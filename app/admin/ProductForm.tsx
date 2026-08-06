'use client'

import React, { useState, useRef, ClipboardEvent, ChangeEvent } from 'react'

interface ProductFormProps {
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

export default function ProductForm({ action }: ProductFormProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [filesList, setFilesList] = useState<File[]>([])

  // Функція оновлення файлів у реальному інпуті через DataTransfer
  const updateInputFiles = (newFiles: File[]) => {
    const dataTransfer = new DataTransfer()
    newFiles.forEach((file) => dataTransfer.items.add(file))
    
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files
    }
    setFilesList(newFiles)
  }

  // Вибір файлів через провідник
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    const newFilesArray = Array.from(selectedFiles)
    const combinedFiles = [...filesList, ...newFilesArray]
    updateInputFiles(combinedFiles)

    const newPreviews = newFilesArray.map((file) => URL.createObjectURL(file))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  // Вставка файлів через Ctrl + V
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

  // Видалення окремої картинки
  const handleRemoveImage = (index: number) => {
    const updatedFiles = filesList.filter((_, i) => i !== index)
    updateInputFiles(updatedFiles)
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const [textUrlsInput, setTextUrlsInput] = useState('')

  return (
    <form 
      action={action}
      className="bg-white p-6 rounded-lg shadow-md border mb-8 space-y-4"
    >
      <h2 className="text-lg font-semibold border-b pb-2">Додати товар вручну</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Назва товару *</label>
          <input 
            type="text" 
            name="title" 
            required 
            placeholder="Наприклад: Стильна куртка" 
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ціна (грн) *</label>
          <input 
            type="number" 
            step="0.01" 
            name="price" 
            required 
            placeholder="0.00" 
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
      </div>

      {/* НОВЕ ПОЛЕ: Вибір категорії */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
          Категорія товару
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue=""
          className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 bg-white"
        >
          <option value="">-- Без категорії --</option>
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

      <div>
        <label className="block text-sm font-medium mb-1">Посилання на товар (1688 / Pinduoduo / і т.д. — необов'язково)</label>
        <input 
          type="text" 
          name="sourceUrl" 
          placeholder="https://detail.1688.com/offer/..." 
          className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Кольори (кожний з нового рядка або через кому)</label>
          <textarea 
            name="colors" 
            rows={3} 
            placeholder="Чорний&#10;Білий&#10;Червоний" 
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Розміри (кожний з нового рядка або через кому)</label>
          <textarea 
            name="sizes" 
            rows={3} 
            placeholder="S&#10;M&#10;L&#10;XL" 
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
      </div>

      {/* Зона завантаження з підтримкою Ctrl + V */}
      <div 
        tabIndex={0}
        onPaste={handlePaste}
        className="space-y-3 p-4 bg-gray-50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black/20 cursor-pointer"
        title="Клікніть сюди та натисніть Ctrl + V, щоб вставити фото з буфера обміну"
      >
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-800 cursor-pointer">
            Фотографії товару <span className="text-xs text-gray-500 font-normal">(Клікніть сюди та натисніть <kbd className="bg-gray-200 px-1 rounded">Ctrl + V</kbd>)</span>
          </label>
        </div>
        
        <div>
          <span className="block text-xs font-medium text-gray-600 mb-1">1. Вибрати файли з комп'ютера або вставити через Ctrl+V:</span>
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
          <span className="block text-xs font-medium text-gray-600 mb-1">2. Або вказати посилання на фото (кожне з нового рядка):</span>
          <textarea 
            name="imagesText" 
            rows={2} 
            value={textUrlsInput}
            onChange={(e) => setTextUrlsInput(e.target.value)}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" 
            className="w-full border bg-white rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 font-mono text-xs"
          />
        </div>

        {/* Прев'ю картинок */}
        {previews.length > 0 && (
          <div>
            <span className="block text-xs font-medium text-gray-700 mb-2">Попередній перегляд обраних фото (перше буде головним):</span>
            <div className="flex flex-wrap gap-3">
              {previews.map((src, index) => (
                <div key={index} className="relative w-20 h-20 border rounded bg-white overflow-hidden shadow-sm group">
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

      <div>
        <label className="block text-sm font-medium mb-1">Опис товару</label>
        <textarea 
          name="description" 
          rows={3} 
          placeholder="Детальний опис товару..." 
          className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
        />
      </div>

      <button 
        type="submit" 
        className="bg-black text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-gray-800 transition w-full md:w-auto"
      >
        Додати товар
      </button>
    </form>
  )
}