"use client";

import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, children, maxWidth = "max-w-lg" }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative bg-slate-900 border border-slate-800 rounded-2xl ${maxWidth} w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition z-10"
          aria-label="Close modal"
        >
          <i className="fa-solid fa-xmark text-lg" />
        </button>
        {children}
      </div>
    </div>
  );
}
