"use client";

import { useEffect, useState } from "react";

interface Props {
  message: string;
  subtitle?: string;
  confirmText?: string;
  confirmColor?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ActionToast({
  message,
  subtitle,
  confirmText = "Confirm",
  confirmColor = "bg-emerald-600 hover:bg-emerald-500",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(onCancel, 9000);
    return () => clearTimeout(timer);
  }, [onCancel]);

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-auto transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="p-3.5 rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-md shadow-2xl text-xs font-medium space-y-2.5">
        <div className="flex items-start space-x-2.5">
          <i className="fa-solid fa-circle-question text-emerald-400 mt-0.5 text-sm" />
          <div className="flex-1">
            <p className="font-bold text-slate-100">{message}</p>
            {subtitle && <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{subtitle}</p>}
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 p-0.5 text-xs">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold text-white shadow-sm transition ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
