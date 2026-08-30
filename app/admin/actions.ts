'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function verifyAdmin() {
  const isAdmin = true; // await checkUserRole() === 'ADMIN'
  if (!isAdmin) {
    throw new Error('У вас немає прав для виконання цієї операції')
  }
}

export async function createProduct(formData: FormData) {
  await verifyAdmin()

  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string)
  const description = formData.get('description') as string
  const categoryId = (formData.get('categoryId') as string) || null
  const sourceUrl = (formData.get('sourceUrl') as string) || null

  const rawSizes = formData.get('sizes') as string | null
  let parsedSizes: string[] = []
  if (rawSizes && rawSizes.trim() !== '') {
    try {
      parsedSizes = JSON.parse(rawSizes)
    } catch {
      parsedSizes = rawSizes.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }

  const rawColorVariants = formData.get('colorVariants') as string | null
  let parsedColorVariants: string[] = []
  if (rawColorVariants && rawColorVariants.trim() !== '') {
    try {
      parsedColorVariants = JSON.parse(rawColorVariants)
    } catch {
      parsedColorVariants = rawColorVariants.split(',').map((c) => c.trim()).filter(Boolean)
    }
  }

  const rawImagesText = formData.get('imagesText') as string
  const textImages = rawImagesText
    ? rawImagesText.split('\n').map((url) => url.trim()).filter((url) => url.length > 0)
    : []

  // ВНИМАНИЕ: Для продакшена замени конвертацию в Base64 на загрузку в облако (S3/Cloudinary/Vercel Blob)
  const imageFiles = formData.getAll('imageFiles') as File[]
  const uploadedImageUrls: string[] = []

  for (const file of imageFiles) {
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`
      uploadedImageUrls.push(base64Image)
    }
  }

  const allImages = [...uploadedImageUrls, ...textImages]
  const mainImage = allImages[0] || ''

  await prisma.product.create({
    data: {
      title,
      price: isNaN(price) ? 0 : price,
      description,
      image: mainImage,
      images: allImages,
      categoryId,
      sourceUrl,
      sizes: parsedSizes,
      colorVariants: parsedColorVariants,
    },
  })

  revalidatePath('/admin')
  revalidatePath('/store')
  redirect('/admin')
}

export async function updateProduct(id: string, formData: FormData) {
  await verifyAdmin()

  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string)
  const description = formData.get('description') as string
  const categoryId = (formData.get('categoryId') as string) || null
  const sourceUrl = (formData.get('sourceUrl') as string) || null

  const rawSizes = formData.get('sizes') as string | null
  let parsedSizes: string[] = []
  if (rawSizes && rawSizes.trim() !== '') {
    try {
      parsedSizes = JSON.parse(rawSizes)
    } catch {
      parsedSizes = rawSizes.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }

  const rawColorVariants = formData.get('colorVariants') as string | null
  let parsedColorVariants: string[] = []
  if (rawColorVariants && rawColorVariants.trim() !== '') {
    try {
      parsedColorVariants = JSON.parse(rawColorVariants)
    } catch {
      parsedColorVariants = rawColorVariants.split(',').map((c) => c.trim()).filter(Boolean)
    }
  }

  const rawImagesText = formData.get('imagesText') as string
  const textImages = rawImagesText
    ? rawImagesText.split('\n').map((url) => url.trim()).filter((url) => url.length > 0)
    : []

  const imageFiles = formData.getAll('imageFiles') as File[]
  const uploadedImageUrls: string[] = []

  for (const file of imageFiles) {
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`
      uploadedImageUrls.push(base64Image)
    }
  }

  const allImages = [...uploadedImageUrls, ...textImages]
  const mainImage = allImages[0] || ''

  await prisma.product.update({
    where: { id },
    data: {
      title,
      price: isNaN(price) ? 0 : price,
      description,
      image: mainImage,
      images: allImages,
      categoryId,
      sourceUrl,
      sizes: parsedSizes,
      colorVariants: parsedColorVariants,
    },
  })

  revalidatePath('/admin')
  revalidatePath('/store')
  revalidatePath(`/admin/edit/${id}`)
  redirect('/admin')
}

export async function deleteProduct(id: string) {
  await verifyAdmin()
  
  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin')
  revalidatePath('/store')
}

export async function deleteProducts(ids: string[]) {
  await verifyAdmin()

  if (!ids || ids.length === 0) return
  await prisma.product.deleteMany({
    where: { id: { in: ids } },
  })
  revalidatePath('/admin')
  revalidatePath('/store')
}

export async function deleteOrder(id: string) {
  await verifyAdmin()
  
  await prisma.order.delete({ where: { id } })
  revalidatePath('/admin')
}

export async function deleteOrders(ids: string[]) {
  await verifyAdmin()

  if (!ids || ids.length === 0) return
  await prisma.order.deleteMany({
    where: { id: { in: ids } },
  })
  revalidatePath('/admin')
}

export async function updateOrderStatus(orderId: string, status: string) {
  await verifyAdmin()
  
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })
    revalidatePath('/admin')
  } catch (error) {
    console.error('Failed to update order status:', error)
    throw new Error('Не вдалося оновити статус замовлення')
  }
}

export async function deleteReview(reviewId: string) {
  await verifyAdmin()

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  })

  if (!review) return

  await prisma.review.delete({
    where: { id: reviewId },
  })

  revalidatePath(`/product/${review.productId}`)
  revalidatePath('/admin')
}

export async function deleteReviews(reviewIds: string[]) {
  await verifyAdmin()

  if (!reviewIds || reviewIds.length === 0) return

  const reviews = await prisma.review.findMany({
    where: { id: { in: reviewIds } },
    select: { id: true, productId: true },
  })

  await prisma.review.deleteMany({
    where: { id: { in: reviewIds } },
  })

  reviews.forEach(rev => {
    revalidatePath(`/product/${rev.productId}`)
  })
  revalidatePath('/admin')
}