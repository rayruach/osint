"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import PostCard, { PostCardSkeleton } from "@/components/PostCard";
import ToastContainer from "@/components/ToastContainer";
import ReportModal from "@/components/modals/ReportModal";
import SOSModal from "@/components/modals/SOSModal";
import RegisterModal from "@/components/modals/RegisterModal";
import ClientDashboard from "@/components/modals/ClientDashboard";
import LoginModal from "@/components/modals/LoginModal";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/hooks/useUser";
import type { Post } from "@/types";

function LiveTicker({ posts }: { posts: Post[] }) {
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
        <div className="flex-1 overflow-hidden relative">          {/* fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

          {posts.length === 0 ? (
            <div className="flex items-center h-full px-4 py-2.5">
              <span className="text-xs text-slate-500 italic">Loading feed...</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-0 py-2.5 w-max"
              style={{ animation: "ticker-scroll 40s linear infinite" }}
            >
              {items.map((post, i) => {
                return (
                  <span key={`${post.id}-${i}`} className="flex items-center gap-2 px-4 shrink-0">
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
      </div>
    </div>
  );
}

function FeaturedReport({ post, onReport }: { post?: Post; onReport: () => void }) {
  if (!post) return null;
  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-[#0a0d12]">
      {post.mediaUrl && <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${post.mediaUrl})` }} />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080b10] via-[#080b10]/90 to-[#080b10]/60" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wider"><span className="bg-red-600 px-2.5 py-1 font-bold text-white">Report</span><span className="text-amber-400">{post.state}</span><span className="text-slate-500">Published {new Date(post.createdAt).toLocaleDateString()}</span></div>
            <h1 className="max-w-4xl font-editorial text-4xl font-bold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">{post.title}</h1>
            <p className="max-w-3xl text-base font-light leading-relaxed text-slate-300 sm:text-lg">{post.body.length > 280 ? `${post.body.slice(0, 280).trimEnd()}…` : post.body}</p>
            <div className="flex flex-wrap items-center gap-4 border-t border-slate-800 pt-4 text-xs text-slate-400"><span className="font-medium text-slate-200">By {post.authorName}</span><span className="text-slate-700">|</span><span>{post.lga}, {post.state}</span>{post.sourceUrl && <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">View source <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-[9px]" /></a>}</div>
          </div>
          <aside className="self-start rounded-xl border border-slate-800 bg-slate-950/85 p-5 backdrop-blur lg:col-span-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-amber-400">Report details</p>
            <div className="my-4 border-t border-slate-800" />
            <p className="text-sm font-semibold text-white">{post.badge}</p><p className="mt-2 text-xs leading-relaxed text-slate-400">{post.confirmations} community confirmation{post.confirmations === 1 ? "" : "s"}</p>
            <button onClick={onReport} className="mt-5 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-left text-xs font-semibold text-white hover:bg-slate-700 transition">Submit related information</button>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default function FeedPage() {
  const { toasts, showToast, removeToast } = useToast();
  const { user, refresh: refreshUser, logout } = useUser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [currentGPS, setCurrentGPS] = useState("");

  const [showSearch, setShowSearch] = useState(false);
  const [showLocationCard, setShowLocationCard] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushMuted, setPushMuted] = useState(false);

  const [modal, setModal] = useState<"report" | "sos" | "register" | "login" | "dashboard" | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const fetchPosts = useCallback(async () => {
    setVisibleCount(10);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (locationFilter) params.set("state", locationFilter);
      // Pass device ID so server can restore confirmed state for anonymous visitors
      const deviceId = localStorage.getItem("osint_device_id");
      if (deviceId) params.set("deviceId", deviceId);
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
    if (localStorage.getItem("osint_push_muted") === "1") setPushMuted(true);
  }, []);

  const handleConfirmToggle = async (id: string) => {
    // Optimistic update — flip UI instantly
    const prev = posts.find((p) => p.id === id);
    if (!prev) return;
    const optimisticConfirmed = !prev.isConfirmed;
    const optimisticCount = prev.confirmations + (optimisticConfirmed ? 1 : -1);
    setPosts((all) =>
      all.map((p) =>
        p.id === id ? { ...p, isConfirmed: optimisticConfirmed, confirmations: optimisticCount } : p
      )
    );

    // Get or generate device ID
    let deviceId = localStorage.getItem("osint_device_id");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("osint_device_id", deviceId);
    }

    // Sync with server in background
    try {
      const res = await fetch(`/api/posts/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      // Reconcile with server count
      setPosts((all) =>
        all.map((p) =>
          p.id === id ? { ...p, isConfirmed: data.confirmed, confirmations: data.confirmations } : p
        )
      );
      if (data.confirmed) showToast("Thanks for confirming this report.", "success");
    } catch {
      // Revert on failure
      setPosts((all) =>
        all.map((p) =>
          p.id === id ? { ...p, isConfirmed: prev.isConfirmed, confirmations: prev.confirmations } : p
        )
      );
      showToast("Failed to update confirmation.", "error");
    }
  };

  const handlePushToggle = async () => {
    if (!("Notification" in window)) { showToast("Notifications not supported in this browser.", "error"); return; }
    if (Notification.permission === "granted") {
      // Toggle mute
      const newMuted = !pushMuted;
      setPushMuted(newMuted);
      localStorage.setItem("osint_push_muted", newMuted ? "1" : "0");
      showToast(newMuted ? "Notifications silenced." : "Notifications unmuted.", newMuted ? "info" : "success");
      return;
    }
    if (Notification.permission === "denied") { showToast("Enable notifications in browser site settings.", "warning"); return; }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setPushEnabled(true);
      setPushMuted(false);
      localStorage.setItem("osint_push_muted", "0");
      showToast("Push Notifications enabled!", "success");
      new Notification("BIOS", { body: "You will receive emergency notifications." });
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }
    showToast("Locating...", "info");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode using OpenStreetMap Nominatim (free, no API key)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address ?? {};
          const city = addr.city || addr.town || addr.village || addr.county || "Unknown area";
          const state = addr.state?.replace(/\s+State$/i, "").trim() ?? "";
          const label = state ? `${city}, ${state} State` : city;
          setCurrentGPS(label);
          setLocationFilter(state);
          setShowLocationCard(true);
          showToast(`You are in ${label}`, "location");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
          // Fallback — show raw coords if geocoding fails
          const label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setCurrentGPS(label);
          setShowLocationCard(true);
          showToast(`Location detected: ${label}`, "info");
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          showToast("Location access denied. Please allow location in browser settings.", "warning");
        } else {
          showToast("Could not detect your location. Try again.", "error");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClearLocation = () => {
    setLocationFilter("");
    setCurrentGPS("");
    setShowLocationCard(false);
    showToast("Showing all nationwide reports", "info");
  };

  const handleUserClick = () => {
    if (user) { setModal("dashboard"); return; }
    setModal("login");
  };


  return (
    <div className="min-h-full flex flex-col font-sans antialiased bg-[#080B10] selection:bg-red-600 selection:text-white">
      <Navbar
        onSearchToggle={() => setShowSearch((v) => !v)}
        onLocate={handleLocate}
        onSOSClick={() => setModal("sos")}
        onReportClick={() => setModal("report")}
        onUserClick={handleUserClick}
        userLabel={user?.fullName}
        onPushToggle={handlePushToggle}
        pushEnabled={pushEnabled}
        pushMuted={pushMuted}
        showToast={showToast}
      />

      {showSearch && (
        <div className="sticky top-16 z-30 w-full px-4 sm:top-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl border border-slate-800 bg-slate-900/90 p-2.5 px-3 shadow-xl backdrop-blur-md">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incidents, locations..."
                autoFocus
                className="w-full bg-slate-950 text-slate-100 text-xs pl-8 pr-7 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <FeaturedReport post={posts[0]} onReport={() => setModal("report")} />

      <main id="reports" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-3">

        <div className="flex items-end justify-between border-b border-slate-800 pb-4">
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-red-400">From the newsroom</p><h2 className="mt-1 font-editorial text-3xl font-bold text-white">Latest reports</h2></div>
          <span className="font-mono text-[10px] text-slate-500">{posts.length} published</span>
        </div>

        {/* Location Intel Card */}
        {showLocationCard && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-slate-100">
                <i className="fa-solid fa-location-dot text-emerald-400 text-sm" />
                <h2 className="font-bold text-sm tracking-tight">You are in {currentGPS}</h2>
              </div>
              <button onClick={handleClearLocation} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition">
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>

            <div className="pt-2.5 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
                <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                  <i className="fa-solid fa-shield-halved text-amber-400" />
                  <span>{currentGPS} Advisory</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Stay alert in this area. Check the reports below for recent incidents near your location. Contact emergency services if you witness any ongoing threat.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-slate-400">Emergency:</span>
                <a href="tel:199" className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition">Police: 199</a>
                <a href="tel:112" className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition">Emergency: 112</a>
                <a href="tel:08033429811" className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition">NEMA: 0800 033 3132</a>
              </div>
            </div>
          </div>
        )}

        {/* Location filter header */}
        {locationFilter && (
          <div className="text-xs text-slate-400 font-medium px-1 pt-1">
            Reports in Anambra (<span className="font-mono text-slate-200">{posts.length}</span>)
          </div>
        )}

        {/* Feed */}
        <div className="pt-1">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <PostCardSkeleton key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <i className="fa-solid fa-folder-open text-slate-600 text-3xl mb-2 block" />
              <p className="text-xs text-slate-400">No incident reports found in this view.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                {posts.slice(0, visibleCount).map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onConfirmToggle={handleConfirmToggle}
                    showToast={showToast}
                  />
                ))}
              </div>
              {/* Load more */}
              {visibleCount < posts.length && visibleCount < 20 && (
                <button
                  onClick={() => setVisibleCount(20)}
                  className="w-full py-3 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-xs font-medium transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-chevron-down text-[10px]" />
                  See more reports
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <footer className="mt-6 pb-24 text-center space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <span>© {new Date().getFullYear()} BIOS</span>
              <span className="text-slate-700">·</span>
              <a href="/about" className="hover:text-emerald-400 transition">About</a>
              <span className="text-slate-700">·</span>
              <a href="https://wa.me/2348060760476" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition flex items-center gap-1">
                <i className="fa-brands fa-whatsapp text-[#25D366]" /> Support
              </a>
            </div>
          </footer>
        )}
      </main>

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
        user={user}
        onLoginRequired={() => setModal("login")}
      />
      <RegisterModal
        open={modal === "register"}
        onClose={() => setModal(null)}
        onSwitchToLogin={() => setModal("login")}
        showToast={showToast}
        onRegistered={refreshUser}
      />      <LoginModal
        open={modal === "login"}
        onClose={() => setModal(null)}
        onSwitchToRegister={() => setModal("register")}
        showToast={showToast}
        onLoggedIn={refreshUser}
      />
      {user && (
        <ClientDashboard
          open={modal === "dashboard"}
          user={user}
          onClose={() => setModal(null)}
          onLogout={() => { logout(); setModal(null); }}
          showToast={showToast}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
