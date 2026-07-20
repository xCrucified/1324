export function TopBar() {
  return (
    <div className="bg-gray-900 text-gray-300" style={{ fontSize: '0.72rem' }}>
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
        <div className="flex gap-4 items-center font-body">
          <span>
            Welcome to <strong className="text-orange-500 font-semibold">Thornfield Market</strong>
          </span>
          <span className="hidden sm:inline text-gray-700">|</span>
          <span className="hidden sm:inline text-gray-400">Free shipping over £40</span>
        </div>
        <div className="flex gap-5 items-center font-body">
          {['Track Order', 'Help', 'Sign In', 'Register'].map((l) => (
            <button
              key={l}
              className="hover:text-white transition-colors text-gray-400 hover:opacity-100 cursor-pointer"
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}