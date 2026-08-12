import { prisma } from '@/lib/prisma'
import { updateProduct } from '../../actions'
import Link from 'next/link'
import EditProductForm from './EditProductForm'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditPageProps) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Товар не знайдено</h2>
        <p className="text-sm text-gray-500">Можливо, він був видалений або вказано невірний ID.</p>
        <Link 
          href="/admin" 
          className="inline-block bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition"
        >
          Повернутися в панель управління
        </Link>
      </div>
    )
  }

  // Зв'язуємо ID з серверним екшеном
  const updateProductWithId = updateProduct.bind(null, id)

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Редагувати товар</h1>
        <span className="text-xs font-mono text-gray-400">ID: {product.id}</span>
      </div>

      <EditProductForm product={product} action={updateProductWithId} />
    </div>
  )
}