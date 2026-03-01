"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "./wallet/ConnectButton";

const NAV_LINKS = [
  { href: "/privacy", label: "Privacy Vault" },
  { href: "/submit", label: "Submit Case" },
  { href: "/ledger", label: "Public Ledger" },
  { href: "/agency", label: "Agency Portal" },
  { href: "http://localhost:3001", label: "Admin", external: true },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 w-full z-50"
      >
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl border-b border-border-subtle/80" />

        <div className="relative max-w-7xl mx-auto w-full flex items-center justify-between px-6 py-3.5">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative p-1.5 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary group-hover:shadow-[0_0_20px_rgba(37,99,235,0.25)] transition-all duration-300">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight text-text-main">NyayaSetu</span>
              <span className="text-[8px] font-mono text-text-muted uppercase tracking-[0.2em] hidden sm:block">Justice Protocol</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, external }) => {
              const isActive = pathname === href;
              if (external) {
                return (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 text-text-muted hover:text-text-main hover:bg-bg-page"
                  >
                    {label}
                  </a>
                );
              }
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${isActive
                    ? "text-brand-primary bg-brand-primary/8"
                    : "text-text-muted hover:text-text-main hover:bg-bg-page"
                    }`}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Wallet + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <ConnectButton />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-bg-page transition-colors text-text-muted"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[60px] inset-x-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-border-subtle shadow-xl lg:hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label, external }) => {
                const isActive = pathname === href;
                if (external) {
                  return (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-xl text-sm font-semibold transition-all text-text-muted hover:text-text-main hover:bg-bg-page"
                    >
                      {label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                      ? "text-brand-primary bg-brand-primary/5 border border-brand-primary/15"
                      : "text-text-muted hover:text-text-main hover:bg-bg-page"
                      }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
