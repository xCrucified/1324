import { cn } from '@/lib/utils';
import React from 'react';
import Link from 'next/link';

interface Props {
  className?: string;
}

// Функція для перетворення тексту посилання на безпечний URL (slug)
const slugify = (text: string) => {
  return text.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
};

const cols = [
    {
      title: "Маркет Pentu24",
      links: [
        "Про нас",
        "Вакансії",
        "Преса",
        "Сталий розвиток",
        "Програма для майстрів",
      ],
    },
    {
      title: "Допомога та підтримка",
      links: [
        "Відстежити замовлення",
        "Політика повернення",
        "Способи оплати",
        "Часті запитання",
        "Зв'язатися з нами",
      ],
    },
    {
      title: "Центр продавця",
      links: [
        "Відкрити магазин",
        "Комісії продавця",
        "Захист продавців",
        "Форум спільноти",
        "Реклама",
      ],
    },
    {
      title: "Відкривайте",
      links: [
        "Ідеї для подарунків",
        "Сезонні добірки",
        "Нові надходження",
        "Швидкі знижки",
        "Найкращі магазини",
      ],
    },
  ];

export const Footer: React.FC<Props> = ({ className }) => {
  return (
    <footer className={cn(className, "bg-bark text-parchment mt-2")}>
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {cols.map((col) => (
          <div key={col.title}>
            <h3
              className="font-body text-wheat uppercase tracking-widest mb-4"
              style={{ fontSize: "0.65rem", letterSpacing: "0.16em" }}
            >
              {col.title}
            </h3>
            <ul className="space-y-2 list-none p-0 m-0">
              {col.links.map((l) => {
                const href = `/info/${slugify(l)}`;
                return (
                  <li key={l}>
                    <Link
                      href={href}
                      className="font-body text-parchment opacity-70 hover:opacity-100 hover:text-wheat transition-colors"
                      style={{ fontSize: "0.82rem" }}
                    >
                      {l}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        className="border-t border-caramel"
        style={{ borderColor: "rgba(192,118,48,0.3)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="font-script text-caramel"
              style={{ fontSize: "1.2rem" }}
            >
              Pentu24.com
            </span>
            <span
              className="font-body text-oak opacity-60"
              style={{ fontSize: "0.7rem" }}
            >
              © 2026 Pentu24 Market Ltd. Усі права захищені.
            </span>
          </div>
          <div className="flex gap-4">
            {[
              { label: "Конфіденційність", name: "Privacy" },
              { label: "Умови", name: "Terms" },
              { label: "Файли cookie", name: "Cookies" },
              { label: "Мапа сайту", name: "Sitemap" },
            ].map(({ label, name }) => {
              const href = `/info/${slugify(name)}`;
              return (
                <Link
                  key={label}
                  href={href}
                  className="font-body text-oak hover:text-wheat transition-colors opacity-60 hover:opacity-100"
                  style={{ fontSize: "0.7rem" }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;