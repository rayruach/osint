"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import type { ToastType } from "@/hooks/useToast";

interface Props {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  showToast: (msg: string, type?: ToastType) => void;
  onRegistered: () => void;
}

export default function RegisterModal({ open, onClose, onSwitchToLogin, showToast, onRegistered }: Props) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Registration failed.", "error"); return; }
      showToast(`Account registered! Your Emergency ID is ${data.user.ein}`, "success");
      onRegistered();
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
          <i className="fa-solid fa-id-card text-sm" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Register an OSINT Account</h3>
          <p className="text-[11px] text-slate-400">Get an Emergency Identification Number (EIN)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">Full Names *</label>
          <div className="relative">
            <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="e.g. Chukwuma Adebayo"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition" />
          </div>
        </div>
        <div>
          <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
          <div className="relative">
            <i className="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="e.g. 0803 123 4567"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono transition" />
          </div>
        </div>
        <div>
          <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
          <div className="relative">
            <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="e.g. adebayo@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition" />
          </div>
        </div>
        <div>
          <label className="block text-slate-300 font-medium mb-1">Password *</label>
          <div className="relative">
            <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
            <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Minimum 6 characters"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-9 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs p-1">
              <i className={`fa-regular ${showPwd ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 text-[11px] text-slate-400 flex items-start space-x-2">
          <i className="fa-solid fa-id-card text-emerald-400 mt-0.5 text-xs shrink-0" />
          <span>An Emergency Identification Number (EIN) will be assigned immediately upon registration.</span>
        </div>

        <div className="pt-1 flex items-center justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-medium transition text-xs">Cancel</button>
          <button type="submit" disabled={loading}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold rounded-xl flex items-center space-x-1.5 transition text-xs disabled:opacity-60">
            <i className="fa-solid fa-user-check text-xs" />
            <span>{loading ? "Registering..." : "Register an OSINT Account"}</span>
          </button>
        </div>

        <div className="text-center pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          Already have an account?{" "}
          <button type="button" onClick={onSwitchToLogin} className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 ml-1">Log In</button>
        </div>
      </form>
    </Modal>
  );
}
