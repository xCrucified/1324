import Link from 'next/link';
import { CATEGORY_TREE } from '@/store/categories';

export default function CategoryGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="font-display font-bold text-lg text-bark mb-4">Переглянути категорії</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CATEGORY_TREE.map((cat) => (
          <Link
            key={cat.id}
            href={`/?category=${encodeURIComponent(cat.id)}`}
            className="bg-ivory border border-parchment hover:border-oak transition-colors p-4 rounded-sm flex flex-col items-center text-center group cursor-pointer"
          >
            <span className="text-2xl mb-2">{cat.name.split(' ')[0]}</span>
            <span className="font-display font-bold text-xs text-bark group-hover:text-caramel transition-colors">
              {cat.name.split(' ').slice(1).join(' ')}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}