'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { addressConfig } from '@/contracts/addresses'
import { useAccount, useBlockNumber, useChainId } from 'wagmi'
import {
    Activity,
    Cpu,
    Database,
    Globe,
    Layers,
    Server,
    ShieldCheck,
    KeyRound,
    Loader2,
    Shield,
    Lock
} from 'lucide-react'
import { motion } from 'framer-motion'
import { generateRSAKeyPair } from '@/lib/browser-crypto'
import { useState } from 'react'

export default function NetworkPage() {
    const { address } = useAccount()
    const { data: blockNumber } = useBlockNumber({ watch: true })
    const chainId = useChainId()

    const [keyPair, setKeyPair] = useState<{ publicKey: string; privateKey: string } | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateKeys = async () => {
        setIsGenerating(true)
        try {
            const keys = await generateRSAKeyPair()
            setKeyPair(keys)
        } finally {
            setIsGenerating(false)
        }
    }

    const nodeStats = [
        { label: 'Network Name', value: 'CivicChain Local', icon: Globe },
        { label: 'Chain ID', value: chainId, icon: Layers },
        { label: 'Latest Block', value: blockNumber?.toString() || 'Loading...', icon: Database },
        { label: 'Node Provider', value: 'Hardhat Engine v2.0', icon: Server },
        { label: 'Gas Price', value: '0.00001 Gwei', icon: Activity },
        { label: 'Consensus', value: 'Proof of Authority', icon: ShieldCheck },
    ]

    const contracts = Object.entries(addressConfig).filter(([k]) => k !== 'network' && k !== 'chainId')

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-text-main tracking-tight mb-2">Network Architecture</h1>
                    <p className="text-text-muted">Real-time diagnostics and smart contract deployments for the NyayaSetu ecosystem.</p>
                </div>

                {/* Node Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nodeStats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                                    <stat.icon className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none mb-1.5">{stat.label}</div>
                                    <div className="text-lg font-bold text-text-main leading-none">{stat.value}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Deployment Registry */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                        Deployment Registry
                        <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold border border-brand-primary/20">LIVE ON-CHAIN</span>
                    </h2>

                    <div className="document-card overflow-hidden shadow-lg">
                        <div className="px-8 py-4 bg-slate-50 border-b border-border-subtle flex items-center justify-between">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Protocol Contract Name</span>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">EVM Address</span>
                        </div>
                        <div className="divide-y divide-border-subtle">
                            {contracts.map(([name, addr]) => (
                                <div key={name} className="flex items-center justify-between px-8 py-5 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-brand-accent" />
                                        <span className="text-sm font-bold text-text-main">{name}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-text-muted bg-bg-page px-3 py-1.5 rounded-lg border border-border-subtle">
                                        {addr as string}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Key Generation Tool */}
                <div className="glass-card p-8 border-brand-primary/20 bg-brand-primary/5">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="md:w-1/3">
                            <div className="p-3 bg-brand-primary/10 rounded-2xl w-fit mb-4 border border-brand-primary/20">
                                <KeyRound className="w-6 h-6 text-brand-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-text-main mb-2">Authority Key Portal</h3>
                            <p className="text-sm text-text-muted leading-relaxed mb-6">
                                Generate cryptographic keys to secure whistleblower evidence. Keep your <strong>Private Key</strong> secret and register the <strong>Public Key</strong> on-chain.
                            </p>
                            <button
                                onClick={handleGenerateKeys}
                                disabled={isGenerating}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-all disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                {isGenerating ? 'Generating...' : 'Generate Key Pair'}
                            </button>
                        </div>

                        <div className="flex-1 space-y-6">
                            {keyPair ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-brand-accent uppercase tracking-widest flex items-center gap-2">
                                            <Shield className="w-3 h-3" /> Public Key (For Smart Contract)
                                        </label>
                                        <textarea
                                            readOnly
                                            value={keyPair.publicKey}
                                            className="w-full h-32 bg-bg-page border border-brand-primary/20 rounded-xl px-4 py-3 text-[10px] font-mono text-brand-primary focus:outline-none"
                                        />
                                        <div className="text-[9px] text-text-muted">Copy this to the <code className="bg-bg-page px-1 rounded">registerAgencyDetails</code> contract function.</div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                                            <Lock className="w-3 h-3" /> Private Key (SAVE SECURELY)
                                        </label>
                                        <textarea
                                            readOnly
                                            value={keyPair.privateKey}
                                            className="w-full h-32 bg-red-50/50 border border-red-200 rounded-xl px-4 py-3 text-[10px] font-mono text-red-600 focus:outline-none"
                                        />
                                        <div className="text-[9px] text-red-400">NEVER share this key. It is required to decrypt evidence.</div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-3xl p-12 text-center">
                                    <Lock className="w-12 h-12 text-text-muted/30 mb-4" />
                                    <p className="text-text-muted text-sm">No active key pair. Generate one to begin secure setup.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Infrastructure Note */}
                <div className="p-6 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex gap-4">
                    <Cpu className="w-6 h-6 text-brand-primary shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-text-main mb-1">Decentralized Infrastructure</h4>
                        <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
                            All administrative actions are cryptographically signed and recorded on the CivicChain ledger.
                            This portal communicates directly with localized nodes and decentralized storage (IPFS) to ensure zero-point failure resistance.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
