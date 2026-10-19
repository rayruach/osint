"use client";

import { useState } from "react";
import type { ToastType } from "@/hooks/useToast";

interface Props {
  onSearchToggle: () => void;
  onLocate: () => void;
  onSOSClick: () => void;
  onReportClick: () => void;
  onUserClick: () => void;
  userLabel?: string;
  onPushToggle: () => void;
  pushEnabled: boolean;
  pushMuted: boolean;
  showToast: (msg: string, type?: ToastType) => void;
}

export default function Navbar({ onSearchToggle, onLocate, onSOSClick, onReportClick, onUserClick, userLabel, onPushToggle, pushEnabled, pushMuted }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="border-b border-slate-800 bg-slate-950 px-4 py-1.5 font-mono text-[10px] text-slate-400 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3"><span className="font-semibold text-slate-300">BIOS NEWSROOM</span><span className="hidden border-l border-slate-700 pl-3 md:inline">Independent journalism for Nigeria</span></div>
          <div className="flex items-center gap-3">
            <button onClick={onUserClick} aria-label={userLabel ? "Account" : "Login/Register"} className="inline-flex items-center gap-1.5 whitespace-nowrap text-slate-300 transition hover:text-white">
              <i className={`fa-solid ${userLabel ? "fa-user-check text-emerald-400" : "fa-user"}`} />
              <span>{userLabel ? "Account" : "Login/Register"}</span>
            </button>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0a0d12]/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 min-w-0 max-w-7xl items-center justify-between gap-2 px-3 sm:h-20 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
          <a href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-red-600 font-editorial text-xl font-bold text-white shadow-lg shadow-red-950/30 sm:h-10 sm:w-10 sm:text-2xl">B</div>
            <div className="min-w-0"><p className="font-editorial text-xl font-bold leading-none tracking-tight text-white sm:text-2xl">BIOS</p><p className="mt-1 hidden font-mono text-[9px] uppercase tracking-[0.16em] text-red-400 sm:block">Independent Investigative Journalism</p></div>
          </a>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button onClick={onSearchToggle} title="Search reports" aria-label="Search reports" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition sm:w-40 sm:justify-start sm:gap-2 sm:px-3 md:w-52"><i className="fa-solid fa-magnifying-glass text-xs" /><span className="hidden text-xs text-slate-400 sm:inline">Search reports</span></button>
            <button onClick={onLocate} title="Use my location" aria-label="Use my location" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition"><i className="fa-solid fa-location-crosshairs text-xs" /></button>
            <button onClick={onPushToggle} title="Notifications" className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 sm:inline-flex"><i className={`fa-solid ${!pushEnabled || pushMuted ? "fa-bell-slash" : "fa-bell text-emerald-400"} text-xs`} /></button>
            <button onClick={onSOSClick} title="Emergency SOS" aria-label="Emergency SOS" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-500/50 bg-red-600/15 px-2.5 text-red-300 transition hover:bg-red-600 hover:text-white sm:w-9 sm:px-0">
              <i className="fa-solid fa-triangle-exclamation text-xs" />
              <span className="text-[10px] font-bold sm:hidden">SOS</span>
            </button>
            <button onClick={onReportClick} aria-label="Submit report" className="h-9 rounded-lg bg-red-600 px-3 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-red-950/30 hover:bg-red-700 transition sm:h-auto sm:py-2.5"><i className="fa-solid fa-plus sm:mr-1.5" /> <span className="hidden sm:inline">Submit report</span></button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button onClick={() => setMenuOpen(false)} aria-label="Close navigation" className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside className="relative flex h-full w-[82%] max-w-sm flex-col border-r border-slate-800 bg-[#0a0d12] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div><p className="font-editorial text-2xl font-bold text-white">BIOS</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-red-400">Investigative journalism</p></div>
              <button onClick={() => setMenuOpen(false)} aria-label="Close navigation" className="h-9 w-9 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"><i className="fa-solid fa-xmark text-lg" /></button>
            </div>
            <nav className="mt-5 space-y-1 text-base">
            </nav>
            <div className="mt-auto space-y-3 border-t border-slate-800 pt-5">
              <button onClick={() => { setMenuOpen(false); onUserClick(); }} className="w-full rounded-lg border border-slate-700 px-4 py-3 text-left text-sm font-medium text-slate-200 hover:bg-slate-800"><i className={`fa-solid ${userLabel ? "fa-user-check text-emerald-400" : "fa-user text-slate-400"} mr-2`} /> {userLabel || "Sign in"}</button>
              <button onClick={() => { setMenuOpen(false); onReportClick(); }} className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"><i className="fa-solid fa-plus mr-2" /> Submit report</button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
