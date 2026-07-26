import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type MonobankTransaction = {
  comment?: string;
  description?: string;
  amount: number;
};

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'Paid') {
      return NextResponse.json({ success: true, status: 'Paid' });
    }

    const jarId = process.env.MONOBANK_JAR_ID;
    const token = process.env.MONOBANK_API_TOKEN;

    if (!jarId || !token) {
      return NextResponse.json({ error: 'Monobank credentials not configured' }, { status: 500 });
    }

    const toTime = Math.floor(Date.now() / 1000);
    const fromTime = toTime - (24 * 60 * 60);

    // Додано обов'язковий параметр toTime до запиту виписки Monobank
    const monoRes = await fetch(
      `https://api.monobank.ua/personal/statement/${jarId}/${fromTime}/${toTime}`,
      {
        headers: { 'X-Token': token },
        cache: 'no-store',
      }
    );

    if (!monoRes.ok) {
      return NextResponse.json({ error: 'Rate limit or Bank API error' }, { status: monoRes.status });
    }

    const transactions = await monoRes.json() as MonobankTransaction[];

    // Пошук за останніми 8 символами ID або повним ID
    const shortOrderId = order.id.length > 10 ? order.id.slice(-8) : order.id;

    const paymentFound = transactions.find((tx: MonobankTransaction) => {
      const hasComment = tx.comment && tx.comment.includes(shortOrderId);
      const hasDescription = tx.description && tx.description.includes(shortOrderId);
      return hasComment || hasDescription;
    });

    if (paymentFound) {
      const orderTotalInCents = Math.round(order.total * 100);

      if (paymentFound.amount >= orderTotalInCents) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'Paid' },
        });

        return NextResponse.json({ success: true, status: 'Paid' });
      }
    }

    return NextResponse.json({ success: false, status: 'Processing' });

  } catch (error) {
    console.error('Помилка перевірки платежу:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}