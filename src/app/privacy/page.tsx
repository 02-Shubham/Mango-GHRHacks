'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { MixerComponent } from '@/components/MixerComponent';
import { Shield, Lock, Activity, ArrowRight, Monitor, Wifi, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
    {
        icon: Monitor,
        title: "Initialize Secure Browser",
        desc: "Utilize Tor Browser or a verified VPN to mask your network footprint from NyayaSetu and ISP observers.",
        tag: "REQ_LOG_01",
    },
    {
        icon: RefreshCw,
        title: "Generate Burner Identity",
        desc: "Create a fresh MetaMask account. Never link this identity to accounts with KYC or prior on-chain history.",
        tag: "REQ_LOG_02",
    },
    {
        icon: ShieldAlert,
        title: "Execute ShadowVault Mix",
        desc: "Deposit assets from your origin wallet into the mixer. Withdraw to your burner wallet via ZK-Proofs.",
        tag: "REQ_LOG_03",
    },
    {
        icon: Shield,
        title: "Final Archive Submission",
        desc: "Navigate to the secure portal from your burner wallet. Your real identity is now fully disconnected.",
        tag: "REQ_LOG_04",
    },
];

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-bg-page text-text-main selection:bg-brand-primary/10 relative overflow-hidden flex flex-col items-center font-sans">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />

            <Navbar />

            <div className="w-full max-w-6xl mx-auto px-6 pt-32 pb-32 space-y-24 relative z-10">

                {/* Header */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em]">
                        <Lock className="w-4 h-4" />
                        <span>Zero-Leak Privacy Protocol</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none text-text-main">ShadowVault</h1>
                    <p className="text-text-muted max-w-2xl mx-auto font-normal leading-relaxed text-lg">
                        Sever the cryptographic link between your identity and your testimony.
                        Follow the mandatory sequences below to ensure absolute deniability.
                    </p>
                </div>

                {/* Step-by-Step Protocol */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-border-subtle pb-4">
                        <Activity className="w-5 h-5 text-brand-primary" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">Pre-Submission Protocol Sequence</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {STEPS.map(({ icon: Icon, title, desc, tag }) => (
                            <div key={title} className="p-8 rounded-2xl bg-white border border-border-subtle space-y-6 hover:border-brand-primary/30 hover:shadow-lg transition-all group shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 bg-bg-page rounded-2xl group-hover:bg-brand-primary/10 transition-all">
                                        <Icon className="w-5 h-5 text-text-muted group-hover:text-brand-primary" />
                                    </div>
                                    <span className="text-[10px] text-text-muted font-mono font-black group-hover:text-brand-primary transition-colors uppercase tracking-widest">{tag}</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-black uppercase tracking-tight text-lg text-text-main group-hover:text-brand-primary transition-colors">{title}</h3>
                                    <p className="text-xs text-text-muted font-light leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mixer Section */}
                <div className="space-y-8 relative">
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
                    <div className="flex items-center gap-4 border-b border-border-subtle pb-4">
                        <RefreshCw className="w-5 h-5 text-brand-primary" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted">Transaction Obfuscation Module</h2>
                    </div>
                    <MixerComponent />
                </div>

                {/* Done CTA */}
                <div className="text-center bg-white border border-border-subtle rounded-[4rem] p-16 space-y-8 relative overflow-hidden group shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto border border-brand-accent/20">
                        <CheckCircle2 className="w-10 h-10 text-brand-accent" />
                    </div>
                    <div className="space-y-3 relative z-10">
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-text-main">Protocol Complete?</h3>
                        <p className="text-text-muted max-w-sm mx-auto text-sm font-normal">
                            Ensure your burner wallet is funded and disconnected from any traceable source before proceeding to the archive.
                        </p>
                    </div>
                    <Link href="/submit" className="relative z-10 inline-block">
                        <button className="bg-brand-primary text-white hover:bg-brand-secondary px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all shadow-lg hover:shadow-xl">
                            Enter Secure Portal
                            <ArrowRight className="inline-block w-4 h-4 ml-3" />
                        </button>
                    </Link>
                </div>

                {/* Scientific Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-10 rounded-3xl bg-white border border-border-subtle space-y-4 hover:shadow-lg hover:border-brand-primary/20 transition-all shadow-sm">
                        <Activity className="w-8 h-8 text-brand-primary/50" />
                        <h3 className="text-xl font-bold uppercase tracking-tight text-text-main">Computational Privacy</h3>
                        <p className="text-xs text-text-muted font-light leading-relaxed">The link between deposit and withdrawal is mathematically severed using POSEIDON hashes and zk-SNARKs.</p>
                    </div>
                    <div className="p-10 rounded-3xl bg-white border border-border-subtle space-y-4 hover:shadow-lg hover:border-brand-primary/20 transition-all shadow-sm">
                        <Shield className="w-8 h-8 text-brand-primary/50" />
                        <h3 className="text-xl font-bold uppercase tracking-tight text-text-main">Trustless Escrow</h3>
                        <p className="text-xs text-text-muted font-light leading-relaxed">No human intervention. The vault is an autonomous on-chain engine governed by CivicChain protocols.</p>
                    </div>
                    <div className="p-10 rounded-3xl bg-white border border-border-subtle space-y-4 hover:shadow-lg hover:border-brand-primary/20 transition-all shadow-sm">
                        <Lock className="w-8 h-8 text-brand-primary/50" />
                        <h3 className="text-xl font-bold uppercase tracking-tight text-text-main">ZK-Anonymity</h3>
                        <p className="text-xs text-text-muted font-light leading-relaxed">Proof generated in-browser (~8 seconds) ensures your identity never touches the decentralized network logs.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
