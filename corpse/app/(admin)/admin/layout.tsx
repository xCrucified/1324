import "@/app/globals.css";

export const metadata = {
  title: 'ChinaDrop Admin Panel',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        <header className="bg-slate-900 text-white py-4 px-8 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-xs font-bold px-2.5 py-1 rounded">ADMIN</span>
            <h1 className="font-semibold text-lg">ChinaDrop Control Panel</h1>
          </div>
          <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            🟢 Localhost Node Mode
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </body>
    </html>
  )
}