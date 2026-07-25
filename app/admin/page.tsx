import { prisma } from '@/lib/prisma'
import { deleteProduct } from './actions'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import ProductForm from './ProductForm'

export const dynamic = 'force-dynamic'

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

  const title = (formData.get('title') as string) || 'New Product'
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

export default async function AdminPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8 max-w-6xl mx-auto" suppressHydrationWarning>
      <h1 className="text-2xl font-bold mb-6">Панель управления магазином</h1>

      {/* Интерактивная форма с превью */}
      <ProductForm action={handleCreateProduct} />

      {/* Список товаров */}
      <h2 className="text-xl font-semibold mb-4">Список товаров ({products.length})</h2>
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-sm text-gray-600">
              <th className="p-3 w-20">Фото</th>
              <th className="p-3">Название</th>
              <th className="p-3">Цена</th>
              <th className="p-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const displayImage = product.image || (product.images && product.images[0])
              const imagesCount = product.images?.length || (product.image ? 1 : 0)
              const formattedPrice = Number(product.price || 0).toFixed(2)

              return (
                <tr key={product.id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-3">
                    <div className="relative w-12 h-12">
                      {displayImage ? (
                        <img 
                          src={displayImage} 
                          alt="" 
                          className="w-12 h-12 object-cover rounded border" 
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-[10px] text-gray-400">
                          Нет фото
                        </div>
                      )}

                      {imagesCount > 0 && (
                        <span 
                          title={`Всего фото: ${imagesCount}`}
                          className="absolute -bottom-1 -right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono shadow border border-white"
                        >
                          {imagesCount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-medium max-w-md truncate">
                    {product.title}
                  </td>
                  <td className="p-3 font-semibold text-green-700 whitespace-nowrap" suppressHydrationWarning>
                    € {formattedPrice}
                  </td>
                  <td className="p-3 text-right space-x-3 whitespace-nowrap">
                    <Link 
                      href={`/admin/edit/${product.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Редактировать
                    </Link>
                    <form action={deleteProduct.bind(null, product.id)} className="inline">
                      <button type="submit" className="text-red-600 hover:underline">
                        Удалить
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Список товаров пуст. Добавьте первый товар через форму выше.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}