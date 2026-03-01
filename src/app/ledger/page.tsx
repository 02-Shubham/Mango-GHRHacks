"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import {
    Shield, CheckCircle2, XCircle, Search,
    ArrowUpRight, ExternalLink, Activity, Megaphone,
    AlertTriangle, Clock, FileText, Filter
} from "lucide-react";
import { usePublicClient } from "wagmi";
import { addressConfig } from "@/contracts/addresses";
import CivicChainRegistryABI from '@blockchain/artifacts/contracts/CivicChainRegistry.sol/CivicChainRegistry.json';
import { parseAbiItem } from "viem";
import { format, formatDistanceToNow } from "date-fns";
import { getCaseImage, getSyntheticMetadata } from "@/lib/media";
import Link from "next/link";
import { DEMO_CASES } from "@/data/demo-cases";

const CONTRACT_ADDRESS = addressConfig.CivicChainRegistry as `0x${string}`;

interface LedgerCase {
    id: number;
    department: string;
    metadataCID: string;
    timestamp: number;
    status: number;
    title?: string;
    summary?: string;
    leaked?: boolean;
}

const statusLabels: Record<number, string> = {
    0: "Submitted", 1: "Assigned", 2: "In Progress",
    3: "Escalated", 4: "Resolved", 5: "Rejected", 6: "False Claim"
};
const statusColors: Record<number, string> = {
    0: "bg-blue-500", 1: "bg-indigo-500", 2: "bg-amber-500",
    3: "bg-orange-500", 4: "bg-green-500", 5: "bg-red-500", 6: "bg-gray-500"
};

function getLeakedCases(): number[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('nyayasetu_leaked_cases') || '[]'); } catch { return []; }
}

type TabFilter = "all" | "leaked" | "resolved" | "active";

export default function LedgerPage() {
    const publicClient = usePublicClient();
    const [blockchainCases, setBlockchainCases] = useState<LedgerCase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<TabFilter>("all");
    const [leakedIds, setLeakedIds] = useState<number[]>([]);

    useEffect(() => {
        setLeakedIds(getLeakedCases());
        // Also try fetching from admin panel
        fetch('http://localhost:3001/api/leaked-cases')
            .then(r => r.json())
            .then(data => {
                if (data.leakedIds?.length) {
                    setLeakedIds(prev => [...new Set([...prev, ...data.leakedIds])]);
                }
            })
            .catch(() => { });
    }, []);

    const allCases = useMemo(() => {
        const demoMapped: LedgerCase[] = DEMO_CASES.map(c => ({
            id: c.id, department: c.department, metadataCID: c.metadataCID,
            timestamp: c.timestamp, status: c.status, title: c.title,
            summary: c.summary, leaked: leakedIds.includes(c.id)
        }));
        const uniqueBlockchain = blockchainCases
            .filter(bc => !demoMapped.some(dc => dc.id === bc.id))
            .map(bc => ({ ...bc, leaked: leakedIds.includes(bc.id) }));
        return [...demoMapped, ...uniqueBlockchain].sort((a, b) => b.timestamp - a.timestamp);
    }, [blockchainCases, leakedIds]);

    const fetchAllCases = useCallback(async () => {
        if (!publicClient) return;
        setIsLoading(true);
        try {
            const logs = await publicClient.getLogs({
                address: CONTRACT_ADDRESS,
                event: parseAbiItem('event CaseCreated(uint256 indexed caseId, address indexed creator, string metadataCID, string department)'),
                fromBlock: 0n, toBlock: 'latest'
            });
            const results = await Promise.all(
                logs.map(async (log): Promise<LedgerCase | null> => {
                    try {
                        const args = log.args as any;
                        const caseId = args.caseId;
                        const caseData = await publicClient.readContract({
                            address: CONTRACT_ADDRESS, abi: CivicChainRegistryABI.abi,
                            functionName: 'cases', args: [caseId]
                        }) as any;
                        const status = Number(caseData[5]);
                        const metadataCID = args.metadataCID;
                        const department = args.department;
                        const timestamp = Number(caseData[3]) * 1000;
                        let { title, summary } = getSyntheticMetadata(Number(caseId), department);
                        try {
                            const cleanCID = metadataCID.startsWith('ipfs://') ? metadataCID.slice(7) : metadataCID;
                            if (cleanCID && !cleanCID.includes('test')) {
                                const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cleanCID}`, { signal: (AbortSignal as any).timeout(4000) });
                                if (res.ok) {
                                    const meta = await res.json();
                                    title = meta.title || title;
                                    summary = meta.description || meta.summary || summary;
                                }
                            }
                        } catch { }
                        return { id: Number(caseId), department, metadataCID, timestamp, status, title, summary };
                    } catch { return null; }
                })
            );
            setBlockchainCases(results.filter((c): c is LedgerCase => c !== null));
        } catch (err) {
            console.error("Failed to fetch ledger:", err);
        } finally {
            setIsLoading(false);
        }
    }, [publicClient]);

    useEffect(() => { fetchAllCases(); }, [fetchAllCases]);

    // Filter chain
    const filteredCases = allCases.filter((c: LedgerCase) => {
        const matchSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.toString().includes(searchTerm);
        if (!matchSearch) return false;
        if (activeTab === "leaked") return c.leaked;
        if (activeTab === "resolved") return c.status >= 4;
        if (activeTab === "active") return c.status < 4;
        return true;
    });

    const leakedCount = allCases.filter(c => c.leaked).length;
    const resolvedCount = allCases.filter(c => c.status >= 4).length;
    const activeCount = allCases.filter(c => c.status < 4).length;

    const tabs: { key: TabFilter; label: string; count: number; icon: any; color: string }[] = [
        { key: "all", label: "All Records", count: allCases.length, icon: Shield, color: "text-brand-primary" },
        { key: "leaked", label: "Leaked to Media", count: leakedCount, icon: Megaphone, color: "text-red-600" },
        { key: "resolved", label: "Resolved", count: resolvedCount, icon: CheckCircle2, color: "text-green-600" },
        { key: "active", label: "Active / Pending", count: activeCount, icon: Clock, color: "text-amber-600" },
    ];

    return (
        <main className="min-h-screen bg-bg-page text-text-main relative overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 opacity-30" />

            <Navbar />

            <div className="w-full max-w-[1400px] mx-auto px-6 pt-32 pb-20 relative z-10">
                {/* ═══════ HEADER ═══════ */}
                <div className="mb-12 border-b border-border-subtle pb-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-px w-12 bg-brand-primary" />
                                <span className="text-brand-primary font-mono text-xs uppercase tracking-[0.3em] font-bold">Public Evidence Registry</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-none text-text-main">
                                Nyaya <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Archive</span>
                            </h1>
                            <p className="text-lg text-text-muted font-normal leading-relaxed max-w-2xl">
                                A transparent, blockchain-verified repository of all whistleblower cases —
                                including <strong className="text-red-600">leaked disclosures</strong>, resolved investigations, and active cases.
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="text-6xl font-black text-brand-primary/10 select-none">
                                #{allCases.length.toString().padStart(3, '0')}
                            </div>
                            <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">Total Records</div>
                            {leakedCount > 0 && (
                                <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
                                    <Megaphone className="w-3.5 h-3.5 text-red-600" />
                                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{leakedCount} Leaked to Media</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search + Tabs */}
                    <div className="mt-10 space-y-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-primary transition-all" />
                                <input
                                    type="text"
                                    placeholder="Search by case ID, department, or keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white border border-border-subtle rounded-2xl pl-14 pr-6 py-4 text-sm font-medium text-text-main focus:border-brand-primary/50 focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all shadow-sm"
                                />
                            </div>
                            <div className="flex gap-2 items-center px-4 py-3 bg-white border border-border-subtle rounded-2xl shadow-sm">
                                {isLoading
                                    ? <Activity className="w-4 h-4 animate-spin text-brand-primary" />
                                    : <Activity className="w-4 h-4 text-brand-primary" />
                                }
                                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{isLoading ? "Syncing..." : "Live"}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeTab === tab.key
                                        ? tab.key === 'leaked'
                                            ? 'bg-red-50 border-red-200 text-red-600'
                                            : 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary'
                                        : 'bg-white border-border-subtle text-text-muted hover:border-brand-primary/20 hover:text-text-main'
                                        }`}
                                >
                                    <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.key ? tab.color : ''}`} />
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${activeTab === tab.key
                                        ? tab.key === 'leaked' ? 'bg-red-100 text-red-600' : 'bg-brand-primary/10 text-brand-primary'
                                        : 'bg-slate-100 text-text-muted'
                                        }`}>{tab.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══════ FEATURED (first case) ═══════ */}
                {filteredCases.length > 0 && (
                    <div className="mb-16">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl font-black tracking-tight uppercase border-l-4 border-brand-primary pl-4 text-text-main">
                                {activeTab === 'leaked' ? 'Media Disclosures' : 'Highlighted Investigation'}
                            </h2>
                            <div className="h-px flex-1 bg-border-subtle" />
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group">
                            <Link href={`/ledger/${filteredCases[0].id}`}>
                                <div className="relative bg-white border border-border-subtle rounded-3xl overflow-hidden hover:shadow-2xl hover:border-brand-primary/20 transition-all duration-500 shadow-xl">
                                    <div className="h-72 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
                                        <img
                                            src={getCaseImage(filteredCases[0].department, filteredCases[0].id)}
                                            alt=""
                                            className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-25 transition-all duration-700 scale-105 group-hover:scale-100"
                                        />
                                        <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-2">
                                            <span className="px-3 py-1.5 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-[0.15em] rounded-full shadow-lg">
                                                {filteredCases[0].id >= 1000 ? "Archive Report" : "On-Chain"}
                                            </span>
                                            {filteredCases[0].leaked && (
                                                <span className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-[0.12em] rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                                                    <Megaphone className="w-3 h-3" /> Leaked to Media
                                                </span>
                                            )}
                                            {filteredCases[0].status === 4 && (
                                                <span className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-bold uppercase tracking-[0.12em] rounded-full shadow-lg flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3 h-3" /> Resolved
                                                </span>
                                            )}
                                            {filteredCases[0].status < 4 && !filteredCases[0].leaked && (
                                                <span className="px-3 py-1.5 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-[0.12em] rounded-full shadow-lg flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> {statusLabels[filteredCases[0].status]}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-10 -mt-12 relative z-20">
                                        <span className="text-xs font-mono text-brand-primary mb-3 block tracking-tight uppercase font-bold">
                                            DEPT: {filteredCases[0].department} // CASE #{filteredCases[0].id}
                                        </span>
                                        <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-4 group-hover:text-brand-primary transition-colors leading-tight text-text-main">
                                            {filteredCases[0].title}
                                        </h3>
                                        <p className="text-text-muted text-base leading-relaxed line-clamp-3 mb-6">
                                            {filteredCases[0].summary}
                                        </p>
                                        <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
                                            <div className="flex items-center gap-4 text-xs text-text-muted">
                                                <span className="font-bold font-mono">{format(filteredCases[0].timestamp, 'MMMM dd, yyyy')}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1.5 font-bold">
                                                    <Activity className="w-3.5 h-3.5 text-brand-primary" /> Verified On-Chain
                                                </span>
                                            </div>
                                            <div className="p-3 bg-bg-page border border-border-subtle rounded-xl group-hover:bg-brand-primary group-hover:text-white transition-all">
                                                <ArrowUpRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                )}

                {/* ═══════ CASE GRID ═══════ */}
                {filteredCases.length > 1 && (
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl font-black tracking-tight uppercase border-l-4 border-border-subtle pl-4 text-text-main">
                                {activeTab === 'leaked' ? 'All Leaked Cases' : 'Archive Entries'}
                            </h2>
                            <div className="h-px flex-1 bg-border-subtle" />
                            <span className="text-xs text-text-muted font-mono font-bold">{filteredCases.length - 1} more</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCases.slice(1).map((record: LedgerCase, i: number) => (
                                <motion.div
                                    key={record.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.04 * i }}
                                    className="group"
                                >
                                    <Link href={`/ledger/${record.id}`}>
                                        <div className={`bg-white border rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col h-full ${record.leaked
                                            ? 'border-red-200 hover:border-red-300'
                                            : 'border-border-subtle hover:border-brand-primary/20'
                                            }`}>
                                            {/* Image area */}
                                            <div className="h-40 relative overflow-hidden bg-bg-page">
                                                <img
                                                    src={getCaseImage(record.department, record.id)}
                                                    alt=""
                                                    className="absolute inset-0 w-full h-full object-cover opacity-8 group-hover:opacity-20 transition-all duration-500"
                                                />
                                                <div className="absolute bottom-3 right-3 text-4xl font-black text-brand-primary/5 select-none">
                                                    #{record.id}
                                                </div>
                                                {/* Badges */}
                                                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                                    {record.leaked && (
                                                        <span className="px-2 py-1 bg-red-600 text-white text-[8px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 shadow-md">
                                                            <Megaphone className="w-2.5 h-2.5" /> Leaked
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-1 text-white text-[8px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 shadow-md ${statusColors[record.status]}`}>
                                                        {statusLabels[record.status]}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 flex-1 flex flex-col">
                                                <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest font-bold mb-1.5">
                                                    {record.department}
                                                </span>
                                                <h4 className="text-base font-bold tracking-tight mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors text-text-main leading-snug">
                                                    {record.title}
                                                </h4>
                                                <p className="text-text-muted text-xs line-clamp-3 leading-relaxed mb-4 flex-1">
                                                    {record.summary}
                                                </p>

                                                <div className="pt-4 border-t border-border-subtle flex items-center justify-between mt-auto">
                                                    <span className="text-[10px] font-mono text-text-muted font-bold">
                                                        {format(record.timestamp, 'MMM dd, yyyy')}
                                                    </span>
                                                    <div className="p-2 rounded-lg bg-bg-page text-text-muted group-hover:text-brand-primary group-hover:bg-brand-primary/5 transition-all">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && filteredCases.length === 0 && (
                    <div className="py-32 text-center">
                        <Search className="w-12 h-12 text-text-muted mx-auto mb-6 opacity-20" />
                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tight text-text-muted">No records found</h3>
                        <p className="text-text-muted max-w-sm mx-auto">Try adjusting your search or filter selection.</p>
                    </div>
                )}

                {/* Loading */}
                {isLoading && allCases.length === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-80 bg-white animate-pulse rounded-2xl border border-border-subtle" />
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-24 pt-12 border-t border-border-subtle grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black tracking-tighter text-text-main">A New Standard for Public Trust.</h3>
                        <p className="text-text-muted leading-relaxed">
                            NyayaSetu is a cryptographic framework ensuring accountability between citizens and authorities.
                            By anchoring investigations to the blockchain, we ensure that justice is a globally verifiable record.
                        </p>
                    </div>
                    <div className="bg-white border border-border-subtle rounded-3xl p-8 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-brand-primary">
                            <Activity className="w-4 h-4" />
                            <span className="text-[10px] font-mono uppercase font-bold tracking-widest">Network Status: Optimal</span>
                        </div>
                        <div className="font-mono text-[10px] text-text-muted break-all leading-loose font-bold">
                            [SYSTEM]: ARCHIVE_CID_SYNC_SECURE... {CONTRACT_ADDRESS}<br />
                            [CHAIN]: CIVIC_CHAIN_NODES_VERIFIED<br />
                            [SECURITY]: RSA_ENCRYPTION_ACTIVE
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
