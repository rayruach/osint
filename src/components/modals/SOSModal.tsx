"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import type { User } from "@/types";
import type { ToastType } from "@/hooks/useToast";

const SOS_TYPES = [
  "Medical Emergency",
  "Active Threat / Armed Attack",
  "Trapped / Disaster",
  "Fire / Explosion",
];

interface Props {
  open: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: ToastType) => void;
  onBroadcast: () => void;
  user: User | null;
  onLoginRequired: () => void;
}

export default function SOSModal({ open, onClose, showToast, onBroadcast, user, onLoginRequired }: Props) {
  const [sosType, setSosType] = useState("Medical Emergency");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-request GPS when modal opens
  useEffect(() => {
    if (!open || !user) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setLocating(false);
      },
      () => {
        setLocation("");
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [open, user]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSosType("Medical Emergency");
      setLocation("");
      setLatitude(null);
      setLongitude(null);
    }
  }, [open]);

  // Block if not logged in
  if (open && !user) {
    return (
      <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-full bg-red-950/50 border border-red-800/60 flex items-center justify-center mx-auto">
            <i className="fa-solid fa-lock text-red-400 text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Login Required</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              You must be logged in to send an SOS. Your identity and location will be recorded for emergency response.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={() => { onClose(); onLoginRequired(); }}
              className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition"
            >
              Log In
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  const handleBroadcast = async () => {
    if (!location.trim()) { showToast("Location is required.", "warning"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/posts/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sosType, location, latitude, longitude }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to broadcast SOS.", "error");
        return;
      }
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`[EMERGENCY] SOS: ${sosType}`, { body: `${location} - Immediate response requested.` });
      }
      showToast("Emergency SOS sent. Stay calm — help is on the way.", "error");
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

      {/* User identity — prefilled, read-only */}
      {user && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-slate-500 block">Name</span>
            <span className="text-slate-200 font-medium">{user.fullName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">EIN</span>
            <span className="text-emerald-400 font-mono font-semibold">{user.ein}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Phone</span>
            <span className="text-slate-200 font-mono">{user.phone}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Status</span>
            <span className="text-red-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
              SOS Active
            </span>
          </div>
        </div>
      )}

      {/* Emergency type */}
      <div className="space-y-1.5 text-xs">
        <label className="block text-slate-400 font-medium">Select Emergency Type</label>
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

      {/* Location */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <label className="block text-slate-400 font-medium">Your Location</label>
          {locating ? (
            <span className="text-[10px] text-amber-400 flex items-center gap-1">
              <i className="fa-solid fa-circle-notch fa-spin text-[9px]" /> Detecting GPS...
            </span>
          ) : latitude ? (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              GPS acquired
            </span>
          ) : (
            <span className="text-[10px] text-slate-500">Enter manually</span>
          )}
        </div>
        <div className="relative">
          <i className="fa-solid fa-location-dot absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-xs" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Detecting your location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-red-500 transition"
          />
        </div>
        {latitude && longitude && (
          <p className="text-[10px] text-slate-500 font-mono">
            Coords: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium transition">
          Cancel
        </button>
        <button
          onClick={handleBroadcast}
          disabled={loading || locating}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-medium text-xs rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-red-900/40 disabled:opacity-60"
        >
          <i className="fa-solid fa-triangle-exclamation text-xs" />
          <span>{loading ? "Sending..." : "Send SOS"}</span>
        </button>
      </div>
    </Modal>
  );
}
