import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#030303",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Credex AI Spend Audit | Reclaim 30% of your AI & SaaS budget",
  description:
    "Automatically audit active SaaS licenses, track LLM API token anomalies, clean orphaned databases, and draft empirical vendor negotiations. Premium, secure, zero-friction setup.",
  keywords: [
    "AI Spend Audit",
    "SaaS Optimization",
    "Cloud Cost Control",
    "LLM Token Tracking",
    "Procurement Automation",
    "AWS RDS Optimization",
  ],
  authors: [{ name: "Credex Engineering Team", url: "https://credex.ai" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://credex.ai",
    title: "Credex AI Spend Audit | Reclaim 30% of your AI & SaaS budget",
    description:
      "Empower your finance and engineering teams with autonomous spend audits. Scan 120+ integrations for idle assets and tokens leaks.",
    siteName: "Credex AI",
    images: [
      {
        url: "https://credex.ai/og-preview.png",
        width: 1200,
        height: 630,
        alt: "Credex AI Spend Audit Platform Dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Credex AI Spend Audit | Reclaim 30% of your AI & SaaS budget",
    description: "Scan active cloud integrations and reclaim 30% of your SaaS budget automatically.",
    creator: "@credex_ai",
    images: ["https://credex.ai/og-preview.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://credex.ai"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[#030303] text-neutral-200">
        {children}
      </body>
    </html>
  );
}
