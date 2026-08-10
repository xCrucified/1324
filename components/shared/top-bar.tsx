'use client';

import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { useSession, signOut } from 'next-auth/react';
import { getOrders } from '@/app/actions';
import OrdersModal from './orders-modal';

interface Props {
  className?: string;
}

export const TopBar: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  //  const { data: session, status } = useSession();
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    getOrders()
      .then((data) => setOrdersCount(data.length))
      .catch(() => setOrdersCount(0));
  }, [ordersOpen]);

  // Додали "Мої адреси" для авторизованих
  const navItems = status === "authenticated" 
    ? ["Мої адреси", "Відстежити замовлення", "Допомога", "Вийти"] 
    : ["Відстежити замовлення", "Допомога", "Увійти", "Зареєструватися"];

  const handleTopBarClick = (item: string) => {
    if (item === "Мої адреси") {
      router.push("/addresses");
    } else if (item === "Відстежити замовлення") {
      setOrdersOpen(true);
    } else if (item === "Увійти") {
      router.push("/login");
    } else if (item === "Зареєструватися") {
      router.push("/register");
    } else if (item === "Вийти") {
      // signOut({ callbackUrl: "/" }); 
    } else if (item === "Допомога") {
      alert("Підтримка: support@pentu24.com");
    }
  };

  return (
    <>
      <div className={cn("bg-bark text-parchment text-[0.71rem]", className)}>
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex gap-4 items-center font-body opacity-80">
            <span>
              Ласкаво просимо до{" "}
              <strong className="text-wheat opacity-100">
                Маркету Pentu24
              </strong>
{/*               
              {session?.user?.name && (
                <span className="ml-2 text-wheat">({session.user.name})</span>
              )} */}
            </span>
            <span className="hidden sm:inline opacity-40">|</span>
          </div>
          
          <div className="flex gap-5 items-center font-body">
            {navItems.map((l) => (
              <button
                key={l}
                onClick={() => handleTopBarClick(l)}
                className="hover:text-wheat transition-colors opacity-80 hover:opacity-100 relative cursor-pointer"
              >
                {l}
                {l === "Відстежити замовлення" && ordersCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber text-cream rounded-full text-[9px] w-3 h-3 flex items-center justify-center font-bold">
                    {ordersCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <OrdersModal 
        isOpen={ordersOpen} 
        onClose={() => {
          setOrdersOpen(false);
          getOrders().then((data) => setOrdersCount(data.length));
        }} 
      />
    </>
  );
};

export default TopBar;