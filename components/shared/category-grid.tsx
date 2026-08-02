import Link from 'next/link';

const CATEGORIES = [
  { label: "Кераміка", icon: "🏺", count: "2.4k товарів" },
];

export default function CategoryGrid() {
  // return (
  //   <div className="max-w-7xl mx-auto px-4 py-6">
  //     <h2 className="font-display font-bold text-lg text-bark mb-4">Переглянути категорії</h2>
  //     <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
  //       {CATEGORIES.map((cat) => (
  //         <Link
  //           key={cat.label}
  //           href={`/?category=${encodeURIComponent(cat.label)}`}
  //           className="bg-ivory border border-parchment hover:border-oak transition-colors p-4 rounded-sm flex flex-col items-center text-center group cursor-pointer"
  //         >
  //           <span className="text-2xl mb-2">{cat.icon}</span>
  //           <span className="font-display font-bold text-xs text-bark group-hover:text-caramel transition-colors">
  //             {cat.label}
  //           </span>
  //           <span className="font-body text-[10px] text-oak mt-0.5">{cat.count}</span>
  //         </Link>
  //       ))}
  //     </div>
  //   </div>
  // );
}