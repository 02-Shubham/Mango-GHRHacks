import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NyayaAdmin | Secure Case Management",
  description: "Administrative portal for NyayaSetu whistleblower platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-bg-page text-text-main selection:bg-brand-primary/10 relative min-h-screen`}>
        <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none z-0" />
        <Web3Provider>
          <div className="relative z-10">
            {children}
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
