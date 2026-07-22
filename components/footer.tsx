import { cn } from '@/lib/utils';
import React from 'react';
import Link from 'next/link';

interface Props {
  className?: string;
}

// Функция для перевода текста ссылки в безопасный URL (slug)
const slugify = (text: string) => {
  return text.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
};

const cols = [
    {
      title: "Pentu24 Market",
      links: [
        "About Us",
        "Careers",
        "Press",
        "Sustainability",
        "Maker Programme",
      ],
    },
    {
      title: "Help & Support",
      links: [
        "Track Your Order",
        "Returns Policy",
        "Payment Methods",
        "FAQ",
        "Contact Us",
      ],
    },
    {
      title: "Seller Hub",
      links: [
        "Open a Shop",
        "Seller Fees",
        "Seller Protection",
        "Community Forum",
        "Advertising",
      ],
    },
    {
      title: "Discover",
      links: [
        "Gift Ideas",
        "Seasonal Edits",
        "New Arrivals",
        "Flash Deals",
        "Top Shops",
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
              © 2026 Pentu24 Market Ltd. All rights reserved.
            </span>
          </div>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Cookies", "Sitemap"].map((l) => {
              const href = `/info/${slugify(l)}`;
              return (
                <Link
                  key={l}
                  href={href}
                  className="font-body text-oak hover:text-wheat transition-colors opacity-60 hover:opacity-100"
                  style={{ fontSize: "0.7rem" }}
                >
                  {l}
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