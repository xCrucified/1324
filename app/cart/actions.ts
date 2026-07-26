/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createOrder(formData: {
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  warehouse: string
  telegram?: string
  userId?: string
  items: Array<{
    productId: string
    quantity: number
    price: number
    size?: string
    color?: string
  }>
  total: number
}) {
  try {
    // Створюємо замовлення та пов'язаніOrderItem в одній транзакції
    const order = await prisma.order.create({
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || 'no-email@pentu24.com',
        phone: formData.phone,
        city: formData.city,
        warehouse: formData.warehouse,
        telegram: formData.telegram,
        total: formData.total,
        itemsCount: formData.items.reduce((acc, item) => acc + item.quantity, 0),
        status: 'Processing',
        userId: formData.userId || null,
        orderItems: {
          create: formData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size || null,
            color: item.color || null,
          })),
        },
      },
    })

    revalidatePath('/admin')
    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('Помилка при створенні замовлення:', error)
    return { success: false, error: 'Не вдалося створити замовлення' }
  }
}