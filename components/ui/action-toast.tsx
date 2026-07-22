'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  visible: boolean;
  message: string;
  icon?: string;
}

export default function ActionToast({ visible, message, icon = '✨' }: Props) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 bg-bark text-cream px-4 py-3 rounded-sm shadow-xl flex items-center gap-3 transition-all duration-300 transform",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <span className="text-xl">{icon}</span>
      <p className="font-body text-xs font-bold tracking-wide">{message}</p>
    </div>
  );
}