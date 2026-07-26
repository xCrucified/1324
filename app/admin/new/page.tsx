import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProductForm from '../ProductForm'

async function fileToDataUrl(file: File): Promise<string> {
  if (!file || file.size === 0) return ''
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString('base64')
  const mime = file.type || 'image/jpeg'
  return `data:${mime};base64,${base64}`
}

async function handleCreateProduct(formData: FormData) {
  'use server'

  const title = (formData.get('title') as string) || 'Новий товар'
  const price = parseFloat(formData.get('price') as string) || 0
  const description = (formData.get('description') as string) || ''
  const sourceUrl = (formData.get('sourceUrl') as string) || ''

  const images: string[] = []

  const rawImagesText = (formData.get('imagesText') as string) || ''
  const textUrls = rawImagesText
    .split('\n')
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
  images.push(...textUrls)

  const files = formData.getAll('imageFiles') as File[]
  for (const file of files) {
    if (file && file.size > 0) {
      const dataUrl = await fileToDataUrl(file)
      if (dataUrl) {
        images.push(dataUrl)
      }
    }
  }

  const mainImage = images[0] || 'https://via.placeholder.com/800x800?text=No+Image'

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

  await prisma.product.create({
    data: {
      title,
      price: isNaN(price) ? 0 : price,
      description: fullDescription.trim(),
      image: mainImage,
      images: images.length > 0 ? images : [mainImage],
    },
  })

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
            Створення товару
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