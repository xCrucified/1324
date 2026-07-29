/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface Props {
  className?: string;
}

export default async function Profile({ className = '' }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { name, email, image, role } = session.user;

  return (
    <div className={`max-w-2xl mx-auto p-8 bg-white border border-gray-100 rounded-2xl shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        
        <div className="w-24 h-24 shrink-0 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
          {image ? (
            <img 
              src={image} 
              alt={name || 'Аватар'} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span className="text-3xl font-bold text-gray-400">
              {name ? name[0].toUpperCase() : email?.[0].toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900">
            {name || 'Пользователь'}
          </h1>
          <p className="text-gray-500 mt-1">{email}</p>
          
          <div className="mt-3 flex justify-center sm:justify-start">
            <span 
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                role === 'admin' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {role === 'admin' ? 'Администратор' : 'Покупатель'}
            </span>
          </div>
        </div>
      </div>

      {role === 'admin' && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="bg-indigo-50 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-indigo-900">Панель управления</h3>
              <p className="text-sm text-indigo-700 mt-1">
                Управление товарами, заказами и пользователями.
              </p>
            </div>
            <Link 
              href="/admin"
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Перейти
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}