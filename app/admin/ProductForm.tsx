'use client'

import { useState, useRef, ClipboardEvent, ChangeEvent } from 'react'

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>
}

export default function ProductForm({ action }: ProductFormProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [filesList, setFilesList] = useState<File[]>([])

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

  const [textUrlsInput, setTextUrlsInput] = useState('')

  return (
    <form 
      action={action}
      className="bg-white p-6 rounded-lg shadow-md border mb-8 space-y-4"
    >
      <h2 className="text-lg font-semibold border-b pb-2">Добавить товар вручную</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Название товара *</label>
          <input 
            type="text" 
            name="title" 
            required 
            placeholder="Например: Стильная куртка" 
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Цена (€) *</label>
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

      <div>
        <label className="block text-sm font-medium mb-1">Ссылка на товар (1688 / Pinduoduo / и т.д. — необязательно)</label>
        <input 
          type="text" 
          name="sourceUrl" 
          placeholder="https://detail.1688.com/offer/..." 
          className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 text-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Цвета (каждый с новой строки или через запятую)</label>
          <textarea 
            name="colors" 
            rows={3} 
            placeholder="Черный&#10;Белый&#10;Красный" 
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Размеры (каждый с новой строки или через запятую)</label>
          <textarea 
            name="sizes" 
            rows={3} 
            placeholder="S&#10;M&#10;L&#10;XL" 
            className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
      </div>

      <div 
        tabIndex={0}
        onPaste={handlePaste}
        className="space-y-3 p-4 bg-gray-50 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black/20 cursor-pointer"
        title="Кликните сюда и нажмите Ctrl + V, чтобы вставить фото из буфера обмена"
      >
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-800 cursor-pointer">
            Фотографии товара <span className="text-xs text-gray-500 font-normal">(Кликните сюда и нажмите <kbd className="bg-gray-200 px-1 rounded">Ctrl + V</kbd>)</span>
          </label>
        </div>
        
        <div>
          <span className="block text-xs font-medium text-gray-600 mb-1">1. Выбрать файлы с компьютера или вставить через Ctrl+V:</span>
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
          <span className="block text-xs font-medium text-gray-600 mb-1">2. Или указать ссылки на фото (каждая с новой строки):</span>
          <textarea 
            name="imagesText" 
            rows={2} 
            value={textUrlsInput}
            onChange={(e) => setTextUrlsInput(e.target.value)}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" 
            className="w-full border bg-white rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 font-mono text-xs"
          />
        </div>

        {/* Превью картинок */}
        {previews.length > 0 && (
          <div>
            <span className="block text-xs font-medium text-gray-700 mb-2">Превью выбранных фото (первое будет главным):</span>
            <div className="flex flex-wrap gap-3">
              {previews.map((src, index) => (
                <div key={index} className="relative w-20 h-20 border rounded bg-white overflow-hidden shadow-sm group">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  {index === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] text-center font-medium py-0.5">
                      Главное
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                    title="Удалить фото"
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
        <label className="block text-sm font-medium mb-1">Описание товара</label>
        <textarea 
          name="description" 
          rows={3} 
          placeholder="Подробное описание товара..." 
          className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
        />
      </div>

      <button 
        type="submit" 
        className="bg-black text-white px-6 py.2.5 rounded text-sm font-medium hover:bg-gray-800 transition w-full md:w-auto"
      >
        Добавить товар
      </button>
    </form>
  )
}