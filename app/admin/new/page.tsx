import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '../ProductForm'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

async function handleCreateProduct(formData: FormData) {
  'use server'

  try {
    const title = (formData.get('title') as string) || 'Новий товар'
    const price = parseFloat(formData.get('price') as string) || 0
    const description = (formData.get('description') as string) || ''
    const sourceUrl = (formData.get('sourceUrl') as string) || ''
    
    // ВАЖЛИВЕ ВИПРАВЛЕННЯ: Надійно обробляємо порожній рядок
    const rawCategoryId = formData.get('categoryId') as string | null
    const categoryId = rawCategoryId && rawCategoryId.trim() !== '' ? rawCategoryId.trim() : null

    const images: string[] = []

    // 1. Збираємо текстові посилання на фото, якщо вони є
    const rawImagesText = (formData.get('imagesText') as string) || ''
    const textUrls = rawImagesText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
    images.push(...textUrls)

    // 2. Зберігаємо завантажені файли фізично на диск у public/uploads
    const files = formData.getAll('imageFiles') as File[]
    if (files && files.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch {}

      for (const file of files) {
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)

          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
          const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const filename = `${uniqueSuffix}-${sanitizedFilename}`
          const filepath = path.join(uploadDir, filename)

          await writeFile(filepath, buffer)
          images.push(`/uploads/${filename}`)
        }
      }
    }

    const mainImage = images[0] || 'https://via.placeholder.com/800x800?text=No+Image'

    // 3. Збираємо кольори та розміри
    const rawColors = (formData.get('colors') as string) || ''
    const colors = rawColors
      .split(/[\n,]/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0)

    const rawSizes = (formData.get('sizes') as string) || ''
    const sizes = rawSizes
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    let fullDescription = description
    if (sourceUrl) {
      fullDescription += `\n\nSource: ${sourceUrl}`
    }
    if (colors.length > 0) {
      fullDescription += `\nColors: ${colors.join(', ')}`
    }
    if (sizes.length > 0) {
      fullDescription += `\nSizes: ${sizes.join(', ')}`
    }

    // 4. Створюємо товар у базі через Prisma
    await prisma.product.create({
      data: {
        title,
        price: isNaN(price) ? 0 : price,
        description: fullDescription.trim(),
        image: mainImage,
        images: images.length > 0 ? images : [mainImage],
        categoryId, // Зберігаємо категорію (тепер це або валідний ID, або null)
      },
    })

  } catch (error: any) {
    console.error('Помилка при створенні товару:', error)
    throw new Error(error.message || 'Помилка при створенні товару')
  }

  revalidatePath('/admin')
  revalidatePath('/')
  redirect('/admin')
}

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-ivory text-bark pb-16">
      <header className="bg-bark text-parchment border-b border-oak/20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="font-display font-semibold text-sm text-wheat hover:text-cream transition-colors">
            ← Назад до панелі
          </Link>
          <h1 className="font-display font-bold text-lg text-cream tracking-wide">
            Створення товару (грн)
          </h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-ivory border border-parchment rounded-sm p-6 shadow-sm">
          <ProductForm action={handleCreateProduct} />
        </div>
      </main>
    </div>
  )
}