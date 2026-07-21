import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  className?: string;
}

const cols = [
    {
      title: "Thornfield Market",
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
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="font-body text-parchment opacity-70 hover:opacity-100 hover:text-wheat transition-colors"
                    style={{ fontSize: "0.82rem" }}
                  >
                    {l}
                  </a>
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
              Thornfield
            </span>
            <span
              className="font-body text-oak opacity-60"
              style={{ fontSize: "0.7rem" }}
            >
              © 2026 Thornfield Market Ltd. All rights reserved.
            </span>
          </div>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Cookies", "Sitemap"].map((l) => (
              <a
                key={l}
                href="#"
                className="font-body text-oak hover:text-wheat transition-colors opacity-60 hover:opacity-100"
                style={{ fontSize: "0.7rem" }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;