"use client";

export default function AboutPage() {
  return (
    <div
      className="min-h-screen text-slate-200 font-sans flex flex-col"
      style={{
        backgroundColor: "#0b0e14",
        backgroundImage: `
          linear-gradient(to bottom, rgba(11,14,20,0.88), rgba(11,14,20,0.97)),
          url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1920&q=80')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img src="/logo.png" alt="OSINT-NG" className="w-8 h-8 rounded-xl object-cover border border-emerald-500/30" />
            <a href="/" className="font-bold text-lg tracking-tight text-emerald-400 hover:text-emerald-300 transition font-mono">
              OSINT-NG
            </a>
          </div>
          <a href="/" className="text-xs text-slate-400 hover:text-emerald-400 transition flex items-center space-x-1.5">
            <i className="fa-solid fa-arrow-left text-[10px]" />
            <span>Back to Feed</span>
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 space-y-14 w-full">

        {/* Hero */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-5 w-8 rounded overflow-hidden border border-white/20 shadow-sm" title="Federal Republic of Nigeria">
              <div className="w-1/3 bg-[#008751]" />
              <div className="w-1/3 bg-white" />
              <div className="w-1/3 bg-[#008751]" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
              Open Source Intelligence Nigeria
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#008751] text-white font-black text-4xl sm:text-6xl px-4 py-2 rounded-xl tracking-tight uppercase shadow-lg">
              OSINT
            </div>
            <div className="text-3xl sm:text-5xl font-extrabold uppercase tracking-wide leading-tight text-white">
              IN INVESTIGATIVE<br />
              <span className="text-emerald-400">JOURNALISM</span>
            </div>
          </div>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Leveraging public documents, corporate registries, satellite imagery, and open data to uncover corruption, verify claims, and expose facts across Nigeria and West Africa.
          </p>
        </section>

        {/* Process */}
        <section className="space-y-3">
          <p className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">How We Work</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "fa-magnifying-glass", label: "Gather Data" },
              { icon: "fa-shield-halved", label: "Cross-Verify" },
              { icon: "fa-chart-pie", label: "Analyze" },
              { icon: "fa-bullhorn", label: "Expose Facts" },
            ].map(({ icon, label }, i) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm text-center">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <i className={`fa-solid ${icon} text-emerald-400 text-sm`} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{i + 1}.</span>
                  <span className="text-xs font-semibold text-slate-200">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="space-y-6">
          <div className="space-y-4 border-l-2 border-emerald-500/40 pl-5">
            <h2 className="text-lg font-bold text-white">Who We Are</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              OSINT-NG is an independent investigative journalism organization operating across Nigeria and West Africa. Our analysts, field reporters, and citizen contributors work together to document, verify, and publish security and accountability intelligence in real time.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              We are not affiliated with any government agency, political party, or security apparatus. Our only obligation is to the truth and to the safety of Nigerian communities.
            </p>
          </div>

          <div className="space-y-4 border-l-2 border-emerald-500/40 pl-5">
            <h2 className="text-lg font-bold text-white">Citizen Intelligence</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every Nigerian is a potential source. OSINT-NG gives citizens the platform to submit incident reports, verify what they witness, and contribute to a national intelligence picture — safely and anonymously.
            </p>
          </div>

          <div className="space-y-4 border-l-2 border-amber-500/40 pl-5">
            <h2 className="text-lg font-bold text-white">Reward Program</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              High-priority reports with verified media evidence may qualify for a ₦500 reward. Submit a report, save your claim code, and redeem via your account dashboard when selected.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-black/30 border border-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white">Contact Our Desk</p>
            <p className="text-xs text-slate-400 mt-0.5">Tips, press inquiries, or partnership requests.</p>
          </div>
          <a
            href="https://wa.me/2348060760476"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center space-x-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-semibold rounded-xl transition"
          >
            <i className="fa-brands fa-whatsapp text-base" />
            <span>WhatsApp Us</span>
          </a>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-600 pb-4 space-y-2">
          <div className="border-t border-slate-800/60 pt-4 space-y-1">
            <p className="text-slate-500 text-[11px]">
              OSINT-NG is a joint initiative of
            </p>
            <p className="text-slate-400 font-medium">
              ReyFund <span className="text-slate-600 font-normal">(Ruach & Zoe Nigeria)</span> &amp; Afribic Alliance
            </p>
          </div>
          <p>© {new Date().getFullYear()} OSINT-NG. All rights reserved.</p>
          <a href="/" className="text-slate-500 hover:text-emerald-400 transition inline-block">← Back to Feed</a>
        </footer>
      </main>
    </div>
  );
}
