'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Функция перевода на английский
async function translateToEnglish(text: string): Promise<string> {
  if (!text) return ''
  try {
    const cleanText = text.replace(/<[^>]*>?/gm, ' ').trim()
    if (!cleanText) return ''

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(cleanText)}`
    const res = await fetch(url)
    if (!res.ok) return text
    const data = await res.json()
    return data[0]?.map((item: any) => item[0]).join('') || text
  } catch (e) {
    console.error('Translation error:', e)
    return text
  }
}

// Извлечение цены
function parsePrice(val: any): number {
  if (!val) return 0
  if (typeof val === 'number') {
    return val > 50000 ? val / 100 : val
  }
  if (typeof val === 'string') {
    const match = val.match(/[\d.]+/)
    if (!match) return 0
    const parsed = parseFloat(match[0])
    return parsed > 50000 ? parsed / 100 : parsed
  }
  if (Array.isArray(val)) {
    for (const item of val) {
      const res = parsePrice(item)
      if (res > 0) return res
    }
  }
  if (typeof val === 'object') {
    return (
      parsePrice(val.price) ||
      parsePrice(val.value) ||
      parsePrice(val.min_group_price) ||
      parsePrice(val.min_normal_price) ||
      parsePrice(val.priceMoney) ||
      parsePrice(val.promotionPrice) ||
      parsePrice(val.displayPrice) ||
      parsePrice(val.reservePrice)
    )
  }
  return 0
}

// Извлечение ID
function extractItemId(url: string, provider: 'pinduoduo' | '1688'): string | null {
  if (/^\d+$/.test(url.trim())) {
    return url.trim()
  }

  if (provider === 'pinduoduo') {
    const patterns = [
      /goods_id[:=](\d+)/i,
      /goodsId[:=](\d+)/i,
      /goods[_-]?id[:=](\d+)/i,
      /sub_goods_id[:=](\d+)/i,
      /[?&]id=(\d+)/i,
      /\/goods\/(\d+)/i,
      /\/goods_detail\/(\d+)/i,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) return match[1]
    }
  } else {
    const patterns = [
      /offer\/(\d+)\.html/i,
      /itemId=(\d+)/i,
      /[?&]id=(\d+)/i,
      /\/(\d+)\.html/i,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) return match[1]
    }
  }

  return null
}

export async function parseAndSaveProduct(rawInputUrl: string) {
  try {
    console.log('--- START PARSING INPUT ---', rawInputUrl)

    // 1. Извлекаем чистый URL
    const extractedUrlMatch = rawInputUrl.match(/(https?:\/\/[^\s]+)/)
    let cleanUrl = extractedUrlMatch ? extractedUrlMatch[1] : rawInputUrl.trim()

    try {
      cleanUrl = decodeURIComponent(cleanUrl)
    } catch {
      // Игнорируем ошибки декодирования
    }

    // 2. Определяем провайдера
    const isPinduoduo = /pinduoduo|yangkeduo|goods_id|goodsId/i.test(cleanUrl) || !cleanUrl.includes('1688.com')
    const provider = isPinduoduo ? 'pinduoduo' : '1688'

    // 3. Извлекаем ID
    let itemId = extractItemId(cleanUrl, provider)

    // 4. Если короткая ссылка — раскрываем редирект
    if (!itemId && (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))) {
      console.log('⚠️ ID не найден. Пробуем получить финальный URL через редирект...')
      try {
        const res = await fetch(cleanUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
          },
        })
        const finalUrl = decodeURIComponent(res.url)
        console.log('📍 Финальный URL:', finalUrl)
        itemId = extractItemId(finalUrl, provider)
      } catch (err) {
        console.warn('Не удалось раскрыть ссылку:', err)
      }
    }

    if (!itemId) {
      throw new Error(`Could not extract product ID from ${provider.toUpperCase()} link. Make sure the URL contains product ID.`)
    }

    console.log(`✅ Extracted Item ID: ${itemId} | Provider: ${provider}`)

    const apiKey = process.env.RAPIDAPI_KEY
    const apiHost = process.env.RAPIDAPI_HOST || 'taobao-tmall-16881.p.rapidapi.com'

    if (!apiKey) {
      throw new Error('API Key missing in environment variables (RAPIDAPI_KEY).')
    }

    // Варианты эндпоинтов для проверки
    const endpointCandidates = [
      `https://${apiHost}/api/tkl/item/detail?provider=${provider}&id=${itemId}`,
      `https://${apiHost}/item_detail?provider=${provider}&id=${itemId}`,
      `https://${apiHost}/api/item/detail?provider=${provider}&id=${itemId}`,
      `https://${apiHost}/item_detail?id=${itemId}`,
      `https://${apiHost}/api/tkl/item/detail?id=${itemId}`,
    ]

    let response: Response | null = null
    let lastErrorText = ''

    for (const url of endpointCandidates) {
      console.log(`🔍 Пробуем эндпоинт: ${url}`)
      try {
        const res = await fetch(url, {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost,
          },
          signal: AbortSignal.timeout(15000),
        })

        if (res.status === 404) {
          console.warn(`⚠️ Эндпоинт ${url} вернул 404, пробуем следующий...`)
          continue
        }

        response = res
        if (!res.ok) {
          lastErrorText = await res.text()
          console.error(`❌ Ошибка API (Status ${res.status}): ${lastErrorText}`)
        } else {
          break
        }
      } catch (e: any) {
        console.warn(`Ошибка при запросе к ${url}:`, e.message)
      }
    }

    if (!response || !response.ok) {
      throw new Error(`RapidAPI Error: ${lastErrorText || response?.statusText || 'Endpoint unavailable (404)'}`)
    }

    const json = await response.json()
    console.log('--- API RESPONSE ---', JSON.stringify(json).substring(0, 300))

    const item =
      json.item ||
      json.data?.item ||
      json.goods_details?.[0] ||
      json.result?.item ||
      json.data ||
      json.result ||
      json

    if (!item || Object.keys(item).length === 0 || json.msg?.includes('error')) {
      throw new Error('Empty or invalid product response from API.')
    }

    let title = 'Imported Product'
    let mainImage: string | null = null
    let allImages: string[] = []
    let rawProps: string[] = []
    let rawPrice = 0

    // Название
    const rawTitle = item.title || item.goods_name || item.goodsName || item.itemTitle || item.shortTitle || item.desc
    if (rawTitle) {
      title = await translateToEnglish(rawTitle)
    }

    // Изображения
    const rawMain =
      item.pic_url ||
      item.hd_thumb_url ||
      item.thumb_url ||
      item.image ||
      item.mainImage ||
      item.pictUrl ||
      item.picUrl ||
      (item.images && item.images[0])

    if (rawMain) {
      mainImage = rawMain.startsWith('//') ? `https:${rawMain}` : rawMain
    }

    const imagesSet = new Set<string>()
    if (mainImage) imagesSet.add(mainImage)

    const gallery =
      item.images ||
      item.detail_gallery ||
      item.top_gallery ||
      item.item_imgs ||
      item.imageList ||
      item.smallImages ||
      []

    gallery.forEach((img: any) => {
      const src = typeof img === 'string' ? img : img?.url || img?.src || img?.url_hd
      if (src) imagesSet.add(src.startsWith('//') ? `https:${src}` : src)
    })

    allImages = Array.from(imagesSet)
    if (!mainImage && allImages.length > 0) {
      mainImage = allImages[0]
    }

    // Характеристики
    const propsSource =
      item.props_list ||
      item.attributes ||
      item.goods_properties ||
      item.props ||
      item.properties ||
      []

    if (typeof propsSource === 'object' && !Array.isArray(propsSource)) {
      rawProps = Object.values(propsSource).map((p: any) => String(p))
    } else if (Array.isArray(propsSource)) {
      rawProps = propsSource
        .map((p: any) => (typeof p === 'string' ? p : p.name && p.value ? `${p.name}: ${p.value}` : p.value || p.key || ''))
        .filter(Boolean)
    }

    // Цена
    rawPrice = parsePrice(
      item.price ||
      item.min_group_price ||
      item.min_normal_price ||
      item.priceRange ||
      item.reservePrice ||
      item.promotionPrice ||
      item.reference_price ||
      item.priceInfo ||
      item.sku?.def?.price ||
      item.skus?.[0]?.price ||
      item.skus?.[0]?.group_price
    )

    let formattedDescription = `Source: ${cleanUrl}`
    if (rawProps.length > 0) {
      const translatedProps = await Promise.all(
        rawProps.slice(0, 35).map((p) => translateToEnglish(p))
      )
      formattedDescription = `Specifications:\n• ${translatedProps.join('\n• ')}\n\nSource: ${cleanUrl}`
    }

    // Конвертация Юань -> Евро (курсы + маржа)
    const cnyToEur = 0.14
    const markupMultiplier = 1.35
    const finalPrice = rawPrice > 0 ? Math.round(rawPrice * cnyToEur * markupMultiplier * 100) / 100 : 0

    if (!mainImage && allImages.length === 0) {
      throw new Error('Failed to retrieve product images. Link might be invalid or restricted.')
    }

    await prisma.product.create({
      data: {
        title: title.substring(0, 190),
        price: finalPrice,
        description: formattedDescription,
        image: mainImage,
        images: allImages,
      },
    })

    revalidatePath('/admin')
  } catch (error) {
    console.error('--- PARSING ERROR ---', error)
    throw error
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string)
  const description = formData.get('description') as string
  const image = formData.get('image') as string

  const rawImages = formData.get('images') as string
  const images = rawImages
    ? rawImages
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0)
    : []

  await prisma.product.update({
    where: { id },
    data: {
      title,
      price,
      description,
      image: image || (images[0] ?? null),
      images,
    },
  })

  revalidatePath('/admin')
  revalidatePath(`/admin/edit/${id}`)
  redirect('/admin')
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin')
}