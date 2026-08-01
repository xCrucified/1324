/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { deleteOrder, deleteOrders } from './actions'

export default function OrdersTableClient({ orders }: { orders: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(orders.map(o => o.id))
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
    if (!orderToDelete) return
    setIsDeleting(true)
    try {
      await deleteOrder(orderToDelete)
      setSelectedIds(selectedIds.filter(id => id !== orderToDelete))
      setOrderToDelete(null)
    } catch (e) {
      alert('Помилка при видаленні замовлення')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    setIsDeleting(true)
    try {
      await deleteOrders(selectedIds)
      setSelectedIds([])
      setIsBulkDeleteModalOpen(false)
    } catch (e) {
      alert('Помилка при масовому видаленні замовлень')
    } finally {
      setIsDeleting(false)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="bg-ivory border border-parchment rounded-sm shadow-sm overflow-hidden p-12 text-center text-oak font-body">
        Ще немає оплачених замовлень у системі.
      </div>
    )
  }

  const allSelected = orders.length > 0 && selectedIds.length === orders.length

  return (
    <div className="space-y-4">
      {/* Панель масових дій (з'являється, якщо щось вибрано) */}
      {selectedIds.length > 0 && (
        <div className="bg-bark text-parchment px-6 py-3 rounded-sm shadow-md flex items-center justify-between animate-in fade-in duration-200">
          <span className="font-body text-xs">
            Вибрано замовлень: <strong className="text-wheat">{selectedIds.length}</strong>
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
                <th className="p-4">ID / Дата</th>
                <th className="p-4">Покупець (Акаунт)</th>
                <th className="p-4">Контакти / Доставка</th>
                <th className="p-4">Сума</th>
                <th className="p-4">Статус</th>
                <th className="p-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment/60">
              {orders.map((order) => {
                const isSelected = selectedIds.includes(order.id)
                return (
                  <tr 
                    key={order.id} 
                    className={`transition-colors font-body text-sm ${isSelected ? 'bg-caramel/10' : 'hover:bg-parchment/20'}`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(order.id)}
                        className="cursor-pointer accent-caramel w-4 h-4 rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-xs text-bark font-bold">#{order.id.slice(-6)}</div>
                      <div className="text-[11px] text-oak">
                        {new Date(order.createdAt).toLocaleString('uk-UA')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-display font-semibold text-bark">
                        {order.user?.name || order.customerName || 'Гість / Анонім'}
                      </div>
                      <div className="text-xs text-oak">
                        {order.user?.email || order.email || 'Email не вказано'}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-bark">
                      <div>{order.address || order.shippingAddress || 'Самовивіз / Не вказано'}</div>
                      <div className="text-oak">{order.phone || ''}</div>
                    </td>
                    <td className="p-4 font-bold text-amber whitespace-nowrap">
                      ₴ {Number(order.total || order.amount || 0).toFixed(2)}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-block bg-amber/10 text-amber border border-amber/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {order.status || 'Оплачено'}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setOrderToDelete(order.id)}
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

      {/* Модалка для видалення одного замовлення */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-lg">
                !
              </div>
              <h3 className="text-lg font-bold text-gray-900">Видалити замовлення?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Цю дію неможливо скасувати. Замовлення #{orderToDelete.slice(-6)} буде остаточно видалено з бази даних.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
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

      {/* Модалка для масового видалення */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-lg">
                !
              </div>
              <h3 className="text-lg font-bold text-gray-900">Видалити вибрані замовлення?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Ви збираєтесь видалити <strong className="text-gray-900">{selectedIds.length}</strong> замовлень. Цю дію неможливо скасувати.
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