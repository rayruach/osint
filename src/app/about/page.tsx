"use client";

const principles = [
  ["fa-file-lines", "Report", "We receive reports, documents, and public records."],
  ["fa-list-check", "Verify", "We check claims against available evidence and sources."],
  ["fa-newspaper", "Publish", "We publish reporting that serves the public interest."],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080B10] text-slate-200">
      <div className="border-b border-[#1E2638] bg-[#080B10] px-4 py-1.5 font-mono text-[10px] text-slate-400 sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><span className="font-semibold text-slate-300">BIOS NEWSROOM</span><a href="/" className="hover:text-white">Back to reports</a></div></div>
      <header className="border-b border-[#1E2638] bg-[#0A0D12]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded bg-red-600 font-editorial text-2xl font-bold text-white">B</div><div><p className="font-editorial text-2xl font-bold leading-none text-white">BIOS</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-red-400">Independent Investigative Journalism</p></div></a>
          <a href="/" className="rounded-lg border border-[#30394B] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-[#12161F] hover:text-white"><i className="fa-solid fa-arrow-left mr-1.5 text-[10px]" /> Reports</a>
        </div>
      </header>

      <main>
        <section className="border-b border-[#1E2638] bg-[#0A0D12]"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">About BIOS</p><h1 className="mt-4 max-w-3xl font-editorial text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl">Journalism in the public interest.</h1><p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">BIOS is an independent newsroom documenting issues that affect people and communities across Nigeria.</p></div></section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="grid gap-5 md:grid-cols-3">{principles.map(([icon, title, copy], index) => <article key={title} className="rounded-xl border border-[#1E2638] bg-[#12161F] p-6"><span className="font-mono text-[10px] text-red-400">0{index + 1}</span><i className={`fa-solid ${icon} ml-3 text-sm text-amber-400`} /><h2 className="mt-7 font-editorial text-3xl font-bold text-white">{title}</h2><p className="mt-3 text-sm leading-relaxed text-slate-400">{copy}</p></article>)}</div></section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-12 lg:px-8"><div className="lg:col-span-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-red-400">Our work</p><h2 className="mt-3 font-editorial text-4xl font-bold text-white">Accountability begins with good reporting.</h2><div className="mt-6 space-y-4 border-l-2 border-red-600 pl-5 text-sm leading-relaxed text-slate-300"><p>We cover public-interest issues with care, context, and a commitment to accuracy. Our work is independent of government agencies, political parties, and private interests.</p><p>People can share reports and first-hand information with our desk. Community confirmations help show where an issue may need further reporting; they do not replace verification.</p></div></div><aside className="self-start rounded-xl border border-[#1E2638] bg-[#12161F] p-6 lg:col-span-5"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">Contact the newsroom</p><p className="mt-4 text-sm leading-relaxed text-slate-400">For tips, press inquiries, or partnership requests, contact the BIOS desk.</p><a href="https://wa.me/2348060760476" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex rounded-lg bg-red-600 px-4 py-3 text-xs font-bold text-white hover:bg-red-700"><i className="fa-brands fa-whatsapp mr-2" /> Contact BIOS</a></aside></section>
      </main>

      <footer className="border-t border-[#1E2638] bg-[#0A0D12] px-4 py-8 text-center font-mono text-[10px] text-slate-500"><p>© {new Date().getFullYear()} BIOS. Independent journalism for Nigeria.</p></footer>
    </div>
  );
}
