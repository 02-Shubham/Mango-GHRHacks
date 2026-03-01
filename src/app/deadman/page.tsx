"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Timer, Shield, AlertTriangle, CheckCircle2, Loader2, Clock,
    Plus, X, ArrowLeft, Lock, Unlock, RefreshCw, Flame, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { useDeadManSwitch, useSwitchCount, type DeadManEntry } from "@/hooks/useDeadManSwitch";
import { Navbar } from "@/components/Navbar";

// ── Countdown display ─────────────────────────────────────────────────────────
function Countdown({ releaseAt }: { releaseAt: number }) {
    const [remaining, setRemaining] = useState(releaseAt * 1000 - Date.now());

    useEffect(() => {
        const t = setInterval(() => setRemaining(releaseAt * 1000 - Date.now()), 1000);
        return () => clearInterval(t);
    }, [releaseAt]);

    if (remaining <= 0) return <span className="text-red-500 font-bold animate-pulse">TRIGGERED</span>;

    const d = Math.floor(remaining / 86400000);
    const h = Math.floor((remaining % 86400000) / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);

    const urgency = d < 3 ? "text-red-500" : d < 14 ? "text-amber-500" : "text-brand-accent";

    return (
        <span className={`font-mono text-sm font-bold ${urgency}`}>
            {d}d {h}h {m}m {s}s
        </span>
    );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ entry }: { entry: DeadManEntry }) {
    if (entry.cancelled) return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-muted border border-border-subtle">Cancelled</span>
    );
    if (entry.triggered) return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200 animate-pulse">🔓 Released</span>
    );
    if (Date.now() / 1000 >= entry.releaseAt) return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-500 border border-amber-200">⚡ Triggerable</span>
    );
    return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent border border-brand-accent/20">🔒 Armed</span>
    );
}

// ── Switch card ───────────────────────────────────────────────────────────────
function SwitchCard({
    entry, onCancel, onExtend, onReleaseNow, isLoading
}: {
    entry: DeadManEntry;
    onCancel: (id: number) => void;
    onExtend: (id: number) => void;
    onReleaseNow: (id: number) => void;
    isLoading: boolean;
}) {
    const [showKey, setShowKey] = useState(false);
    const isPast = Date.now() / 1000 >= entry.releaseAt;
    const isActive = !entry.cancelled && !entry.triggered;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border rounded-2xl p-6 space-y-4 shadow-sm ${entry.triggered ? "border-red-200" :
                entry.cancelled ? "border-border-subtle" :
                    isPast ? "border-amber-300 shadow-amber-100/50" :
                        "border-brand-primary/20"
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-text-muted">#{entry.id}</span>
                        <StatusBadge entry={entry} />
                    </div>
                    <p className="text-text-main font-medium text-sm truncate">{entry.evidenceCID}</p>
                    {entry.publicMessage && (
                        <p className="text-text-muted text-xs mt-1 italic">"{entry.publicMessage}"</p>
                    )}
                </div>
                <div className="text-right shrink-0">
                    <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Time until release</p>
                    {isActive ? <Countdown releaseAt={entry.releaseAt} /> : (
                        <span className="text-text-muted text-xs font-mono">
                            {new Date(entry.releaseAt * 1000).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Key reveal (only after trigger) */}
            {entry.triggered && entry.plaintextKeyHex && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Decryption Key Released On-Chain</span>
                        <button onClick={() => setShowKey(v => !v)} className="text-text-muted hover:text-text-main">
                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className={`font-mono text-xs break-all ${showKey ? "text-red-500" : "text-transparent select-none bg-red-100 rounded"}`}>
                        {entry.plaintextKeyHex}
                    </p>
                </div>
            )}

            {/* Actions */}
            {isActive && !isPast && (
                <div className="flex gap-2 pt-2">
                    <button
                        disabled={isLoading}
                        onClick={() => onExtend(entry.id)}
                        className="flex-1 bg-bg-page hover:bg-border-subtle text-text-main text-xs py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 border border-border-subtle"
                    >
                        <RefreshCw className="w-3 h-3" /> Extend
                    </button>
                    <button
                        disabled={isLoading}
                        onClick={() => onReleaseNow(entry.id)}
                        className="flex-1 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5"
                    >
                        <Unlock className="w-3 h-3" /> Release Now
                    </button>
                    <button
                        disabled={isLoading}
                        onClick={() => onCancel(entry.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 text-xs py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5"
                    >
                        <X className="w-3 h-3" /> Cancel
                    </button>
                </div>
            )}
        </motion.div>
    );
}

// ── Register form ─────────────────────────────────────────────────────────────
function RegisterForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const { register, isLoading, isSuccess, error } = useDeadManSwitch();
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [releaseDate, setReleaseDate] = useState("");
    const [step, setStep] = useState<"idle" | "encrypting" | "uploading" | "registering">("idle");
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => { if (isSuccess) { onSuccess(); onClose(); } }, [isSuccess]);

    // Min date: tomorrow
    const minDate = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file || !releaseDate) return;
        setLocalError(null);

        try {
            setStep("encrypting");
            const { encryptFile } = await import("@/lib/browser-crypto");
            const { encryptedBlob, encryptionKeyHex, ivHex } = await encryptFile(file);

            setStep("uploading");
            const fd = new FormData();
            fd.append("file", new File([encryptedBlob], "deadman-evidence.enc"));
            const res = await fetch("/api/ipfs", { method: "POST", body: fd });
            const { ipfsHash } = await res.json();

            // Store encrypted key as "iv:key" — user needs to provide plaintext key when triggering
            const encryptedKeyRecord = `${ivHex}:${encryptionKeyHex}`;

            setStep("registering");
            const releaseDateObj = new Date(releaseDate + "T00:00:00.000Z");
            await register(ipfsHash, encryptedKeyRecord, releaseDateObj, message);
        } catch (err: any) {
            setLocalError(err.message || "Failed");
            setStep("idle");
        }
    };

    const stepLabel = {
        idle: null,
        encrypting: "Encrypting evidence locally...",
        uploading: "Uploading to IPFS...",
        registering: "Registering on blockchain...",
    }[step];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white border border-border-subtle rounded-2xl p-8 w-full max-w-lg shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-primary/10 rounded-xl">
                            <Timer className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-text-main">Arm Dead Man's Switch</h2>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main"><X className="w-5 h-5" /></button>
                </div>

                {(localError || error) && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-500 text-sm flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        {localError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Evidence file */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Evidence File</label>
                        <div className="relative border-2 border-dashed border-border-subtle rounded-xl p-6 hover:border-brand-primary/40 text-center bg-bg-page transition-colors">
                            <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} />
                            <Lock className="w-5 h-5 text-brand-primary mx-auto mb-2" />
                            <p className="text-sm text-text-main">{file ? file.name : "Choose file to encrypt & lock"}</p>
                            <p className="text-xs text-text-muted mt-1">Encrypted AES-256 in browser before upload</p>
                        </div>
                    </div>

                    {/* Release date */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Auto-Release Date</label>
                        <input
                            type="date"
                            required
                            min={minDate}
                            value={releaseDate}
                            onChange={e => setReleaseDate(e.target.value)}
                            className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-3 text-text-main focus:border-brand-primary/50 focus:outline-none focus:ring-4 focus:ring-brand-primary/5"
                        />
                        <p className="text-xs text-text-muted mt-1">Evidence releases publicly on this date unless you cancel</p>
                    </div>

                    {/* Public message */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                            Public Statement <span className="text-text-muted/60 normal-case font-normal">(optional)</span>
                        </label>
                        <textarea
                            rows={3}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Statement released alongside the evidence if triggered..."
                            className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-3 text-text-main text-sm focus:border-brand-primary/50 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 resize-none"
                        />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-amber-600 text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>Keep your decryption key safe — you'll need it to voluntarily release or trigger the switch. The encrypted version is stored on-chain.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || step !== "idle"}
                        className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:bg-brand-secondary transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
                    >
                        {(isLoading || step !== "idle") ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> {stepLabel || "Processing..."}</>
                        ) : (
                            <><Timer className="w-4 h-4" /> Arm the Switch</>
                        )}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DeadManPage() {
    const { address, isConnected } = useAccount();
    const { cancel, extend, releaseNow, isLoading, fetchMySwitches } = useDeadManSwitch();
    const totalCount = useSwitchCount();

    const [switches, setSwitches] = useState<DeadManEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [extendId, setExtendId] = useState<number | null>(null);
    const [extendDate, setExtendDate] = useState("");

    const refresh = useCallback(async () => {
        setLoading(true);
        const data = await fetchMySwitches();
        setSwitches(data);
        setLoading(false);
    }, [fetchMySwitches]);

    useEffect(() => { if (isConnected) refresh(); }, [isConnected, refresh]);

    const handleCancel = async (id: number) => {
        if (!confirm("Cancel this switch? This is irreversible.")) return;
        await cancel(id);
        refresh();
    };

    const handleExtend = (id: number) => { setExtendId(id); setExtendDate(""); };

    const handleExtendSubmit = async () => {
        if (extendId === null || !extendDate) return;
        await extend(extendId, new Date(extendDate + "T00:00:00.000Z"));
        setExtendId(null);
        refresh();
    };

    const handleReleaseNow = async (id: number) => {
        const key = prompt("Enter your plaintext decryption key (from your saved note):");
        if (!key) return;
        await releaseNow(id, key);
        refresh();
    };

    const armed = switches.filter(s => !s.cancelled && !s.triggered && Date.now() / 1000 < s.releaseAt);
    const triggered = switches.filter(s => s.triggered);
    const inactive = switches.filter(s => s.cancelled || (Date.now() / 1000 >= s.releaseAt && !s.triggered));

    return (
        <main className="min-h-screen bg-bg-page relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 opacity-30" />

            <Navbar />

            <div className="w-full max-w-4xl mx-auto relative z-10 px-6 pt-32 pb-20">
                {/* Header */}
                <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary transition-colors mb-8 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-border-subtle pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-brand-primary/10 rounded-xl">
                                <Timer className="w-6 h-6 text-brand-primary" />
                            </div>
                            <h1 className="text-3xl font-black text-text-main uppercase tracking-tight">Dead Man's Switch</h1>
                        </div>
                        <p className="text-text-muted font-normal max-w-xl leading-relaxed">
                            Encrypt evidence now. Set a release date. If you're silenced before then, the truth releases automatically — no one can stop it.
                        </p>
                    </div>
                    {isConnected && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-brand-secondary shadow-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Arm New Switch
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {[
                        { label: "Total Network Switches", value: totalCount, color: "text-text-main" },
                        { label: "Your Armed Switches", value: armed.length, color: "text-brand-accent" },
                        { label: "Triggered (Released)", value: triggered.length, color: "text-red-500" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white border border-border-subtle rounded-xl p-5 shadow-sm">
                            <p className="text-xs text-text-muted mb-1">{label}</p>
                            <p className={`text-3xl font-bold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Explainer */}
                <div className="bg-white border border-brand-primary/10 rounded-2xl p-6 mb-8 flex gap-4 shadow-sm">
                    <Shield className="w-6 h-6 text-brand-primary shrink-0 mt-0.5" />
                    <div className="space-y-1 text-sm text-text-muted">
                        <p><span className="text-text-main font-medium">How it works:</span> Register evidence with a release date. Evidence is AES-256 encrypted and stored on IPFS. Only the commitment is on-chain.</p>
                        <p>If you're safe → come back and <span className="text-brand-primary font-medium">cancel or extend</span> before the date. If you're silenced → the chain automatically enables public release of the decryption key after the deadline.</p>
                    </div>
                </div>

                {/* Content */}
                {!isConnected ? (
                    <div className="bg-white border border-border-subtle rounded-2xl p-12 text-center shadow-sm">
                        <Timer className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-text-main mb-2">Connect Your Wallet</h3>
                        <p className="text-text-muted text-sm mb-6">Connect to view and manage your dead man's switches.</p>
                        <ConnectButton />
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                    </div>
                ) : switches.length === 0 ? (
                    <div className="bg-white border border-dashed border-border-subtle rounded-2xl p-12 text-center shadow-sm">
                        <Flame className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
                        <p className="text-text-muted text-sm">No switches registered yet.</p>
                        <button onClick={() => setShowForm(true)} className="mt-4 text-brand-primary text-sm hover:underline font-medium">
                            + Arm your first switch
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {armed.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-brand-accent" /> Armed ({armed.length})
                                </h2>
                                <div className="space-y-4">
                                    {armed.map(e => (
                                        <SwitchCard key={e.id} entry={e}
                                            onCancel={handleCancel}
                                            onExtend={handleExtend}
                                            onReleaseNow={handleReleaseNow}
                                            isLoading={isLoading}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {triggered.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-red-500" /> Triggered — Evidence Released ({triggered.length})
                                </h2>
                                <div className="space-y-4">
                                    {triggered.map(e => (
                                        <SwitchCard key={e.id} entry={e} onCancel={() => { }} onExtend={() => { }} onReleaseNow={() => { }} isLoading={false} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {inactive.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-text-muted" /> Inactive ({inactive.length})
                                </h2>
                                <div className="space-y-4">
                                    {inactive.map(e => (
                                        <SwitchCard key={e.id} entry={e} onCancel={() => { }} onExtend={() => { }} onReleaseNow={() => { }} isLoading={false} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Register modal */}
            <AnimatePresence>
                {showForm && (
                    <RegisterForm onClose={() => setShowForm(false)} onSuccess={refresh} />
                )}
            </AnimatePresence>

            {/* Extend modal */}
            <AnimatePresence>
                {extendId !== null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <div className="bg-white border border-border-subtle rounded-2xl p-8 w-full max-w-sm shadow-2xl">
                            <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-brand-primary" /> Extend Switch #{extendId}
                            </h3>
                            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">New Release Date</label>
                            <input type="date" value={extendDate} onChange={e => setExtendDate(e.target.value)}
                                className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-3 text-text-main mb-5 focus:border-brand-primary/50 focus:outline-none focus:ring-4 focus:ring-brand-primary/5"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setExtendId(null)} className="flex-1 bg-bg-page text-text-muted py-3 rounded-xl text-sm font-semibold hover:bg-border-subtle transition-all border border-border-subtle">Cancel</button>
                                <button onClick={handleExtendSubmit} disabled={!extendDate || isLoading}
                                    className="flex-1 bg-brand-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-brand-secondary transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4" /> Extend</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
