'use server';

import { prisma } from '@/lib/prisma'; // Убедись, что у тебя настроен клиент prisma, либо импортируй из своего файла
import { revalidatePath } from 'next/cache';

// Создание заказа из чекаута
export async function createOrder(data: {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  country: string;
  payment: string;
  total: number;
  items: { productId: string; quantity: number; price: number }[];
}) {
  try {
    const order = await prisma.order.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        address: data.address,
        city: data.city,
        country: data.country,
        payment: data.payment,
        total: data.total,
        itemsCount: data.items.reduce((sum, item) => sum + item.quantity, 0),
        status: 'Processing',
        orderItems: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    revalidatePath('/orders');
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Failed to create order:', error);
    return { success: false, error: 'Failed to create order' };
  }
}

// Получение списка заказов
export async function getOrders() {
  try {
    return await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return [];
  }
}