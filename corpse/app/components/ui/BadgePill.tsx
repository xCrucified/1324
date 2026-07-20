export function BadgePill({ text }: { text: string }) {
  const styles: Record<string, string> = {
    HOT: 'bg-orange-50 text-orange-600 border-orange-200',
    TOP: 'bg-white text-amber-600 border-amber-200',
    NEW: 'bg-white text-gray-600 border-gray-200',
    SALE: 'bg-orange-600 text-white border-transparent',
    '30% OFF': 'bg-orange-600 text-white border-transparent',
  }

  const currentStyle = styles[text] ?? 'bg-white text-orange-600 border-orange-200'

  return (
    <span
      className={`font-body px-1.5 py-px rounded-sm leading-none inline-block border font-bold tracking-wider ${currentStyle}`}
      style={{ fontSize: '0.58rem' }}
    >
      {text}
    </span>
  )
}