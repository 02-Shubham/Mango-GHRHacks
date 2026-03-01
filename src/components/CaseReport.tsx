"use client";

import { motion } from "framer-motion";
import { 
    Shield, CheckCircle2, Activity, ExternalLink, 
    FileText, Hash, Scale, Clock, Globe, Briefcase,
    AlertCircle, Bookmark, Share2
} from "lucide-react";
import { format } from "date-fns";
import { DemoCase } from "@/data/demo-cases";

interface CaseReportProps {
    record: DemoCase;
    bannerImage: string;
}

export function CaseReport({ record, bannerImage }: CaseReportProps) {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Report Header Card */}
            <div className="relative group overflow-hidden rounded-[3rem] border border-border-subtle bg-white p-1 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent opacity-50" />
                
                <div className="relative p-10 md:p-16 flex flex-col lg:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-8">
                        <div className="flex items-center gap-4">
                            <span className="px-4 py-1.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                                OFFICIAL_FINAL_REPORT
                            </span>
                            <div className="h-px w-12 bg-border-subtle" />
                            <span className="text-text-muted font-mono text-[10px] uppercase tracking-widest font-bold">
                                DOCKET: #{record.id.toString().padStart(6, '0')}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-black text-text-main tracking-tight leading-none uppercase">
                            {record.title}
                        </h1>

                        <p className="text-xl text-text-muted font-normal leading-relaxed max-w-2xl">
                            {record.summary}
                        </p>

                        <div className="flex flex-wrap gap-8 pt-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">Executive Dept</label>
                                <div className="text-sm font-bold text-text-main flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-brand-primary" />
                                    {record.department}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">Ledger Date</label>
                                <div className="text-sm font-bold text-text-main flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-text-muted" />
                                    {format(record.timestamp, 'MMMM dd, yyyy')}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">Registry Status</label>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-brand-accent shadow-lg" />
                                    <span className="text-xs font-black text-brand-accent uppercase">VERIFIED_RESOLVED</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 aspect-square rounded-3xl bg-bg-page border border-border-subtle overflow-hidden relative group">
                        <img 
                            src={bannerImage} 
                            alt="Investigation Visual" 
                            className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-700"
                        />
                        <div className="absolute inset-0 bg-linear-to-br from-brand-primary/10 via-transparent to-transparent opacity-50" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="flex items-center justify-between text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">
                                <span>LAYER: 01_VISUAL</span>
                                <Activity className="w-4 h-4 text-brand-primary" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Investigative Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-16">
                    {/* Brief */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tight border-l-4 border-brand-primary pl-6 text-text-main">Investigative Brief</h2>
                            <div className="h-px flex-1 bg-border-subtle" />
                        </div>
                        <div className="space-y-8">
                            <p className="text-3xl font-normal text-text-main leading-snug italic opacity-90">
                                "{record.story.intro}"
                            </p>
                            <div className="prose prose-slate max-w-none text-text-muted text-lg leading-relaxed font-normal space-y-6">
                                <p>{record.description}</p>
                                <p>{record.story.body}</p>
                            </div>
                        </div>
                    </section>

                    {/* Outcome Card */}
                    <section className="bg-white border border-border-subtle rounded-[3rem] p-12 relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Scale className="w-24 h-24 text-brand-primary" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-8">Final Verdict & Outcome</h3>
                        <p className="text-2xl font-bold text-text-main mb-6 leading-tight">
                            {record.outcome}
                        </p>
                        <p className="text-text-muted font-normal leading-relaxed">
                            {record.story.conclusion}
                        </p>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Technical Dossier */}
                    <div className="p-10 bg-white border border-border-subtle rounded-[2.5rem] relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[60px] -mr-16 -mt-16" />
                        
                        <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-10 border-b border-border-subtle pb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Hash className="w-4 h-4" /> Technical Dossier
                            </span>
                            <span className="text-[8px] font-mono opacity-40">SEC_LEVEL: ALPHA</span>
                        </h3>
                        
                        <div className="space-y-10">
                            {[
                                { label: "Metadata CID (IPFS)", value: record.metadataCID, icon: Globe },
                                { label: "Evidence Integrity Hash", value: record.fileHash, icon: FileText },
                                { label: "Blockchain Anchor", value: `TXNID_X_${record.id.toString(16).toUpperCase()}`, icon: Activity }
                            ].map((item, i) => (
                                <div key={i} className="group cursor-help">
                                    <label className="text-[10px] font-mono text-text-muted mb-2 uppercase tracking-tighter flex items-center gap-2 font-bold">
                                        <item.icon className="w-4 h-4 text-brand-primary" /> {item.label}
                                    </label>
                                    <div className="text-[10px] font-mono text-text-muted break-all leading-relaxed group-hover:text-brand-primary transition-colors border-l-2 border-border-subtle pl-4 py-1 font-bold">
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 space-y-3">
                            <button className="w-full flex items-center justify-center gap-3 py-4 bg-bg-page border border-border-subtle rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-main hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                                <ExternalLink className="w-4 h-4" /> Download Raw Proof
                            </button>
                        </div>
                    </div>

                    {/* Verification Badge */}
                    <div className="p-8 bg-brand-primary/5 border border-brand-primary/10 rounded-[2.5rem] text-center shadow-inner">
                        <div className="inline-flex p-4 bg-brand-primary/10 rounded-2xl mb-6">
                            <CheckCircle2 className="w-10 h-10 text-brand-primary" />
                        </div>
                        <h4 className="text-xl font-bold mb-3 uppercase tracking-tighter text-text-main">IMMUTABLE RECORD</h4>
                        <p className="text-[10px] text-text-muted font-mono leading-relaxed uppercase font-bold">
                            This report is cryptographically sealed and cannot be altered by any authority.
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Action Bar */}
            <div className="pt-12 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                   <div className="flex items-center gap-3 text-text-muted hover:text-brand-primary cursor-pointer transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Share Record</span>
                   </div>
                   <div className="flex items-center gap-3 text-text-muted hover:text-brand-primary cursor-pointer transition-colors">
                        <Bookmark className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Save to Archive</span>
                   </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white border border-border-subtle rounded-2xl shadow-sm">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-tighter font-bold">Report a discrepancy in this public record? Contact Registry Admin</span>
                </div>
            </div>
        </div>
    );
}
