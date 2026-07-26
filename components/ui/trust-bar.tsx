import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  className?: string;
}

const items = [
    { icon: "🚚", title: "Free Delivery", sub: "On orders over £40" },
    { icon: "↩️", title: "Easy Returns", sub: "30-day return window" },
    { icon: "🔒", title: "Secure Payment", sub: "Encrypted checkout" },
    { icon: "🌿", title: "Eco Packaging", sub: "Plastic-free dispatch" },
    { icon: "⭐", title: "Verified Makers", sub: "Every shop vetted" },
  ];

export const TrustBar: React.FC<Props> = ({ className }) => {
  return (
    <div className={cn(className, "max-w-7xl mx-auto px-3 mb-4")}>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-parchment border border-parchment rounded-sm overflow-hidden">
        {items.map((item) => (
          <div
            key={item.title}
            className="bg-ivory flex items-center gap-3 px-4 py-3"
          >
            <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
            <div>
              <p
                className="font-body text-bark font-bold"
                style={{ fontSize: "0.75rem" }}
              >
                {item.title}
              </p>
              <p className="font-body text-oak" style={{ fontSize: "0.65rem" }}>
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBar;