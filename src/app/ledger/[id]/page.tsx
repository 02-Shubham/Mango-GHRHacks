"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import {
    Shield, CheckCircle2, Search, ArrowLeft, ExternalLink,
    Activity, Scale, Info, FileText, Lock, Globe, Hash
} from "lucide-react";
import { usePublicClient } from "wagmi";
import { addressConfig } from "@/contracts/addresses";
import CivicChainRegistryABI from '@blockchain/artifacts/contracts/CivicChainRegistry.sol/CivicChainRegistry.json';
import { parseAbiItem } from "viem";
import { format } from "date-fns";
import Link from "next/link";
import { getCaseImage, getEditorialStory, getSyntheticMetadata } from "@/lib/media";
import { DEMO_CASES } from "@/data/demo-cases";
import { CaseReport } from "@/components/CaseReport";

const CONTRACT_ADDRESS = addressConfig.CivicChainRegistry as `0x${string}`;

interface CaseDetail {
    id: number;
    creator: string;
    department: string;
    metadataCID: string;
    fileHash: string;
    timestamp: number;
    status: number;
    title?: string;
    description?: string;
}

const statusMap: Record<number, string> = {
    4: "RESOLVED",
    5: "REJECTED",
    6: "FALSE CLAIM"
};

export default function CaseDetailPage() {
    const { id } = useParams();
    const publicClient = usePublicClient();
    const [record, setRecord] = useState<CaseDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCaseDetails = useCallback(async () => {
        if (!publicClient || !id) return;
        setIsLoading(true);

        try {
            const caseIdNum = Number(id);

            // Check for Demo Cases first
            const demoCase = DEMO_CASES.find(c => c.id === caseIdNum);
            if (demoCase) {
                setRecord({
                    id: demoCase.id,
                    creator: demoCase.creator,
                    metadataCID: demoCase.metadataCID,
                    fileHash: demoCase.fileHash,
                    timestamp: demoCase.timestamp,
                    department: demoCase.department,
                    status: demoCase.status,
                    title: demoCase.title,
                    description: demoCase.description
                });
                setIsLoading(false);
                return;
            }

            const caseIdBigInt = BigInt(id as string);

            // Step 1: Get the mapping data (Status and FileHash)
            const caseData = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: CivicChainRegistryABI.abi,
                functionName: 'cases',
                args: [caseIdBigInt]
            }) as any;

            if (!caseData || (Number(caseData[0]) === 0 && Number(id) !== 0)) {
                setIsLoading(false);
                return;
            }

            const status = Number(caseData[5]);

            // Step 2: Extract Department and MetadataCID from Logs
            const logs = await publicClient.getLogs({
                address: CONTRACT_ADDRESS,
                event: parseAbiItem('event CaseCreated(uint256 indexed caseId, address indexed creator, string metadataCID, string department)'),
                args: { caseId: caseIdBigInt },
                fromBlock: 0n,
                toBlock: 'latest'
            });

            let department = "Investigation";
            let metadataCID = "N/A";

            if (logs.length > 0) {
                const logArgs = logs[0].args as any;
                department = logArgs.department;
                metadataCID = logArgs.metadataCID;
            }

            // Step 3: Handle Metadata & Synthetic Fallbacks
            const synthetic = getSyntheticMetadata(caseIdNum, department);
            let title = synthetic.title;
            let description = synthetic.summary;

            try {
                const cleanCID = metadataCID.startsWith('ipfs://') ? metadataCID.slice(7) : metadataCID;
                if (cleanCID && !cleanCID.includes('test') && cleanCID !== "N/A") {
                    const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cleanCID}`, { signal: (AbortSignal as any).timeout(4000) });
                    if (res.ok) {
                        const meta = await res.json();
                        title = meta.title || title;
                        description = meta.description || meta.summary || description;
                    }
                }
            } catch (e) {
                console.warn(`Failed to fetch metadata for ${id}`);
            }

            setRecord({
                id: caseIdNum,
                creator: caseData[0],
                metadataCID,
                fileHash: caseData[2],
                timestamp: Number(caseData[3]) * 1000,
                department,
                status,
                title,
                description
            });
        } catch (err) {
            console.error("Failed to fetch case details:", err);
        } finally {
            setIsLoading(false);
        }
    }, [publicClient, id]);

    useEffect(() => {
        fetchCaseDetails();
    }, [fetchCaseDetails]);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-bg-page flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 text-brand-primary animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted">Decrypting Public Index...</span>
                </div>
            </main>
        );
    }

    if (!record || record.status < 4) {
        return (
            <main className="min-h-screen bg-bg-page flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <Globe className="w-16 h-16 text-text-muted/30 mx-auto mb-6" />
                    <h1 className="text-2xl font-black uppercase mb-4 tracking-tighter text-text-main">Case Not Publicly Accessible</h1>
                    <p className="text-text-muted text-sm mb-8 leading-relaxed">
                        This investigation is either in progress or restricted. Only finalized and resolved cases are released to the Public Justice Ledger.
                    </p>
                    <Link href="/ledger" className="px-8 py-4 bg-white border border-border-subtle rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                        Return to Archive
                    </Link>
                </div>
            </main>
        );
    }

    // Resolved/Demo Case - Premium Report Layout
    const demoData = DEMO_CASES.find(c => c.id === record.id);
    const finalRecord = demoData ? {
        ...demoData,
        timestamp: record.timestamp,
    } : {
        ...record,
        title: record.title || "Unknown Case",
        summary: record.description || "No summary available.",
        story: getEditorialStory(record.id, record.department, record.title || "Unknown"),
        outcome: "Investigation finalized and archived in the public ledger."
    } as any;

    return (
        <main className="min-h-screen bg-bg-page text-text-main selection:bg-brand-primary/10 relative overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
            <Navbar />

            <div className="w-full max-w-[1200px] mx-auto px-6 pt-32 pb-20 relative z-10">
                <Link href="/ledger" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-border-subtle rounded-full text-xs font-bold uppercase tracking-widest text-text-muted hover:text-brand-primary hover:border-brand-primary/30 transition-all mb-12 shadow-sm">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Archive
                </Link>

                <CaseReport record={finalRecord} bannerImage={getCaseImage(record.department, record.id)} />

                {/* Final Branding Block */}
                <div className="mt-32 p-16 bg-white border border-border-subtle rounded-[4rem] text-center shadow-xl">
                    <Link href="/ledger" className="inline-block px-12 py-6 bg-brand-primary text-white text-xs font-black uppercase tracking-[0.3em] rounded-full hover:bg-brand-secondary transition-all mb-8 shadow-lg">
                        Explore More Investigations
                    </Link>
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">NyayaSetu Intelligence • Securing the Silent</p>
                </div>
            </div>
        </main>
    );
}
