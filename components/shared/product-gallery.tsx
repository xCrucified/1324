/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const imagesList = images && images.length > 0 ? images : ['/placeholder.png'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpenModal, setIsOpenModal] = useState(false);

  // Закрытие модального окна по нажатию на клавишу Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpenModal(false);
      }
    };
    if (isOpenModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpenModal]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Главное изображение на странице */}
        <div
          onClick={() => setIsOpenModal(true)}
          className="relative w-full h-[380px] md:h-[450px] bg-parchment rounded-sm overflow-hidden border border-mist group flex items-center justify-center cursor-zoom-in"
          title="Нажмите, чтобы увеличить"
        >
          <img
            src={imagesList[currentIndex]}
            alt={title}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          />

          {/* Стрелки переключения */}
          {imagesList.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-ivory/90 hover:bg-ivory text-bark rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 text-lg"
              >
                ‹
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-ivory/90 hover:bg-ivory text-bark rounded-full w-9 h-9 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 text-lg"
              >
                ›
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-bark/70 text-cream px-2.5 py-1 rounded-full text-xs font-body tracking-wide">
                {currentIndex + 1} / {imagesList.length}
              </div>
            </>
          )}
        </div>

        {/* Миниатюры снизу */}
        {imagesList.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {imagesList.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-28 h-20 rounded-sm overflow-hidden border-2 transition-all shrink-0 ${
                  idx === currentIndex ? 'border-amber scale-105 shadow-sm' : 'border-parchment opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${title} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно (Lightbox) — на весь экран с большой картинкой */}
      {isOpenModal && (
        <div
          onClick={() => setIsOpenModal(false)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 md:p-6 backdrop-blur-md"
        >
          {/* Верхняя строка: счетчик и кнопка закрытия */}
          <div className="w-full max-w-7xl flex items-center justify-between z-50 px-2">
            <span className="text-white/80 text-sm font-body">
              Фото {currentIndex + 1} из {imagesList.length}
            </span>
            <button
              onClick={() => setIsOpenModal(false)}
              className="bg-white/10 hover:bg-white/25 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl transition-colors shadow-lg cursor-pointer"
              title="Закрыть"
            >
              ✕
            </button>
          </div>

          {/* Центральная часть с большой картинкой и стрелками */}
          {/* Центральная часть с большой картинкой */}
<div
  className="relative flex-1 w-full flex items-center justify-center px-6 md:px-14 py-6"
  onClick={(e) => e.stopPropagation()}
>
  <div className="relative w-full max-w-6xl h-[72vh] bg-white rounded-xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,.45)]">

    <img
      src={imagesList[currentIndex]}
      alt={title}
      className="w-full h-full object-contain p-6 select-none"
    />

    {imagesList.length > 1 && (
      <>
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-110 text-2xl cursor-pointer"
        >
          ‹
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-110 text-2xl cursor-pointer"
        >
          ›
        </button>
      </>
    )}
  </div>
</div>

          {/* Миниатюры внизу модального окна */}
          {imagesList.length > 1 && (
            <div 
              className="flex gap-2 overflow-x-auto max-w-full py-2 px-4 z-50 bg-black/40 rounded-lg backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-20 h-14 rounded-sm overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    idx === currentIndex ? 'border-amber scale-105 opacity-100' : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}