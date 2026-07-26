/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function isValidPublicUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr)
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    const hostname = parsed.hostname.toLowerCase()
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local')
    ) {
      return false
    }
    return true
  } catch {
    return false
  }
}

async function translateToEnglish(text: string): Promise<string> {
  if (!text || !text.trim()) return ''
  try {
    const cleanText = text.replace(/<[^>]*>?/gm, ' ').trim()
    if (!cleanText) return ''

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t`
    const res = await fetch(url, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `q=${encodeURIComponent(cleanText)}`,
      signal: AbortSignal.timeout(8000),
      cache: 'no-store' 
    })
    
    if (!res.ok) return text
    const data = await res.json()
    return data[0]?.map((item: any) => item[0]).join('') || text
  } catch (e) {
    console.error('Translation error:', e)
    return text
  }
}

async function translateBatchToEnglish(lines: string[]): Promise<string[]> {
  if (!lines.length) return []
  const cleanLines = lines.map(l => l.replace(/<[^>]*>?/gm, ' ').trim()).filter(Boolean)
  if (!cleanLines.length) return []

  const delimiter = ' ||| '
  const joinedText = cleanLines.join(delimiter)
  
  try {
    const translatedJoined = await translateToEnglish(joinedText)
    const translatedLines = translatedJoined.split(/\s*\|\|\|\s*/)
    if (translatedLines.length === cleanLines.length) {
      return translatedLines
    }
    return cleanLines
  } catch {
    return cleanLines
  }
}

function parsePrice(val: any): number {
  if (val === null || val === undefined) return 0

  if (typeof val === 'number') {
    return val > 50000 ? val / 100 : val
  }

  if (typeof val === 'string') {
    const matches = val.match(/[\d.]+/g)
    if (!matches || matches.length === 0) return 0
    const numbers = matches.map(n => parseFloat(n)).filter(n => !isNaN(n))
    if (numbers.length === 0) return 0
    const minVal = Math.min(...numbers)
    return minVal > 50000 ? minVal / 100 : minVal
  }

  if (Array.isArray(val)) {
    let min = Infinity
    for (const item of val) {
      const p = parsePrice(item)
      if (p > 0 && p < min) {
        min = p
      }
    }
    return min === Infinity ? 0 : min
  }

  if (typeof val === 'object') {
    let min = Infinity
    const keysToCheck = ['price', 'promotionPrice', 'min_price', 'value', 'skuRangePrice', 'discountPrice', 'salePrice']
    for (const key of keysToCheck) {
      if (val[key] !== undefined) {
        const p = parsePrice(val[key])
        if (p > 0 && p < min) {
          min = p
        }
      }
    }
    return min === Infinity ? 0 : min
  }

  return 0
}

function extractItemId(url: string): string | null {
  const trimmedUrl = url.trim()
  if (/^\d+$/.test(trimmedUrl)) {
    return trimmedUrl
  }

  const patterns = [
    /offer\/(\d+)\.html/i,
    /itemId=(\d+)/i,
    /item_id=(\d+)/i,
    /[?&]id=(\d+)/i,
    /\/(\d+)\.html/i,
  ]
  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern)
    if (match && match[1]) return match[1]
  }

  const digitsMatch = trimmedUrl.match(/\d{8,}/)
  return digitsMatch ? digitsMatch[0] : null
}

export async function parseAndSaveProduct(rawInputUrl: string) {
  try {
    console.log('--- START PARSING INPUT ---', rawInputUrl)

    const extractedUrlMatch = rawInputUrl.match(/(https?:\/\/[^\s]+)/)
    let cleanUrl = extractedUrlMatch ? extractedUrlMatch[1] : rawInputUrl.trim()

    try {
      cleanUrl = decodeURIComponent(cleanUrl)
    } catch {}

    let itemId = extractItemId(cleanUrl)

    if (!itemId && isValidPublicUrl(cleanUrl)) {
      console.log('⚠️ Item ID не найден. Пробуем получить финальный URL через редирект...')
      try {
        const res = await fetch(cleanUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
          },
          signal: AbortSignal.timeout(8000),
          cache: 'no-store'
        })
        const finalUrl = decodeURIComponent(res.url)
        console.log('📍 Финальный URL:', finalUrl)
        itemId = extractItemId(finalUrl)
      } catch (err) {
        console.warn('Не удалось раскрыть ссылку:', err)
      }
    }

    if (!itemId) {
      throw new Error('Could not extract itemId from the link. Make sure the URL contains a valid item ID or offer link.')
    }

    console.log(`✅ Extracted Item ID: ${itemId}`)

    const apiKey = process.env.RAPIDAPI_KEY
    const apiHost = process.env.RAPIDAPI_HOST || 'taobao-1688-api1.p.rapidapi.com'

    if (!apiKey) {
      throw new Error('API Key missing in environment variables (RAPIDAPI_KEY).')
    }

    const targetUrl = `https://${apiHost}/1688/detail?itemId=${itemId}`
    console.log(`🔍 Запрос к API: ${targetUrl}`)

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': apiHost,
        'x-rapidapi-key': apiKey,
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`RapidAPI Error (Status ${response.status}): ${errText}`)
    }

    const json = await response.json()
    console.log('--- API RESPONSE ---', JSON.stringify(json).substring(0, 300))

    const item = json.item || json.data?.item || json.result?.item || json.data || json.result || json

    if (!item || Object.keys(item).length === 0) {
      throw new Error('Empty or invalid product response from API.')
    }

    let title = 'Imported Product'
    let rawProps: string[] = []

    const rawTitle = item.title || item.goods_name || item.goodsName || item.itemTitle || item.subject || item.desc
    if (rawTitle) {
      title = await translateToEnglish(rawTitle)
    }

    const imagesSet = new Set<string>()
    const extractUrls = (obj: any) => {
      if (!obj) return
      if (typeof obj === 'string') {
        if (obj.startsWith('http://') || obj.startsWith('https://') || obj.startsWith('//')) {
          imagesSet.add(obj.startsWith('//') ? `https:${obj}` : obj)
        }
      } else if (Array.isArray(obj)) {
        obj.forEach(extractUrls)
      } else if (typeof obj === 'object') {
        const priorityKeys = ['url', 'src', 'pic_url', 'image', 'img', 'mainImage', 'pictUrl', 'picUrl', 'imageList', 'images']
        for (const key of priorityKeys) {
          if (obj[key]) extractUrls(obj[key])
        }
      }
    }

    extractUrls(item.pic_url)
    extractUrls(item.image)
    extractUrls(item.images)
    extractUrls(item.skuImages)
    extractUrls(item.imageList)
    extractUrls(item.item_imgs)

    let allImages = Array.from(imagesSet)
    const mainImage = allImages[0] || 'https://via.placeholder.com/800x800?text=No+Image'
    if (allImages.length === 0) allImages = [mainImage]

    const propsSource = item.props_list || item.attributes || item.goods_properties || item.props || []
    if (typeof propsSource === 'object' && !Array.isArray(propsSource)) {
      rawProps = Object.values(propsSource).map((p: any) => String(p))
    } else if (Array.isArray(propsSource)) {
      rawProps = propsSource
        .map((p: any) => (typeof p === 'string' ? p : p.name && p.value ? `${p.name}: ${p.value}` : p.value || p.key || ''))
        .filter(Boolean)
    }

    const rawPrice = parsePrice([
      item.priceInfo,
      item.sku?.skuRangePrice,
      item.sku?.base,
      item.sku?.def?.price,
      item.sku?.promotionPrice,
      item.sku?.price,
      item.price,
      item.min_price,
      item.min_group_price,
      item.priceRange
    ])

    let formattedDescription = `Source: ${cleanUrl}`
    if (rawProps.length > 0) {
      const translatedProps = await translateBatchToEnglish(rawProps.slice(0, 35))
      formattedDescription = `Specifications:\n• ${translatedProps.join('\n• ')}\n\nSource: ${cleanUrl}`
    }

    const cnyToEur = 0.14
    const markupMultiplier = 1.35
    const calculatedPrice = rawPrice > 0 ? Math.round(rawPrice * cnyToEur * markupMultiplier * 100) / 100 : 0
    const finalPrice = isNaN(calculatedPrice) ? 0 : calculatedPrice

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
    ? rawImages.split('\n').map((url) => url.trim()).filter((url) => url.length > 0)
    : []

  await prisma.product.update({
    where: { id },
    data: {
      title,
      price: isNaN(price) ? 0 : price,
      description,
      image: image || (images[0] ?? ''),
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