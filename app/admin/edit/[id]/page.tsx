import { prisma } from '@/lib/prisma'
import { updateProduct } from '../../actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditPageProps) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) {
    return <div className="p-8">Товар не найден</div>
  }

  // Подготавливаем список всех картинок для textarea (по 1 ссылке на строку)
  const imagesListText = product.images && product.images.length > 0
    ? product.images.join('\n')
    : (product.image || '')

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Редактировать товар</h1>

      <form 
        action={async (formData) => {
          'use server'
          await updateProduct(id, formData)
          redirect('/admin')
        }}
        className="space-y-4 bg-white p-6 rounded-lg shadow border"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Название</label>
          <input 
            type="text" 
            name="title" 
            defaultValue={product.title} 
            className="w-full border rounded p-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Цена (€)</label>
          <input 
            type="number" 
            step="0.01" 
            name="price" 
            defaultValue={product.price} 
            className="w-full border rounded p-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Описание / Характеристики</label>
          <textarea 
            name="description" 
            defaultValue={product.description || ''} 
            className="w-full border rounded p-2 text-sm h-36 font-sans"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Главное фото (URL)</label>
          <input 
            type="text" 
            name="image" 
            defaultValue={product.image || ''} 
            className="w-full border rounded p-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Галерея картинок (каждая URL-ссылка с новой строки)
          </label>
          <textarea 
            name="images" 
            defaultValue={imagesListText} 
            className="w-full border rounded p-2 text-sm h-32 font-mono text-xs leading-relaxed"
            placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
          />
        </div>

        {/* Сетка предпросмотра всей галереи */}
        {product.images && product.images.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Все фото товара в базе ({product.images.length}):
            </p>
            <div className="grid grid-cols-4 gap-2 border p-2 rounded bg-gray-50 max-h-48 overflow-y-auto">
              {product.images.map((imgUrl, index) => (
                <div key={index} className="relative group aspect-square border rounded overflow-hidden bg-white">
                  <img 
                    src={imgUrl} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800"
          >
            Сохранить
          </button>
          <Link href="/admin" className="border px-4 py-2 rounded text-sm flex items-center">
            Назад
          </Link>
        </div>
      </form>
    </div>
  )
}