/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useShopStore } from '@/store/use-shop';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import Link from 'next/link';
import RecipientForm, { RecipientData } from '@/components/shared/recipient-form';

export default function CheckoutPage() {
  const { items, clearCart } = useShopStore();
  const [paddle, setPaddle] = useState<Paddle>();
  const [loading, setLoading] = useState(false);

  // Контактні дані (не залежать від адреси доставки)
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');

  // Стейт для адрес Нової Пошти
  const [savedAddresses, setSavedAddresses] = useState<RecipientData[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<RecipientData | null>(null);

  useEffect(() => {
    initializePaddle({ 
      environment: 'sandbox', 
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN! 
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, []);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Обробка збереження адреси з RecipientForm
  const handleSaveAddress = (data: RecipientData) => {
    if (editingAddress && data.id) {
      setSavedAddresses((prev) => prev.map((a) => (a.id === data.id ? data : a)));
    } else {
      const newAddress = { ...data, id: Date.now().toString() };
      setSavedAddresses((prev) => [...prev, newAddress]);
      setSelectedAddressId(newAddress.id); // Автоматично обираємо нову адресу
    }
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEditAddress = (address: RecipientData) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paddle) {
      alert('Модуль оплаты еще загружается...');
      return;
    }

    if (items.length === 0) {
      alert('Ваш кошик порожній');
      return;
    }

    const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId);

    if (!selectedAddress) {
      alert('Будь ласка, додайте та оберіть адресу доставки Новою Поштою.');
      return;
    }

    setLoading(true);

    try {
      const orderRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceAmount: totalAmount,
          firstName: selectedAddress.firstName,
          lastName: selectedAddress.lastName,
          email: email || 'client@pentu24.com',
          phone: selectedAddress.phone,
          city: selectedAddress.city, 
          warehouse: selectedAddress.warehouse,
          telegram,
          orderDescription: `Замовлення з ${items.length} товарів на Pentu24`,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            size: (item as any).size || null,
            color: (item as any).color || null,
          })),
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Помилка при створенні замовлення в базі');
      }

      const paddleItems = items.map((item) => ({
        priceId: process.env.PADDLE_PRICE_ID || 'pri_01kydgjadqhb94zscnszd4ccec',
        quantity: item.quantity,
      }));

      paddle.Checkout.open({
        items: paddleItems,
        customer: {
          email: email,
        },
        settings: {
          successUrl: `${window.location.origin}/?success=true&orderId=${orderData.payment_id || ''}`,
        },
      });

      // clearCart();
    } catch (error) {
      console.error('Ошибка Paddle Checkout:', error);
      alert('Не удалось запустить оплату. Перевірте поля форми.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-4 font-body">
        <div className="w-20 h-20 bg-parchment rounded-full flex items-center justify-center text-3xl mb-4">
          🛒
        </div>
        <h1 className="font-display font-bold text-2xl text-bark mb-2">Your cart is empty</h1>
        <Link 
          href="/"
          className="px-6 py-2.5 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-10 px-4 relative font-body text-bark">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-xs text-oak hover:text-caramel transition-colors mb-6 inline-block">
          ← Back to Marketplace
        </Link>
        
        <h1 className="font-display font-bold text-3xl text-bark mb-8">Checkout & Delivery</h1>

        <form onSubmit={handleCheckout} className="space-y-6">
          
          {/* Блок 1: Адреса доставки */}
          <div className="bg-ivory border border-parchment p-6 rounded-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-bark border-b border-parchment pb-2">
              1. Дані отримувача (Нова Пошта)
            </h2>

            {showForm ? (
              <div className="pt-2">
                <RecipientForm 
                  initialData={editingAddress}
                  onSave={handleSaveAddress}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingAddress(null);
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {savedAddresses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {savedAddresses.map((addr) => (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id || null)}
                        className={`relative p-4 rounded-sm border cursor-pointer transition-all ${
                          selectedAddressId === addr.id 
                            ? 'border-bark bg-cream' 
                            : 'border-mist bg-white hover:border-oak'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-bark">{addr.addressName}</h3>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(addr);
                            }}
                            className="text-xs text-oak hover:text-caramel"
                          >
                            Редагувати
                          </button>
                        </div>
                        <p className="text-sm text-bark">{addr.firstName} {addr.lastName}</p>
                        <p className="text-sm text-oak mb-2">{addr.phone}</p>
                        <div className="text-xs text-bark bg-parchment/30 p-2 rounded-sm">
                          <p className="font-semibold">м. {addr.city}</p>
                          <p className="mt-1">{addr.warehouse}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-oak">У вас ще немає збережених адрес доставки.</p>
                )}

                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="w-full py-2 border border-bark text-bark font-bold rounded-sm hover:bg-bark hover:text-cream transition-colors text-sm"
                >
                  + Додати нову адресу доставки
                </button>
              </div>
            )}
          </div>

          {/* Блок 2: Контактні дані для зв'язку/чеку */}
          <div className="bg-ivory border border-parchment p-6 rounded-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-bark border-b border-parchment pb-2">
              2. Контактні дані
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-display text-oak mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cream border border-mist rounded-sm p-2 text-sm focus:border-caramel outline-none"
                  placeholder="example@gmail.com"
                />
              </div>
              <div>
                <label className="block text-xs font-display text-oak mb-1">Telegram (необов`язково)</label>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="w-full bg-cream border border-mist rounded-sm p-2 text-sm focus:border-caramel outline-none"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          {/* Блок 3: Замовлення та оплата */}
          <div className="bg-ivory border border-parchment p-6 rounded-sm space-y-6">
            <h2 className="font-display font-bold text-lg text-bark border-b border-parchment pb-2">
              Order Summary
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm font-body">
                  <div>
                    <span className="text-oak font-semibold">{item.name}</span> x{item.quantity}
                    {((item as any).size || (item as any).color) && (
                      <div className="text-xs text-oak/70">
                        {(item as any).size ? `Розмір: ${(item as any).size} ` : ''}
                        {(item as any).color ? `Колір: ${(item as any).color}` : ''}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-bark">€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-parchment pt-4 space-y-2 font-body text-sm">
              <div className="flex justify-between text-bark font-bold text-base pt-2">
                <span>Total (Tax & VAT handled by Paddle)</span>
                <span className="text-amber">€{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !paddle || showForm}
              className="w-full py-3.5 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Processing...' : 'Pay with Paddle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}