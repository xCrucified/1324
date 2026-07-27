'use client';

import React, { useState, useEffect } from 'react';

export interface RecipientData {
  id?: string;
  addressName: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  phone: string;
  city: string;
  cityRef: string;
  warehouse: string;
  warehouseRef: string;
}

interface RecipientFormProps {
  initialData?: RecipientData | null;
  onSave: (data: RecipientData) => void;
  onCancel: () => void;
}

export default function RecipientForm({ initialData, onSave, onCancel }: RecipientFormProps) {
  const [formData, setFormData] = useState<RecipientData>({
    addressName: initialData?.addressName || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    patronymic: initialData?.patronymic || '',
    phone: initialData?.phone || '',
    city: initialData?.city || '',
    cityRef: initialData?.cityRef || '',
    warehouse: initialData?.warehouse || '',
    warehouseRef: initialData?.warehouseRef || '',
  });

  const [citySearch, setCitySearch] = useState(initialData?.city || '');
  const [cities, setCities] = useState<any[]>([]);
  const [showCities, setShowCities] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Автоматичний пошук міст із затримкою (debounce)
  useEffect(() => {
    if (citySearch.length < 2) {
      setCities([]);
      return;
    }
    if (citySearch === formData.city) return;

    const timer = setTimeout(async () => {
      const res = await fetch('/api/novaposhta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getCities', query: citySearch }),
      });
      const data = await res.json();
      setCities(data);
      setShowCities(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [citySearch, formData.city]);

  // Завантаження відділень при виборі міста
  useEffect(() => {
    if (!formData.cityRef) return;

    const fetchWarehouses = async () => {
      setLoading(true);
      const res = await fetch('/api/novaposhta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getWarehouses', cityRef: formData.cityRef }),
      });
      const data = await res.json();
      setWarehouses(data);
      setLoading(false);
    };

    fetchWarehouses();
  }, [formData.cityRef]);

  const handleCitySelect = (city: any) => {
    setCitySearch(city.name);
    setFormData({ 
      ...formData, 
      city: city.name, 
      cityRef: city.ref, 
      warehouse: '', 
      warehouseRef: '' 
    });
    setShowCities(false);
  };

  const handleWarehouseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRef = e.target.value;
    const selectedWh = warehouses.find((w) => w.ref === selectedRef);
    setFormData({
      ...formData,
      warehouseRef: selectedRef,
      warehouse: selectedWh?.description || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-ivory border border-parchment p-6 rounded-sm space-y-4">
      <h3 className="font-display font-bold text-lg text-bark border-b border-parchment pb-2">
        {initialData ? 'Редагувати отримувача' : 'Додати отримувача (Нова Пошта)'}
      </h3>

      <div>
        <label className="block text-xs font-display text-oak mb-1">Назва адреси (наприклад: Дім, Робота) *</label>
        <input
          type="text"
          required
          value={formData.addressName}
          onChange={(e) => setFormData({ ...formData, addressName: e.target.value })}
          className="w-full bg-cream border border-mist rounded-sm p-2 text-sm focus:border-caramel outline-none"
          placeholder="Дім"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-display text-oak mb-1">Ім'я *</label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full bg-cream border border-mist rounded-sm p-2 text-sm focus:border-caramel outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-display text-oak mb-1">Прізвище *</label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full bg-cream border border-mist rounded-sm p-2 text-sm focus:border-caramel outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-display text-oak mb-1">По батькові (необов'язково)</label>
          <input
            type="text"
            value={formData.patronymic}
            onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
            className="w-full bg-cream border border-mist rounded-sm p-2 text-sm focus:border-caramel outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-display text-oak mb-1">Телефон *</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-cream border border-mist rounded-sm p-2 text-sm focus:border-caramel outline-none"
            placeholder="+380..."
          />
        </div>
      </div>

      {/* Випадаючий список міст із пошуком */}
      <div className="relative">
        <label className="block text-xs font-display text-oak mb-1">Населений пункт (Місто) *</label>
        <input
          type="text"
          required
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          onFocus={() => setShowCities(true)}
          className="w-full bg-cream border border-mist rounded-sm p-2 text-sm focus:border-caramel outline-none"
          placeholder="Почніть вводити назву..."
        />
        {showCities && cities.length > 0 && (
          <ul className="absolute z-20 w-full mt-1 bg-white border border-mist rounded-sm shadow-md max-h-48 overflow-y-auto">
            {cities.map((city) => (
              <li
                key={city.ref}
                onClick={() => handleCitySelect(city)}
                className="p-2 text-xs hover:bg-cream cursor-pointer border-b border-mist/50"
              >
                {city.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Випадаючий список відділень */}
      <div>
        <label className="block text-xs font-display text-oak mb-1">Відділення / Поштомат *</label>
        <select
          required
          disabled={!formData.cityRef || loading}
          value={formData.warehouseRef}
          onChange={handleWarehouseSelect}
          className="w-full bg-cream border border-mist rounded-sm p-2 text-sm focus:border-caramel outline-none disabled:opacity-50"
        >
          <option value="" disabled>
            {loading ? 'Завантаження відділень...' : 'Оберіть відділення'}
          </option>
          {warehouses.map((wh) => (
            <option key={wh.ref} value={wh.ref}>
              {wh.description}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-mist text-oak text-xs font-bold rounded-sm hover:bg-mist/20"
        >
          Скасувати
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-bark text-cream text-xs font-bold rounded-sm hover:bg-caramel"
        >
          Зберегти адресу
        </button>
      </div>
    </form>
  );
}