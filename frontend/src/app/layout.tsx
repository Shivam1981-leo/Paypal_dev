import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayGuard AI - Real-Time Fraud Defense for PayPal Merchants",
  description: "Pre-capture AI-powered fraud scoring to protect your PayPal revenues from chargebacks and account freezes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#030712] text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
