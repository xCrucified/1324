import { Product } from '@/types/product'
import { ProductCard } from '../../components/shared/ProductCard'

export function ProductSection({
  title,
  products,
  onAdd,
}: {
  title: string
  products: Product[]
  onAdd: () => void
}) {
  return (
    <section className="max-w-7xl mx-auto px-3 mb-4">
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="font-display text-gray-900 font-bold" style={{ fontSize: '1.05rem' }}>
            {title}
          </h2>
          <button className="font-body text-orange-600 text-xs hover:text-orange-700 font-medium transition-colors cursor-pointer">
            See all →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-gray-200 p-px">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </section>
  )
}