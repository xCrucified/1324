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

// Извлечение цены (усиленный поиск)
function parsePrice(val: any): number {
  if (!val) return 0
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const match = val.match(/[\d.]+/)
    return match ? parseFloat(match[0]) : 0
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
      parsePrice(val.priceMoney) ||
      parsePrice(val.promotionPrice) ||
      parsePrice(val.displayPrice) ||
      parsePrice(val.reservePrice)
    )
  }
  return 0
}

export async function parseAndSaveProduct(url: string) {
  try {
    console.log('--- START PARSING URL ---', url)

    let title = '1688 Product'
    let mainImage: string | null = null
    let allImages: string[] = []
    let rawProps: string[] = []
    let rawPrice = 0

    const matchId = url.match(/offer\/(\d+)\.html/) || url.match(/itemId=(\d+)/) || url.match(/id=(\d+)/)
    const itemId = matchId ? matchId[1] : null

    if (!itemId) {
      throw new Error('Could not extract item ID from link.')
    }

    const apiKey = process.env.RAPIDAPI_KEY
    const apiHost = process.env.RAPIDAPI_HOST || 'taobao-tmall-16881.p.rapidapi.com'

    if (!apiKey) {
      console.error('❌ ОШИБКА: RAPIDAPI_KEY не найден в process.env!')
    }

    if (apiKey) {
      const endpoint = `https://${apiHost}/api/tkl/item/detail?provider=1688&id=${itemId}`
      console.log(`Запрос к API: ${endpoint}`)
      
      const response = await fetch(endpoint, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost,
        },
        signal: AbortSignal.timeout(20000),
      })

      if (!response.ok) {
        console.error(`❌ Ошибка API Status: ${response.status} ${response.statusText}`)
        const errText = await response.text()
        console.error('Ответ ошибки от API:', errText)
      } else {
        const json = await response.json()
        
        console.log('--- СЫРОЙ ОТВЕТ ОТ API (первые 300 симв) ---', JSON.stringify(json).substring(0, 300))

        const item =
          json.item ||
          json.data?.item ||
          json.result?.item ||
          json.data ||
          json.result ||
          json

        if (!item || Object.keys(item).length === 0 || item.msg?.includes('error')) {
          console.error('⚠️ Объект товара пуст или API вернул ошибку:', json)
        } else {
          console.log('✅ Данные товара успешно получены от API!')

          // 1. Название товара
          const rawTitle = item.title || item.itemTitle || item.shortTitle || item.desc
          if (rawTitle) {
            title = await translateToEnglish(rawTitle)
          }

          // 2. Главное фото
          const rawMain = item.pic_url || item.image || item.mainImage || item.pictUrl || item.picUrl || (item.images && item.images[0])
          if (rawMain) {
            mainImage = rawMain.startsWith('//') ? `https:${rawMain}` : rawMain
          }

          // 3. Галерея + SKU
          const imagesSet = new Set<string>()
          if (mainImage) imagesSet.add(mainImage)

          const gallery = item.images || item.item_imgs || item.imageList || item.smallImages || []
          gallery.forEach((img: any) => {
            const src = typeof img === 'string' ? img : img?.url || img?.src
            if (src) imagesSet.add(src.startsWith('//') ? `https:${src}` : src)
          })

          const propsImgs = item.props_img || item.skuImages || []
          propsImgs.forEach((img: any) => {
            const src = typeof img === 'string' ? img : img?.url || img?.src
            if (src) imagesSet.add(src.startsWith('//') ? `https:${src}` : src)
          })

          if (Array.isArray(item.skus)) {
            item.skus.forEach((sku: any) => {
              const src = sku.image || sku.imgUrl || sku.picUrl || sku.pictUrl
              if (src) imagesSet.add(src.startsWith('//') ? `https:${src}` : src)
            })
          }

          allImages = Array.from(imagesSet)
          if (!mainImage && allImages.length > 0) {
            mainImage = allImages[0]
          }

          // 4. Характеристики
          const propsSource = item.props_list || item.attributes || item.props || item.properties || []
          if (typeof propsSource === 'object' && !Array.isArray(propsSource)) {
            rawProps = Object.values(propsSource).map((p: any) => String(p))
          } else if (Array.isArray(propsSource)) {
            rawProps = propsSource
              .map((p: any) => (typeof p === 'string' ? p : p.name && p.value ? `${p.name}: ${p.value}` : p.value || p.key || ''))
              .filter(Boolean)
          }

          // 5. Цена
          rawPrice = parsePrice(
            item.price ||
            item.priceRange ||
            item.reservePrice ||
            item.promotionPrice ||
            item.reference_price ||
            item.priceInfo ||
            item.sku?.def?.price ||
            item.skus?.[0]?.price ||
            item.skus?.[0]?.priceMoney
          )
        }
      }
    }

    let formattedDescription = `Source: ${url}`
    if (rawProps.length > 0) {
      const translatedProps = await Promise.all(
        rawProps.slice(0, 35).map((p) => translateToEnglish(p))
      )
      formattedDescription = `Specifications:\n• ${translatedProps.join('\n• ')}\n\nSource: ${url}`
    }

    const cnyToEur = 0.14
    const markupMultiplier = 1.35
    const finalPrice = rawPrice > 0 ? Math.round(rawPrice * cnyToEur * markupMultiplier * 100) / 100 : 0

    if (title === '1688 Product' && !mainImage) {
      throw new Error('Failed to retrieve item data. Please check your RapidAPI usage limits or link validity.')
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
  const description = formData.get('description') as string // Исправлено здесь
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