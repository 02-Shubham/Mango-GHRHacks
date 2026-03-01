'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Lock, ArrowDownToLine, ArrowUpFromLine,
    CheckCircle2, AlertTriangle, Download, Copy,
    RefreshCw, Info, Zap, Users, Eye, EyeOff, ChevronRight, Activity, Hash
} from 'lucide-react';
import Link from 'next/link';
import { useShadowVault, useAnonymitySet, type ProofStatus } from '@/hooks/useShadowVault';

// ── Proof status label ────────────────────────────────────────────────────────
function ProofStatusLabel({ status }: { status: ProofStatus }) {
    const config: Record<ProofStatus, { label: string; color: string }> = {
        idle: { label: '', color: '' },
        'computing-commitment': { label: 'Computing POSEIDON commitment...', color: 'text-brand-primary' },
        'generating-proof': { label: 'Generating GROTH16 ZK proof...', color: 'text-amber-500' },
        'awaiting-wallet': { label: 'Awaiting signature...', color: 'text-brand-primary' },
        confirming: { label: 'Syncing to CivicChain...', color: 'text-brand-primary' },
        done: { label: 'Transaction Finalized', color: 'text-brand-accent' },
        error: { label: 'Protocol Error', color: 'text-red-500' },
    };
    const { label, color } = config[status];
    if (!label) return null;
    return (
        <p className={`text-[10px] text-center font-mono mt-4 uppercase tracking-[0.2em] font-black animate-pulse ${color}`}>
            {label}
        </p>
    );
}

// ── Anonymity set badge ───────────────────────────────────────────────────────
function AnonymityBadge() {
    const { size } = useAnonymitySet();
    const level = size >= 20 ? 'High' : size >= 5 ? 'Medium' : 'Low';
    const color = size >= 20 ? 'text-brand-accent border-brand-accent/30 bg-brand-accent/10'
        : size >= 5 ? 'text-amber-500 border-amber-500/30 bg-amber-500/10'
            : 'text-red-500 border-red-500/30 bg-red-500/10';
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${color}`}>
            <Users className="w-3 h-3" />
            {size} DEPOSITS · MIX_LEVEL: {level}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export const MixerComponent = () => {
    const [page, setPage] = useState<'deposit' | 'withdraw'>('deposit');
    const [note, setNote] = useState<string>('');
    const [recipient, setRecipient] = useState<string>('');
    const [step, setStep] = useState(1);
    const [noteVisible, setNoteVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const {
        isLoading, isPending, isConfirming, isSuccess, error,
        hash, proofStatus, generateSecretNote, deposit, withdraw,
    } = useShadowVault();

    // Advance step on success
    React.useEffect(() => {
        if (isSuccess) {
            setStep(page === 'deposit' ? 4 : 2);
        }
    }, [isSuccess, page]);

    const handleGenerateNote = () => {
        const newNote = generateSecretNote();
        setNote(newNote);
        setStep(2);
    };

    const downloadNote = () => {
        const el = document.createElement('a');
        el.href = URL.createObjectURL(new Blob([note], { type: 'text/plain' }));
        el.download = 'shadow-vault-secret.txt';
        document.body.appendChild(el);
        el.click();
        document.body.removeChild(el);
        setStep(3);
    };

    const copyNote = () => {
        navigator.clipboard.writeText(note);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDeposit = async () => {
        try { await deposit(note); } catch { }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        try { await withdraw(note, recipient); } catch { }
    };

    const resetPage = (p: 'deposit' | 'withdraw') => {
        setPage(p); setStep(1); setNote(''); setRecipient('');
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white border border-border-subtle rounded-3xl overflow-hidden shadow-xl relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />

            {/* ── Tabs ──────────────────────────────────────────────────────────── */}
            <div className="flex bg-bg-page border-b border-border-subtle p-2 gap-2">
                {(['deposit', 'withdraw'] as const).map((p) => (
                    <button
                        key={p}
                        onClick={() => resetPage(p)}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all
              ${page === p ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'text-text-muted hover:text-text-main'}`}
                    >
                        {p === 'deposit' ? <ArrowDownToLine className="w-4 h-4" /> : <ArrowUpFromLine className="w-4 h-4" />}
                        {p}
                    </button>
                ))}
            </div>

            {/* ── Anonymity Set Info ────────────────────────────────────────────── */}
            <div className="px-10 pt-8 flex items-center justify-between">
                <AnonymityBadge />
                <span className="text-[10px] text-text-muted font-mono font-black uppercase tracking-widest">0.1 ETH Fixed Payload</span>
            </div>

            <div className="p-10 space-y-6 min-h-[500px]">

                {/* ══════════════ DEPOSIT FLOW ══════════════ */}
                <AnimatePresence mode="wait">
                    {page === 'deposit' && (
                        <motion.div key="deposit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                            {/* Step 1 — Generate Note */}
                            {step === 1 && (
                                <div className="space-y-8 text-center py-4">
                                    <div className="bg-brand-primary/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto border border-brand-primary/20">
                                        <Shield className="w-12 h-12 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tighter text-text-main uppercase mb-3">Privacy Handshake</h3>
                                        <p className="text-text-muted text-sm font-normal leading-relaxed max-w-sm mx-auto">
                                            Sever the link between your identity and your testimony.
                                            Initialize the Zero-Knowledge commitment loop.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        {['GEN_SECRET', 'SAFE_BACKUP', 'COMMIT_VAULT'].map((s, i) => (
                                            <div key={i} className="bg-bg-page rounded-2xl p-4 border border-border-subtle">
                                                <div className="text-brand-primary font-black font-mono text-sm mb-1">{i + 1}</div>
                                                <div className="text-[8px] font-mono text-text-muted uppercase tracking-widest">{s}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleGenerateNote}
                                        className="w-full bg-brand-primary text-white py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-secondary transition-all shadow-lg"
                                    >
                                        Initialize Secret Protocol
                                    </button>
                                </div>
                            )}

                            {/* Step 2 — Save Note */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4 text-amber-600 text-[10px] font-mono uppercase tracking-widest font-black leading-relaxed">
                                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p>Critical Warning: This secret note is your only access key. Verification is absolute — loss is irreversible.</p>
                                    </div>

                                    <div className="bg-bg-page border border-border-subtle p-8 rounded-2xl space-y-6">
                                        <div className="flex items-center justify-between mb-1 px-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted flex items-center gap-2">
                                                <Hash className="w-3 h-3 text-brand-primary" /> SECRET_PROTOCOL_KEY
                                            </span>
                                            <button onClick={() => setNoteVisible(v => !v)} className="text-text-muted hover:text-brand-primary transition-colors">
                                                {noteVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="font-mono text-xs break-all bg-white p-6 rounded-2xl text-brand-primary border border-brand-primary/10 leading-loose select-all font-bold">
                                            {noteVisible ? note : note.replace(/./g, '•')}
                                        </div>
                                        <div className="flex gap-4">
                                            <button onClick={downloadNote} className="flex-1 bg-brand-primary text-white py-4 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-brand-secondary transition-all">
                                                <Download className="w-4 h-4" /> Download Key
                                            </button>
                                            <button onClick={copyNote} className="flex-1 bg-white border border-border-subtle hover:bg-bg-page text-text-muted py-4 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all">
                                                <Copy className="w-4 h-4" /> {copied ? 'Anchored!' : 'Copy Key'}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(3)}
                                        className="w-full flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-brand-primary py-2 transition-all"
                                    >
                                        Keys Secured Offline <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Step 3 — Commit */}
                            {step === 3 && (
                                <div className="space-y-8 text-center py-6">
                                    <div className="bg-brand-primary/5 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto border border-brand-primary/10 animate-pulse">
                                        <Lock className="w-12 h-12 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter text-text-main mb-2 leading-none">Execute Commit</h3>
                                        <p className="text-text-muted text-sm font-normal leading-relaxed max-w-sm mx-auto">
                                            Computing POSEIDON hash locally... Your secret node stays in memory.
                                        </p>
                                    </div>
                                    <div className="bg-bg-page border border-border-subtle rounded-2xl p-5 flex items-start gap-4 text-left">
                                        <Zap className="w-5 h-5 text-brand-primary mt-0.5 shrink-0" />
                                        <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest leading-normal">
                                            Protocol Status: <span className="text-brand-primary">ZERO_LEAK_VERIFIED</span>. No data sent to centralized servers.
                                        </p>
                                    </div>
                                    <button
                                        disabled={isLoading}
                                        onClick={handleDeposit}
                                        className="w-full bg-brand-primary text-white py-6 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-brand-secondary transition-all shadow-lg disabled:opacity-40 flex items-center justify-center gap-4"
                                    >
                                        {isLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                        {isLoading ? 'SYNCING...' : 'COMMIT TO VAULT'}
                                    </button>
                                    <ProofStatusLabel status={proofStatus} />
                                </div>
                            )}

                            {/* Step 4 — Success */}
                            {step === 4 && (
                                <div className="space-y-6 text-center py-6">
                                    <div className="bg-brand-accent w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                                        <CheckCircle2 className="w-12 h-12 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter text-text-main mb-2 leading-none">Vault Synchronized</h3>
                                        <p className="text-text-muted text-sm font-normal">Payload successfully mixed within the anonymity pool.</p>
                                    </div>
                                    {hash && (
                                        <div className="bg-bg-page p-6 rounded-2xl border border-border-subtle text-left border-l-4 border-l-brand-primary">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Blockchain Registry Root</p>
                                            <p className="font-mono text-[10px] text-brand-primary break-all tracking-tight font-bold">{hash}</p>
                                        </div>
                                    )}
                                    <div className="bg-brand-primary/5 border border-brand-primary/20 p-5 rounded-2xl text-left flex gap-4">
                                        <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest leading-relaxed">
                                            <strong>Deployment Tip:</strong> Wait for peak network activity before withdrawal to maximize forensic difficulty.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => resetPage('withdraw')}
                                        className="w-full border border-brand-primary/30 text-brand-primary py-4 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-primary/5 transition-all font-mono"
                                    >
                                        Shift to Exit Protocol →
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ══════════════ WITHDRAW FLOW ══════════════ */}
                    {page === 'withdraw' && (
                        <motion.div key="withdraw" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <form onSubmit={handleWithdraw} className="space-y-8">

                                {step === 1 && (
                                    <>
                                        <div className="text-center">
                                            <h3 className="text-3xl font-black uppercase tracking-tighter text-text-main mb-3">Exit Protocol</h3>
                                            <p className="text-text-muted text-sm font-normal max-w-sm mx-auto leading-relaxed">
                                                Generating a GROTH16 ZK proof... No on-chain link to your origin wallet will exist.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted px-2 block">SECRET_PROTOCOL_KEY</label>
                                                <textarea
                                                    required
                                                    className="w-full bg-bg-page border border-border-subtle p-6 rounded-2xl text-[10px] font-mono text-brand-primary focus:outline-none focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 transition-all h-24 resize-none"
                                                    placeholder="shadow-vault-0x…"
                                                    value={note}
                                                    onChange={(e) => setNote(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted px-2 block">EXIT_PAYLOAD_RECIPIENT (BURNER)</label>
                                                <input
                                                    required
                                                    type="text"
                                                    className="w-full bg-bg-page border border-border-subtle p-6 rounded-2xl text-[10px] font-mono text-text-main focus:outline-none focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 transition-all"
                                                    placeholder="0x… (Fresh Target)"
                                                    value={recipient}
                                                    onChange={(e) => setRecipient(e.target.value)}
                                                />
                                            </div>

                                            <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-2xl p-5 flex gap-4">
                                                <Zap className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                                                <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest leading-relaxed">
                                                    Local computation of <strong className="text-text-main">ZK_GROTH16</strong> initiated.
                                                    Elapsed time: 3-8 seconds... Identity remains obfuscated.
                                                </p>
                                            </div>

                                            <button
                                                disabled={isLoading}
                                                type="submit"
                                                className="w-full bg-brand-primary text-white py-6 rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-brand-secondary transition-all shadow-lg disabled:opacity-40 flex items-center justify-center gap-4"
                                            >
                                                {isLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                                {isLoading ? 'PROCESSING PROOF...' : 'GENERATE ZK PROOF & EXIT'}
                                            </button>
                                            <ProofStatusLabel status={proofStatus} />
                                        </div>
                                    </>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8 text-center py-6">
                                        <div className="bg-brand-accent w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                                            <CheckCircle2 className="w-12 h-12 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black uppercase tracking-tighter text-text-main mb-2 leading-none">Exit Finalized</h3>
                                            <p className="text-text-muted text-sm font-normal">Target wallet successfully funded via ZK proofs.</p>
                                        </div>
                                        {hash && (
                                            <div className="bg-bg-page p-6 rounded-2xl border border-border-subtle text-left border-l-4 border-l-brand-primary">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Exfiltration Entry</p>
                                                <p className="font-mono text-[10px] text-brand-primary break-all tracking-tight font-bold">{hash}</p>
                                            </div>
                                        )}
                                        <div className="bg-brand-accent/5 border border-brand-accent/20 p-6 rounded-2xl text-left flex gap-4">
                                            <CheckCircle2 className="w-6 h-6 text-brand-accent shrink-0" />
                                            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest leading-relaxed">
                                                Anonymity tunnel closed. Your fresh identity is now fueled and ready for report submission. Proceed to secure portal.
                                            </p>
                                        </div>
                                        <Link href="/submit" className="block w-full">
                                            <button className="w-full bg-brand-primary text-white py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] font-mono hover:bg-brand-secondary transition-all shadow-lg">
                                                Go to Submission →
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Error banner ──────────────────────────────────────────────────── */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden px-10 pb-10"
                    >
                        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex gap-4 text-red-500 text-[10px] font-mono uppercase tracking-widest font-black">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
