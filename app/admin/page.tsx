import { prisma } from '@/lib/prisma'
import { parseAndSaveProduct, deleteProduct } from './actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic' // Принудительный SSR без статического кеша, чтобы всегда свежие данные

export default async function AdminPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8 max-w-6xl mx-auto" suppressHydrationWarning>
      <h1 className="text-2xl font-bold mb-6">Панель управления магазином</h1>

      {/* Форма парсера */}
      <form 
        action={async (formData) => {
          'use server'
          const url = formData.get('url') as string
          if (url) {
            await parseAndSaveProduct(url)
          }
        }} 
        className="bg-white p-6 rounded-lg shadow-md border mb-8 flex gap-4 items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Ссылка на товар (1688 / Интернет-магазин)</label>
          <input 
            type="url" 
            name="url" 
            required 
            placeholder="https://detail.1688.com/offer/..." 
            className="w-full border rounded p-2 text-sm"
          />
        </div>
        <button 
          type="submit" 
          className="bg-black text-white px-5 py-2 rounded text-sm font-medium hover:bg-gray-800 transition h-[38px]"
        >
          Запустить парсер
        </button>
      </form>

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

              // Жестко фиксируем вывод цены через точку, чтобы сервер и клиент всегда видели одинаковый текст
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
                  Список товаров пуст. Добавьте первую ссылку сверху.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}