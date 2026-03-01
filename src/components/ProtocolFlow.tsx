"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Database, Cloud, Layout, CheckCircle2, ArrowDown, Activity } from "lucide-react";

const steps = [
    {
        id: "ANON",
        title: "Identity Anonymization",
        desc: "Burner identity initialization via ShadowVault ZK-Mixer.",
        icon: Shield,
    },
    {
        id: "ENC",
        title: "Hybrid Encryption",
        desc: "Payload secured locally using AES-256-GCM + Public-Key Handshake.",
        icon: Lock,
    },
    {
        id: "SYNC",
        title: "IPFS Anchoring",
        desc: "Decentralized distribution of encrypted blocks across nodes.",
        icon: Cloud,
    },
    {
        id: "CHAIN",
        title: "Mutable Ledger Proof",
        desc: "Integrity hash anchored to CivicChain for public verification.",
        icon: Activity,
    }
];

export function ProtocolFlow() {
    return (
        <div className="w-full space-y-12">
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[8px] font-black uppercase tracking-[0.3em] rounded">
                        Security Intelligence
                    </span>
                    <span className="text-text-muted text-[8px] font-mono tracking-widest uppercase">Protocol_v4.2</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase text-text-main leading-[0.85]">
                    THE SUBMISSION <br /> <span className="text-text-muted italic">ARCHITECTURE</span>
                </h2>
            </div>

            <div className="relative">
                {/* Connection Line */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-brand-primary/20 via-border-subtle to-transparent" />

                <div className="space-y-12">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                            className="relative flex items-start gap-8 group"
                        >
                            <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border border-border-subtle flex items-center justify-center shrink-0 group-hover:border-brand-primary/40 transition-all duration-500 shadow-sm overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <step.icon className={`w-7 h-7 ${i % 2 === 0 ? "text-brand-primary" : "text-text-muted"} group-hover:scale-110 transition-transform`} />
                            </div>

                            <div className="pt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-mono font-bold text-brand-primary/40">0{i + 1}</span>
                                    <h3 className="text-lg font-black uppercase tracking-tight text-text-main group-hover:text-brand-primary transition-colors">
                                        {step.title}
                                    </h3>
                                </div>
                                <p className="text-xs text-text-muted font-light leading-relaxed max-w-[280px]">
                                    {step.desc}
                                </p>

                                {/* Visual Connector Pulse */}
                                {i < steps.length - 1 && (
                                    <motion.div
                                        animate={{ y: [0, 5, 0], opacity: [0.2, 0.5, 0.2] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="mt-8 ml-1"
                                    >
                                        <ArrowDown className="w-3 h-3 text-brand-primary/20" />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="pt-12 border-t border-border-subtle space-y-8">
                <div className="p-6 bg-white border border-border-subtle rounded-2xl shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 shrink-0" /> Live Network Proofs
                    </h4>
                    <div className="space-y-3">
                        {[
                            { label: "Encryption", status: "AES_256_GCM_READY", primary: true },
                            { label: "IPFS Gateway", status: "DECENTRALIZED_ACTIVE", primary: false },
                            { label: "CivicChain", status: "NODE_STABLE", primary: true }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-text-muted uppercase">{item.label}</span>
                                <span className={`text-[9px] font-mono uppercase font-black tracking-tighter ${item.primary ? "text-brand-primary" : "text-text-main"}`}>{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-[9px] text-text-muted font-mono uppercase leading-relaxed max-w-xs">
                    * All investigative material is encrypted client-side. NyayaSetu operators have NO access to raw evidence payloads.
                </p>
            </div>
        </div>
    );
}
