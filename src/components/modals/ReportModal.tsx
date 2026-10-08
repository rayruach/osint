"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import NigeriaLocationSelectors from "@/components/NigeriaLocationSelectors";
import type { ToastType } from "@/hooks/useToast";

const INCIDENT_TYPES = [
  "Mass Protest / Civilian Unrest",
  "Violent Crime / Armed Robbery / Kidnapping",
  "Missing Person",
  "Wanted Person / Fugitive Alert",
  "Road Accident / Highway Crash",
  "Travel & Highway Security Advisory",
  "Flooding / Natural Hazard",
  "Major Traffic Gridlock / Road Blockage",
  "Fire / Industrial Hazard",
  "Public Health Emergency / Disease Outbreak",
  "Infrastructure / Power / Pipeline Failure",
  "Suspicious Activity / Security Advisory",
];

interface Props {
  open: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: ToastType) => void;
  onSubmitted: () => void;
  defaultTown?: string;
}

export default function ReportModal({ open, onClose, showToast, onSubmitted, defaultTown = "" }: Props) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [incidentType, setIncidentType] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [town, setTown] = useState(defaultTown);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSensitive, setIsSensitive] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsSensitive(false);
  };

  const handleClose = () => {
    setStep("form");
    setIncidentType(""); setContact(""); setState(""); setLga(""); setTown(defaultTown);
    setDescription(""); clearImage();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentType,
          contact,
          state,
          lga,
          town,
          description,
          mediaUrl: imagePreview ?? null,
          isSensitive,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error ?? "Submission failed.", "error");
        return;
      }
      setStep("success");
      onSubmitted();
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      {step === "form" ? (
        <>
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold border-b border-slate-800 pb-3">
            <i className="fa-solid fa-bullhorn text-lg" />
            <h3 className="text-sm text-slate-100">Submit Emergency Report</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {/* Incident Type */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Incident Type *</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="" disabled>Select incident type...</option>
                {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Contact & Bounty notice */}
            <div className="space-y-2">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Email / Phone *</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-300 flex items-start space-x-2">
                <i className="fa-solid fa-circle-check text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-white font-medium">Verified Information Reward:</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-normal">For verified reports, the user that submits first is paid ₦500.</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <NigeriaLocationSelectors state={state} lga={lga} onStateChange={setState} onLgaChange={setLga} />
            <div>
              <label className="block text-slate-300 font-medium mb-1">Town / Specific Area *</label>
              <input
                type="text"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">What really happened? *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Upload Incident Image (Optional)</label>
              <input type="file" id="report-image-input" accept="image/*" onChange={handleImageChange} className="hidden" />
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => document.getElementById("report-image-input")?.click()}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs px-3.5 py-2 rounded-xl border border-slate-800 flex items-center space-x-2 transition"
                >
                  <i className="fa-solid fa-cloud-arrow-up text-slate-400" />
                  <span>Choose Image</span>
                </button>
                <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {imageFile ? imageFile.name : "No image chosen"}
                </span>
                {imageFile && (
                  <button type="button" onClick={clearImage} className="text-xs text-red-400 hover:text-red-300">
                    <i className="fa-solid fa-trash-can" />
                  </button>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2.5">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-40 object-cover rounded-xl border border-slate-800" />
                  <label className="inline-flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={isSensitive}
                      onChange={(e) => setIsSensitive(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-emerald-500"
                    />
                    <i className="fa-solid fa-eye-slash text-slate-400 text-xs" />
                    <span>Cover as sensitive / graphic content</span>
                  </label>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button type="button" onClick={handleClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 text-xs">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-emerald-950/50 text-xs disabled:opacity-60"
              >
                <i className="fa-solid fa-paper-plane" />
                <span>{loading ? "Submitting..." : "Submit Report"}</span>
              </button>
            </div>
          </form>
        </>
      ) : (
        /* Success state */
        <div className="py-4 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center animate-[scale-check_0.4s_ease-in-out]">
              <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 52 52" fill="none">
                <circle cx="26" cy="26" r="23" stroke="currentColor" strokeWidth="2.5" className="opacity-30" />
                <path
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 27l8 8 16-16"
                  className="animate-[stroke-check_0.45s_cubic-bezier(0.65,0,0.45,1)_0.15s_forwards]"
                  style={{ strokeDasharray: 48, strokeDashoffset: 48 }}
                />
              </svg>
            </div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Report Submitted Successfully</h3>
            <p className="text-xs text-emerald-400 font-medium">Awaiting Admin & OSINT Desk Verification</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-left text-xs text-slate-300 space-y-2">
            <div className="flex items-start space-x-2">
              <i className="fa-solid fa-clock-rotate-left text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed">Your submission is queued and under review by our OSINT verification units.</p>
            </div>
            <div className="flex items-start space-x-2 border-t border-slate-800/80 pt-2">
              <i className="fa-solid fa-money-bill-transfer text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                If verified and you were the <strong className="text-white">first to submit</strong>, our dispatch team will contact you for your <strong className="text-emerald-400">₦500 reward</strong>.
              </p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition">
            Close & Return to Feed
          </button>
        </div>
      )}
    </Modal>
  );
}
