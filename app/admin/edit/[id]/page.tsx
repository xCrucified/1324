/* eslint-disable @next/next/no-img-element */
import { prisma } from '@/lib/prisma'
import { updateProduct } from '../../actions'
import Link from 'next/link'

interface EditPageProps {
  params: Promise<{ id: string }>
}

const CATEGORY_TREE = [
  {
    id: 'clothing',
    name: '👗 Одяг та Взуття',
    subcategories: [
      { id: 'clothing-women', name: 'Жіночий одяг' },
      { id: 'clothing-men', name: 'Чоловічий одяг' },
      { id: 'clothing-kids', name: 'Дитячий одяг' },
      { id: 'clothing-sleep', name: 'Піжами' },
      { id: 'clothing-sport', name: 'Спортивні костюми' },
      { id: 'clothing-shoes', name: 'Взуття' },
      { id: 'clothing-other', name: 'Інше' },
    ],
  },
  {
    id: 'accessories',
    name: '🎒 Аксесуари',
    subcategories: [
      { id: 'acc-bags', name: 'Сумки та барсетки' },
      { id: 'acc-backpacks', name: 'Рюкзаки' },
      { id: 'acc-jewelry', name: 'Біжутерія' },
      { id: 'acc-hair', name: 'Аксесуари для волосся' },
      { id: 'acc-smart', name: 'Смарт-годинники та браслети' },
      { id: 'acc-glasses', name: 'Окуляри' },
      { id: 'acc-other', name: 'Інше' },
    ],
  },
  {
    id: 'home',
    name: '🏠 Товари для дому',
    subcategories: [
      { id: 'home-organizers', name: 'Органайзери' },
      { id: 'home-smart-gadgets', name: 'Міні-гаджети' },
      { id: 'home-kitchen', name: 'Кухонне приладдя та посуд' },
      { id: 'home-decor', name: 'Декор' },
      { id: 'home-textile', name: 'Текстиль' },
      { id: 'home-other', name: 'Інше' },
    ],
  },
];

// Допоміжна функція для пошуку зрозумілої назви категорії за її ID
function getCategoryNameById(catId?: string | null): string | null {
  if (!catId) return null;

  for (const parent of CATEGORY_TREE) {
    if (parent.id === catId) return parent.name;
    const sub = parent.subcategories.find((s) => s.id === catId);
    if (sub) return `${parent.name} → ${sub.name}`;
  }

  return catId; // Якщо в базі ID є, але в дереві не знайшли
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

  // Отримуємо назву поточної категорії для відображення
  const currentCategoryName = getCategoryNameById(product.categoryId);

  // Підготовлюємо список всіх картинок для textarea (по 1 посиланню на рядок)
  const imagesListText = product.images && product.images.length > 0
    ? product.images.join('\n')
    : (product.image || '')

  // Збираємо список для попереднього перегляду
  const previewImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.image ? [product.image] : [])

  // Зв'язуємо ID з серверним екшеном
  const updateProductWithId = updateProduct.bind(null, id)

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Редагувати товар</h1>
        <span className="text-xs font-mono text-gray-400">ID: {product.id}</span>
      </div>

      <form 
        action={updateProductWithId}
        className="space-y-4 bg-white p-6 rounded-lg shadow border"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Назва</label>
          <input 
            type="text" 
            name="title" 
            defaultValue={product.title} 
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            required
          />
        </div>

        {/* Секція Категорії */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium">Категорія</label>
            
            {/* Статус поточної категорії */}
            <span className="text-xs">
              {currentCategoryName ? (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                  Зараз обрано: {currentCategoryName}
                </span>
              ) : (
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                  ⚠️ Категорію ще не обрано
                </span>
              )}
            </span>
          </div>

          <select 
            name="categoryId" 
            defaultValue={product.categoryId || ''} 
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 bg-white font-medium"
            required
          >
            <option value="" disabled>-- Оберіть категорію зі списку --</option>
            {CATEGORY_TREE.map((parent) => (
              <optgroup key={parent.id} label={parent.name}>
                <option value={parent.id}>Головна: {parent.name}</option>
                {parent.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    ↳ {sub.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ціна (грн)</label>
          <input 
            type="number" 
            step="0.01" 
            name="price" 
            defaultValue={product.price} 
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Опис / Характеристики</label>
          <textarea 
            name="description" 
            defaultValue={product.description || ''} 
            className="w-full border rounded p-2 text-sm h-36 font-sans focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Головне фото (URL)</label>
          <input 
            type="text" 
            name="image" 
            defaultValue={product.image || ''} 
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Галерея картинок (кожне URL-посилання з нового рядка)
          </label>
          <textarea 
            name="images" 
            defaultValue={imagesListText} 
            className="w-full border rounded p-2 text-sm h-32 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-black/5"
            placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
          />
        </div>

        {/* Сітка попереднього перегляду всієї галереї */}
        {previewImages.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Попередній перегляд зображень ({previewImages.length}):
            </p>
            <div className="grid grid-cols-4 gap-2 border p-2 rounded bg-gray-50 max-h-48 overflow-y-auto">
              {previewImages.map((imgUrl, index) => (
                <div key={index} className="relative group aspect-square border rounded overflow-hidden bg-white">
                  <img 
                    src={imgUrl} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded font-mono">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t mt-6">
          <button 
            type="submit" 
            className="bg-black text-white px-5 py-2 rounded text-sm font-medium hover:bg-gray-800 transition"
          >
            Зберегти зміни
          </button>
          <Link 
            href="/admin" 
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50 transition flex items-center"
          >
            Скасувати
          </Link>
        </div>
      </form>
    </div>
  )
}