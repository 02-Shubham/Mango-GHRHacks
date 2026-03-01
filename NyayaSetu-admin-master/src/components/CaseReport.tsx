"use client";

import { motion } from "framer-motion";
import { 
    Shield, CheckCircle2, Activity, ExternalLink, 
    FileText, Hash, Scale, Clock, Globe, Briefcase,
    AlertCircle, Bookmark, Share2, Scan, Brain, Zap
} from "lucide-react";
import { format } from "date-fns";
import { DemoCase } from "@/data/demo-cases";
import { CaseRecord } from "@/hooks/useCases";

interface CaseReportProps {
    record: DemoCase | CaseRecord;
    bannerImage?: string;
}

export function CaseReport({ record, bannerImage = "" }: CaseReportProps) {
    const isDemo = 'story' in record;
    
    const story = isDemo ? (record as DemoCase).story : {
        intro: "Blockchain-verified authentic public record.",
        body: record.title || "No detailed description available for this on-chain record.",
        conclusion: `Resolved by ${record.department}.`
    };
    
    const description = isDemo ? (record as DemoCase).description : "Official record securely anchored to the decentralized ledger.";
    const outcome = isDemo ? (record as DemoCase).outcome : "Verified resolution completed securely on-chain.";
    const fileHash = 'fileHash' in record ? record.fileHash : "0x" + "0".repeat(60);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Admin Header with Meta Info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            RESOLVED_CASE_FILE
                        </span>
                        <span className="text-text-muted font-mono text-[10px] uppercase tracking-widest font-bold">
                            #DOCKET_{record.id}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tight leading-tight uppercase">
                        {record.title}
                    </h1>
                </div>
                
                <div className="bg-brand-accent/10 border border-brand-accent/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-accent shadow-sm" />
                    <span className="text-sm font-bold text-brand-accent uppercase tracking-wider">Verified Resolution</span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Visual & Core Stats */}
                    <div className="document-card overflow-hidden bg-white shadow-2xl">
                        <div className="h-64 relative">
                            <img 
                                src={bannerImage} 
                                alt="" 
                                className="w-full h-full object-cover opacity-10 hover:opacity-20 transition-opacity duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Department</div>
                                        <div className="text-text-main font-bold flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-brand-primary" /> {record.department}
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-border-subtle" />
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Resolved Date</div>
                                        <div className="text-text-main font-bold flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-text-muted" /> {format(record.timestamp, 'MMM dd, yyyy')}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-border-subtle font-bold">
                                    IMG_REF_{record.id}_SYH
                                </div>
                            </div>
                        </div>

                        <div className="p-10 space-y-10">
                            {/* Summary & Description */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-border-subtle">
                                    <FileText className="w-4 h-4" /> Investigative Case Brief
                                </h3>
                                <p className="text-2xl font-normal text-text-main leading-tight italic opacity-90">
                                    "{story.intro}"
                                </p>
                                <div className="text-text-muted leading-relaxed font-normal space-y-4 text-lg">
                                    <p>{description}</p>
                                    <p>{story.body}</p>
                                </div>
                            </div>

                            {/* Verdict Section */}
                            <div className="p-8 rounded-4xl bg-brand-primary/5 border border-brand-primary/10 relative overflow-hidden group shadow-inner">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                    <Scale className="w-24 h-24 text-brand-primary" />
                                </div>
                                <h4 className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-4">Final Administrative Verdict</h4>
                                <p className="text-xl font-bold text-text-main mb-4">{outcome}</p>
                                <p className="text-sm text-text-muted font-normal leading-relaxed">{story.conclusion}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Dossier */}
                <div className="space-y-8">
                    {/* Technical Records */}
                    <div className="document-card p-8 space-y-8 bg-white shadow-xl">
                        <h3 className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-border-subtle">
                            <Activity className="w-4 h-4 text-brand-primary" /> Immutable Records
                        </h3>
                        
                        <div className="space-y-8">
                             {[
                                { label: "Metadata CID", value: record.metadataCID, icon: Globe },
                                { label: "Evidence Hash", value: fileHash, icon: Hash },
                                { label: "Registry TXN", value: `TXN_REF_${record.id.toString(16).toUpperCase()}`, icon: Scan }
                            ].map((item, i) => (
                                <div key={i} className="group cursor-help">
                                    <label className="text-[10px] font-mono text-text-muted mb-2 uppercase tracking-tighter flex items-center gap-2 font-bold">
                                        <item.icon className="w-3.5 h-3.5" /> {item.label}
                                    </label>
                                    <div className="text-[10px] font-mono text-text-muted break-all leading-relaxed group-hover:text-brand-primary transition-colors border-l-2 border-border-subtle pl-4 py-1 font-bold">
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full flex items-center justify-center gap-3 py-4 bg-bg-page border border-border-subtle rounded-xl text-[10px] font-black uppercase tracking-widest text-text-main hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                            <ExternalLink className="w-4 h-4" /> View On IPFS Gateway
                        </button>
                    </div>

                    {/* AI Analysis Summary */}
                    <div className="document-card p-8 bg-brand-primary/5 border border-brand-primary/10 relative overflow-hidden group shadow-lg">
                        <div className="absolute inset-0 bg-linear-to-br from-brand-primary/5 to-transparent pointer-events-none" />
                        <h3 className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Brain className="w-4 h-4" /> AI Intel Post-Analysis
                        </h3>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] text-text-muted uppercase font-mono font-bold">Confidence Level</span>
                            <span className="text-sm font-bold text-brand-primary">98.4%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-6 shadow-inner">
                            <div className="h-full w-[98.4%] bg-brand-primary" />
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed italic font-medium">
                            "Automated forensic scan confirms the integrity of the evidence chain. Zero-knowledge proofs successfully verified the whistleblower identity within the target department."
                        </p>
                    </div>

                    {/* Resolution Footer */}
                    <div className="p-8 bg-brand-accent/5 border border-brand-accent/10 rounded-3xl text-center shadow-inner">
                        <div className="inline-flex p-3 bg-brand-accent/10 rounded-xl mb-4 text-brand-accent">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <h4 className="text-sm font-bold text-text-main uppercase tracking-tighter mb-2">Case Permanently Sealed</h4>
                        <p className="text-[10px] text-text-muted font-mono uppercase font-bold">Reference: #NS-RESOLVE-{record.id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
