'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RecipientForm, { RecipientData } from '@/components/shared/recipient-form';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<RecipientData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<RecipientData | null>(null);

  // Завантаження збережених адрес із localStorage при монтуванні
  useEffect(() => {
    const saved = localStorage.getItem('user_novaposhta_addresses');
    if (saved) {
      try {
        setAddresses(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Збереження в localStorage при зміні
  const saveToLocalStorage = (updated: RecipientData[]) => {
    setAddresses(updated);
    localStorage.setItem('user_novaposhta_addresses', JSON.stringify(updated));
  };

  const handleSaveAddress = (data: RecipientData) => {
    if (editingAddress && data.id) {
      const updated = addresses.map((a) => (a.id === data.id ? data : a));
      saveToLocalStorage(updated);
    } else {
      const newAddress = { ...data, id: Date.now().toString() };
      saveToLocalStorage([...addresses, newAddress]);
    }
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id?: string) => {
    if (!id) return;
    const updated = addresses.filter((a) => a.id !== id);
    saveToLocalStorage(updated);
  };

  return (
    <div className="min-h-screen bg-cream py-10 px-4 font-body text-bark">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xs text-oak hover:text-caramel transition-colors">
            ← На головну
          </Link>
          <h1 className="font-display font-bold text-2xl text-bark">Мої адреси доставки</h1>
        </div>

        {showForm ? (
          <RecipientForm
            initialData={editingAddress}
            onSave={handleSaveAddress}
            onCancel={() => {
              setShowForm(false);
              setEditingAddress(null);
            }}
          />
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => {
                setEditingAddress(null);
                setShowForm(true);
              }}
              className="w-full py-3 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors text-sm cursor-pointer"
            >
              + Додати нову адресу
            </button>

            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-ivory border border-parchment p-5 rounded-sm relative space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base text-bark">{addr.addressName}</h3>
                      <div className="space-x-3 text-xs">
                        <button
                          onClick={() => {
                            setEditingAddress(addr);
                            setShowForm(true);
                          }}
                          className="text-oak hover:text-caramel cursor-pointer"
                        >
                          Редагувати
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          Видалити
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-bark">{addr.firstName} {addr.lastName} {addr.patronymic}</p>
                    <p className="text-sm text-oak">{addr.phone}</p>
                    <div className="text-xs bg-cream p-3 rounded-sm border border-mist mt-2 space-y-1">
                      <p><span className="font-semibold">Місто:</span> {addr.city}</p>
                      <p><span className="font-semibold">Відділення:</span> {addr.warehouse}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-ivory border border-parchment rounded-sm">
                <p className="text-sm text-oak">У вас ще немає збережених адрес Нової Пошти.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}