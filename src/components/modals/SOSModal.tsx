"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import type { ToastType } from "@/hooks/useToast";

const SOS_TYPES = ["Medical Emergency", "Active Threat", "Trapped / Disaster", "Fire / Explosion"];

interface Props {
  open: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: ToastType) => void;
  onBroadcast: () => void;
  currentLocation?: string;
}

export default function SOSModal({ open, onClose, showToast, onBroadcast, currentLocation = "" }: Props) {
  const [sosType, setSosType] = useState("Medical Emergency");
  const [location, setLocation] = useState(currentLocation);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setLocation(currentLocation || "Detecting location...");
  }, [open, currentLocation]);

  const handleBroadcast = async () => {
    if (!location.trim()) { showToast("Please enter your location.", "warning"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/posts/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sosType, location }),
      });
      if (!res.ok) { showToast("Failed to broadcast SOS.", "error"); return; }
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`[EMERGENCY] SOS: ${sosType}`, { body: `${location} — Immediate response requested.` });
      }
      showToast("Emergency SOS broadcasted.", "error");
      onBroadcast();
      onClose();
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-center space-x-2 text-red-500 border-b border-slate-800 pb-3">
        <i className="fa-solid fa-triangle-exclamation text-base" />
        <h3 className="text-sm font-semibold text-slate-100 tracking-wide">Emergency SOS</h3>
      </div>

      <div className="space-y-1.5 text-xs">
        <label className="block text-slate-400 font-medium">Select Emergency</label>
        <div className="grid grid-cols-2 gap-2">
          {SOS_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSosType(type)}
              className={`p-2.5 rounded-xl border text-xs text-center transition ${
                sosType === type
                  ? "border-red-500/60 bg-red-950/40 text-white font-medium"
                  : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <label className="block text-slate-400 font-medium">Emergency Location</label>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            GPS Location
          </span>
        </div>
        <div className="relative">
          <i className="fa-solid fa-location-dot absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-xs" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter or confirm location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-red-500 transition"
          />
        </div>
        <p className="text-[11px] text-slate-500">Dispatch units will route emergency responders to this location.</p>
      </div>

      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium transition">
          Cancel
        </button>
        <button
          onClick={handleBroadcast}
          disabled={loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-medium text-xs rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-red-900/40 disabled:opacity-60"
        >
          <i className="fa-solid fa-triangle-exclamation text-xs" />
          <span>{loading ? "Sending..." : "Send SOS"}</span>
        </button>
      </div>
    </Modal>
  );
}
