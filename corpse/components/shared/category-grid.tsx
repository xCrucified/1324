import React from 'react';

interface Props {
  className?: string;
}

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

export const CategoryGrid: React.FC<Props> = ({ className }) => {
  return (
    <section className="max-w-7xl mx-auto px-3 mb-4">
      <div className="bg-ivory border border-parchment rounded-sm p-4">
        <h2
          className="font-display text-bark font-semibold mb-3"
          style={{ fontSize: "1rem" }}
        >
          Browse Categories
        </h2>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              className="flex flex-col items-center gap-1.5 p-2 rounded-sm hover:bg-parchment transition-colors group"
            >
              <span style={{ fontSize: "1.6rem" }}>{cat.icon}</span>
              <span
                className="font-body text-bark text-xs text-center leading-tight group-hover:text-caramel transition-colors"
                style={{ fontSize: "0.68rem" }}
              >
                {cat.label}
              </span>
              <span
                className="font-body text-oak"
                style={{ fontSize: "0.58rem" }}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;