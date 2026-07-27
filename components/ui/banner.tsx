/* eslint-disable @next/next/no-img-element */
'use client';

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

interface Props {
  className?: string;
}

const BANNER_IMGS = [
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&h=420&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&h=420&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1400&h=420&fit=crop&auto=format",
];

const slides = [
  {
    title: "Тисячі товарів за вигідними цінами",
    sub: "Електроніка, одяг, аксесуари, товари для дому та багато іншого",
    cta: "Перейти до покупок",
  },
  {
    title: "Нові надходження щодня",
    sub: "Популярні товари від міжнародних продавців",
    cta: "Переглянути новинки",
  },
  {
    title: "Знижки та гарячі пропозиції",
    sub: "Обирайте найкращі товари за привабливими цінами",
    cta: "Дивитися акції",
  },
];

export const Banner: React.FC<Props> = ({ className }) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((a) => (a + 1) % BANNER_IMGS.length);
    }, 4000);

    return () => clearInterval(t);
  }, []);

  return (
    <div className={cn(className, "flex gap-3 p-3 max-w-7xl mx-auto")}>
      {/* Main banner */}
      <div
        className="relative flex-1 overflow-hidden rounded-sm bg-bark"
        style={{ minHeight: 240 }}
      >
        {BANNER_IMGS.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: i === active ? 0.7 : 0 }}
          />
        ))}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(30,15,6,0.75) 0%, rgba(30,15,6,0.1) 70%)",
          }}
        />

        <div
          className="relative p-8 flex flex-col justify-end h-full"
          style={{ minHeight: 240 }}
        >
          <p className="font-script text-tan mb-1" style={{ fontSize: "1rem" }}>
            {slides[active].sub}
          </p>

          <h2
            className="font-display text-wheat leading-tight mb-4"
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
              fontWeight: 700,
            }}
          >
            {slides[active].title}
          </h2>

          <button className="self-start font-body bg-caramel hover:bg-amber text-cream px-5 py-2 text-sm transition-colors cursor-pointer">
            {slides[active].cta} →
          </button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {BANNER_IMGS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all cursor-pointer"
              style={{
                width: i === active ? 18 : 6,
                height: 6,
                background:
                  i === active
                    ? "#F4E8C1"
                    : "rgba(244,232,193,0.4)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Right mini banners */}
      <div className="hidden lg:flex flex-col gap-3 w-52 shrink-0">
        <div
          className="flex-1 rounded-sm overflow-hidden relative bg-parchment flex flex-col justify-end p-3"
          style={{ minHeight: 112 }}
        >
          <img
            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=150&fit=crop&auto=format"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />

          <div
            className="absolute inset-0"
            style={{ background: "rgba(61,31,11,0.45)" }}
          />

          <p className="relative font-display text-wheat text-sm font-semibold leading-tight">
            Популярні
            <br />
            товари
          </p>

          <button className="relative font-body text-tan text-xs mt-1 hover:text-wheat transition-colors cursor-pointer text-left">
            Переглянути →
          </button>
        </div>

        <div
          className="flex-1 rounded-sm overflow-hidden relative bg-parchment flex flex-col justify-end p-3"
          style={{ minHeight: 112 }}
        >
          <img
            src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=300&h=150&fit=crop&auto=format"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />

          <div
            className="absolute inset-0"
            style={{ background: "rgba(61,31,11,0.4)" }}
          />

          <p className="relative font-display text-wheat text-sm font-semibold leading-tight">
            Безпечна
            <br />
            оплата
          </p>

          <button className="relative font-body text-tan text-xs mt-1 hover:text-wheat transition-colors cursor-pointer text-left">
            Visa • MasterCard →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Banner;