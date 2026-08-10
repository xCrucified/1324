'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  Loader2, 
  Truck, 
  Clock, 
  MapPin, 
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface TrackingEvent {
  a?: string; // Дата і час (напр. 2026-03-30 14:20)
  z?: string; // Опис події (напр. Arrived at sorting center)
  c?: string; // Локація / Місто
}

interface TrackingData {
  number?: string;
  status_info?: string;
  e?: number; // Код статусу від 17TRACK
  z1?: TrackingEvent[];
  [key: string]: any;
}

// Допоміжна функція для визначення статусу
const getStatusText = (track: TrackingData | null) => {
  if (!track) return 'Невідомо';
  
  const statusCode = track.e;
  
  switch (statusCode) {
    case 40:
      return 'Доставлено';
    case 20:
      return 'В дорозі';
    case 30:
      return 'Прибуло у відділення (готово до видачі)';
    case 35:
      return 'Невдала спроба доставки';
    case 50:
      return 'Проблема з доставкою / Виняток';
    default:
      // Якщо івентів немає взагалі — трек найімовірніше заархівований
      if (!track.z1 || track.z1.length === 0) {
        return 'Архівоване відправлення';
      }
      return track.status_info || 'В дорозі';
  }
};

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackData, setTrackData] = useState<TrackingData | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryNumber = trackingNumber.trim();
    if (!queryNumber) return;

    setLoading(true);
    setError('');
    setTrackData(null);

    try {
      const res = await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: queryNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Не вдалося знайти інформацію про трек-номер');
      }

      // Якщо бекенд повертає data.track або просто data
      const resultTrack = data.track || data;
      setTrackData(resultTrack);
    } catch (err: any) {
      setError(err.message || 'Сталася помилка при запиті. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Посилання для повернення */}
        <div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Повернутися на головну
          </Link>
        </div>

        {/* Картка з полем пошуку */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-100 pb-6 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-[#0066FF]" />
              Відстеження відправлення
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Введіть трек-номер вашої посилки, щоб дізнатися поточний статус та історію доставки
            </p>
          </div>

          {/* Форма */}
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Введіть трек-номер (наприклад: MGRMY123456789)"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 pl-11 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#0066FF] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              disabled={loading || !trackingNumber.trim()}
              className="bg-[#0066FF] hover:bg-blue-700 text-white font-medium px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Шукаємо...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Відстежити
                </>
              )}
            </button>
          </form>

          {/* Відображення помилки */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Помилка відстеження</p>
                <p className="text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Результати відстеження */}
        {trackData && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Шапка з номером та статусом */}
            <div className="bg-gray-50 border-b border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                  Трек-номер
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-xl font-bold text-gray-900 font-mono">
                    {trackingNumber}
                  </h2>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                    title="Копіювати трек-номер"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  {/* Використовуємо нову функцію для відображення правильного статусу */}
                  <span>{getStatusText(trackData)}</span>
                </div>
                
                <button
                  onClick={() => handleTrack()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors"
                  title="Оновити дані"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Таймлайн статусів */}
            <div className="p-6 sm:p-8">
              <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Історія переміщення
              </h3>

              {trackData.z1 && trackData.z1.length > 0 ? (
                <div className="relative border-l-2 border-blue-100 ml-4 pl-6 space-y-8">
                  {trackData.z1.map((event: TrackingEvent, idx: number) => {
                    const isLatest = idx === 0;
                    return (
                      <div key={idx} className="relative">
                        {/* Точка на вертикальній лінії */}
                        <span 
                          className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ring-4 ${
                            isLatest 
                              ? 'bg-blue-600 ring-blue-100' 
                              : 'bg-gray-300 ring-gray-100'
                          }`}
                        />

                        <div className="space-y-1">
                          {/* Час та дата */}
                          {event.a && (
                            <p className="text-xs font-semibold text-blue-600">
                              {event.a}
                            </p>
                          )}
                          
                          {/* Опис події */}
                          <p className={`text-sm ${isLatest ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {event.z}
                          </p>
                          
                          {/* Локація (якщо є) */}
                          {event.c && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 pt-0.5">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              {event.c}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="font-medium text-gray-700">Історія переміщення відсутня або заархівована</p>
                  <p className="text-xs text-gray-400 mt-1">
                    17TRACK зберігає детальні логи подій протягом 90–180 днів з моменту доставки.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}