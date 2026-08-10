"use client";

import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useShopStore } from "@/store/use-shop";
import { getOrders } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import CartModal from "./shared/cart-modal";
import SavedModal from "./shared/saved-modal";
import OrdersModal from "./shared/orders-modal";
import ProfileModal from "./shared/profile-modal";
import { CATEGORY_TREE } from "@/store/categories";

interface Props {
  className?: string;
}

const CATEGORIES = [{ label: "Кераміка", icon: "🏺", count: "2.4k товарів" }];

const getSecureImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.includes("vercel-storage.com")) {
    return `/api/avatar?url=${encodeURIComponent(url)}`;
  }
  return url;
};

export const Header: React.FC<Props> = ({ className }) => {
  const [searchActive, setSearchActive] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const currentCategory = searchParams.get("category") || "Home";

  const { items, savedItems, query, setQuery } = useShopStore();
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    getOrders()
      .then((data) => setOrdersCount(data.length))
      .catch(() => setOrdersCount(0));
  }, [ordersOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (window.location.pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <>
      <header
        className={cn(className, "bg-wheat sticky top-0 z-40")}
        style={{
          boxShadow:
            "0 1px 0 rgba(139,94,47,0.2), 0 2px 12px rgba(30,15,6,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="shrink-0 flex flex-col leading-none mr-2">
            <span
              className="font-script text-caramel"
              style={{ fontSize: "1.5rem" }}
            >
              Pentu24
            </span>
            <span
              className="font-body text-oak uppercase tracking-widest"
              style={{ fontSize: "0.7rem" }}
            >
              Маркетплейс
            </span>
          </Link>

          <form
            onSubmit={handleSearch}
            className={`flex flex-1 border transition-colors rounded-sm overflow-hidden ${searchActive ? "border-oak" : "border-mist"}`}
            style={{ maxWidth: 680 }}
          >
            <select
              className="bg-parchment border-r border-oak text-bark font-body px-3 py-2.5 text-xs outline-none shrink-0 hidden sm:block"
              style={{ minWidth: 125 }}
            >
              <option value="">Усі категорії</option>
              {CATEGORY_TREE.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              className="flex-1 bg-ivory px-4 py-2.5 font-body text-bark text-sm outline-none placeholder-oak"
              placeholder="Шукайте товари, бренди або категорії…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchActive(true)}
              onBlur={() => setSearchActive(false)}
              style={{ minWidth: 0 }}
            />
            <button
              type="submit"
              className="bg-caramel hover:bg-amber transition-colors px-5 shrink-0 flex items-center justify-center"
              title="Шукати"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="6.5"
                  cy="6.5"
                  r="5"
                  stroke="#FAF5EC"
                  strokeWidth="1.5"
                />
                <path
                  d="M10.5 10.5L14 14"
                  stroke="#FAF5EC"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </form>

          {/* Кнопки Saved, Orders, Cart */}
          <div className="flex items-center gap-4 ml-auto shrink-0">
            <button
              onClick={() => setSavedOpen(true)}
              className="flex flex-col items-center gap-0.5 text-bark hover:text-caramel transition-colors relative"
            >
              <div className="relative">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 17S2 12 2 6.5A4.5 4.5 0 0110 4a4.5 4.5 0 018 2.5C18 12 10 17 10 17z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    fill="none"
                  />
                </svg>
                {savedItems.length > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 bg-amber text-cream rounded-full font-body leading-none flex items-center justify-center text-[0.58rem]"
                    style={{ width: 16, height: 16, fontWeight: 700 }}
                  >
                    {savedItems.length}
                  </span>
                )}
              </div>
              <span className="font-body" style={{ fontSize: "0.6rem" }}>
                Збережене
              </span>
            </button>

            <button
              onClick={() => setOrdersOpen(true)}
              className="flex flex-col items-center gap-0.5 text-bark hover:text-caramel transition-colors relative"
            >
              <div className="relative">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="3"
                    y="5"
                    width="14"
                    height="12"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M7 5V4a3 3 0 016 0v1"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
                {ordersCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 bg-amber text-cream rounded-full font-body leading-none flex items-center justify-center text-[0.58rem]"
                    style={{ width: 16, height: 16, fontWeight: 700 }}
                  >
                    {ordersCount}
                  </span>
                )}
              </div>
              <span className="font-body" style={{ fontSize: "0.6rem" }}>
                Замовлення
              </span>
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="flex flex-col items-center gap-0.5 text-bark hover:text-caramel transition-colors relative"
            >
              <div className="relative">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M2 2h2l3 11h10l2-7H6"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="17.5" r="1.2" fill="currentColor" />
                  <circle cx="15" cy="17.5" r="1.2" fill="currentColor" />
                </svg>
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 bg-amber text-cream rounded-full font-body leading-none flex items-center justify-center text-[0.58rem]"
                    style={{ width: 16, height: 16, fontWeight: 700 }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="font-body" style={{ fontSize: "0.6rem" }}>
                Кошик
              </span>
            </button>

            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex flex-col items-center gap-0.5 text-bark hover:text-caramel transition-colors relative"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                {session?.user?.image ? (
                  <Avatar className="w-5 h-5 border border-amber/30">
                    <AvatarImage src={getSecureImageUrl(session.user.image) || ""} alt="Avatar" />
                    <AvatarFallback className="text-[0.5rem] bg-parchment text-caramel">
                      {session.user.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 21a8 8 0 10-16 0"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </div>
              <span className="font-body" style={{ fontSize: "0.6rem" }}>
                Профіль
              </span>
            </button>

            <ProfileModal
              isOpen={profileOpen}
              onClose={() => setProfileOpen(false)}
            />
          </div>
        </div>

        <div
          className="border-t border-parchment bg-ivory overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="max-w-7xl mx-auto px-4 flex gap-0">
            {[
              { label: "Головна", key: "Home" },
              ...CATEGORY_TREE.map((cat) => ({ label: cat.name, key: cat.id })),
            ].map((itemObj) => {
              const itemLabel = itemObj.label;
              const itemKey = itemObj.key;
              const href =
                itemKey === "Home"
                  ? "/"
                  : `/?category=${encodeURIComponent(itemKey)}`;
              const isActive = currentCategory === itemKey;

              return (
                <Link
                  key={itemKey}
                  href={href}
                  className={`font-body whitespace-nowrap px-4 py-2 text-xs transition-colors border-b-2 inline-block ${
                    isActive
                      ? "border-amber text-amber font-bold"
                      : "border-transparent text-bark hover:text-oak hover:border-oak"
                  }`}
                  style={{ letterSpacing: "0.03em" }}
                >
                  {itemLabel}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <SavedModal isOpen={savedOpen} onClose={() => setSavedOpen(false)} />
      <OrdersModal
        isOpen={ordersOpen}
        onClose={() => {
          setOrdersOpen(false);
          getOrders().then((d) => setOrdersCount(d.length));
        }}
      />
    </>
  );
};

export default Header;