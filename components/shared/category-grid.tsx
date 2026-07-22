import Link from 'next/link';

const CATEGORIES = [
  { label: "Ceramics", icon: "🏺", count: "2.4k items" },
  { label: "Coffee & Tea", icon: "☕", count: "5.1k items" },
  { label: "Textiles", icon: "🧵", count: "3.8k items" },
  { label: "Candles", icon: "🕯️", count: "1.9k items" },
  { label: "Woodwork", icon: "🪵", count: "2.0k items" },
  { label: "Botanicals", icon: "🌿", count: "1.3k items" },
  { label: "Stationery", icon: "📄", count: "0.8k items" },
  { label: "Kitchenware", icon: "🥄", count: "4.2k items" },
  { label: "Homeware", icon: "🏡", count: "6.5k items" },
  { label: "Gifts", icon: "🎁", count: "3.1k items" },
];

export default function CategoryGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="font-display font-bold text-lg text-bark mb-4">Browse Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.label}
            href={`/?category=${encodeURIComponent(cat.label)}`}
            className="bg-ivory border border-parchment hover:border-oak transition-colors p-4 rounded-sm flex flex-col items-center text-center group"
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