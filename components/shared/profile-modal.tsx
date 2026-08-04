"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ProfileSettingsModal } from "./profile-settings-modal";

interface Props {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

const getSecureImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (url.includes("vercel-storage.com")) {
    return `/api/avatar?url=${encodeURIComponent(url)}`;
  }
  return url;
};

export const ProfileModal: React.FC<Props> = ({
  className = "",
  isOpen,
  onClose,
}) => {
  const { status } = useSession();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dbUser, setDbUser] = useState<{ name: string | null; email: string | null; image: string | null; role: string | null } | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    const loadUserData = async () => {
      try {
        setLoadingUser(true);
        const res = await fetch("/api/profile");
        if (!active) return;

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setDbUser(data.user);
          }
        }
      } catch (e) {
        console.error("Failed to fetch fresh user data", e);
      } finally {
        if (active) setLoadingUser(false);
      }
    };

    loadUserData();

    return () => {
      active = false;
    };
  }, [isOpen, isSettingsOpen]); // Перезавантажуємо дані з бази коли закриваються налаштування

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAdmin = dbUser?.role === "admin";

  const getInitials = () => {
    if (dbUser?.name) return dbUser.name[0].toUpperCase();
    if (dbUser?.email) return dbUser.email[0].toUpperCase();
    return "U";
  };

  return (
    <div
      ref={dropdownRef}
      className={`absolute top-15 right-0 mt-2 w-70 bg-white rounded-2xl shadow-xl border border-amber/25 z-50 p-4 text-bark ${className}`}
    >
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

      <div className="mt-3">
        {status === "loading" || loadingUser ? (
          <div className="text-center py-4 text-oak animate-pulse font-body text-xs">
            Завантаження з бази...
          </div>
        ) : dbUser ? (
          <div className="flex flex-col items-center text-center">
            {/* Аватарка з урахуванням захищеного посилання */}
            <Avatar className="w-14 h-14 border-2 border-amber/30 shadow-xs mb-2">
              <AvatarImage src={getSecureImageUrl(dbUser.image) || ""} alt={dbUser.name || "User"} />
              <AvatarFallback className="bg-parchment text-caramel font-bold text-base">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            {/* Ім'я та пошта напряму з бази */}
            <h3 className="text-sm font-bold text-bark truncate max-w-full">
              {dbUser.name || "Користувач"}
            </h3>
            <p className="text-[0.7rem] text-oak truncate max-w-full mb-2">
              {dbUser.email}
            </p>

            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6rem] font-bold tracking-wider uppercase mb-4 ${
                isAdmin
                  ? "bg-amber/15 text-amber border border-amber/30"
                  : "bg-oak/10 text-oak"
              }`}
            >
              {isAdmin ? "Адміністратор" : "Покупець"}
            </span>

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
                onClick={() => setIsSettingsOpen(true)}
                className="block w-full py-2 bg-caramel hover:bg-amber text-white font-body text-xs font-bold rounded-xl text-center transition-colors shadow-xs"
              >
                Налаштування
              </button>

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

      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default ProfileModal;