'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma' // Используем синглтон Prisma (или оставь new PrismaClient(), если lib/prisma ещё нет)

// Настройки калькулятора цен
const CNY_TO_EUR_RATE = 0.13  // Курс: 1 CNY ≈ 0.13 EUR
const MARGIN_MULTIPLIER = 2.2  // Наценка (x2.2)

/**
 * Функция для сбора данных с китайской площадки (1688 / Pinduoduo / Taobao)
 */
async function fetchProductDataFromUrl(url: string) {
  // --------------------------------------------------------------------------
  // 🔌 ВАРИАНТ А: Если подключаешь реальный API скрапера (например, RapidAPI или ScraperAPI)
  // --------------------------------------------------------------------------
  /*
  const response = await fetch(`https://api.example-scraper.com/parse?url=${encodeURIComponent(url)}`, {
    headers: {
      'Authorization': `Bearer ${process.env.SCRAPER_API_KEY}`
    },
    cache: 'no-store' // Обязательно отключаем кэш Next.js для новых запросов
  })

  if (!response.ok) {
    throw new Error('Не удалось получить данные с целевого сайта')
  }

  const data = await response.json()
  return {
    titleZh: data.title,
    descriptionZh: data.description,
    priceCny: Number(data.price),
    images: data.images || []
  }
  */

  // --------------------------------------------------------------------------
  // 🧪 ВАРИАНТ Б: Динамический MOCK (для тестов UI и базы данных)
  // Генерирует УНИКАЛЬНЫЕ данные на основе переданной ссылки!
  // --------------------------------------------------------------------------
  const urlHash = Array.from(url).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const dynamicPrice = (urlHash % 150) + 25 // Уникальная цена от 25 до 174 ¥
  const is1688 = url.includes('1688')

  return {
    titleZh: is1688 ? `1688 Товар ID-${urlHash.toString().slice(-4)}` : `Pinduoduo Товар ID-${urlHash.toString().slice(-4)}`,
    descriptionZh: `Автоматически спарсенное описание товара по адресу: ${url.slice(0, 30)}...`,
    priceCny: dynamicPrice,
    images: [
      `https://picsum.photos/seed/${urlHash}/600/600`,
      `https://picsum.photos/seed/${urlHash + 1}/600/600`
    ]
  }
}

export async function parseAndSaveProduct(formData: FormData) {
  const url = formData.get('url') as string

  if (!url || typeof url !== 'string' || !url.trim()) {
    return { success: false, error: 'Ссылка не может быть пустой' }
  }

  try {
    // 1. Получаем данные с парсера (динамически)
    const rawParsedData = await fetchProductDataFromUrl(url)

    // 2. ИИ-Перевод (В будущем: вызов OpenAI API / DeepL)
    const translatedTitle = `Товар: ${rawParsedData.titleZh}`
    const translatedDesc = rawParsedData.descriptionZh

    // 3. Калькулятор цены в EUR
    const basePriceEur = rawParsedData.priceCny * CNY_TO_EUR_RATE
    const finalPriceEur = Number((basePriceEur * MARGIN_MULTIPLIER).toFixed(2))

    // 4. Запись в БД PostgreSQL через Prisma
    const newProduct = await prisma.product.create({
      data: {
        title: translatedTitle,
        description: translatedDesc,
        priceCny: rawParsedData.priceCny,
        priceEur: finalPriceEur,
        images: rawParsedData.images,
        originalUrl: url,
      }
    })

    // 5. Инвалидируем кэш страниц, чтобы новые товары сразу появились на фронте
    revalidatePath('/admin')
    revalidatePath('/')

    return { success: true, product: newProduct }

  } catch (error) {
    console.error('Ошибка парсинга:', error)
    return { success: false, error: 'Не удалось спарсить товар' }
  }
}

// Получение списка всех спарсенных товаров
export async function getProducts() {
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Ошибка при получении товаров:', error)
    return []
  }
}