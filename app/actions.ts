'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/app/api/auth/[...nextauth]/route'; 
import { revalidatePath } from 'next/cache';
import { put } from "@vercel/blob";
import bcrypt from "bcryptjs";

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

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Не авторизовано");
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const avatarFile = formData.get("avatarFile") as File | null;

  const updateData: { name: string; email: string; password?: string; image?: string } = {
    name: `${firstName.trim()} ${lastName.trim()}`.trim(),
    email: email.trim(),
  };

  if (password && password.length >= 6) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  if (avatarFile && avatarFile.size > 0) {
    // Сохраняем в Vercel Blob
    const blob = await put(`avatars/${session.user.id}-${Date.now()}-${avatarFile.name}`, avatarFile, {
      access: 'public',
    });
    updateData.image = blob.url;
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
  });

  return { 
    success: true, 
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
    } 
  };
}