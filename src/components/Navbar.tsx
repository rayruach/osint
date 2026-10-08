"use client";

import { useState } from "react";
import type { User } from "@/types";
import type { ToastType } from "@/hooks/useToast";

interface Props {
  user: User | null;
  onSearchToggle: () => void;
  onLocate: () => void;
  onUserClick: () => void;
  onSOSClick: () => void;
  onPushToggle: () => void;
  pushEnabled: boolean;
  showToast: (msg: string, type?: ToastType) => void;
}

export default function Navbar({
  user,
  onSearchToggle,
  onLocate,
  onUserClick,
  onSOSClick,
  onPushToggle,
  pushEnabled,
}: Props) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-2xl mx-auto px-4 h-15 flex items-center justify-between py-3">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <img
            src="/logo.png"
            alt="OSINT-NG logo"
            className="w-8 h-8 rounded-xl object-cover border border-emerald-500/30 shadow-lg shadow-emerald-950/40"
          />
          <a href="/" className="font-bold text-lg tracking-tight text-white hover:text-emerald-400 transition font-mono">
            OSINT<span className="text-emerald-400">-NG</span>
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <button
            onClick={onSearchToggle}
            title="Search Incidents"
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700 transition flex items-center justify-center active:scale-95 shadow-sm"
          >
            <i className="fa-solid fa-magnifying-glass text-xs" />
          </button>

          {/* Locate */}
          <button
            onClick={onLocate}
            title="Locate Me"
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700 transition flex items-center justify-center active:scale-95 shadow-sm"
          >
            <i className="fa-solid fa-location-crosshairs text-xs" />
          </button>

          {/* User / Account */}
          <button
            onClick={onUserClick}
            title={user ? `OSINT Account: ${user.fullName} | ${user.ein}` : "Register / Login"}
            className={`w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border transition flex items-center justify-center active:scale-95 shadow-sm ${
              user
                ? "border-emerald-500/60 text-emerald-400"
                : "border-slate-700 text-slate-300 hover:text-emerald-400"
            }`}
          >
            <i className={`fa-solid ${user ? "fa-user-check" : "fa-user"} text-xs`} />
          </button>

          {/* Push Notifications */}
          <button
            onClick={onPushToggle}
            title={pushEnabled ? "Push Alerts: Active" : "Push Alerts: Off"}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition flex items-center justify-center active:scale-95 shadow-sm"
          >
            <i className={`fa-solid ${pushEnabled ? "fa-bell text-emerald-400" : "fa-bell-slash text-slate-400"} text-xs`} />
          </button>

          {/* SOS */}
          <button
            onClick={onSOSClick}
            title="Emergency SOS Broadcast"
            className="w-8 h-8 rounded-full bg-red-700 hover:bg-red-600 active:scale-95 text-white flex items-center justify-center border border-red-500 shadow-sm transition"
          >
            <i className="fa-solid fa-triangle-exclamation text-xs" />
          </button>
        </div>
      </div>
    </header>
  );
}
