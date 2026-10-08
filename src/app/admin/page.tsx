"use client";

import { useState, useEffect, useCallback } from "react";
import ToastContainer from "@/components/ToastContainer";
import ActionToast from "@/components/ActionToast";
import Modal from "@/components/Modal";
import { useToast } from "@/hooks/useToast";
import { nigeriaStates, getLGAs } from "@/lib/nigeria-locations";
import type { AdminReport, Analytics } from "@/types";

type View = "analytics" | "reports";
type DeleteTarget = { id: string; title: string } | null;

/* ─── helpers ─────────────────────────────────────────── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Rejected: "bg-red-500/15 text-red-400 border-red-500/30",
    Pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  };
  const icon: Record<string, string> = { Approved: "fa-check", Rejected: "fa-xmark", Pending: "fa-clock" };
  const cls = map[status] ?? map.Pending;
  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${cls}`}>
      <i className={`fa-solid ${icon[status] ?? "fa-clock"} text-[9px]`} />
      <span>{status}</span>
    </span>
  );
}

/* ─── BarChart ────────────────────────────────────────── */
function BarChart({ items, color }: { items: { name: string; count: number; pct: number }[]; color: string }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-medium truncate max-w-[240px]">{item.name}</span>
            <span className="font-mono text-slate-400">{item.count} ({item.pct}%)</span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${item.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Edit Modal ──────────────────────────────────────── */
const CATEGORIES = [
  "Violent Crime / Armed Robbery / Kidnapping","Missing Person","Wanted Person / Fugitive Alert",
  "Road Accident / Highway Crash","Travel & Highway Security Advisory","Flooding / Natural Hazard",
  "Major Traffic Gridlock / Road Blockage","Fire / Industrial Hazard","Public Health Emergency / Disease Outbreak",
  "Civil Unrest / Public Protest","Infrastructure / Power / Pipeline Failure","Suspicious Activity / Security Advisory",
];

function EditModal({ report, onClose, onSaved, showToast }: {
  report: AdminReport; onClose: () => void;
  onSaved: () => void; showToast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  const [title, setTitle] = useState(report.title);
  const [category, setCategory] = useState(report.category);
  const [source, setSource] = useState(report.source);
  const [contact, setContact] = useState(report.contact);
  const [location, setLocation] = useState(report.location);
  const [status, setStatus] = useState(report.status);
  const [body, setBody] = useState(report.body);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, source, contact, location, status, body }),
      });
      if (!res.ok) { showToast("Failed to save changes.", "error"); return; }
      showToast(`Report ${report.id} updated.`, "success");
      onSaved(); onClose();
    } finally { setLoading(false); }
  };

  return (
    <Modal open onClose={onClose}>
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <i className="fa-solid fa-pen-to-square text-amber-400 text-sm" />
        <h3 className="text-sm font-bold text-white">Edit Incident Report</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">Headline *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500" />
        </div>
        <div>
          <label className="block text-slate-300 font-medium mb-1">Category *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Sender Contact *</label>
            <input value={contact} onChange={(e) => setContact(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Location *</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Status *</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as AdminReport["status"])} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500">
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Source *</label>
            <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500">
              <option value="Public">Public</option>
              <option value="Authorities">Authorities</option>
              <option value="News">News</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-slate-300 font-medium mb-1">Report Details *</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 resize-none" />
        </div>
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 disabled:opacity-60">
            <i className="fa-solid fa-floppy-disk" /><span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── View Modal ──────────────────────────────────────── */
function ViewModal({ report, onClose, onApprove, onReject }: {
  report: AdminReport; onClose: () => void;
  onApprove: (incidentStatus: string) => void; onReject: () => void;
}) {
  const [mediaRevealed, setMediaRevealed] = useState(false);
  const [incidentStatus, setIncidentStatus] = useState("Active");

  return (
    <Modal open onClose={onClose}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 pr-8">
        <div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{report.id}</span>
          <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">{report.title}</h3>
        </div>
        <StatusBadge status={report.status} />
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Citizen Submitter:</span>
          <span className="font-mono text-emerald-400 font-bold">{report.contact}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-900 pt-1.5">
          <span className="text-slate-400">Submitted:</span>
          <span className="font-mono text-slate-300">{timeAgo(report.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-900 pt-1.5">
          <span className="text-slate-400">Bounty:</span>
          <span className={`font-mono font-semibold ${report.status === "Approved" ? "text-emerald-400" : report.status === "Rejected" ? "text-red-400" : "text-amber-400"}`}>
            {report.status === "Approved" ? "Disbursed (₦500 Paid)" : report.status === "Rejected" ? "Ineligible" : "Pending (₦500 queued)"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {[["Category", report.category], ["Location", report.location], ["Source", report.source]].map(([label, val]) => (
          <div key={label} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-mono">{label}</span>
            <span className="font-semibold text-slate-200 mt-0.5 block truncate">{val}</span>
          </div>
        ))}
      </div>
      <div className="space-y-1 text-xs">
        <label className="block text-slate-400 font-medium">Full Report:</label>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 leading-relaxed max-h-40 overflow-y-auto">{report.body}</div>
      </div>
      {report.mediaUrl && (
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <label className="text-slate-400 font-medium">Media Evidence:</label>
            <button onClick={() => setMediaRevealed((v) => !v)} className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center space-x-1.5 transition px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800">
              <i className={`fa-solid ${mediaRevealed ? "fa-eye" : "fa-eye-slash"} text-[10px]`} />
              <span>{mediaRevealed ? "Hide" : "Show Graphic Imagery"}</span>
            </button>
          </div>
          <div className="relative w-full max-h-56 overflow-hidden rounded-xl border border-slate-800">
            <img src={report.mediaUrl} alt="Evidence" className={`w-full max-h-56 object-cover transition-all duration-300 ${mediaRevealed ? "" : "filter blur-xl scale-105 brightness-50"}`} />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
        <span className="text-slate-400">Citizen Confirmations:</span>
        <span className="font-mono text-emerald-400 font-bold">{report.confirmations} Confirmations</span>
      </div>

      {/* Incident status picker — only shown when report is still pending */}
      {report.status === "Pending" && (
        <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-3 space-y-2 text-xs">
          <label className="block text-slate-300 font-semibold flex items-center space-x-1.5">
            <i className="fa-solid fa-tag text-emerald-400 text-[10px]" />
            <span>Set Incident Status on Approval</span>
          </label>
          <select
            value={incidentStatus}
            onChange={(e) => setIncidentStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="Active">Active - Ongoing threat, citizens must act</option>
            <option value="Resolved">Resolved - Incident closed / no longer active</option>
          </select>
          <p className="text-[10px] text-slate-500">This status will be applied to the public post when you approve.</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button onClick={onClose} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition">Close</button>
        <div className="flex items-center space-x-2">
          <button onClick={onReject} className="px-3.5 py-2 bg-red-950 hover:bg-red-900 border border-red-800/80 text-red-300 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5">
            <i className="fa-solid fa-ban" /><span>Reject</span>
          </button>
          <button onClick={() => onApprove(incidentStatus)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5">
            <i className="fa-solid fa-check" /><span>Approve & Disburse Bounty</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Create Post Modal ───────────────────────────────── */
function CreatePostModal({ onClose, onCreated, showToast }: {
  onClose: () => void;
  onCreated: () => void;
  showToast: (m: string, t?: "success" | "error" | "info") => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("Authorities");
  const [incidentStatus, setIncidentStatus] = useState("Active");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [town, setTown] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isSensitive, setIsSensitive] = useState(false);
  const [loading, setLoading] = useState(false);

  const lgas = state ? getLGAs(state) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !state || !lga || !town) {
      showToast("Please fill all required fields.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, badge, incidentStatus, state, lga, town, sourceUrl, mediaUrl, isSensitive }),
      });
      if (!res.ok) { showToast("Failed to publish post.", "error"); return; }
      showToast("Post published to the live feed.", "success");
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose}>
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <i className="fa-solid fa-broadcast-tower text-emerald-400 text-sm" />
        <h3 className="text-sm font-bold text-white">Publish New Intelligence Post</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        {/* Title */}
        <div>
          <label className="block text-slate-300 font-medium mb-1">Headline *</label>
          <input
            value={title} onChange={(e) => setTitle(e.target.value)} required
            placeholder="e.g. Armed Robbery Alert along Nnewi-Onitsha Expressway"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Badge + Status */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Source Badge *</label>
            <select value={badge} onChange={(e) => setBadge(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500">
              <option value="Authorities">Authorities</option>
              <option value="News">News</option>
              <option value="Public">Public</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Incident Status *</label>
            <select value={incidentStatus} onChange={(e) => setIncidentStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500">
              <option value="Active">🔴 Active</option>
              <option value="Resolved">⚫ Resolved</option>
            </select>
          </div>
        </div>

        {/* State + LGA */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-300 font-medium mb-1">State *</label>
            <select value={state} onChange={(e) => { setState(e.target.value); setLga(""); }} required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500">
              <option value="">Select state...</option>
              {nigeriaStates.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">LGA *</label>
            <select value={lga} onChange={(e) => setLga(e.target.value)} required disabled={!state} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-50">
              <option value="">Select LGA...</option>
              {lgas.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Town */}
        <div>
          <label className="block text-slate-300 font-medium mb-1">Town / Area *</label>
          <input
            value={town} onChange={(e) => setTown(e.target.value)} required
            placeholder="e.g. Nkwo Nnewi Triangle"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-slate-300 font-medium mb-1">Intel Report Body *</label>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
            placeholder="Describe the incident in full detail..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        {/* Source URL + Media URL */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Source URL</label>
            <input
              value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Media URL</label>
            <input
              value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Sensitive toggle */}
        <label className="flex items-center space-x-2.5 cursor-pointer select-none">
          <div
            onClick={() => setIsSensitive((v) => !v)}
            className={`w-9 h-5 rounded-full border flex items-center transition-colors duration-200 ${isSensitive ? "bg-red-600 border-red-500" : "bg-slate-800 border-slate-700"}`}
          >
            <span className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 ml-0.5 ${isSensitive ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-slate-300">Mark as Sensitive / Graphic Content</span>
        </label>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 disabled:opacity-60">
            <i className="fa-solid fa-broadcast-tower" />
            <span>{loading ? "Publishing..." : "Publish to Live Feed"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Main Admin Page ─────────────────────────────────── */
export default function AdminPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [view, setView] = useState<View>("analytics");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<AdminReport[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [clock, setClock] = useState("");
  const [viewReport, setViewReport] = useState<AdminReport | null>(null);
  const [editReport, setEditReport] = useState<AdminReport | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WAT");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    const res = await fetch("/api/admin/analytics");
    const data = await res.json();
    setAnalytics(data);
  }, []);

  const fetchReports = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    const res = await fetch(`/api/admin/reports?${params}`);
    const data = await res.json();
    const list: AdminReport[] = data.reports ?? [];
    setReports(list);
    setFilteredReports(list);
  }, [search, statusFilter]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);
  useEffect(() => { if (view === "reports") fetchReports(); }, [view, fetchReports]);

  const refresh = () => { fetchAnalytics(); if (view === "reports") fetchReports(); showToast("Admin data refreshed.", "info"); };

  const handleApprove = async (id: string, incidentStatus = "Verified") => {
    await fetch(`/api/admin/reports/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Approved", incidentStatus }) });
    showToast(`Report approved. Incident marked as "${incidentStatus}". Bounty queued.`, "success");
    fetchReports(); fetchAnalytics();
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/admin/reports/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Rejected" }) });
    showToast("Report marked as rejected.", "info");
    fetchReports(); fetchAnalytics();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/reports/${id}`, { method: "DELETE" });
    showToast("Report permanently removed.", "info");
    setDeleteTarget(null);
    fetchReports(); fetchAnalytics();
  };

  const exportCSV = () => {
    const headers = ["S/N","ID","Contact","Date","Category","Location","Confirmations","Status","Title","Body"];
    const rows = reports.map((r, i) => [i + 1, r.id, `"${r.contact}"`, `"${timeAgo(r.createdAt)}"`, `"${r.category}"`, `"${r.location}"`, r.confirmations, r.status, `"${r.title.replace(/"/g,'""')}"`, `"${r.body.replace(/"/g,'""')}"`]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const a = document.createElement("a"); a.href = encodeURI(csv); a.download = `OSINT_NG_Reports_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    showToast("Reports exported to CSV.", "success");
  };

  const navBtn = (active: boolean) =>
    active
      ? "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group bg-emerald-600/15 text-emerald-400 border border-emerald-500/30"
      : "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent transition group";

  const pendingCount = analytics?.pending ?? 0;

  return (
    <div className="h-screen flex overflow-hidden font-sans antialiased bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <img src="/logo.png" alt="OSINT.NG" className="w-8 h-8 rounded-xl object-cover border border-emerald-500/30" />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-white font-mono">OSINT<span className="text-emerald-400">.NG</span></span>
                <span className="text-[9px] font-mono px-1.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">ADMIN</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Incident Desk & Intel</p>
            </div>
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
              <span className="text-slate-300 font-medium">Desk Feed Active</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{clock}</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1.5">
          <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono">Operations</div>
          <button onClick={() => setView("analytics")} className={navBtn(view === "analytics")}>
            <div className="flex items-center space-x-3"><i className="fa-solid fa-chart-pie text-sm" /><span>Summary & Analytics</span></div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Live</span>
          </button>
          <button onClick={() => setView("reports")} className={navBtn(view === "reports")}>
            <div className="flex items-center space-x-3"><i className="fa-solid fa-list-check text-sm" /><span>Manage Reports</span></div>
            {pendingCount > 0 && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">{pendingCount}</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-mono text-xs font-bold">OS</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200">Duty Officer Alpha</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">desk_alpha@osint.ng</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-bold text-white">{view === "analytics" ? "Summary & Analytics" : "Manage Reports"}</h1>
            <p className="text-[11px] text-slate-400">{view === "analytics" ? "Real-time intelligence overview & reward disbursement metrics" : "Audit, approve payouts, and edit incoming field alerts"}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={refresh} className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition">
              <i className="fa-solid fa-arrows-rotate text-xs" /><span>Refresh</span>
            </button>
            <button onClick={exportCSV} className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition">
              <i className="fa-solid fa-file-arrow-down text-xs" /><span>Export CSV</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Analytics View ── */}
          {view === "analytics" && analytics && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: "Total Inflow", val: analytics.total, color: "text-white", icon: "fa-inbox", bg: "bg-blue-500/10 border-blue-500/20 text-blue-400", trend: "+18% past 24h" },
                  { label: "Pending Review", val: analytics.pending, color: "text-amber-300", icon: "fa-clock-rotate-left", bg: "bg-amber-500/10 border-amber-500/20 text-amber-400", trend: "Awaiting review" },
                  { label: "Approved Reports", val: analytics.approved, color: "text-emerald-400", icon: "fa-circle-check", bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", trend: `${analytics.total ? Math.round((analytics.approved / analytics.total) * 100) : 0}% verification rate` },
                  { label: "Bounties Paid", val: `₦${analytics.bountiesTotal.toLocaleString()}`, color: "text-purple-300", icon: "fa-money-bill-wave", bg: "bg-purple-500/10 border-purple-500/20 text-purple-400", trend: `${analytics.approved} reporters rewarded` },
                  { label: "Total Confirms", val: analytics.totalConfirms, color: "text-teal-300", icon: "fa-circle-check", bg: "bg-teal-500/10 border-teal-500/20 text-teal-400", trend: "Citizen corroborations" },
                ].map(({ label, val, color, icon, bg, trend }) => (
                  <div key={label} className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">{label}</span>
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs ${bg}`}><i className={`fa-solid ${icon}`} /></div>
                    </div>
                    <div className="mt-3">
                      <div className={`text-2xl font-bold font-mono ${color}`}>{val}</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{trend}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Incident Categories</h3>
                    <p className="text-[11px] text-slate-400">Distribution across verified and incoming alerts</p>
                  </div>
                  <BarChart items={analytics.categories} color="bg-gradient-to-r from-red-600 to-rose-500" />
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Top Alert Zones</h3>
                    <p className="text-[11px] text-slate-400">State-level incident inflow concentration</p>
                  </div>
                  <BarChart items={analytics.states} color="bg-gradient-to-r from-emerald-500 to-teal-400" />
                </div>
              </div>

              {/* Operational metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: "fa-stopwatch text-amber-400", label: "Avg Verification Time", val: "3.8 Minutes", desc: "From submit to OSINT verification checkmark." },
                  { icon: "fa-users text-blue-400", label: "Field Corroboration Multiplier", val: "4.6 Confirms / Alert", desc: "Avg citizen confirmations per legitimate report." },
                  { icon: "fa-hand-holding-dollar text-emerald-400", label: "First-Submitter Payout Success", val: "96.2% Disbursed", desc: "Verified reports with accurate contact received ₦500." },
                ].map(({ icon, label, val, desc }) => (
                  <div key={label} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-slate-400 text-xs"><i className={`fa-solid ${icon}`} /><span className="font-medium">{label}</span></div>
                    <div className="text-xl font-bold font-mono text-white">{val}</div>
                    <p className="text-[11px] text-slate-400 leading-normal">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Reports Table View ── */}
          {view === "reports" && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                  <input
                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID, phone, email, category, title..."
                    className="w-full bg-slate-950 text-slate-100 text-xs pl-8 pr-8 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition"
                  />
                  {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"><i className="fa-solid fa-xmark" /></button>}
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shrink-0"
                  >
                    <i className="fa-solid fa-broadcast-tower text-xs" />
                    <span>New Post</span>
                  </button>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500">
                    <option value="ALL">All Statuses</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button onClick={fetchReports} className="bg-slate-950 hover:bg-slate-800 text-slate-300 p-2 rounded-xl border border-slate-800 text-xs transition">
                    <i className="fa-solid fa-rotate-right" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 w-16">S/N</th>
                        <th className="py-3 px-4">Sender</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Incident & Category</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Confirms</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredReports.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-10 text-slate-500"><i className="fa-solid fa-folder-open text-2xl mb-2 block" />No reports found.</td></tr>
                      ) : filteredReports.map((r, i) => (
                        <tr key={r.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-300">#{i + 1}</td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-emerald-400 font-semibold flex items-center space-x-1.5"><i className="fa-solid fa-user-shield text-[10px] text-slate-500" /><span>{r.contact}</span></div>
                            <span className="text-[10px] text-slate-500 font-mono">{r.id}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">{timeAgo(r.createdAt)}</td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-slate-100 truncate" title={r.title}>{r.title}</div>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="text-[11px] text-slate-400 truncate">{r.category}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 inline-flex items-center gap-1 whitespace-nowrap"><span className="text-slate-400">Source:</span><span className="font-semibold text-emerald-400">{r.source}</span></span>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1"><i className="fa-solid fa-location-dot text-red-500 text-[10px]" /><span className="truncate max-w-[150px]">{r.location}</span></div>
                          </td>
                          <td className="py-3 px-4 font-mono"><span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">{r.confirmations}</span></td>
                          <td className="py-3 px-4 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center space-x-1">
                              <button onClick={() => setViewReport(r)} title="View" className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition"><i className="fa-solid fa-eye text-xs" /></button>
                              <button onClick={() => setEditReport(r)} title="Edit" className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-amber-950/60 border border-slate-800 text-amber-400 flex items-center justify-center transition"><i className="fa-solid fa-pen-to-square text-xs" /></button>
                              {r.status !== "Approved" ? (
                                <button onClick={() => handleApprove(r.id)} title="Approve" className="w-7 h-7 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-400 flex items-center justify-center transition"><i className="fa-solid fa-check text-xs" /></button>
                              ) : (
                                <button disabled className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800/60 text-slate-600 flex items-center justify-center cursor-not-allowed"><i className="fa-solid fa-check text-xs" /></button>
                              )}
                              <button onClick={() => setDeleteTarget({ id: r.id, title: r.title })} title="Delete" className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-red-950/60 border border-slate-800 text-red-400 flex items-center justify-center transition"><i className="fa-solid fa-trash text-xs" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div>Showing <span className="font-bold text-slate-200 font-mono">{filteredReports.length}</span> of <span className="font-bold text-slate-200 font-mono">{reports.length}</span> reports</div>
                  <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium text-[11px]"><i className="fa-solid fa-circle-check text-[10px]" /><span>₦500 bounty paid on approval</span></span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {viewReport && (
        <ViewModal
          report={viewReport}
          onClose={() => setViewReport(null)}
          onApprove={(incidentStatus) => { handleApprove(viewReport.id, incidentStatus); setViewReport(null); }}
          onReject={() => { handleReject(viewReport.id); setViewReport(null); }}
        />
      )}
      {editReport && (
        <EditModal
          report={editReport}
          onClose={() => setEditReport(null)}
          onSaved={() => { fetchReports(); fetchAnalytics(); }}
          showToast={showToast}
        />
      )}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onCreated={() => { fetchReports(); fetchAnalytics(); }}
          showToast={showToast}
        />
      )}
      {deleteTarget && (
        <ActionToast
          message={`Delete report ${deleteTarget.id}?`}
          subtitle={`Permanently remove "${deleteTarget.title.slice(0, 50)}..."?`}
          confirmText="Delete"
          confirmColor="bg-red-600 hover:bg-red-500"
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
