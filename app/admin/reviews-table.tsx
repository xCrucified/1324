/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteReview, deleteReviews } from './actions'

export default function ReviewsTableClient({ reviews }: { reviews: any[] }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelectAll = () => {
    if (selectedIds.length === reviews.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(reviews.map(r => r.id))
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
    if (!reviewToDelete) return
    setIsDeleting(true)
    try {
      await deleteReview(reviewToDelete)
      setSelectedIds(selectedIds.filter(id => id !== reviewToDelete))
      setReviewToDelete(null)
      router.refresh()
    } catch (e) {
      alert('Помилка при видаленні відгуку')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    setIsDeleting(true)
    try {
      await deleteReviews(selectedIds)
      setSelectedIds([])
      setIsBulkDeleteModalOpen(false)
      router.refresh()
    } catch (e) {
      alert('Помилка при масовому видаленні відгуків')
    } finally {
      setIsDeleting(false)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-ivory border border-parchment rounded-sm shadow-sm overflow-hidden p-12 text-center text-oak font-body">
        Ще немає залишених відгуків у системі.
      </div>
    )
  }

  const allSelected = reviews.length > 0 && selectedIds.length === reviews.length

  return (
    <div className="space-y-4">
      {/* Панель масових дій */}
      {selectedIds.length > 0 && (
        <div className="bg-bark text-parchment px-6 py-3 rounded-sm shadow-md flex items-center justify-between animate-in fade-in duration-200">
          <span className="font-body text-xs">
            Вибрано відгуків: <strong className="text-wheat">{selectedIds.length}</strong>
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
                <th className="p-4">Користувач</th>
                <th className="p-4">Товар</th>
                <th className="p-4">Оцінка та текст</th>
                <th className="p-4">Дата</th>
                <th className="p-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/60">
              {reviews.map((rev) => {
                const isSelected = selectedIds.includes(rev.id)
                return (
                  <tr 
                    key={rev.id} 
                    className={`transition-colors font-body text-sm ${isSelected ? 'bg-caramel/10' : 'hover:bg-parchment/20'}`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(rev.id)}
                        className="cursor-pointer accent-caramel w-4 h-4 rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-display font-semibold text-bark">
                        {rev.user?.name || rev.user?.email?.split('@')[0] || 'Анонім'}
                      </div>
                      <div className="text-xs text-oak">
                        {rev.user?.email || ''}
                      </div>
                    </td>
                    <td className="p-4">
                      <Link 
                        href={`/product/${rev.productId}`} 
                        target="_blank"
                        className="text-amber hover:underline font-semibold text-xs line-clamp-2 max-w-xs"
                      >
                        {rev.product?.title || 'Товар'}
                      </Link>
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="flex items-center gap-0.5 text-xs text-amber mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={rev.rating >= star ? "text-amber" : "text-gray-300"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-bark italic bg-wheat/20 p-2 rounded-sm line-clamp-2">
                        &ldquo;{rev.text}&rdquo;
                      </p>
                    </td>
                    <td className="p-4 text-xs text-oak whitespace-nowrap">
                      {new Date(rev.createdAt).toLocaleDateString('uk-UA')}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setReviewToDelete(rev.id)}
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

      {/* Модалка для видалення одного відгуку */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-lg">
                !
              </div>
              <h3 className="text-lg font-bold text-gray-900">Видалити відгук?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Цю дію неможливо скасувати. Відгук буде остаточно видалено з бази даних.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setReviewToDelete(null)}
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

      {/* Модалка для масового видалення відгуків */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-lg">
                !
              </div>
              <h3 className="text-lg font-bold text-gray-900">Видалити вибрані відгуки?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Ви збираєтесь видалити <strong className="text-gray-900">{selectedIds.length}</strong> відгуків. Цю дію неможливо скасувати.
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