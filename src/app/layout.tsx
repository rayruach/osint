import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OSINT.NG | REYFUND",
  description: "Open source intelligence Nigeria. 36 states + FCT",
  authors: [{ name: "ReyFund (Ruach & Zoe Nigeria) & Afribic Alliance" }],
  openGraph: {
    title: "OSINT-NG",
    description: "Open source intelligence Nigeria. 36 states + FCT",
    siteName: "ReyFund (Ruach & Zoe Nigeria) & Afribic Alliance",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "OSINT-NG",
    description: "Open source intelligence Nigeria. 36 states + FCT",
    site: "@osintng",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100">
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
