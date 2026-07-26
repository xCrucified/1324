import Link from 'next/link';

const CATEGORIES = [
  { label: "Кераміка", icon: "🏺", count: "2.4k товарів" },
  { label: "Кава та чай", icon: "☕", count: "5.1k товарів" },
  { label: "Текстиль", icon: "🧵", count: "3.8k товарів" },
  { label: "Свічки", icon: "🕯️", count: "1.9k товарів" },
  { label: "Вироби з деревини", icon: "🪵", count: "2.0k товарів" },
  { label: "Рослини та ботаніка", icon: "🌿", count: "1.3k товарів" },
  { label: "Канцелярія", icon: "📄", count: "0.8k товарів" },
  { label: "Кухонний посуд", icon: "🥄", count: "4.2k товарів" },
  { label: "Товари для дому", icon: "🏡", count: "6.5k товарів" },
  { label: "Подарунки", icon: "🎁", count: "3.1k товарів" },
];

export default function CategoryGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="font-display font-bold text-lg text-bark mb-4">Переглянути категорії</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.label}
            href={`/?category=${encodeURIComponent(cat.label)}`}
            className="bg-ivory border border-parchment hover:border-oak transition-colors p-4 rounded-sm flex flex-col items-center text-center group cursor-pointer"
          >
            <span className="text-2xl mb-2">{cat.icon}</span>
            <span className="font-display font-bold text-xs text-bark group-hover:text-caramel transition-colors">
              {cat.label}
            </span>
            <span className="font-body text-[10px] text-oak mt-0.5">{cat.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}