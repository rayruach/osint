"use client";

import { useEffect, useState } from "react";
import type { Toast, ToastType } from "@/hooks/useToast";

const iconMap: Record<ToastType, string> = {
  info: "fa-circle-info text-slate-400",
  success: "fa-circle-check text-emerald-400",
  warning: "fa-triangle-exclamation text-amber-400",
  error: "fa-triangle-exclamation text-red-500",
  location: "fa-location-dot text-emerald-400",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`p-3 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-md shadow-2xl text-xs text-slate-100 font-medium flex items-center space-x-2.5 pointer-events-auto transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <i className={`fa-solid ${iconMap[toast.type]} text-xs`} />
      <span className="flex-1">{toast.message}</span>
      <button onClick={onRemove} className="text-slate-500 hover:text-slate-300 ml-1">
        <i className="fa-solid fa-xmark text-xs" />
      </button>
    </div>
  );
}

export default function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2 pointer-events-none max-w-sm w-full px-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
