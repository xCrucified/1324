/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Props {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<Props> = ({
  className = "",
  isOpen,
  onClose,
}) => {
  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закриття при кліку за межами вікна або натисканні Escape
 

  if (!isOpen) return null;

  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const getInitials = () => {
    if (user?.name) return user.name[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-0 top-full mt-2 w-[280px] bg-white rounded-2xl shadow-xl border border-amber/20 z-50 p-4 text-bark ${className}`}
    >
      {/* Шапка дропдауну */}
      <div className="flex justify-between items-center pb-2 border-b border-amber/15">
        <h2 className="text-xs font-bold text-bark uppercase tracking-wider">
          Профіль
        </h2>
        <button
          onClick={onClose}
          className="text-oak hover:text-caramel transition-colors text-sm leading-none p-1"
          title="Закрити"
        >
          ✕
        </button>
      </div>

      {/* Контент */}
      <div className="mt-3">
        {status === "loading" ? (
          <div className="text-center py-4 text-oak animate-pulse font-body text-xs">
            Завантаження...
          </div>
        ) : user ? (
          <div className="flex flex-col items-center text-center">
            {/* Аватарка */}
            <Avatar className="w-14 h-14 border-2 border-amber/30 shadow-xs mb-2">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback className="bg-parchment text-caramel font-bold text-base">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            {/* Інформація */}
            <h3 className="text-sm font-bold text-bark truncate max-w-full">
              {user.name || "Користувач"}
            </h3>
            <p className="text-[0.7rem] text-oak truncate max-w-full mb-2">
              {user.email}
            </p>

            {/* Роль */}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6rem] font-bold tracking-wider uppercase mb-4 ${
                isAdmin
                  ? "bg-amber/15 text-amber border border-amber/30"
                  : "bg-oak/10 text-oak"
              }`}
            >
              {isAdmin ? "Адміністратор" : "Покупець"}
            </span>

            {/* Кнопки дій */}
            <div className="w-full space-y-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="block w-full py-2 bg-caramel hover:bg-amber text-white font-body text-xs font-bold rounded-xl text-center transition-colors shadow-xs"
                >
                  Панель управління
                </Link>
              )}

              <button
                onClick={() => {
                  onClose();
                  signOut();
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-body text-xs font-semibold rounded-xl transition-colors border border-rose-200/60"
              >
                Вийти з акаунту
              </button>
            </div>
          </div>
        ) : (
          /* Незалогінений стан */
          <div className="text-center py-2">
            <p className="text-xs text-oak mb-4 leading-relaxed">
              Увійдіть у свій акаунт, щоб керувати замовленнями.
            </p>
            <Link
              href="/login"
              onClick={onClose}
              className="block w-full py-2 bg-caramel hover:bg-amber text-white font-body text-xs font-bold text-center rounded-xl transition-colors shadow-xs"
            >
              Увійти
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;