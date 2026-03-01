'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import {
    Settings,
    Bell,
    Shield,
    User,
    Save,
    Key
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function SettingsPage() {
    const [notifications, setNotifications] = useState(true)

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-main tracking-tight mb-2">Portal Settings</h1>
                    <p className="text-text-muted">Manage your administrative preferences and legal node configurations.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* General Account */}
                    <div className="glass-card p-8">
                        <h3 className="text-sm font-bold text-text-main mb-6 flex items-center gap-2">
                            <User className="w-4 h-4 text-brand-primary" /> Identity & Profile
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between py-4 border-b border-border-subtle">
                                <div>
                                    <div className="text-sm font-medium text-text-main">Agency Name</div>
                                    <div className="text-xs text-text-muted">How your department appears in the registry.</div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="e.g. Health Ministry"
                                    className="bg-bg-page border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-main focus:border-brand-primary/40 outline-none transition-all w-64"
                                />
                            </div>
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <div className="text-sm font-medium text-text-main">Public Key Display</div>
                                    <div className="text-xs text-text-muted">Visibility of your encryption key to whistleblowers.</div>
                                </div>
                                <div className="flex bg-bg-page rounded-lg p-1 border border-border-subtle">
                                    <button className="px-4 py-1.5 text-xs font-bold rounded-md bg-brand-primary text-white">Public</button>
                                    <button className="px-4 py-1.5 text-xs font-bold rounded-md text-text-muted">Hidden</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="glass-card p-8">
                        <h3 className="text-sm font-bold text-text-main mb-6 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-brand-primary" /> Security & Privacy
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between py-4 border-b border-border-subtle">
                                <div>
                                    <div className="text-sm font-medium text-text-main">Two-Factor Wallet Auth</div>
                                    <div className="text-xs text-text-muted">Request signature for every administrative action.</div>
                                </div>
                                <div className="w-12 h-6 rounded-full bg-brand-primary/20 border border-brand-primary/40 relative p-1 cursor-pointer">
                                    <div className="w-4 h-4 rounded-full bg-brand-primary float-right" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <div className="text-sm font-medium text-text-main">Session Persistence</div>
                                    <div className="text-xs text-text-muted">Automated logout after periods of inactivity.</div>
                                </div>
                                <select className="bg-bg-page border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-main outline-none">
                                    <option>15 Minutes</option>
                                    <option>1 Hour</option>
                                    <option>Never</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="glass-card p-8">
                        <h3 className="text-sm font-bold text-text-main mb-6 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-brand-primary" /> Case Alerts
                        </h3>
                        <div className="flex items-center justify-between py-4">
                            <div>
                                <div className="text-sm font-medium text-text-main">New Submission Logs</div>
                                <div className="text-xs text-text-muted">Real-time alerts when new cases are filed in your department.</div>
                            </div>
                            <div
                                className={`w-12 h-6 rounded-full border transition-all relative p-1 cursor-pointer ${notifications ? 'bg-brand-primary/20 border-brand-primary/40' : 'bg-bg-page border-border-subtle'}`}
                                onClick={() => setNotifications(!notifications)}
                            >
                                <div className={`w-4 h-4 rounded-full transition-all ${notifications ? 'bg-brand-primary translate-x-6' : 'bg-text-muted'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button className="px-6 py-2.5 rounded-xl border border-border-subtle text-sm font-medium text-text-muted hover:bg-bg-page transition-all">
                        Discard Changes
                    </button>
                    <button className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-secondary transition-all flex items-center gap-2 shadow-md">
                        <Save className="w-4 h-4" /> Save Configuration
                    </button>
                </div>
            </div>
        </AdminLayout>
    )
}
