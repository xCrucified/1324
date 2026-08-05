'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function createReview(formData: FormData) {
  const session = await auth()

  if (!session || !session.user || !session.user.email) {
    throw new Error('Ви повинні бути залогинені, щоб залишати відгуки')
  }

  const productId = formData.get('productId') as string
  const rating = parseInt(formData.get('rating') as string, 10)
  const text = formData.get('text') as string

  if (!productId || !rating || !text) {
    throw new Error('Заповніть усі поля')
  }

  let user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name || 'Користувач',
        image: session.user.image,
      },
    })
  }

  // Перевіряємо, чи користувач вже залишав відгук на цей товар
  const existingReview = await prisma.review.findFirst({
    where: {
      productId: productId,
      userId: user.id,
    },
  })

  if (existingReview) {
    throw new Error('Ви вже залишили відгук')
  }

  await prisma.review.create({
    data: {
      rating,
      text,
      productId,
      userId: user.id,
    },
  })

  revalidatePath(`/product/${productId}`)
}