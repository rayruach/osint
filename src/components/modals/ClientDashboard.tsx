"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import type { User, Post } from "@/types";
import type { ToastType } from "@/hooks/useToast";

interface Props {
  open: boolean;
  user: User;
  onClose: () => void;
  onLogout: () => void;
  showToast: (msg: string, type?: ToastType) => void;
}

type Tab = "account" | "submissions";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingPosts(true);
    fetch("/api/user/posts")
      .then((r) => r.json())
      .then((data) => setPosts(data.posts ?? []))
      .catch(() => showToast("Failed to load your submissions.", "error"))
      .finally(() => setLoadingPosts(false));
  }, [open]);

  const handleLogout = async () => {
    onLogout();
    onClose();
    showToast("You have been signed out.", "info");
  };

  const tabBtn = (t: Tab) =>
    tab === t
      ? "flex-1 py-2 text-xs font-semibold text-emerald-400 border-b-2 border-emerald-500 transition"
      : "flex-1 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent transition";

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
          {posts.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              {posts.length}
            </span>
          )}
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
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono text-emerald-400">{posts.length}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Reports Submitted</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono text-purple-400">
                ₦{posts.filter((p) => p.status === "Active").length * 500 > 0
                  ? (posts.filter((p) => p.status === "Active").length * 500).toLocaleString()
                  : "0"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Estimated Bounty</div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Tab */}
      {tab === "submissions" && (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {loadingPosts ? (
            <div className="text-center py-8">
              <i className="fa-solid fa-circle-notch fa-spin text-emerald-400 text-xl" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <i className="fa-solid fa-inbox text-2xl mb-2 block" />
              <p className="text-xs">You haven't submitted any reports yet.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-100 leading-snug">{post.title}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    post.isSOS
                      ? "bg-red-600 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {post.isSOS ? "SOS" : post.badge}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <i className="fa-solid fa-location-dot text-red-500 text-[9px]" />
                    <span>{post.state}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1">
                      <i className="fa-solid fa-check-double text-emerald-500 text-[9px]" />
                      <span>{post.confirmations} confirms</span>
                    </span>
                    <span>{timeAgo(post.createdAt)}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Modal>
  );
}
