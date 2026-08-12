import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    let priceAmount = Number(body.priceAmount || body.total || 0);

    // Підрахунок суми, якщо вона не передана напряму
    if (priceAmount <= 0 && Array.isArray(body.items) && body.items.length > 0) {
      priceAmount = body.items.reduce(
        (sum: number, item: { price?: number | string; quantity?: number | string }) =>
          sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
      );
    }

    if (priceAmount <= 0) {
      return NextResponse.json({ error: 'Сума замовлення повинна бути більшою за нуль' }, { status: 400 });
    }

    const orderId = `order_${Date.now()}`;
    // Беремо останні 8 символів для короткого коментаря
    const shortOrderId = orderId.slice(-8);

    // Створюємо замовлення в базі з усіма необхідними полями
    const order = await prisma.order.create({
      data: {
        id: orderId,
        firstName: body.firstName || 'Гість',
        lastName: body.lastName || '',
        email: body.email || 'client@pentu24.com',
        phone: body.phone || '',
        city: body.city || '',
        warehouse: body.warehouse || '',
        telegram: body.telegram || null,
        total: priceAmount,
        status: 'Processing',
        itemsCount: Array.isArray(body.items)
          ? body.items.reduce(
              (acc: number, item: { quantity?: number | string }) => acc + (Number(item.quantity) || 1),
              0
            )
          : 1,
        orderItems: {
          create: Array.isArray(body.items) && body.items.length
            ? body.items.map((item: any) => ({
                productId: item.productId || item.id,
                quantity: Number(item.quantity) || 1,
                price: Number(item.price) || priceAmount,
                size: item.size || null,
                color: item.color || null,
              }))
            : [],
        },
      },
    });

    const publicJarCode = process.env.MONOBANK_PUBLIC_JAR_CODE;

    if (!publicJarCode) {
      return NextResponse.json({ error: 'MONOBANK_PUBLIC_JAR_CODE missing' }, { status: 500 });
    }

    // Генеруємо посилання на банку (a = сума, text = коментар)
    const paymentUrl = `https://send.monobank.ua/${publicJarCode}?a=${priceAmount}&text=${shortOrderId}`;

    return NextResponse.json({
      success: true,
      payment_id: order.id,
      short_order_id: shortOrderId,
      payment_url: paymentUrl,
      pay_amount: priceAmount,
    });

  } catch (e) {
    console.error('Payment API Error:', e);
    return NextResponse.json(
      { error: "SERVER ERROR", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}