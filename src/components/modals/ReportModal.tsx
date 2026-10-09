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
  const [sourceLink, setSourceLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSensitive, setIsSensitive] = useState(false);
  const [refCode, setRefCode] = useState("");

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
    setDescription(""); setSourceLink(""); setRefCode(""); clearImage();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentType) { showToast("Please select an incident type.", "error"); return; }
    if (!contact) { showToast("Please enter your email or phone.", "error"); return; }
    if (!state) { showToast("Please select a state.", "error"); return; }
    if (!lga) { showToast("Please select an LGA.", "error"); return; }
    if (!town) { showToast("Please enter the town or area.", "error"); return; }
    if (!description) { showToast("Please describe what happened.", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentType, contact, state, lga, town, description, sourceUrl: sourceLink || null, mediaUrl: imagePreview ?? null, isSensitive }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error ?? "Submission failed.", "error");
        return;
      }
      const data = await res.json();
      setRefCode(data.refCode ?? "");
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
              <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500">
                <option value="" disabled>Select incident type...</option>
                {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Email / Phone *</label>
                <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-300 flex items-start space-x-2">
                <i className="fa-solid fa-money-bill-wave text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-white font-medium">Earn up to ₦50,000</span>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-normal">If your report is confirmed true and has a photo or video, you can get paid. Save the code you get after submitting and use it in your dashboard to claim your reward.</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <NigeriaLocationSelectors state={state} lga={lga} onStateChange={setState} onLgaChange={setLga} />
            <div>
              <label className="block text-slate-300 font-medium mb-1">Town / Specific Area *</label>
              <input type="text" value={town} onChange={(e) => setTown(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">What really happened? *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 resize-none" />
            </div>

            {/* Source Link */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Add a link <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <i className="fa-solid fa-link absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                <input
                  type="url"
                  value={sourceLink}
                  onChange={(e) => setSourceLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 p-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">This link will appear as a clickable source tag on your report in the feed.</p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Upload Incident Image (Optional)</label>
              <input type="file" id="report-image-input" accept="image/*" onChange={handleImageChange} className="hidden" />
              <div className="flex items-center space-x-3">
                <button type="button" onClick={() => document.getElementById("report-image-input")?.click()} className="bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs px-3.5 py-2 rounded-xl border border-slate-800 flex items-center space-x-2 transition">
                  <i className="fa-solid fa-cloud-arrow-up text-slate-400" />
                  <span>Choose Image</span>
                </button>
                <span className="text-[11px] text-slate-400 truncate max-w-[200px]">{imageFile ? imageFile.name : "No image chosen"}</span>
                {imageFile && <button type="button" onClick={clearImage} className="text-xs text-red-400 hover:text-red-300"><i className="fa-solid fa-trash-can" /></button>}
              </div>
              {imagePreview && (
                <div className="mt-2.5">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-40 object-cover rounded-xl border border-slate-800" />
                  <label className="inline-flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer mt-2">
                    <input type="checkbox" checked={isSensitive} onChange={(e) => setIsSensitive(e.target.checked)} className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-emerald-500" />
                    <i className="fa-solid fa-eye-slash text-slate-400 text-xs" />
                    <span>Cover as sensitive / graphic content</span>
                  </label>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button type="button" onClick={handleClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 text-xs">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl flex items-center space-x-1.5 transition shadow-lg shadow-emerald-950/50 text-xs disabled:opacity-60">
                <i className="fa-solid fa-paper-plane" />
                <span>{loading ? "Submitting..." : "Submit Report"}</span>
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="py-4 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 52 52" fill="none">
                <circle cx="26" cy="26" r="23" stroke="currentColor" strokeWidth="2.5" className="opacity-30" />
                <path stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" d="M14 27l8 8 16-16" className="check-path" />
              </svg>
            </div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Report Submitted</h3>
            <p className="text-xs text-emerald-400 font-medium">Awaiting OSINT Desk Verification</p>
          </div>

          {refCode && (
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
              <p className="text-[11px] text-slate-400">Your claim code — save this to redeem your reward if selected:</p>
              <div className="flex items-center justify-center space-x-2">
                <span className="font-mono text-xl font-black text-white tracking-widest">{refCode}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(refCode); showToast("Claim code copied.", "success"); }}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                >
                  <i className="fa-regular fa-copy text-xs" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">Log in to your account, go to dashboard, and paste this code under "Claim Reward" to add your bank details if your report is approved and selected for a bounty.</p>            </div>
          )}

          <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-3.5 text-left space-y-1.5">
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-triangle-exclamation text-amber-400 text-xs" />
              <span className="text-xs font-bold text-amber-300">Create an account to claim your reward</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pl-5">
              You will need an OSINT-NG account to submit your bank details and receive payment. Register or log in, then go to your dashboard and tap <strong className="text-white">Claim</strong> to redeem.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-left text-xs text-slate-300 space-y-2">
            <div className="flex items-start space-x-2">
              <i className="fa-solid fa-clock-rotate-left text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed">Your submission is under review by our verification team.</p>
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
