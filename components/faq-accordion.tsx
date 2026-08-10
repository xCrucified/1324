'use client';

import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  category: string;
  items: FaqItem[];
}

export default function FaqAccordion({ sections }: { sections: FaqSection[] }) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (sectionIdx: number, itemIdx: number) => {
    const key = `${sectionIdx}-${itemIdx}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-8 w-full">
      {sections.map((section, sectionIdx) => (
        <div key={sectionIdx} className="w-full">
          <h2 className="font-display text-xl text-bark mb-4 font-semibold">
            {section.category}
          </h2>
          
          <div className="space-y-3 w-full">
            {section.items.map((item, itemIdx) => {
              const key = `${sectionIdx}-${itemIdx}`;
              const isOpen = !!openItems[key];

              return (
                <div 
                  key={itemIdx} 
                  className="w-full bg-white border border-parchment rounded-md overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(sectionIdx, itemIdx)}
                    className="w-full flex items-center justify-between gap-4 cursor-pointer font-body text-sm text-bark p-4 font-medium hover:bg-cream transition-colors text-left outline-none"
                  >
                    <span className="flex-1">{item.question}</span>
                    <span className={`transition-transform duration-300 text-caramel flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </span>
                  </button>
                  
                  {/* Плавний контейнер висоти замість різкого умовного рендеру */}
                  <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-oak leading-relaxed border-t border-parchment/30 bg-white break-words w-full">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}