/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EventEntity } from '@paddle/paddle-node-sdk';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('paddle-signature');
    const rawBody = await request.text();

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event: EventEntity = JSON.parse(rawBody);

    if (event.eventType === 'transaction.completed') {
      const transaction = event.data as any;
      
      const customerEmail = transaction?.customer?.email || transaction?.billingDetails?.email || 'unknown@example.com';
      const customerName = transaction?.customer?.name || 'Customer';
      
      const totals = transaction?.details?.totals;
      const totalAmount = totals?.total ? Number(totals.total) / 100 : 0;

      await prisma.order.create({
        data: {
          email: customerEmail,
          firstName: customerName,
          lastName: '',
          address: 'Digital Product',
          city: 'Online',
          country: 'UA',
          total: totalAmount,
          itemsCount: transaction?.items?.length || 1,
          status: 'Processing',
          payment: 'paddle',
        },
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Ошибка обработки вебхука Paddle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}