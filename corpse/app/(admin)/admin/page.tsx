import { parseAndSaveProduct, getProducts } from './actions'

export default async function AdminPage() {
  const products = await getProducts()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Секция 1: Форма парсинга */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold mb-2 text-slate-800">Импорт товара с 1688 / Pinduoduo</h2>
        <p className="text-sm text-slate-500 mb-4">
          Вставьте прямую ссылку на товар. Скрипт пересчитает цену с наценкой x2.2 и занесет карточку в базу.
        </p>

        <form action={parseAndSaveProduct} className="flex gap-3">
          <input
            type="url"
            name="url"
            required
            placeholder="https://detail.1688.com/offer/67483920.html"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl text-sm transition shadow-sm active:scale-95"
          >
            Спарсить и Сохранить
          </button>
        </form>
      </section>

      {/* Секция 2: Таблица спарсенных товаров из БД */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Товары в базе данных ({products.length})</h3>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
              <th className="p-4">Превью</th>
              <th className="p-4">Название</th>
              <th className="p-4">Цена 1688 (CNY)</th>
              <th className="p-4">Цена Магазина (EUR)</th>
              <th className="p-4">Ссылка 1688</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition">
                <td className="p-4">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt=""
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded-lg" />
                  )}
                </td>
                <td className="p-4 font-medium text-slate-900 max-w-xs truncate">
                  {product.title}
                </td>
                <td className="p-4 text-slate-600 font-mono">
                  ¥{product.priceCny}
                </td>
                <td className="p-4 text-emerald-600 font-bold font-mono">
                  €{product.priceEur}
                </td>
                <td className="p-4">
                  <a
                    href={product.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-xs font-medium"
                  >
                    Открыть на 1688 ↗
                  </a>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400 text-sm">
                  База данных пуста. Вставьте ссылку выше, чтобы спарсить первый товар.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}