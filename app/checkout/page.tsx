/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShopStore } from "@/store/use-shop";
import Link from "next/link";
import RecipientForm, {
  RecipientData,
} from "@/components/shared/recipient-form";

export default function CheckoutPage() {
  const { items, clearCart } = useShopStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Контактні дані
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");

  // Завантаження адрес з localStorage (синхронізовано з app/addresses)
  const [savedAddresses, setSavedAddresses] = useState<RecipientData[]>(() => {
    try {
      const saved = localStorage.getItem("user_novaposhta_addresses");
      return saved ? (JSON.parse(saved) as RecipientData[]) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem("user_novaposhta_addresses");
      if (!saved) return null;
      const parsed: RecipientData[] = JSON.parse(saved);
      return parsed.length > 0 ? parsed[0].id || null : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<RecipientData | null>(
    null,
  );

  // Note: savedAddresses and selectedAddressId are initialized from localStorage
  // using lazy initializers to avoid setState calls within useEffect.

  const saveAddressesToStorage = (updated: RecipientData[]) => {
    setSavedAddresses(updated);
    localStorage.setItem("user_novaposhta_addresses", JSON.stringify(updated));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Збереження нової чи відредагованої адреси
  const handleSaveAddress = (data: RecipientData) => {
    let updated: RecipientData[];
    if (editingAddress && data.id) {
      updated = savedAddresses.map((a) => (a.id === data.id ? data : a));
    } else {
      const newAddress = { ...data, id: Date.now().toString() };
      updated = [...savedAddresses, newAddress];
      setSelectedAddressId(newAddress.id);
    }
    saveAddressesToStorage(updated);
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEditAddress = (address: RecipientData) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Ваш кошик порожній");
      return;
    }

    const selectedAddress = savedAddresses.find(
      (a) => a.id === selectedAddressId,
    );

    if (!selectedAddress) {
      alert("Будь ласка, оберіть або додайте адресу доставки Новою Поштою.");
      return;
    }

    setLoading(true);

    try {
      const orderRes = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceAmount: totalAmount,
          firstName: selectedAddress.firstName,
          lastName: selectedAddress.lastName,
          email: email || "client@pentu24.com",
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
        throw new Error(
          orderData.error || "Помилка при створенні замовлення в базі",
        );
      }

      clearCart();

      if (orderData.payment_url) {
        window.location.replace(orderData.payment_url);
        return;
      }

      // use replace to avoid direct assignment to window.location.href (lint rule)
      window.location.replace(`/?success=true&orderId=${orderData.payment_id || ""}`);
    } catch (error: any) {
      console.error("Помилка оформлення замовлення:", error);
      alert(
        error?.message || "Не вдалося оформити замовлення. Спробуйте ще раз.",
      );
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
        <h1 className="font-display font-bold text-2xl text-bark mb-2">
          Ваш кошик порожній
        </h1>
        <Link
          href="/"
          className="px-6 py-2.5 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors"
        >
          Продовжити покупки
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-10 px-4 relative font-body text-bark">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-xs text-oak hover:text-caramel transition-colors mb-6 inline-block"
        >
          ← Назад до магазину
        </Link>

        <h1 className="font-display font-bold text-3xl text-bark mb-8">
          Оформлення та доставка
        </h1>

        <form onSubmit={handleCheckout} className="space-y-6">
          {/* Блок 1: Адреса доставки (синхронізована з localStorage) */}
          <div className="bg-ivory border border-parchment p-6 rounded-sm space-y-4">
            <div className="flex justify-between items-center border-b border-parchment pb-2">
              <h2 className="font-display font-bold text-lg text-bark">
                1. Дані отримувача (Нова Пошта)
              </h2>
              <Link
                href="/addresses"
                className="text-xs text-oak hover:text-caramel underline"
              >
                Керувати адресами
              </Link>
            </div>

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
                            ? "border-bark bg-cream"
                            : "border-mist bg-white hover:border-oak"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-bark">
                            {addr.addressName}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(addr);
                            }}
                            className="text-xs text-oak hover:text-caramel cursor-pointer"
                          >
                            Редагувати
                          </button>
                        </div>
                        <p className="text-sm text-bark">
                          {addr.firstName} {addr.lastName} {addr.patronymic}
                        </p>
                        <p className="text-sm text-oak mb-2">{addr.phone}</p>
                        <div className="text-xs text-bark bg-parchment/30 p-2 rounded-sm">
                          <p className="font-semibold">м. {addr.city}</p>
                          <p className="mt-1">{addr.warehouse}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-oak">
                    У вас ще немає збережених адрес доставки.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setShowForm(true);
                  }}
                  className="w-full py-2 border border-bark text-bark font-bold rounded-sm hover:bg-bark hover:text-cream transition-colors text-sm cursor-pointer"
                >
                  + Додати нову адресу доставки
                </button>
              </div>
            )}
          </div>

          {/* Блок 2: Контактні дані */}
          <div className="bg-ivory border border-parchment p-6 rounded-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-bark border-b border-parchment pb-2">
              2. Контактні дані
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-display text-oak mb-1">
                  Email *
                </label>
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
                <label className="block text-xs font-display text-oak mb-1">
                  Telegram (необов`язково)
                </label>
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
              Деталі замовлення
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm font-body"
                >
                  <div>
                    <span className="text-oak font-semibold">{item.name}</span>{" "}
                    x{item.quantity}
                    {((item as any).size || (item as any).color) && (
                      <div className="text-xs text-oak/70">
                        {(item as any).size
                          ? `Розмір: ${(item as any).size} `
                          : ""}
                        {(item as any).color
                          ? `Колір: ${(item as any).color}`
                          : ""}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-bark">
                    {(item.price * item.quantity).toFixed(2)} грн
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-parchment pt-4 space-y-2 font-body text-sm">
              <div className="flex justify-between text-bark font-bold text-base pt-2">
                <span>Загалом:</span>
                <span className="text-amber">{totalAmount.toFixed(2)} грн</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || showForm}
              className="w-full py-3.5 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Обробка..." : "Підтвердити замовлення"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
