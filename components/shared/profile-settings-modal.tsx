"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";

interface Props {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatarPreview: string | null;
  avatarFile: File | null;
};

type ProfileFormAction =
  | { type: "updateField"; field: keyof ProfileFormState; value: ProfileFormState[keyof ProfileFormState] }
  | { type: "reset"; payload: ProfileFormState };

const initialFormState: ProfileFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  avatarPreview: null,
  avatarFile: null,
};

const formReducer = (
  state: ProfileFormState,
  action: ProfileFormAction
): ProfileFormState => {
  switch (action.type) {
    case "updateField":
      return { ...state, [action.field]: action.value };
    case "reset":
      return action.payload;
    default:
      return state;
  }
};

// Вспомогательная функция для обработки ссылок на приватные картинки
const getSecureImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  // Если это картинка из Vercel Blob, пропускаем через наш API
  if (url.includes("vercel-storage.com")) {
    return `/api/avatar?url=${encodeURIComponent(url)}`;
  }
  // Иначе (например, аватарка Google) отдаем как есть
  return url;
};

export const ProfileSettingsModal: React.FC<Props> = ({
  className = "",
  isOpen,
  onClose,
}) => {
  const { data: session, update } = useSession();
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const { firstName, lastName, email, password, avatarPreview, avatarFile } = formState;

  // Заполняем форму при открытии
  useEffect(() => {
    if (session?.user && isOpen) {
      const [first = "", last = ""] = (session.user.name || "").split(" ");
      dispatch({
        type: "reset",
        payload: {
          firstName: first,
          lastName: last,
          email: session.user.email || "",
          password: "",
          // ТУТ ИЗМЕНЕНИЕ: используем нашу функцию для правильной ссылки
          avatarPreview: getSecureImageUrl(session.user.image),
          avatarFile: null,
        },
      });
    }
  }, [session, isOpen]);

  // Закрытие и скролл
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Обработка выбора картинки
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      dispatch({ type: "updateField", field: "avatarPreview", value: url });
      dispatch({ type: "updateField", field: "avatarFile", value: file });
    }
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      if (password) formData.append("password", password);
      if (avatarFile) formData.append("avatarFile", avatarFile);

      const response = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Помилка сервера");
      const result = await response.json();

      if (result.success) {
        // Оновлюємо сесію NextAuth
        await update({
          name: result.user.name,
          email: result.user.email,
          image: result.user.image,
        });
        
        // Примусово оновлюємо сторінку/роутер, щоб хедер і меню побачили зміни
        router.refresh();
        onClose();
      }
    } catch (error) {
      console.error("Помилка оновлення профілю:", error);
      alert("Не вдалося оновити профіль. Спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99] transition-opacity" />
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <div ref={modalRef} className={`w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-amber/20 overflow-hidden text-bark ${className}`}>
          
          <div className="flex justify-between items-center px-6 py-4 border-b border-amber/15 bg-parchment/30">
            <h2 className="text-lg font-bold text-bark">Налаштування профілю</h2>
            <button onClick={onClose} disabled={isLoading} className="text-oak hover:text-caramel transition-colors p-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div className="flex items-center gap-5">
              <Avatar className="w-20 h-20 border-2 border-amber/30 shadow-sm shrink-0">
                {/* Аватарка теперь всегда рендерится правильно, будь то локальный файл, Vercel Proxy или Google */}
                <AvatarImage src={avatarPreview || ""} alt="Avatar" />
                <AvatarFallback className="bg-parchment text-caramel font-bold text-xl">
                  {firstName?.[0] || email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-sm font-bold mb-1">Фото профілю</h3>
                <p className="text-xs text-oak mb-3">JPG, GIF або PNG. Максимум 2MB.</p>
                <label className={`cursor-pointer inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl transition-colors border ${isLoading ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-amber/10 hover:bg-amber/20 text-caramel border-amber/20'}`}>
                  <span>Змінити фото</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isLoading} />
                </label>
              </div>
            </div>

            <hr className="border-amber/15" />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-oak ml-1">Ім`я</label>
                  <input required type="text" value={firstName} onChange={(e) => dispatch({ type: "updateField", field: "firstName", value: e.target.value })} disabled={isLoading} className="w-full bg-white border border-amber/30 rounded-xl px-4 py-2.5 text-sm text-bark outline-none focus:border-caramel focus:ring-1 focus:ring-caramel transition-all disabled:opacity-50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-oak ml-1">Прізвище</label>
                  <input type="text" value={lastName} onChange={(e) => dispatch({ type: "updateField", field: "lastName", value: e.target.value })} disabled={isLoading} className="w-full bg-white border border-amber/30 rounded-xl px-4 py-2.5 text-sm text-bark outline-none focus:border-caramel focus:ring-1 focus:ring-caramel transition-all disabled:opacity-50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-oak ml-1">Email адреса</label>
                <input required type="email" value={email} onChange={(e) => dispatch({ type: "updateField", field: "email", value: e.target.value })} disabled={isLoading} className="w-full bg-white border border-amber/30 rounded-xl px-4 py-2.5 text-sm text-bark outline-none focus:border-caramel focus:ring-1 focus:ring-caramel transition-all disabled:opacity-50" />
              </div>
            </div>

            <hr className="border-amber/15" />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-oak ml-1">Новий пароль (залиште порожнім, якщо не змінюєте)</label>
              <input type="password" value={password} onChange={(e) => dispatch({ type: "updateField", field: "password", value: e.target.value })} disabled={isLoading} className="w-full bg-white border border-amber/30 rounded-xl px-4 py-2.5 text-sm text-bark outline-none focus:border-caramel focus:ring-1 focus:ring-caramel transition-all disabled:opacity-50" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-oak hover:bg-parchment/50 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50">
                Скасувати
              </button>
              <button type="submit" disabled={isLoading} className="min-w-[140px] flex justify-center px-6 py-2.5 bg-caramel hover:bg-amber text-white font-bold text-sm rounded-xl shadow-md transition-colors disabled:opacity-70 disabled:cursor-wait">
                {isLoading ? "Збереження..." : "Зберегти зміни"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default ProfileSettingsModal;