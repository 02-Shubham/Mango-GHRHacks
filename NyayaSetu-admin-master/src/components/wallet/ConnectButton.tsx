'use client'

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { Wallet, LogOut, ChevronDown, X, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { formatEther } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'

export function ConnectButton() {
    const { address, isConnected } = useAccount()
    const { connect, connectors, isPending, error } = useConnect()
    const { disconnect } = useDisconnect()
    const { data: balance } = useBalance({ address })
    const [mounted, setMounted] = useState(false)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleConnect = async (connector: any) => {
        try {
            await connect({ connector })
            setShowModal(false)
        } catch (err) {
            console.error('Connection error:', err)
        }
    }

    if (!mounted) return (
        <div className="w-32 h-10 bg-bg-page border border-border-subtle rounded-xl animate-pulse" />
    )

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-brand-primary font-bold uppercase tracking-widest leading-none mb-1">Admin Session</span>
                        <span className="text-xs font-mono font-medium text-text-main leading-none">
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                    </div>
                    <div className="w-px h-6 bg-brand-primary/10"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-none mb-1">Balance</span>
                        <span className="text-xs font-medium text-text-main leading-none">
                            {balance ? `${parseFloat(formatEther(balance.value)).toFixed(3)} ${balance.symbol}` : '0.000'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => disconnect()}
                    className="p-3 bg-bg-page hover:bg-red-50 border border-border-subtle hover:border-red-200 rounded-xl transition-all group"
                    title="Sign Out"
                >
                    <LogOut className="w-4 h-4 text-text-muted group-hover:text-red-500 transition-colors" />
                </button>
            </div>
        )
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                disabled={isPending}
                className="px-6 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Wallet className="w-4 h-4" />
                {isPending ? 'Connecting...' : 'Connect Admin Wallet'}
                {!isPending && <ChevronDown className="w-3 h-3" />}
            </button>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md z-50"
                        >
                            <div className="bg-white border border-brand-primary/20 rounded-3xl p-8 shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-text-main mb-1">Authorization</h3>
                                        <p className="text-xs text-text-muted">Select a secure provider to access the portal</p>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-bg-page rounded-xl transition-colors">
                                        <X className="w-5 h-5 text-text-muted" />
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-600">{error.message}</p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {connectors.map((connector) => (
                                        <button
                                            key={connector.id}
                                            onClick={() => handleConnect(connector)}
                                            disabled={isPending}
                                            className="w-full flex items-center gap-4 p-5 bg-bg-page hover:bg-brand-primary/5 border border-border-subtle hover:border-brand-primary/30 rounded-2xl transition-all group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-white border border-border-subtle flex items-center justify-center group-hover:bg-brand-primary/10 group-hover:border-brand-primary/20 transition-colors">
                                                <Wallet className="w-6 h-6 text-text-muted group-hover:text-brand-primary" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="text-sm font-bold text-text-main group-hover:text-brand-primary transition-colors">
                                                    {connector.name}
                                                </div>
                                                <div className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">
                                                    Secure Access
                                                </div>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-text-muted -rotate-90 group-hover:text-brand-primary transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
