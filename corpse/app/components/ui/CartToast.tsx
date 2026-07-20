export function CartToast({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-gray-900 text-white font-body text-sm px-4 py-3 rounded-sm shadow-xl border border-gray-800 flex items-center gap-2.5 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="w-5 h-5 rounded-full bg-orange-600/20 flex items-center justify-center shrink-0">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8l3.5 3.5L13 4"
            stroke="#EA580C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="font-medium text-xs tracking-wide">Added to cart</span>
    </div>
  )
}