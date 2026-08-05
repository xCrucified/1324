/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteProduct, deleteProducts } from './actions'

export default function ProductsTableClient({ products }: { products: any[] }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(products.map(p => p.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleSingleDelete = async () => {
    if (!productToDelete) return
    setIsDeleting(true)
    try {
      await deleteProduct(productToDelete)
      setSelectedIds(selectedIds.filter(id => id !== productToDelete))
      setProductToDelete(null)
      router.refresh()
    } catch (e) {
      alert('Помилка при видаленні товару')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    setIsDeleting(true)
    try {
      // Переконайтеся, що ви реалізували функцію deleteProducts у вашому файлі actions.ts
      if (typeof deleteProducts === 'function') {
        await deleteProducts(selectedIds)
      } else {
        // Запасний варіант, якщо є лише поштучне видалення в actions
        for (const id of selectedIds) {
          await deleteProduct(id)
        }
      }
      setSelectedIds([])
      setIsBulkDeleteModalOpen(false)
      router.refresh()
    } catch (e) {
      alert('Помилка при масовому видаленні товарів')
    } finally {
      setIsDeleting(false)
    }
  }

  if (products.length === 0) {
    return (
      <div className="bg-ivory border border-parchment rounded-sm shadow-sm overflow-hidden p-12 text-center text-oak font-body">
        Список товарів порожній. Натисніть «Додати новий товар», щоб створити першу позицію.
      </div>
    )
  }

  const allSelected = products.length > 0 && selectedIds.length === products.length

  return (
    <div className="space-y-4">
      {/* Панель масових дій */}
      {selectedIds.length > 0 && (
        <div className="bg-bark text-parchment px-6 py-3 rounded-sm shadow-md flex items-center justify-between animate-in fade-in duration-200">
          <span className="font-body text-xs">
            Вибрано товарів: <strong className="text-wheat">{selectedIds.length}</strong>
          </span>
          <button
            type="button"
            onClick={() => setIsBulkDeleteModalOpen(true)}
            className="bg-red-700 hover:bg-red-800 text-white font-body text-xs font-bold px-4 py-2 rounded-sm transition-colors cursor-pointer"
          >
            Видалити вибрані ({selectedIds.length})
          </button>
        </div>
      )}

      <div className="bg-ivory border border-parchment rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-parchment bg-parchment/40 font-display text-xs text-oak">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="cursor-pointer accent-caramel w-4 h-4 rounded"
                  />
                </th>
                <th className="p-4 w-20">Фото</th>
                <th className="p-4">Назва товару</th>
                <th className="p-4">Ціна</th>
                <th className="p-4">Дата створення</th>
                <th className="p-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/60">
              {products.map((product) => {
                const displayImage = product.image || (product.images && product.images[0])
                const imagesCount = product.images?.length || (product.image ? 1 : 0)
                const formattedPrice = Number(product.price || 0).toFixed(2)
                const isSelected = selectedIds.includes(product.id)

                return (
                  <tr 
                    key={product.id} 
                    className={`transition-colors font-body text-sm ${isSelected ? 'bg-caramel/10' : 'hover:bg-parchment/20'}`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(product.id)}
                        className="cursor-pointer accent-caramel w-4 h-4 rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="relative w-12 h-12 bg-parchment rounded-sm overflow-hidden border border-mist">
                        {displayImage ? (
                          <img src={displayImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-oak">
                            Немає
                          </div>
                        )}
                        {imagesCount > 1 && (
                          <span className="absolute bottom-0 right-0 bg-bark/80 text-cream text-[9px] px-1 rounded-tl font-mono">
                            {imagesCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-display font-semibold text-bark max-w-xs truncate">
                      {product.title}
                    </td>
                    <td className="p-4 font-bold text-amber whitespace-nowrap">
                      ₴ {formattedPrice}
                    </td>
                    <td className="p-4 text-xs text-oak whitespace-nowrap">
                      {new Date(product.createdAt).toLocaleDateString('uk-UA')}
                    </td>
                    <td className="p-4 text-right space-x-3 whitespace-nowrap">
                      <Link
                        href={`/admin/edit/${product.id}`}
                        className="text-oak hover:text-caramel font-semibold text-xs transition-colors"
                      >
                        Редагувати
                      </Link>
                      <button
                        type="button"
                        onClick={() => setProductToDelete(product.id)}
                        className="text-red-700 hover:text-red-900 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модалка для видалення одного товару */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-lg">
                !
              </div>
              <h3 className="text-lg font-bold text-gray-900">Видалити товар?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Цю дію неможливо скасувати. Обраний товар буде остаточно видалено з бази даних.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                Скасувати
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleSingleDelete}
                className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-sm text-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Видалення...' : 'Видалити'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка для масового видалення товарів */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-lg">
                !
              </div>
              <h3 className="text-lg font-bold text-gray-900">Видалити вибрані товари?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Ви збираєтесь видалити <strong className="text-gray-900">{selectedIds.length}</strong> товарів. Цю дію неможливо скасувати.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                Скасувати
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleBulkDelete}
                className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-sm text-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Видалення...' : `Видалити (${selectedIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}