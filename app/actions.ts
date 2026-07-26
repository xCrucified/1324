'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/app/api/auth/[...nextauth]/route'; // Путь к твоему файлу конфига NextAuth
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
    const session = await auth();
    const userId = session?.user?.id; 

    const order = await prisma.order.create({
      data: {
        userId: userId || null, 
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

// Получение списка заказов только текущего пользователя
export async function getOrders() {
  try {
    const session = await auth();
    
    // Если пользователь не авторизован, возвращаем пустой список
    if (!session || !session.user?.id) {
      return [];
    }

    return await prisma.order.findMany({
      where: {
        userId: session.user.id, // Фильтруем заказы строго по ID вошедшего юзера
      },
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