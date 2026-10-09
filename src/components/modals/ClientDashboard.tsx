"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import type { User } from "@/types";
import type { ToastType } from "@/hooks/useToast";

interface UserReport {
  id: string;
  refCode: string | null;
  title: string;
  status: string;
  bountyPaid: boolean;
  bountyEligible: boolean;
  bankAccount: string | null;
  bankName: string | null;
  createdAt: string;
}

interface Props {
  open: boolean;
  user: User;
  onClose: () => void;
  onLogout: () => void;
  showToast: (msg: string, type?: ToastType) => void;
}

type Tab = "account" | "submissions" | "claim";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-NG", { dateStyle: "medium" });
}

export default function ClientDashboard({ open, user, onClose, onLogout, showToast }: Props) {
  const [tab, setTab] = useState<Tab>("account");
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Claim state
  const [claimCode, setClaimCode] = useState("");
  const [claimBank, setClaimBank] = useState("");
  const [claimAccount, setClaimAccount] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimResult, setClaimResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoadingReports(true);
    fetch("/api/user/reports")
      .then((r) => r.json())
      .then((data) => setReports(data.reports ?? []))
      .catch(() => showToast("Failed to load your reports.", "error"))
      .finally(() => setLoadingReports(false));
  }, [open]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimLoading(true);
    setClaimResult(null);
    try {
      const res = await fetch("/api/user/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimCode: claimCode.trim(), bankAccount: claimAccount.trim(), bankName: claimBank.trim() }),
      });
      const data = await res.json();
      setClaimResult({ ok: res.ok, message: data.message ?? data.error ?? "Something went wrong." });
      if (res.ok) { setClaimCode(""); setClaimBank(""); setClaimAccount(""); }
    } catch {
      setClaimResult({ ok: false, message: "Network error. Please try again." });
    } finally {
      setClaimLoading(false);
    }
  };

  const handleLogout = async () => {    onLogout();
    onClose();
    showToast("You have been signed out.", "info");
  };

  const tabBtn = (t: Tab) =>
    tab === t
      ? "flex-1 py-2 text-xs font-semibold text-emerald-400 border-b-2 border-emerald-500 transition"
      : "flex-1 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition";

  const paidCount = reports.filter((r) => r.bountyPaid).length;
  const approvedCount = reports.filter((r) => r.status === "Approved").length;

  return (
    <Modal open={open} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-user-check text-emerald-400 text-sm" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{user.fullName}</p>
            <p className="text-[10px] text-emerald-400 font-mono">{user.ein}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-800/60 text-slate-400 hover:text-red-400 text-xs transition"
        >
          <i className="fa-solid fa-right-from-bracket text-[10px]" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 -mx-1">
        <button onClick={() => setTab("account")} className={tabBtn("account")}>
          <i className="fa-solid fa-id-card mr-1.5 text-[10px]" />Account
        </button>
        <button onClick={() => setTab("submissions")} className={tabBtn("submissions")}>
          <i className="fa-solid fa-list mr-1.5 text-[10px]" />My Reports
          {reports.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              {reports.length}
            </span>
          )}
        </button>
        <button onClick={() => setTab("claim")} className={tabBtn("claim")}>
          <i className="fa-solid fa-gift mr-1.5 text-[10px]" />Claim
        </button>
      </div>

      {/* Account Tab */}
      {tab === "account" && (
        <div className="space-y-3">
          <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800 text-xs">
            {[
              { icon: "fa-id-badge", label: "EIN", val: user.ein, color: "text-emerald-400" },
              { icon: "fa-user", label: "Full Name", val: user.fullName, color: "text-slate-200" },
              { icon: "fa-envelope", label: "Email", val: user.email, color: "text-slate-200" },
              { icon: "fa-phone", label: "Phone", val: user.phone, color: "text-slate-200" },
              { icon: "fa-calendar", label: "Joined", val: timeAgo(user.createdAt), color: "text-slate-400" },
            ].map(({ icon, label, val, color }) => (
              <div key={label} className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center space-x-2 text-slate-400">
                  <i className={`fa-solid ${icon} text-[10px] w-3`} />
                  <span>{label}</span>
                </div>
                <span className={`font-mono font-medium ${color}`}>{val}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono text-emerald-400">{reports.length}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Submitted</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono text-sky-400">{approvedCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Approved</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono text-purple-400">₦{(paidCount * 500).toLocaleString()}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Earned</div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Tab */}
      {tab === "submissions" && (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {loadingReports ? (
            <div className="text-center py-8">
              <i className="fa-solid fa-circle-notch fa-spin text-emerald-400 text-xl" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <i className="fa-solid fa-inbox text-2xl mb-2 block" />
              <p className="text-xs">You haven't submitted any reports yet.</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    {report.refCode && (
                      <span className="inline-block font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        {report.refCode}
                      </span>
                    )}
                    <p className="text-xs font-semibold text-slate-100 leading-snug">{report.title}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      report.status === "Approved" ? "bg-emerald-600 text-white"
                      : report.status === "Rejected" ? "bg-red-900/60 text-red-400"
                      : "bg-amber-900/40 text-amber-400"
                    }`}>
                      {report.status}
                    </span>
                    {report.status === "Approved" && report.bountyEligible && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        report.bountyPaid ? "bg-purple-600 text-white" : "bg-amber-900/40 text-amber-400"
                      }`}>
                        {report.bountyPaid ? "₦500 Paid" : "Payout Pending"}
                      </span>
                    )}
                  </div>
                </div>
                {report.status === "Approved" && report.bountyEligible && !report.bountyPaid && (
                  <div className="text-[10px] text-slate-500 flex items-center space-x-1.5">
                    <i className="fa-solid fa-circle-info text-[9px] text-amber-500" />
                    <span>
                      {report.bankAccount
                        ? `${report.bankName ?? "Bank"} • ${report.bankAccount} — awaiting transfer`
                        : "No bank details on file — contact support to receive payout"}
                    </span>
                  </div>
                )}
                <div className="text-[10px] text-slate-600">{timeAgo(report.createdAt)}</div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Claim Reward Tab */}
      {tab === "claim" && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-amber-500/20 rounded-xl p-3 text-[11px] text-slate-300 flex items-start space-x-2">
            <i className="fa-solid fa-circle-info text-amber-400 mt-0.5 shrink-0" />
            <p className="leading-relaxed">Paste the claim code from your submitted report. If it was approved and selected for a reward, add your bank details below to receive your ₦500 payout.</p>
          </div>

          {claimResult && (
            <div className={`rounded-xl p-3 text-xs font-medium flex items-start space-x-2 ${
              claimResult.ok
                ? "bg-emerald-950/50 border border-emerald-800/60 text-emerald-400"
                : "bg-red-950/50 border border-red-800/60 text-red-400"
            }`}>
              <i className={`fa-solid ${claimResult.ok ? "fa-circle-check" : "fa-circle-exclamation"} mt-0.5 shrink-0 text-[10px]`} />
              <span>{claimResult.message}</span>
            </div>
          )}

          <form onSubmit={handleClaim} className="space-y-3 text-xs">
            {/* Claim code */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Claim Code *</label>
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                placeholder="e.g. RPT-2026-0001"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono font-bold tracking-widest placeholder:text-slate-600 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Bank details */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Bank Name *</label>
                <input
                  type="text"
                  value={claimBank}
                  onChange={(e) => setClaimBank(e.target.value)}
                  placeholder="e.g. Access Bank"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Account Number *</label>
                <input
                  type="text"
                  value={claimAccount}
                  onChange={(e) => setClaimAccount(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="0000000000"
                  maxLength={10}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono placeholder:text-slate-600 placeholder:font-sans focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={claimLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-2"
            >
              <i className="fa-solid fa-money-bill-wave text-[10px]" />
              <span>{claimLoading ? "Processing..." : "Submit Claim"}</span>
            </button>
          </form>
        </div>
      )}
    </Modal>
  );
}
