/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect } from "react";
import { useShopStore } from "@/store/use-shop";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: Props) {
  const router = useRouter();

  const { items, removeFromCart, updateQuantity, clearCart } = useShopStore();

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  // Закрываем по клавише Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Блокируем скролл страницы, когда корзина открыта
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleProceedToCheckout = () => {
    onClose(); // Закрываем модалку корзины
    router.push("/checkout"); // Переходим на страницу оформления
  };

  return (
    <>
      {/* Затемнение фона (Overlay) */}
      <div
        className={cn(
          "fixed inset-0 bg-bark/40 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Выезжающая панель (Drawer) */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-cream shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Шапка корзины */}
        <div className="flex items-center justify-between p-5 border-b border-parchment bg-ivory">
          <h2 className="font-display font-bold text-xl text-bark">
            Your Cart{" "}
            {items.length > 0 && (
              <span className="text-oak font-body text-sm font-normal ml-2">
                ({items.length})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-oak hover:text-caramel hover:bg-parchment rounded-full transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Список товаров */}
        <div
          className="flex-1 overflow-y-auto p-5 space-y-4"
          style={{ scrollbarWidth: "thin" }}
        >
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-parchment rounded-full flex items-center justify-center text-3xl">
                🛒
              </div>
              <div>
                <p className="font-display font-bold text-bark text-lg">
                  Your cart is empty
                </p>
                <p className="font-body text-oak text-sm mt-1">
                  Looks like you haven`t added anything yet.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 bg-ivory border border-parchment rounded-sm"
              >
                <div className="w-20 h-20 shrink-0 bg-parchment rounded-sm overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-body font-bold text-bark text-sm leading-tight line-clamp-2">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-oak hover:text-amber p-1 -mr-1 -mt-1"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-parchment rounded-sm bg-cream">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        className="px-2.5 py-0.5 text-bark hover:bg-parchment transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-0.5 font-body text-xs font-bold border-x border-parchment">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-2.5 py-0.5 text-bark hover:bg-parchment transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-display font-bold text-amber">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Подвал (Итого + кнопка оплаты) */}
        {items.length > 0 && (
          <div className="p-5 border-t border-parchment bg-ivory">
            <div className="space-y-2 mb-4 font-body text-sm">
              <div className="flex justify-between text-oak">
                <span>Subtotal</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-oak">
                <span>Shipping</span>
                <span className="text-sage font-bold">Free</span>
              </div>
              <div className="flex justify-between text-bark font-display font-bold text-lg pt-2 border-t border-parchment">
                <span>Total</span>
                <span className="text-amber">€{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={items.length === 0}
              className="w-full py-3 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-3 font-body text-oak text-xs hover:text-bark transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}