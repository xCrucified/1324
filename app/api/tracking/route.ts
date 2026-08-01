import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { trackingNumber } = await req.json();

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Трек-номер обов\'язковий' },
        { status: 400 }
      );
    }

    const cleanNumber = trackingNumber.trim();
    const apiKey = process.env.TRACK17_API_KEY || '';

    // Передаємо лише трек-номер — 17TRACK сам виконає auto-detect служби
    const trackPayload = [{ number: cleanNumber }];

    // 1. Автоматично реєструємо трек-номер у 17TRACK (якщо він новий для системи)
    await fetch('https://api.17track.net/track/v2.2/register', {
      method: 'POST',
      headers: {
        '17token': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackPayload),
    });

    // 2. Отримуємо актуальну інформацію про трек-номер
    const response = await fetch('https://api.17track.net/track/v2.2/gettrackinfo', {
      method: 'POST',
      headers: {
        '17token': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackPayload),
    });

    const data = await response.json();

    if (data.code !== 0) {
      return NextResponse.json(
        { error: `Помилка API 17TRACK (Код: ${data.code})` },
        { status: 400 }
      );
    }

    const acceptedItem = data.data?.accepted?.[0];

    if (!acceptedItem) {
      const rejectedError = data.data?.rejected?.[0]?.error;
      const rejectedReason = rejectedError?.message;
      
      let errorMessage = rejectedReason || 'Інформацію про трек-номер не знайдено.';
      
      // Якщо посилка застаріла або не існує в базі
      if (rejectedReason?.toLowerCase().includes('not found') || rejectedError?.code === -10008) {
        errorMessage = 'Посилку не знайдено або її історію вже заархівовано сервісом.';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    return NextResponse.json(acceptedItem);

  } catch (error) {
    console.error('Tracking API Error:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}