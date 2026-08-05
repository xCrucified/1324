'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, CreditCard, ExternalLink, X, UserCheck, MapPin, Plus } from 'lucide-react';

interface BuyButtonProps {
  productId: string;
  priceInUah: number;
  title: string;
}

export default function BuyButton({ productId, priceInUah, title }: BuyButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  // Поля форми
  const [firstName, setFirstName] = useState(() => session?.user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(() => {
    const parts = session?.user?.name?.split(' ') || [];
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  });
  const [email, setEmail] = useState(() => session?.user?.email || '');
  const [phone, setPhone] = useState('');

  // Стейти для Нової Пошти (автокомпліт міст та відділення)
  const [city, setCity] = useState('');
  const [cityRef, setCityRef] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [showCities, setShowCities] = useState(false);

  const [warehouse, setWarehouse] = useState('');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // Збережені адреси користувача
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isChoosingAddress, setIsChoosingAddress] = useState(false);

  // Ефект для завантаження збережених адрес із localStorage
  useEffect(() => {
    const saved = localStorage.getItem('user_novaposhta_addresses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedAddresses(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Ефект для пошуку міст із затримкою (debounce)
  useEffect(() => {
    if (citySearch.length < 2) {
      setCities([]);
      return;
    }
    if (citySearch === city) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/novaposhta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getCities', query: citySearch }),
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setCities(data);
          setShowCities(true);
        }
      } catch (error) {
        console.error('Помилка завантаження міст:', error);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [citySearch, city]);

  // Ефект для завантаження відділень при виборі міста
  useEffect(() => {
    if (!cityRef) {
      setWarehouses([]);
      return;
    }

    const fetchWarehouses = async () => {
      setLoadingWarehouses(true);
      try {
        const res = await fetch('/api/novaposhta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getWarehouses', cityRef }),
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setWarehouses(data);
        }
      } catch (error) {
        console.error('Помилка завантаження відділень:', error);
      } finally {
        setLoadingWarehouses(false);
      }
    };

    fetchWarehouses();
  }, [cityRef]);

  const handleCitySelect = (selectedCity: { name: string; ref: string }) => {
    setCity(selectedCity.name);
    setCitySearch(selectedCity.name);
    setCityRef(selectedCity.ref);
    setWarehouse('');
    setShowCities(false);
  };

  const handleSelectSavedAddress = (addr: any) => {
    if (addr.firstName) setFirstName(addr.firstName);
    if (addr.lastName) setLastName(addr.lastName);
    if (addr.phone) setPhone(addr.phone);
    if (addr.city) {
      setCity(addr.city);
      setCitySearch(addr.city);
    }
    if (addr.cityRef) setCityRef(addr.cityRef);
    if (addr.warehouse) setWarehouse(addr.warehouse);
    
    setIsChoosingAddress(false);
  };

  const handleOpenCheckout = () => {
    if (status === 'unauthenticated' || !session) {
      setShowAuthModal(true);
      return;
    }
    if (savedAddresses.length > 0) {
      setIsChoosingAddress(true);
    } else {
      setIsChoosingAddress(false);
    }
    setShowCheckoutModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!city || !warehouse) {
      alert('Будь ласка, оберіть місто та відділення Нової Пошти');
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const newAddress = {
        id: Date.now().toString(),
        addressName: `${city}, ${warehouse.slice(0, 25)}...`,
        firstName,
        lastName,
        phone,
        city,
        cityRef,
        warehouse,
      };

      const existingAddresses = [...savedAddresses];
      const isDuplicate = existingAddresses.some(
        (a) => a.city === city && a.warehouse === warehouse
      );

      if (!isDuplicate) {
        const updatedAddresses = [newAddress, ...existingAddresses].slice(0, 5);
        setSavedAddresses(updatedAddresses);
        localStorage.setItem('user_novaposhta_addresses', JSON.stringify(updatedAddresses));
      }

      const paymentData = {
        priceAmount: priceInUah,
        firstName,
        lastName,
        email: email || session?.user?.email || 'client@pentu24.com',
        phone,
        city,
        warehouse,
        items: [
          {
            productId,
            name: title,
            price: priceInUah,
            quantity: 1,
          },
        ],
      };

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const textResponse = await response.text();
      let result;
      try {
        result = JSON.parse(textResponse);
      } catch {
        throw new Error(`Сервер повернув невалідну відповідь: ${textResponse.slice(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(result.error || 'Помилка створення замовлення');
      }

      if (!result.payment_url) {
        throw new Error('Monobank посилання не отримано');
      }

      setShowCheckoutModal(false);

      let redirectUrl = result.payment_url;
      if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
        redirectUrl = `https://send.monobank.ua/${redirectUrl}`;
      }

      window.location.assign(redirectUrl);

    } catch (error: any) {
      console.error('Payment fetch error:', error);
      if (error.name === 'AbortError') {
        alert('Перевищено час очікування сервера (таймаут 15с). Перевірте зв’язок із бекендом.');
      } else {
        alert(error.message || 'Помилка з’єднання з сервером оплати');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center bg-gray-50/80 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">До сплати:</p>
              <div className="text-2xl font-bold text-gray-900">{priceInUah} ₴</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-[11px] font-semibold text-gray-700 bg-white border border-gray-200/80 px-2.5 py-1 rounded-full shadow-2xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" /> Secure Checkout
              </span>
            </div>
          </div>

          <div className="bg-orange-50/50 rounded-xl p-3.5 text-xs text-gray-600 space-y-2 border border-orange-100/60">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="leading-tight">Безпечна та захищена оплата через Monobank.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <CreditCard className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="leading-tight">Швидка доставка Новою Поштою.</p>
            </div>
          </div>

          <button
            onClick={handleOpenCheckout}
            type="button"
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-orange-500/15 flex justify-center items-center gap-2 text-sm cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            Купити товар
          </button>
        </div>
      </div>

      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 relative my-8 animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-gray-900">Оформлення замовлення</h3>
              <p className="text-xs text-gray-500 mt-1">
                {title} — <span className="font-semibold text-orange-500">{priceInUah} ₴</span>
              </p>
            </div>

            {isChoosingAddress ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
                    Оберіть збережену адресу:
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsChoosingAddress(false)}
                    className="text-xs font-medium text-orange-500 hover:text-orange-600 transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Нова адреса
                  </button>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id || addr.addressName}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className="border border-gray-200 hover:border-orange-500 bg-gray-50/50 hover:bg-orange-50/20 p-3.5 rounded-xl cursor-pointer transition-all space-y-1.5 group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-xs text-gray-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-orange-500" />
                          {addr.addressName || 'Адреса'}
                        </span>
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full font-semibold group-hover:bg-orange-500 group-hover:text-white transition">
                          Вибрати
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">{addr.firstName} {addr.lastName} ({addr.phone})</p>
                      <p className="text-xs text-gray-500">{addr.city}, {addr.warehouse}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsChoosingAddress(true)}
                    className="text-xs font-medium text-orange-500 hover:underline cursor-pointer block mb-1"
                  >
                    ← Обрати зі збережених адрес
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ім&apos;я *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-2.5 text-xs focus:border-orange-500 focus:bg-white outline-none transition text-gray-900"
                      placeholder="Ім'я"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Прізвище *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-2.5 text-xs focus:border-orange-500 focus:bg-white outline-none transition text-gray-900"
                      placeholder="Прізвище"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-2.5 text-xs focus:border-orange-500 focus:bg-white outline-none transition text-gray-900"
                      placeholder="mail@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Телефон *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-2.5 text-xs focus:border-orange-500 focus:bg-white outline-none transition text-gray-900"
                      placeholder="+380..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Місто (Нова Пошта) *</label>
                    <input
                      type="text"
                      required
                      value={citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setShowCities(true);
                      }}
                      onFocus={() => setShowCities(true)}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-2.5 text-xs focus:border-orange-500 focus:bg-white outline-none transition text-gray-900"
                      placeholder="Введіть місто..."
                    />
                    {showCities && cities.length > 0 && (
                      <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-44 overflow-y-auto">
                        {cities.map((item) => (
                          <li
                            key={item.ref}
                            onClick={() => handleCitySelect(item)}
                            className="p-2.5 text-xs hover:bg-orange-50 hover:text-orange-600 cursor-pointer text-gray-800 border-b border-gray-100 last:border-none transition"
                          >
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Відділення НП *</label>
                    <select
                      required
                      disabled={!cityRef || loadingWarehouses}
                      value={warehouse}
                      onChange={(e) => setWarehouse(e.target.value)}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-2.5 text-xs focus:border-orange-500 focus:bg-white outline-none transition text-gray-900 disabled:opacity-50 cursor-pointer"
                    >
                      <option value="" disabled>
                        {loadingWarehouses ? 'Завантаження...' : 'Оберіть відділення'}
                      </option>
                      {warehouses.map((wh) => (
                        <option key={wh.ref} value={wh.description}>
                          {wh.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-orange-500/15 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Створення замовлення...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Перейти до оплати ({priceInUah} ₴)
                        <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 relative animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Потрібна авторизація</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Щоб оформити замовлення та відстежувати його статус, будь ласка, увійдіть до свого облікового запису Pentu24.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md shadow-orange-500/15 text-xs cursor-pointer"
              >
                Увійти в систему
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-all text-xs cursor-pointer"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}