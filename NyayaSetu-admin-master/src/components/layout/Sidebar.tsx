'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    CheckCircle,
    AlertCircle,
    Settings,
    Shield,
    Activity,
    Users,
    KeyRound
} from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Active Cases', href: '/cases', icon: FileText },
    { name: 'Resolved', href: '/resolved', icon: CheckCircle },
    { name: 'Escalated', href: '/escalated', icon: AlertCircle },
    { name: 'Agencies', href: '/agencies', icon: Users },
    { name: 'Key Vault', href: '/keyvault', icon: KeyRound },
    { name: 'Network Info', href: '/network', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 flex flex-col h-screen border-r border-border-subtle bg-white fixed left-0 top-0 z-50 shadow-sm">
            {/* Brand */}
            <div className="p-10 flex items-center gap-4">
                <div className="p-3 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                    <Shield className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tight text-text-main uppercase leading-none">NyayaSetu</h1>
                    <p className="text-[10px] text-text-muted font-mono font-bold uppercase tracking-[0.2em] mt-1">Admin Portal</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group relative overflow-hidden",
                                isActive
                                    ? "bg-brand-primary/5 text-brand-primary border border-brand-primary/10"
                                    : "text-text-muted hover:text-text-main hover:bg-bg-page border border-transparent"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 w-1.5 h-6 bg-brand-primary rounded-full"
                                    initial={false}
                                />
                            )}
                            <item.icon className={cn(
                                "w-5 h-5 transition-transform group-hover:scale-110",
                                isActive ? "text-brand-primary" : "text-text-muted group-hover:text-text-main"
                            )} />
                            <span className="text-xs font-bold uppercase tracking-widest leading-none">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-8 border-t border-border-subtle">
                <div className="p-6 rounded-3xl bg-bg-page border border-border-subtle">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-accent shadow-sm" />
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">System_Status</span>
                    </div>
                    <p className="text-[10px] text-text-muted font-mono leading-relaxed uppercase font-bold">
                        Node_Sync: Optimal<br />
                        Integrity_Lock: Active
                    </p>
                </div>
            </div>
        </div>
    )
}
