'use client';

import { useState } from 'react';
import { Lock, ShieldCheck, CreditCard, ExternalLink } from 'lucide-react';

interface BuyButtonProps {
  productId: string;
  priceInUah: number; // Цена в гривнах
  title: string;
}

export default function BuyButton({ productId, priceInUah, title }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);

  // Конвертация UAH -> USD
  const rate = 41.5;
  const rawUsd = priceInUah / rate;
  const amountInUsd = Number(rawUsd.toFixed(2));

  const handlePayment = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceAmount: amountInUsd,
          orderId: productId,
          orderDescription: `${title} (${priceInUah} UAH)`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || result.error || 'Ошибка при создании платежа. Попробуйте позже.');
        setLoading(false);
        return;
      }

      // Перенаправляем на страницу оплаты картой
      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        alert('Не удалось сформировать ссылку на оплату. Попробуйте позже.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Сбой сети:', error);
      alert('Ошибка соединения с сервером оплаты.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 space-y-5">
        {/* Сумма оплаты */}
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">К оплате:</p>
            <div className="text-2xl font-bold text-gray-900">{priceInUah} ₴</div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-sm font-medium text-gray-600">~ ${amountInUsd.toFixed(2)} USD</span>
            <span className="text-xs text-gray-400 mt-0.5">Эквивалент</span>
          </div>
        </div>

        {/* Блок доверия - Только карты */}
        <div className="bg-blue-50/50 rounded-lg p-3.5 text-sm text-gray-600 space-y-2.5 border border-blue-50">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <p className="leading-tight text-xs">Безопасный международный шлюз. Защита данных SSL.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <CreditCard className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="leading-tight text-xs">Оплата банковскими картами <b>Visa, Mastercard, Apple Pay</b>.</p>
          </div>
        </div>

        {/* Кнопка оплаты */}
        <button
          onClick={handlePayment}
          disabled={loading}
          type="button"
          className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Подключение к шлюзу...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Оплатить картой
              <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}