"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import ToastContainer from "@/components/ToastContainer";
import ReportModal from "@/components/modals/ReportModal";
import SOSModal from "@/components/modals/SOSModal";
import RegisterModal from "@/components/modals/RegisterModal";
import LoginModal from "@/components/modals/LoginModal";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/hooks/useUser";
import type { Post } from "@/types";

const STATUS_META: Record<string, { color: string; label: string }> = {
  "Active Alert":        { color: "text-red-400",    label: "ACTIVE" },
  "Verified":            { color: "text-emerald-400", label: "VERIFIED" },
  "Under Verification":  { color: "text-amber-400",   label: "UNVERIFIED" },
  "Dispatched":          { color: "text-sky-400",     label: "DISPATCHED" },
  "Emergency SOS":       { color: "text-red-500",     label: "SOS" },
};

function LiveTicker({ posts }: { posts: Post[] }) {
  const activeCount = posts.filter((p) => p.status === "Active" || p.badge === "Emergency SOS").length;

  // Build ticker items from real posts — duplicate for seamless loop
  const items = posts.length > 0 ? [...posts, ...posts] : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      <div className="flex items-stretch">

        {/* Fixed LIVE badge */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-950 border-r border-slate-800 shrink-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Live</span>
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden relative">
          {/* fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

          {posts.length === 0 ? (
            <div className="flex items-center h-full px-4 py-2.5">
              <span className="text-xs text-slate-500 italic">Fetching intelligence feed...</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-0 py-2.5 w-max"
              style={{ animation: "ticker-scroll 40s linear infinite" }}
            >
              {items.map((post, i) => {
                const meta = STATUS_META[post.badge === "Emergency SOS" ? "Emergency SOS" : post.status] ?? STATUS_META["Under Verification"];
                return (
                  <span key={`${post.id}-${i}`} className="flex items-center gap-2 px-4 shrink-0">
                    {/* status tag */}
                    <span className={`text-[10px] font-bold tracking-wider shrink-0 ${meta.color}`}>
                      {meta.label}
                    </span>
                    {/* title */}
                    <span className="text-xs text-slate-200 font-medium whitespace-nowrap">
                      {post.title}
                    </span>
                    {/* location */}
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">
                      · {post.state}
                    </span>
                    {/* separator */}
                    <span className="text-slate-700 text-xs ml-2">◆</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Alert count */}
        {activeCount > 0 && (
          <div className="flex items-center px-3 border-l border-slate-800 shrink-0 bg-slate-950">
            <span className="text-[10px] font-bold text-red-400 whitespace-nowrap">
              {activeCount} ACTIVE
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { toasts, showToast, removeToast } = useToast();
  const { user, refresh: refreshUser } = useUser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [currentGPS, setCurrentGPS] = useState("");

  const [showSearch, setShowSearch] = useState(false);
  const [showLocationCard, setShowLocationCard] = useState(false);
  const [showAdvisory, setShowAdvisory] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [modal, setModal] = useState<"report" | "sos" | "register" | "login" | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (locationFilter) params.set("state", locationFilter);
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      showToast("Failed to load posts.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, locationFilter, showToast]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") setPushEnabled(true);
  }, []);

  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 120);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleConfirmToggle = async (id: string) => {
    if (!user) { showToast("Log in to confirm a report.", "warning"); setModal("login"); return; }
    const res = await fetch(`/api/posts/${id}/confirm`, { method: "POST" });
    if (!res.ok) { showToast("Failed to update confirmation.", "error"); return; }
    const data = await res.json();
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isConfirmed: data.confirmed, confirmations: data.confirmations } : p
      )
    );
    showToast(data.confirmed ? "Thanks! Your confirmation has been added." : "Your confirmation has been removed.", data.confirmed ? "success" : "info");
  };

  const handlePushToggle = async () => {
    if (!("Notification" in window)) { showToast("Notifications not supported in this browser.", "error"); return; }
    if (Notification.permission === "granted") { showToast("Push Notifications are already active.", "info"); return; }
    if (Notification.permission === "denied") { showToast("Enable notifications in browser site settings.", "warning"); return; }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setPushEnabled(true);
      showToast("Push Notifications enabled!", "success");
      new Notification("OSINT.NG", { body: "You will receive emergency notifications." });
    } else {
      showToast("Notification permission was denied.", "warning");
    }
  };

  const handleLocate = () => {
    showToast("Locating...", "info");
    setTimeout(() => {
      setCurrentGPS("Nnewi, Anambra State");
      setLocationFilter("Anambra");
      setShowLocationCard(true);
      showToast("You are in Nnewi, Anambra State", "location");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 400);
  };

  const handleClearLocation = () => {
    setLocationFilter("");
    setCurrentGPS("");
    setShowLocationCard(false);
    showToast("Showing all nationwide reports", "info");
  };

  const handleUserClick = () => {
    if (user) { showToast(`Active OSINT Account: ${user.fullName} | EIN: ${user.ein}`, "info"); return; }
    setModal("register");
  };

  return (
    <div className="min-h-full flex flex-col font-sans antialiased bg-slate-950 selection:bg-emerald-500 selection:text-white">
      <Navbar
        user={user}
        onSearchToggle={() => setShowSearch((v) => !v)}
        onUserClick={handleUserClick}
        onSOSClick={() => setModal("sos")}
        onPushToggle={handlePushToggle}
        pushEnabled={pushEnabled}
        showToast={showToast}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-2 sm:px-4 py-3 space-y-3">

        {/* Live Intel Ticker */}
        <LiveTicker posts={posts} />

        {/* Search Panel (toggle from navbar) */}
        {showSearch && (
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 px-3 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search incidents, tags, locations..."
                  autoFocus
                  className="w-full bg-slate-950 text-slate-100 text-xs pl-8 pr-7 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>
              <button
                onClick={handleLocate}
                className="bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs px-3.5 py-2 rounded-xl border border-slate-800 flex items-center space-x-1.5 transition shrink-0"
              >
                <i className="fa-solid fa-location-crosshairs text-emerald-400" />
                <span>{currentGPS ? "Nnewi, Anambra ✓" : "Locate"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Location Intel Card */}
        {showLocationCard && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-slate-100">
                <i className="fa-solid fa-location-dot text-emerald-400 text-sm" />
                <h2 className="font-bold text-sm tracking-tight">You are in Nnewi, Anambra State</h2>
              </div>
              <button onClick={handleClearLocation} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition">
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-300 pt-0.5">
              <div>
                Safety Rating: <span className="font-semibold text-amber-400">Moderate Caution</span>
                <span className="text-slate-400"> • based on recent violent crime reports</span>
              </div>
              <button
                onClick={() => setShowAdvisory((v) => !v)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition self-start sm:self-auto"
              >
                <i className="fa-regular fa-file-lines text-slate-400" />
                <span>{showAdvisory ? "Hide City Advisory" : "View City Advisory"}</span>
                <i className={`fa-solid fa-chevron-down text-[10px] ml-0.5 transition-transform ${showAdvisory ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showAdvisory && (
              <div className="pt-2.5 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
                  <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <i className="fa-solid fa-shield-halved text-amber-400" />
                    <span>Nnewi City Advisory</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Several violent incidents confirmed in this area recently. Vigilante and police patrols are active. Caution advised when travelling the Nnewi–Ozubulu bypass after dark.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-400">Emergency:</span>
                  <a href="tel:08033429811" className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition">Police: 0803 342 9811</a>
                  <a href="tel:08060001212" className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition">Vigilante: 0806 000 1212</a>
                  <a href="tel:08035438970" className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition">NAUTH: 0803 543 8970</a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Location filter header */}
        {locationFilter && (
          <div className="text-xs text-slate-400 font-medium px-1 pt-1">
            Reports in Anambra (<span className="font-mono text-slate-200">{posts.length}</span>)
          </div>
        )}

        {/* Feed */}
        <div className="space-y-4 pt-1">
          {loading ? (
            <div className="text-center py-12">
              <i className="fa-solid fa-circle-notch fa-spin text-emerald-400 text-2xl" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <i className="fa-solid fa-folder-open text-slate-600 text-3xl mb-2 block" />
              <p className="text-xs text-slate-400">No incident reports found in this view.</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onConfirmToggle={handleConfirmToggle}
                showToast={showToast}
              />
            ))
          )}
        </div>
      </main>

      {/* FAB Stack */}
      <div className="fixed bottom-2.5 sm:bottom-3 z-40 flex flex-col items-center space-y-1.5 right-4 sm:right-[max(1.25rem,calc(50vw-20rem))]">
        <button
          onClick={() => setModal("report")}
          title="Create Incident Report"
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-2xl shadow-emerald-950/90 border-2 border-emerald-400/80 hover:border-emerald-300 transition-all hover:scale-105 group"
        >
          <i className="fa-solid fa-plus text-xl group-hover:rotate-90 transition-transform duration-200" />
        </button>
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-9 h-9 rounded-full bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center active:scale-95 transition"
          >
            <i className="fa-solid fa-arrow-up text-xs" />
          </button>
        )}
      </div>

      {/* Modals */}
      <ReportModal
        open={modal === "report"}
        onClose={() => setModal(null)}
        showToast={showToast}
        onSubmitted={fetchPosts}
        defaultTown={currentGPS}
      />
      <SOSModal
        open={modal === "sos"}
        onClose={() => setModal(null)}
        showToast={showToast}
        onBroadcast={fetchPosts}
        currentLocation={currentGPS}
      />
      <RegisterModal
        open={modal === "register"}
        onClose={() => setModal(null)}
        onSwitchToLogin={() => setModal("login")}
        showToast={showToast}
        onRegistered={refreshUser}
      />
      <LoginModal
        open={modal === "login"}
        onClose={() => setModal(null)}
        onSwitchToRegister={() => setModal("register")}
        showToast={showToast}
        onLoggedIn={refreshUser}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
