'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, CreditCard, ExternalLink, X, UserCheck } from 'lucide-react';

interface BuyButtonProps {
  productId: string;
  priceInUah: number;
  title: string;
}

export default function BuyButton({ productId, priceInUah, title }: BuyButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
  if(session?.user?.email){
    setEmail(session.user.email);
  }
},[session]);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Поля форми доставки
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
 const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [warehouse, setWarehouse] = useState('');

  const handleOpenCheckout = () => {
    if (status === 'unauthenticated' || !session) {
      setShowAuthModal(true);
      return;
    }
    setShowCheckoutModal(true);
  };

const handlePaymentSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log('==============================');
  console.log('🚀 START PAYMENT');
  console.log('==============================');

  try {
    setLoading(true);

    const paymentData = {
      priceAmount: priceInUah,
      priceInUah,
      total: priceInUah,

      firstName,
      lastName,
      email: email || 'client@pentu24.com',

      phone,
      city,
      warehouse,

      orderId: productId,

      orderDescription: `${title} (${priceInUah} ₴)`,

      items: [
        {
          productId,
          name: title,
          price: priceInUah,
          quantity: 1,
        },
      ],
    };


    console.log('📦 SEND DATA');
    console.log(paymentData);


    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });


    console.log(
      '📡 STATUS:',
      response.status
    );


    const result = await response.json();


    console.log('📥 SERVER RESPONSE');
    console.log(result);



    if (!response.ok) {

      console.error(
        '❌ PAYMENT ERROR'
      );

      alert(
        result.error ||
        'Помилка створення замовлення'
      );

      setLoading(false);

      return;
    }



    if (!result.payment_url) {

      console.error(
        '❌ NO PAYMENT URL'
      );

      alert(
        'Monobank посилання не отримано'
      );

      setLoading(false);

      return;
    }



    console.log(
      '🏦 OPEN MONOBANK:',
      result.payment_url
    );


    const monoWindow = window.open(
      result.payment_url,
      '_blank',
      'noopener,noreferrer'
    );


    if (!monoWindow) {

      console.error(
        '❌ POPUP BLOCKED'
      );

      alert(
        'Браузер заблокував відкриття Monobank. Дозвольте спливаючі вікна.'
      );

    } else {

      console.log(
        '✅ MONOBANK OPENED'
      );

    }



    setLoading(false);

    setShowCheckoutModal(false);



  } catch (error) {


    console.error(
      '🔥 PAYMENT FETCH ERROR'
    );

    console.error(error);


    alert(
      'Помилка з’єднання з сервером оплати'
    );


    setLoading(false);
  }
};

  return (
    <>
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 space-y-5">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">До сплати:</p>
              <div className="text-2xl font-bold text-gray-900">{priceInUah} ₴</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-2.5 py-1 rounded shadow-xs">
                Secure Checkout
              </span>
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-lg p-3.5 text-sm text-gray-600 space-y-2.5 border border-blue-50">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <p className="leading-tight text-xs">Безпечна та захищена оплата через Monobank.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <CreditCard className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="leading-tight text-xs">Швидка доставка Новою Поштою.</p>
            </div>
          </div>

          <button
            onClick={handleOpenCheckout}
            type="button"
            className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 text-sm cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            Купити товар
          </button>
        </div>
      </div>

      {/* Модалка оформлення замовлення (Дані покупця + кнопка оплати) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-5 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-gray-900">Оформлення замовлення</h3>
              <p className="text-xs text-gray-500 mt-1">{title} — <span className="font-semibold text-gray-800">{priceInUah} ₴</span></p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ім'я *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:bg-white outline-none"
                    placeholder="Ім'я"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Прізвище *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:bg-white outline-none"
                    placeholder="Прізвище"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:bg-white outline-none"
                    placeholder="mail@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Телефон *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:bg-white outline-none"
                    placeholder="+380..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Місто (Нова Пошта) *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:bg-white outline-none"
                    placeholder="Київ"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Відділення НП *</label>
                  <input
                    type="text"
                    required
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:bg-white outline-none"
                    placeholder="№1 або поштомат"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Створення замовлення...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Перейти до оплати ({priceInUah} ₴)
                      <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка попередження про неавторизованого користувача */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Потрібна авторизація</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Щоб оформити замовлення та відстежувати його статус, будь ласка, увійдіть до свого облікового запису.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-sm text-sm cursor-pointer"
              >
                Увійти в систему
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-all text-sm cursor-pointer"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}