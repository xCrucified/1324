import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const priceAmount = Number(body.priceAmount) || 0;

    if (priceAmount <= 0) {
      return NextResponse.json(
        { error: 'Сумма заказа должна быть больше нуля' },
        { status: 400 }
      );
    }

    // 1. Создаем платеж со скрытой/зафиксированной валютой USDT TRC20
    const payload = {
      price_amount: priceAmount,
      price_currency: 'usd',
      pay_currency: 'usdttrc20', // По умолчанию USDT в сети Tron
      order_id: body.orderId || `order_${Date.now()}`,
      order_description: body.orderDescription || 'Оплата картой Visa/Mastercard',
      ipn_callback_url: process.env.NOWPAYMENTS_IPN_CALLBACK_URL || undefined,
    };

    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NOWPAYMENTS_API_KEY!,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: 'Ошибка ответа NOWPayments API', rawResponse: text },
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      console.error('Ошибка NOWPayments:', data);
      return NextResponse.json(data, { status: response.status });
    }

    // 2. Генерируем прямую ссылку на эквайринг (покупку USDT картой)
    // В NOWPayments покупка USDT картой идет через встроенный процессинг ChangeNOW/Guardarian:
    const cardPaymentUrl = `https://nowpayments.io/payment/?iid=${data.payment_id}`;

    return NextResponse.json({
      success: true,
      payment_id: data.payment_id,
      payment_url: cardPaymentUrl,
      pay_address: data.pay_address,
      pay_amount: data.pay_amount,
    });
  } catch (e) {
    console.error('Критическая ошибка бэкенда /api/payment:', e);
    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}