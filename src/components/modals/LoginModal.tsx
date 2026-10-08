"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import type { ToastType } from "@/hooks/useToast";

interface Props {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  showToast: (msg: string, type?: ToastType) => void;
  onLoggedIn: () => void;
}

export default function LoginModal({ open, onClose, onSwitchToRegister, showToast, onLoggedIn }: Props) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Login failed.", "error"); return; }
      showToast(`Welcome back, ${data.user.fullName}! EIN: ${data.user.ein}`, "success");
      onLoggedIn();
      onClose();
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-center space-x-2.5 text-emerald-400 border-b border-slate-800 pb-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <i className="fa-solid fa-right-to-bracket text-sm" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Log In to OSINT</h3>
          <p className="text-[11px] text-slate-400">Access your Emergency Identification Number (EIN)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">Email, Phone or EIN *</label>
          <div className="relative">
            <i className="fa-solid fa-id-card absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder="e.g. adebayo@example.com or EIN-482910"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-xs transition" />
          </div>
        </div>
        <div>
          <label className="block text-slate-300 font-medium mb-1">Password *</label>
          <div className="relative">
            <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-9 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs p-1">
              <i className={`fa-regular ${showPwd ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-medium transition text-xs">Cancel</button>
          <button type="submit" disabled={loading}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold rounded-xl flex items-center space-x-1.5 transition text-xs disabled:opacity-60">
            <i className="fa-solid fa-right-to-bracket text-xs" />
            <span>{loading ? "Logging in..." : "Log In"}</span>
          </button>
        </div>

        <div className="text-center pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          Don&apos;t have an account?{" "}
          <button type="button" onClick={onSwitchToRegister} className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 ml-1">Register an OSINT Account</button>
        </div>
      </form>
    </Modal>
  );
}
