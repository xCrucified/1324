'use client';

import React, { useState } from 'react';
import { useShopStore } from '@/store/use-shop';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ActionToast from '@/components/ui/action-toast';
import { createOrder } from '@/app/actions';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useShopStore();
  const [toast, setToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    country: 'Germany',
    paymentMethod: 'card',
  });

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || loading) return;

    setLoading(true);

    const result = await createOrder({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      payment: formData.paymentMethod,
      total: totalAmount + 5.00,
      items: items.map((i) => ({
        productId: i.id,
        quantity: i.quantity,
        price: i.price,
      })),
    });

    setLoading(false);

    if (result.success) {
      clearCart();
      setToast(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      alert('Ошибка при оформлении заказа. Попробуйте еще раз.');
    }
  };

  if (items.length === 0 && !toast) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-parchment rounded-full flex items-center justify-center text-3xl mb-4">
          🛒
        </div>
        <h1 className="font-display font-bold text-2xl text-bark mb-2">Your cart is empty</h1>
        <p className="font-body text-oak text-sm mb-6">Add some products before proceeding to checkout.</p>
        <Link 
          href="/"
          className="px-6 py-2.5 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-10 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="font-body text-xs text-oak hover:text-caramel transition-colors mb-6 inline-block">
          ← Back to Marketplace
        </Link>
        
        <h1 className="font-display font-bold text-3xl text-bark mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-ivory border border-parchment p-6 rounded-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-bark border-b border-parchment pb-2">
                Shipping Information
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-xs text-oak mb-1">First Name</label>
                  <input 
                    type="text" 
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-cream border border-mist px-3 py-2 text-sm text-bark rounded-sm outline-none focus:border-oak"
                  />
                </div>
                <div>
                  <label className="block font-body text-xs text-oak mb-1">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-cream border border-mist px-3 py-2 text-sm text-bark rounded-sm outline-none focus:border-oak"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-xs text-oak mb-1">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-cream border border-mist px-3 py-2 text-sm text-bark rounded-sm outline-none focus:border-oak"
                />
              </div>

              <div>
                <label className="block font-body text-xs text-oak mb-1">Street Address</label>
                <input 
                  type="text" 
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-cream border border-mist px-3 py-2 text-sm text-bark rounded-sm outline-none focus:border-oak"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-xs text-oak mb-1">City</label>
                  <input 
                    type="text" 
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-cream border border-mist px-3 py-2 text-sm text-bark rounded-sm outline-none focus:border-oak"
                  />
                </div>
                <div>
                  <label className="block font-body text-xs text-oak mb-1">Country</label>
                  <select 
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-cream border border-mist px-3 py-2 text-sm text-bark rounded-sm outline-none focus:border-oak"
                  >
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Spain">Spain</option>
                    <option value="Italy">Italy</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-ivory border border-parchment p-6 rounded-sm space-y-4">
              <h2 className="font-display font-bold text-lg text-bark border-b border-parchment pb-2">
                Payment Method
              </h2>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-cream border border-mist rounded-sm cursor-pointer">
                  <input type="radio" name="paymentMethod" value="card" defaultChecked onChange={handleChange} className="accent-amber" />
                  <span className="font-body text-sm text-bark">Credit / Debit Card</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-cream border border-mist rounded-sm cursor-pointer">
                  <input type="radio" name="paymentMethod" value="paypal" onChange={handleChange} className="accent-amber" />
                  <span className="font-body text-sm text-bark">PayPal</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-ivory border border-parchment p-6 rounded-sm h-fit space-y-4">
            <h2 className="font-display font-bold text-lg text-bark border-b border-parchment pb-2">
              Order Summary
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs font-body">
                  <span className="text-oak line-clamp-1 max-w-[180px]">{item.name} x{item.quantity}</span>
                  <span className="font-bold text-bark">€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-parchment pt-4 space-y-2 font-body text-xs">
              <div className="flex justify-between text-oak">
                <span>Subtotal</span>
                <span>€{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-oak">
                <span>Shipping</span>
                <span>€5.00</span>
              </div>
              <div className="flex justify-between text-bark font-bold text-base pt-2 border-t border-parchment">
                <span>Total</span>
                <span className="text-amber">€{(totalAmount + 5.00).toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-bark text-cream font-bold rounded-sm hover:bg-caramel transition-colors mt-4 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>

      <ActionToast visible={toast} message="Order placed successfully in database!" icon="📦" />
    </div>
  );
}