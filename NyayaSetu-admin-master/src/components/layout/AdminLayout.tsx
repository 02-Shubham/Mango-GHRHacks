'use client'

import { Sidebar } from './Sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, ShieldCheck, User } from 'lucide-react'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { useAccount } from 'wagmi'

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isConnected } = useAccount()

    return (
        <div className="flex min-h-screen bg-bg-page text-text-main font-sans overflow-hidden">
            <Sidebar />

            <div className="flex-1 ml-64 flex flex-col">
                {/* Header */}
                <header className="h-20 border-b border-border-subtle bg-white/80 backdrop-blur-md sticky top-0 z-40 px-10 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-6 flex-1">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search cases, hashes, or departments..."
                                className="w-full bg-slate-50 border border-border-subtle rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-primary/30 transition-all placeholder:text-text-muted"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 pr-6 border-r border-border-subtle">
                            <button className="p-2.5 rounded-xl hover:bg-slate-100 transition-all text-text-muted hover:text-text-main relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-primary rounded-full border-2 border-white" />
                            </button>
                            <button className="p-2.5 rounded-xl hover:bg-slate-100 transition-all text-text-muted hover:text-text-main">
                                <ShieldCheck className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <ConnectButton />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-10 relative flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}
