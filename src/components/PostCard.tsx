"use client";

import { useState } from "react";
import type { Post } from "@/types";
import type { ToastType } from "@/hooks/useToast";

interface Props {
  post: Post;
  onConfirmToggle: (id: string) => void;
  showToast: (msg: string, type?: ToastType) => void;
}

export function PostCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800" />
          <div className="space-y-1.5">
            <div className="h-2.5 w-24 bg-slate-800 rounded-full" />
            <div className="h-2 w-16 bg-slate-800/60 rounded-full" />
          </div>
        </div>
        <div className="h-5 w-14 bg-slate-800 rounded-lg" />
      </div>
      {/* Title */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-800 rounded-full" />
        <div className="h-3 w-4/5 bg-slate-800 rounded-full" />
      </div>
      {/* Body */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-slate-800/70 rounded-full" />
        <div className="h-2.5 w-full bg-slate-800/70 rounded-full" />
        <div className="h-2.5 w-3/4 bg-slate-800/70 rounded-full" />
      </div>
      {/* Image placeholder — shown ~50% of the time visually */}
      <div className="h-40 w-full bg-slate-800/50 rounded-xl" />
      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-1.5">
          <div className="h-2 w-20 bg-slate-800/60 rounded-full" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-7 w-20 bg-slate-800 rounded-xl" />
          <div className="h-7 w-7 bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PostCard({ post, onConfirmToggle, showToast }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}#${post.id}`;
    const data = {
      title: `${post.authorName}: ${post.title}`,
      text: `[OSINT.NG Alert] ${post.location} - ${post.body}`,
      url,
    };
    if (navigator.share && navigator.canShare?.(data)) {
      await navigator.share(data).catch(() => {});
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast("Incident alert link copied to clipboard.", "info");
    }
  };

  const badgeIsSOS = post.badge === "Emergency SOS";

  return (
    <>
      <article
        id={post.id}
        className={`bg-slate-900 border rounded-2xl p-4 space-y-3 transition shadow-lg ${
          badgeIsSOS ? "border-red-500/60 animate-[red-glow_2.5s_infinite_ease-in-out]" : "border-slate-800 hover:border-slate-700"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt={post.authorName} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
            <div>
              <span className="font-bold text-xs text-slate-100">{post.authorName}</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <i className="fa-solid fa-location-dot text-emerald-400 text-[10px]" />
                <span className="text-slate-300 font-medium text-[11px] truncate max-w-[200px] sm:max-w-xs" title={post.location}>
                  {post.lga}
                </span>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">• {timeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>
          {badgeIsSOS && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-600 text-white border border-red-400 animate-pulse">
              ACTIVE SOS
            </span>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5 pl-1">
          <h3 className="font-bold text-sm text-slate-100 leading-snug">{post.title}</h3>
          {(() => {
            const LIMIT = 120;
            const isLong = post.body.length > LIMIT;
            const displayText = isLong && !expanded ? post.body.slice(0, LIMIT).trimEnd() + "..." : post.body;
            return (
              <p className="text-xs text-slate-300 leading-relaxed">
                {displayText}
                {post.sourceUrl && !isLong && (
                  <>
                    {" "}
                    <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 hover:underline transition">
                      <span className="text-[11px]">— {post.badge}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
                    </a>
                  </>
                )}
                {!post.sourceUrl && !isLong && (
                  <span className="text-[11px] text-slate-500 ml-1">— {post.badge}</span>
                )}
                {isLong && !expanded && (
                  <button onClick={() => setExpanded(true)} className="text-emerald-400 hover:text-emerald-300 transition ml-1 text-[11px] font-medium">
                    Read more
                  </button>
                )}
                {isLong && expanded && post.sourceUrl && (
                  <>
                    {" "}
                    <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 hover:underline transition">
                      <span className="text-[11px]">— {post.badge}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
                    </a>
                  </>
                )}
                {isLong && expanded && !post.sourceUrl && (
                  <span className="text-[11px] text-slate-500 ml-1">— {post.badge}</span>
                )}
              </p>
            );
          })()}

          {/* Confirmation nudge */}
          {!post.isSOS && (
            <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 mt-1">
              <i className="fa-regular fa-circle-check text-emerald-500 text-xs shrink-0" />
              <p className="text-[11px] text-slate-400">
                Did you witness this incident? Please confirm it below.
              </p>
            </div>
          )}

          {/* Media */}
          {post.mediaUrl && (
            <div className="pt-2">
              <div className="relative w-full max-h-72 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                <img
                  src={post.mediaUrl}
                  alt="Incident Media"
                  className={`w-full max-h-72 object-cover transition-all duration-300 ${
                    post.isSensitive && !revealed
                      ? "filter blur-2xl scale-110 brightness-[0.4]"
                      : ""
                  }`}
                />
                {post.isSensitive && !revealed && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-950/50 backdrop-blur-md">
                    <div className="w-12 h-12 rounded-full bg-slate-900/95 border border-slate-700/80 flex items-center justify-center text-slate-200 mb-2">
                      <i className="fa-solid fa-eye-slash text-base" />
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1">Sensitive Content</h4>
                    <p className="text-[11px] text-slate-300 max-w-xs mb-3 leading-snug">
                      This photo may contain graphic or disturbing incident imagery.
                    </p>
                    <button
                      onClick={() => setRevealed(true)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 text-white font-semibold text-xs transition"
                    >
                      <i className="fa-solid fa-eye text-xs" />
                      <span>See Photo</span>
                    </button>
                  </div>
                )}
                {post.isSensitive && revealed && (
                  <button
                    onClick={() => setRevealed(false)}
                    className="absolute top-2.5 right-2.5 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-slate-700 text-slate-200 text-[11px] font-medium backdrop-blur-md transition"
                  >
                    <i className="fa-solid fa-eye-slash text-[11px] text-slate-400" />
                    <span>Hide</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-xs text-slate-400">
          <button
            onClick={() => onConfirmToggle(post.id)}
            className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all duration-150 select-none ${
              post.isConfirmed
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold"
                : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-slate-800/50"
            }`}
          >
            <i className={`${post.isConfirmed ? "fa-solid fa-circle-check text-emerald-400" : "fa-regular fa-circle-check text-slate-400"} text-xs`} />
            <span className="text-[11px] font-semibold">{post.isConfirmed ? "Confirmed" : "Confirm this report"}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${post.isConfirmed ? "bg-emerald-500/25 text-emerald-200 font-bold" : "bg-slate-800 text-slate-400"}`}>
              {post.confirmations} Confirmations
            </span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-slate-100 transition px-2.5 py-1.5 rounded-lg hover:bg-slate-800/50"
          >
            <i className="fa-solid fa-share-nodes text-xs" />
            <span className="font-medium text-[11px]">Share</span>
          </button>
        </div>
      </article>

    </>
  );
}
