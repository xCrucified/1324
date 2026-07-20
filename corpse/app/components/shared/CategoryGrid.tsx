import { CATEGORIES } from '@/constants/categories'

export function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-3 mb-4">
      <div className="bg-white border border-gray-200 rounded-sm p-4">
        <h2 className="font-display text-gray-900 font-semibold mb-3" style={{ fontSize: '1rem' }}>
          Browse Categories
        </h2>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              className="flex flex-col items-center gap-1.5 p-2 rounded-sm hover:bg-orange-50/60 transition-colors group cursor-pointer"
            >
              <span style={{ fontSize: '1.6rem' }}>{cat.icon}</span>
              <span
                className="font-body text-gray-800 text-xs text-center leading-tight group-hover:text-orange-600 font-medium transition-colors"
                style={{ fontSize: '0.68rem' }}
              >
                {cat.label}
              </span>
              <span className="font-body text-gray-400" style={{ fontSize: '0.58rem' }}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}