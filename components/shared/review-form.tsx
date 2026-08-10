'use client'

import { useState } from 'react'
import { createReview } from '@/app/product/[id]/actions'
import Link from 'next/link'

interface ReviewFormProps {
  productId: string
  isLoggedIn: boolean
}

export default function ReviewForm({ productId, isLoggedIn }: ReviewFormProps) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isLoggedIn) {
    return (
      <div className="mt-6 p-4 bg-wheat/30 border border-parchment rounded-sm text-xs text-oak">
        Будь ласка, <Link href="/login" className="text-amber underline font-bold">увійдіть в акаунт</Link>, щоб залишити відгук.
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('productId', productId)
      formData.append('rating', rating.toString())
      formData.append('text', text)

      await createReview(formData)
      setText('')
      setRating(5)
    } catch (err: any) {
      setError(err.message || 'Сталася помилка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-parchment pt-4">
      <h4 className="font-display font-bold text-xs text-bark mb-2">Залишити відгук</h4>
      
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      <div className="mb-3">
        <label className="block text-[10px] text-oak mb-1">Оцінка</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className="text-lg focus:outline-none cursor-pointer transition-transform hover:scale-110"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <span className={(hoverRating || rating) >= star ? "text-amber" : "text-gray-300"}>
                ★
              </span>
            </button>
          ))}
          <span className="ml-2 text-xs text-oak font-body">({rating}/5)</span>
        </div>
      </div>

      <div className="mb-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          placeholder="Поділіться своїми враженнями про цей товар..."
          className="w-full border border-parchment bg-cream p-2 text-xs text-bark rounded-sm focus:outline-none focus:border-amber"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-bark text-cream font-body text-xs px-4 py-2 rounded-sm hover:bg-oak transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? 'Відправляється...' : 'Надіслати відгук'}
      </button>
    </form>
  )
}