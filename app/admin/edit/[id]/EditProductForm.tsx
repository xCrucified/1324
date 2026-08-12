'use client'

import React, { useState, useRef, ClipboardEvent, ChangeEvent } from 'react'
import Link from 'next/link'

interface ColorVariant {
  id: string
  name: string
  preview: string
}

interface EditProductFormProps {
  product: any
  action: (formData: FormData) => Promise<void>
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
]

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

function getCategoryNameById(catId?: string | null): string | null {
  if (!catId) return null
  for (const parent of CATEGORY_TREE) {
    if (parent.id === catId) return parent.name
    const sub = parent.subcategories.find((s) => s.id === catId)
    if (sub) return `${parent.name} → ${sub.name}`
  }
  return catId
}

export default function EditProductForm({ product, action }: EditProductFormProps) {
  // Ініціалізація картинок
  const initialImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.image ? [product.image] : [])

  const [previews, setPreviews] = useState<string[]>(initialImages)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [filesList, setFilesList] = useState<File[]>([])

  // Ініціалізація розмірів
  const initialSizes = product.sizes 
    ? (typeof product.sizes === 'string' ? product.sizes.split('\n').map((s: string) => s.trim()).filter(Boolean) : product.sizes)
    : []
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialSizes)

  // Ініціалізація кольорових іконок
  let parsedColorVariants: ColorVariant[] = []
  try {
    if (product.colorVariants) {
      const raw = typeof product.colorVariants === 'string' 
        ? JSON.parse(product.colorVariants) 
        : product.colorVariants
      parsedColorVariants = Array.isArray(raw) ? raw.map((v: any, index: number) => ({
        id: `variant-${index}`,
        name: v.name || '',
        preview: v.image || v.preview || ''
      })) : []
    }
  } catch (e) {
    parsedColorVariants = []
  }

  const [colorVariants, setColorVariants] = useState<ColorVariant[]>(parsedColorVariants)
  const [textUrlsInput, setTextUrlsInput] = useState(
    product.images && product.images.length > 0 ? product.images.join('\n') : (product.image || '')
  )

  const currentCategoryName = getCategoryNameById(product.categoryId)

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) => 
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const updateInputFiles = (newFiles: File[]) => {
    const dataTransfer = new DataTransfer()
    newFiles.forEach((file) => dataTransfer.items.add(file))
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files
    }
    setFilesList(newFiles)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    const newFilesArray = Array.from(selectedFiles)
    const combinedFiles = [...filesList, ...newFilesArray]
    updateInputFiles(combinedFiles)

    const newPreviews = newFilesArray.map((file) => URL.createObjectURL(file))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    const pastedFiles: File[] = []
    const pastedPreviews: string[] = []

    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile()
        if (file) {
          pastedFiles.push(file)
          pastedPreviews.push(URL.createObjectURL(file))
        }
      }
    }

    if (pastedFiles.length > 0) {
      e.preventDefault()
      const combinedFiles = [...filesList, ...pastedFiles]
      updateInputFiles(combinedFiles)
      setPreviews((prev) => [...prev, ...pastedPreviews])
    }
  }

  const handleRemoveImage = (index: number) => {
    const updatedFiles = filesList.filter((_, i) => i !== index)
    updateInputFiles(updatedFiles)
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  // Обробники для іконок кольорів
  const handleColorPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    let hasImage = false
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile()
        if (file) {
          hasImage = true
          const reader = new FileReader()
          reader.onload = (event) => {
            const base64 = event.target?.result as string
            setColorVariants((prev) => [
              ...prev,
              { id: Math.random().toString(36).substring(7), name: '', preview: base64 }
            ])
          }
          reader.readAsDataURL(file)
        }
      }
    }
    if (hasImage) e.preventDefault()
  }

  const handleColorFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setColorVariants((prev) => [
          ...prev,
          { id: Math.random().toString(36).substring(7), name: '', preview: base64 }
        ])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleColorNameChange = (id: string, newName: string) => {
    setColorVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, name: newName } : v))
    )
  }

  const handleRemoveColorVariant = (id: string) => {
    setColorVariants((prev) => prev.filter((v) => v.id !== id))
  }

  return (
    <form action={action} className="space-y-4 bg-white p-6 rounded-lg shadow border">
      <div>
        <label className="block text-sm font-medium mb-1">Назва *</label>
        <input 
          type="text" 
          name="title" 
          defaultValue={product.title} 
          className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ціна (грн) *</label>
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
          <label className="block text-sm font-medium mb-1">Посилання на джерело (1688 / Pinduoduo)</label>
          <input 
            type="text" 
            name="sourceUrl" 
            defaultValue={product.sourceUrl || ''} 
            placeholder="https://detail.1688.com/offer/..." 
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-600"
          />
        </div>
      </div>

      {/* Секція Категорії */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium">Категорія</label>
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
          {CATEGORY_TREE.map((category) => (
            <React.Fragment key={category.id}>
              <option value={category.id} className="font-bold">
                {category.name}
              </option>
              {category.subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  &nbsp;&nbsp;&nbsp;↳ {sub.name}
                </option>
              ))}
            </React.Fragment>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Кольори (текстом)</label>
            <textarea 
              name="colors" 
              rows={2} 
              defaultValue={product.colors || ''} 
              placeholder="Чорний&#10;Білий" 
              className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>

          {/* Блок іконок кольорів з фото */}
          <div 
            tabIndex={0}
            onPaste={handleColorPaste}
            className="p-3 bg-gray-50 border rounded-lg space-y-2 focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            <label className="block text-sm font-medium text-gray-800">
              🎨 Іконки кольорів з фото <span className="text-xs text-gray-500 font-normal">(Клікніть і натисніть <kbd className="bg-gray-200 px-1 rounded">Ctrl + V</kbd>)</span>
            </label>

            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleColorFilesChange}
              className="w-full border bg-white rounded p-1.5 text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
            />

            {colorVariants.length > 0 && (
              <div className="space-y-2 pt-2">
                {colorVariants.map((variant) => (
                  <div key={variant.id} className="flex items-center gap-2 bg-white p-2 border rounded shadow-sm">
                    <div className="w-10 h-10 flex-shrink-0 border rounded overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={variant.preview} alt="Color icon" className="w-full h-full object-cover" />
                    </div>
                    <input 
                      type="text"
                      value={variant.name}
                      onChange={(e) => handleColorNameChange(variant.id, e.target.value)}
                      placeholder="Назва кольору (напр. Червоний)"
                      className="w-full border rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveColorVariant(variant.id)}
                      className="bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-700 transition flex-shrink-0"
                      title="Видалити"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input 
              type="hidden" 
              name="colorVariants" 
              value={JSON.stringify(colorVariants.map(v => ({ name: v.name, image: v.preview })))} 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Розміри</label>
          <div className="flex flex-wrap gap-x-4 gap-y-3 p-3 border rounded bg-gray-50/50">
            <label className="flex items-center space-x-2 cursor-pointer w-full pb-2 border-b border-gray-200">
              <input 
                type="checkbox" 
                checked={selectedSizes.includes('One Size')}
                onChange={() => handleSizeToggle('One Size')}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm font-semibold text-gray-800">One Size (Універсальний)</span>
            </label>
            
            {STANDARD_SIZES.map((size) => (
              <label key={size} className="flex items-center space-x-1.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedSizes.includes(size)}
                  onChange={() => handleSizeToggle(size)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-700">{size}</span>
              </label>
            ))}
          </div>
          <input 
            type="hidden" 
            name="sizes" 
            value={selectedSizes.join('\n')} 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Опис / Характеристики</label>
        <textarea 
          name="description" 
          defaultValue={product.description || ''} 
          className="w-full border rounded p-2 text-sm h-36 font-sans focus:outline-none focus:ring-2 focus:ring-black/5"
        />
      </div>

      {/* Зона завантаження основних фото з підтримкою Ctrl + V */}
      <div 
        tabIndex={0}
        onPaste={handlePaste}
        className="space-y-3 p-4 bg-gray-50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black/20 cursor-pointer"
        title="Клікніть сюди та натисніть Ctrl + V, щоб вставити фото з буфера обміну"
      >
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-800 cursor-pointer">
            Фотографії товару <span className="text-xs text-gray-500 font-normal">(Клікніть і натисніть <kbd className="bg-gray-200 px-1 rounded">Ctrl + V</kbd>)</span>
          </label>
        </div>
        
        <div>
          <span className="block text-xs font-medium text-gray-600 mb-1">1. Вибрати файли або вставити через Ctrl+V:</span>
          <input 
            ref={fileInputRef}
            type="file" 
            name="imageFiles" 
            multiple 
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border bg-white rounded p-2 text-sm text-gray-600 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
          />
        </div>

        <div>
          <span className="block text-xs font-medium text-gray-600 mb-1">2. Або посилання на фото (кожне з нового рядка):</span>
          <textarea 
            name="imagesText" 
            rows={2} 
            value={textUrlsInput}
            onChange={(e) => setTextUrlsInput(e.target.value)}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" 
            className="w-full border bg-white rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 font-mono text-xs"
          />
        </div>

        {previews.length > 0 && (
          <div>
            <span className="block text-xs font-medium text-gray-700 mb-2">Попередній перегляд обраних фото (перше буде головним):</span>
            <div className="flex flex-wrap gap-3">
              {previews.map((src, index) => (
                <div key={index} className="relative w-20 h-20 border rounded bg-white overflow-hidden shadow-sm group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  {index === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] text-center font-medium py-0.5">
                      Головне
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                    title="Видалити фото"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
  )
}