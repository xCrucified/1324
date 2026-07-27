import { cn } from '@/lib/utils';
import React from 'react';
import Link from 'next/link';

interface Props {
  className?: string;
}

// Данные для колонок футера, которые строго соответствуют ключам (slug) в infoPages
const footerColumns = [
  {
    title: "Pentu24",
    links: [
      { label: "Про нас", slug: "about-us" },
      { label: "Кар'єра", slug: "careers" },
      { label: "Блог", slug: "press" },
    ],
  },
  {
    title: "Допомога & підтримка",
    links: [
      { label: "Трекінг", slug: "track-your-order" },
      { label: "Політика повернення та відшкодування", slug: "returns-policy" },
      { label: "Методи оплати", slug: "payment-methods" },
      { label: "FAQ", slug: "faq" },
      { label: "Contact Us", slug: "contact-us" },
    ],
  },
  {
    title: "Seller hub",
    links: [

    ],
  },
  {
    title: "Discover",
    links: [

    ],
  },
];

export const Footer: React.FC<Props> = ({ className }) => {
  return (
    <footer className={cn(className, "bg-bark text-parchment mt-2")}>
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {footerColumns.map((col) => (
          <div key={col.title}>
            <h3
              className="font-body text-wheat uppercase tracking-widest mb-4"
              style={{ fontSize: "0.65rem", letterSpacing: "0.16em" }}
            >
              {col.title}
            </h3>
            <ul className="space-y-2 list-none p-0 m-0">
              {col.links.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={`/info/${link.slug}`}
                    className="font-body text-parchment opacity-70 hover:opacity-100 hover:text-wheat transition-colors"
                    style={{ fontSize: "0.82rem" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
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
              { label: "Конфіденційність", slug: "privacy" },
              { label: "Умови", slug: "terms" },
              { label: "Файли cookie", slug: "cookies" },
              { label: "Мапа сайту", slug: "sitemap" },
            ].map(({ label, slug }) => (
              <Link
                key={slug}
                href={`/info/${slug}`}
                className="font-body text-oak hover:text-wheat transition-colors opacity-60 hover:opacity-100"
                style={{ fontSize: "0.7rem" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export
 default Footer;