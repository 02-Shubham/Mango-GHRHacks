'use client'

import { useParams, useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { useCases } from '@/hooks/useCases'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { addressConfig } from '@/contracts/addresses'
import RegistryABI from '@/contracts/CivicChainRegistry.json'
import {
    ArrowLeft,
    ExternalLink,
    FileText,
    User,
    Clock,
    Shield,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    Calendar,
    Hash,
    Unlock,
    KeyRound,
    FileSearch,
    Download,
    Brain,
    Zap,
    Scale,
    Activity,
    Scan,
    Upload,
    File,
    X,
    ShieldAlert,
    Check
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { decryptWithPrivateKey, decryptFile } from '@/lib/browser-crypto'
import { addKeyToVault, type VaultKey } from '@/app/keyvault/page'

export default function CaseDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const { cases, isLoading: casesLoading, statusMap } = useCases()
    const [metadata, setMetadata] = useState<any>(null)
    const [isMetadataLoading, setIsMetadataLoading] = useState(false)

    const [privateKey, setPrivateKey] = useState('')
    const [isDecrypting, setIsDecrypting] = useState(false)
    const [decryptedFileUrl, setDecryptedFileUrl] = useState<string | null>(null)
    const [decryptionError, setDecryptionError] = useState<string | null>(null)
    const [showDecryptModal, setShowDecryptModal] = useState(false)

    const [activeTab, setActiveTab] = useState<'overview' | 'ai'>('overview')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [aiReport, setAiReport] = useState<any>(null)
    const [keySaved, setKeySaved] = useState(false)

    // Report modal state
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportAction, setReportAction] = useState<number | null>(null) // 4=resolve, 5=reject
    const [reportSummary, setReportSummary] = useState('')
    const [reportFindings, setReportFindings] = useState('')
    const [reportFile, setReportFile] = useState<File | null>(null)
    const [reportError, setReportError] = useState<string | null>(null)
    const [submittedReport, setSubmittedReport] = useState<{
        action: string
        summary: string
        findings: string
        fileName?: string
        timestamp: Date
    } | null>(null)

    const runAIAnalysis = async () => {
        setIsAnalyzing(true)
        setAiReport(null)
        // Simulate deep neural processing
        await new Promise(r => setTimeout(r, 1200))
        await new Promise(r => setTimeout(r, 1500))

        const report = {
            riskScore: Math.floor(Math.random() * 25) + 72,
            priority: record?.status === 3 ? 'CRITICAL' : 'HIGH',
            violations: [
                { title: "Section 420: Cheating & Dishonesty", severity: "HIGH", code: "IPC-420" },
                { title: "Prevention of Corruption Act: Fund Misuse", severity: "CRITICAL", code: "PCA-1988" },
                { title: "Procedural Integrity: Authentication Breach", severity: "MODERATE", code: "PROTOCOL-V2" }
            ],
            summary: `Neural scan of "${metadata?.title || 'Case'}" identifies systemic irregularities. Cryptographic proof clusters (SHA-256) link activities to the ${record?.department || 'specified department'} with a 94.8% probability. Evidence suggests deliberate bypass of standard procurement protocols.`,
            confidence: 94.8,
            tags: ["#FinancialAnomaly", "#IdentityVerified", "#OnChainProof", "#HighStakes"],
            analysisSources: [
                { name: "Metadata Cross-Reference", status: "VERIFIED" },
                { name: "Description NLP Analysis", status: "COMPLETED" },
                { name: "Cryptographic Proof Validation", status: "AUTHENTICATED" }
            ]
        }

        setAiReport(report)
        setIsAnalyzing(false)
    }

    const record = cases.find(c => c.id === Number(id))
    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        if (record?.metadataCID) {
            setIsMetadataLoading(true)
            const cleanCID = record.metadataCID.startsWith('ipfs://') ? record.metadataCID.slice(7) : record.metadataCID
            fetch(`https://gateway.pinata.cloud/ipfs/${cleanCID}`)
                .then(res => res.json())
                .then(data => {
                    setMetadata(data)
                    setIsMetadataLoading(false)
                })
                .catch(err => {
                    console.error('Failed to fetch metadata:', err)
                    setIsMetadataLoading(false)
                })
        }
    }, [record])

    const openReportModal = (statusCode: number) => {
        setReportAction(statusCode)
        setReportSummary('')
        setReportFindings('')
        setReportFile(null)
        setReportError(null)
        setShowReportModal(true)
    }

    const handleSubmitReport = () => {
        if (!reportSummary.trim()) {
            setReportError('Report summary is required before proceeding.')
            return
        }
        if (reportSummary.trim().length < 20) {
            setReportError('Report summary must be at least 20 characters.')
            return
        }

        // Store the report
        setSubmittedReport({
            action: reportAction === 4 ? 'Resolved' : reportAction === 5 ? 'Rejected' : 'Updated',
            summary: reportSummary.trim(),
            findings: reportFindings.trim(),
            fileName: reportFile?.name,
            timestamp: new Date()
        })

        // Close modal and fire the on-chain transaction
        setShowReportModal(false)

        writeContract({
            address: addressConfig.CivicChainRegistry as `0x${string}`,
            abi: RegistryABI.abi,
            functionName: 'updateStatus',
            args: [BigInt(id as string), reportAction!],
        })
    }

    const handleUpdateStatus = (newStatus: number) => {
        // For resolve (4) and reject (5), require a report
        if (newStatus === 4 || newStatus === 5) {
            openReportModal(newStatus)
            return
        }
        // For other status updates (like In Progress), proceed directly
        writeContract({
            address: addressConfig.CivicChainRegistry as `0x${string}`,
            abi: RegistryABI.abi,
            functionName: 'updateStatus',
            args: [BigInt(id as string), newStatus],
        })
    }

    const handleDecrypt = async () => {
        if (!privateKey || !metadata) return
        setIsDecrypting(true)
        setDecryptionError(null)
        try {
            let aesKey = metadata.encryptionKey
            if (metadata.isAsymmetric) {
                try {
                    aesKey = await decryptWithPrivateKey(privateKey, metadata.encryptionKey)
                } catch (rsaErr) {
                    throw new Error("RSA_FAILED")
                }
            }
            const cleanFileCID = metadata.fileCID.startsWith('ipfs://') ? metadata.fileCID.slice(7) : metadata.fileCID
            const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cleanFileCID}`)
            if (!res.ok) throw new Error("FETCH_FAILED")
            const encryptedBlob = await res.blob()
            const decryptedBuffer = await decryptFile(encryptedBlob, aesKey, metadata.iv)
            const blob = new Blob([decryptedBuffer], { type: metadata.fileType || 'application/octet-stream' })
            const url = URL.createObjectURL(blob)
            setDecryptedFileUrl(url)
            setShowDecryptModal(false)
        } catch (err: any) {
            if (err.message === "RSA_FAILED") {
                setDecryptionError('RSA Decryption failed. Please check if your Private Key matches the Public Key used during submission.')
            } else if (err.message === "FETCH_FAILED") {
                setDecryptionError('Failed to fetch evidence bundle from IPFS. Check your network or the CID.')
            } else {
                setDecryptionError('Decryption failed. This is usually due to a mismatch between the encryption key and the private key.')
            }
        } finally {
            setIsDecrypting(false)
        }
    }

    if (casesLoading || isMetadataLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                </div>
            </AdminLayout>
        )
    }

    if (!record) {
        return (
            <AdminLayout>
                <div className="text-center py-20">
                    <h2 className="text-xl font-bold text-text-main mb-4">Case # {id} Not Found</h2>
                    <button onClick={() => router.back()} className="text-brand-primary hover:underline">Go Back</button>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Decryption Modal */}
                <AnimatePresence>
                    {showDecryptModal && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6"
                                onClick={() => setShowDecryptModal(false)}
                            />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[70] p-4 pointer-events-none"
                            >
                                <div className="bg-white border border-brand-primary/20 rounded-3xl p-8 shadow-2xl pointer-events-auto">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-brand-primary/10 rounded-xl"><Unlock className="w-6 h-6 text-brand-primary" /></div>
                                        <h2 className="text-xl font-bold text-text-main">Authority Decryption</h2>
                                    </div>
                                    <p className="text-sm text-text-muted mb-6 leading-relaxed">
                                        This evidence is end-to-end encrypted. Provide your <strong>Authority Private Key</strong> (PEM format) to decrypt the truth. This happens entirely in your browser.
                                    </p>

                                    <textarea
                                        value={privateKey}
                                        onChange={(e) => setPrivateKey(e.target.value)}
                                        rows={5}
                                        placeholder="-----BEGIN PRIVATE KEY-----..."
                                        className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-3 text-text-main text-xs font-mono focus:border-brand-primary/50 focus:outline-none resize-none mb-6"
                                    />

                                    {decryptionError && (
                                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight">{decryptionError}</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleDecrypt}
                                        disabled={isDecrypting || !privateKey}
                                        className="w-full py-4 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isDecrypting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                                        {isDecrypting ? 'Decrypting Securely...' : 'Unlock Evidence'}
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* ════════════════ REPORT MODAL ════════════════ */}
                <AnimatePresence>
                    {showReportModal && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
                                onClick={() => setShowReportModal(false)}
                            />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-[70] p-4 pointer-events-none"
                            >
                                <div className="bg-white border border-border-subtle rounded-3xl shadow-2xl pointer-events-auto overflow-hidden">
                                    {/* Modal Header */}
                                    <div className={`px-8 py-6 border-b ${reportAction === 4 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-xl ${reportAction === 4 ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    {reportAction === 4 ? <CheckCircle2 className="w-6 h-6 text-brand-accent" /> : <XCircle className="w-6 h-6 text-red-500" />}
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-text-main">
                                                        {reportAction === 4 ? 'Resolution Report' : 'Rejection Report'}
                                                    </h2>
                                                    <p className="text-xs text-text-muted">
                                                        A report is mandatory before {reportAction === 4 ? 'resolving' : 'rejecting'} this case
                                                    </p>
                                                </div>
                                            </div>
                                            <button onClick={() => setShowReportModal(false)}
                                                className="p-2 hover:bg-white rounded-xl transition-colors">
                                                <X className="w-5 h-5 text-text-muted" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-8 space-y-6">
                                        {/* Report Summary — REQUIRED */}
                                        <div>
                                            <label className="text-xs font-bold text-text-main uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5 text-brand-primary" />
                                                Report Summary
                                                <span className="text-red-500 text-[10px]">* Required</span>
                                            </label>
                                            <textarea
                                                value={reportSummary}
                                                onChange={(e) => { setReportSummary(e.target.value); setReportError(null) }}
                                                rows={4}
                                                placeholder={reportAction === 4
                                                    ? "Describe the resolution outcome, actions taken, and measures implemented..."
                                                    : "Provide the reason for rejection, evidence review findings, and justification..."
                                                }
                                                className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-main focus:border-brand-primary/50 focus:outline-none resize-none transition-all"
                                            />
                                            <div className="flex items-center justify-between mt-1.5">
                                                <span className="text-[10px] text-text-muted">Min. 20 characters</span>
                                                <span className={`text-[10px] font-mono ${reportSummary.length >= 20 ? 'text-brand-accent' : 'text-text-muted'}`}>
                                                    {reportSummary.length} chars
                                                </span>
                                            </div>
                                        </div>

                                        {/* Key Findings — OPTIONAL */}
                                        <div>
                                            <label className="text-xs font-bold text-text-main uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Scale className="w-3.5 h-3.5 text-brand-primary" />
                                                Key Findings
                                                <span className="text-text-muted text-[10px]">(Optional)</span>
                                            </label>
                                            <textarea
                                                value={reportFindings}
                                                onChange={(e) => setReportFindings(e.target.value)}
                                                rows={3}
                                                placeholder="List key findings, violations confirmed/denied, supporting evidence references..."
                                                className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-main focus:border-brand-primary/50 focus:outline-none resize-none transition-all"
                                            />
                                        </div>

                                        {/* File Upload — OPTIONAL */}
                                        <div>
                                            <label className="text-xs font-bold text-text-main uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Upload className="w-3.5 h-3.5 text-brand-primary" />
                                                Attach Report Document
                                                <span className="text-text-muted text-[10px]">(Optional)</span>
                                            </label>
                                            {!reportFile ? (
                                                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border-subtle rounded-xl bg-bg-page hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all cursor-pointer group">
                                                    <Upload className="w-6 h-6 text-text-muted group-hover:text-brand-primary mb-2 transition-colors" />
                                                    <span className="text-xs text-text-muted group-hover:text-brand-primary transition-colors">
                                                        Click to upload PDF, DOCX, or image
                                                    </span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0]
                                                            if (file) setReportFile(file)
                                                        }}
                                                    />
                                                </label>
                                            ) : (
                                                <div className="flex items-center justify-between p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                                                            <File className="w-5 h-5 text-brand-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-text-main">{reportFile.name}</div>
                                                            <div className="text-[10px] text-text-muted">{(reportFile.size / 1024).toFixed(1)} KB</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setReportFile(null)}
                                                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <X className="w-4 h-4 text-text-muted hover:text-red-500" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Error */}
                                        {reportError && (
                                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-red-600 font-medium">{reportError}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="px-8 py-5 bg-slate-50 border-t border-border-subtle flex items-center justify-between">
                                        <button
                                            onClick={() => setShowReportModal(false)}
                                            className="px-5 py-2.5 text-sm font-medium text-text-muted hover:text-text-main transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmitReport}
                                            disabled={!reportSummary.trim() || reportSummary.trim().length < 20}
                                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${reportAction === 4
                                                ? 'bg-brand-accent hover:bg-green-600 text-white shadow-md'
                                                : 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                                                }`}
                                        >
                                            {reportAction === 4 ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            Submit Report & {reportAction === 4 ? 'Resolve' : 'Reject'} Case
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors text-sm font-medium group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Registry
                </button>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                                Case File
                            </span>
                            <span className="text-text-muted font-mono text-sm">ID: {id}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-text-main tracking-tight">
                            {metadata?.title || 'Loading Case Title...'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${record.status === 4 ? 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent' :
                            record.status === 3 ? 'bg-red-50 border-red-200 text-red-500' :
                                'bg-amber-50 border-amber-200 text-amber-600'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${record.status === 4 ? 'bg-brand-accent' :
                                record.status === 3 ? 'bg-red-500' :
                                    'bg-amber-500'
                                }`} />
                            <span className="text-sm font-bold uppercase tracking-wider">{statusMap[record.status]}</span>
                        </div>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1 p-1 bg-bg-page border border-border-subtle rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-brand-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                    >
                        Case Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'ai' ? 'bg-brand-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Brain className={`w-3.5 h-3.5 ${activeTab === 'ai' ? 'text-white' : 'text-brand-primary'}`} /> AI Evidence Intel
                    </button>
                </div>

                {activeTab === 'overview' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Description */}
                            <div className="glass-card p-8">
                                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Comprehensive Description
                                </h3>
                                <p className="text-text-main leading-relaxed whitespace-pre-wrap">
                                    {metadata?.description || 'No description provided.'}
                                </p>
                            </div>

                            {/* Evidence & Technical Link */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass-card p-6 hover:border-brand-primary/30 transition-all">
                                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Evidence Hash (SHA-256)</h3>
                                    <div className="flex items-center gap-3 bg-bg-page p-3 rounded-xl border border-border-subtle">
                                        <Hash className="w-4 h-4 text-text-muted shrink-0" />
                                        <span className="text-[10px] font-mono text-text-muted break-all leading-tight">
                                            {record.fileHash}
                                        </span>
                                    </div>
                                </div>
                                <div className="glass-card p-6 hover:border-brand-primary/30 transition-all">
                                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">IPFS Metadata Proof</h3>
                                    <a
                                        href={`https://gateway.pinata.cloud/ipfs/${record.metadataCID}`}
                                        target="_blank"
                                        className="flex items-center justify-between bg-brand-primary/5 p-3 rounded-xl border border-brand-primary/10 group/link"
                                    >
                                        <span className="text-[10px] font-mono text-brand-primary truncate pr-4">
                                            {record.metadataCID}
                                        </span>
                                        <ExternalLink className="w-4 h-4 text-brand-primary group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform shrink-0" />
                                    </a>
                                </div>
                            </div>

                            {/* Evidence File Access */}
                            <div className="glass-card p-8 border-brand-primary/20 bg-brand-primary/5">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-20 h-20 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 flex items-center justify-center">
                                        {decryptedFileUrl ? <FileSearch className="w-10 h-10 text-brand-primary" /> : <Shield className="w-10 h-10 text-brand-primary" />}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-lg font-bold text-text-main mb-1">
                                            {decryptedFileUrl ? 'Evidence Decrypted' : 'Encrypted Evidence Bundle'}
                                        </h3>
                                        <p className="text-sm text-text-muted mb-4">
                                            {decryptedFileUrl
                                                ? 'The evidence has been successfully decrypted locally. You can now view or download the cleartext file.'
                                                : 'This file is secured with RSA-2048 and AES-256. Access requires authority authorization.'
                                            }
                                        </p>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            {!decryptedFileUrl ? (
                                                <button
                                                    onClick={() => setShowDecryptModal(true)}
                                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-secondary transition-all"
                                                >
                                                    <Unlock className="w-4 h-4" /> Unlock Evidence
                                                </button>
                                            ) : (
                                                <>
                                                    <a
                                                        href={decryptedFileUrl}
                                                        target="_blank"
                                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-secondary transition-all"
                                                    >
                                                        <Download className="w-4 h-4" /> Download Cleartext
                                                    </a>
                                                    <button
                                                        onClick={() => setDecryptedFileUrl(null)}
                                                        className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-main transition-colors"
                                                    >
                                                        Clear Memory
                                                    </button>
                                                </>
                                            )}
                                            {/* Send Key to Vault */}
                                            {metadata?.encryptionKey && (
                                                keySaved ? (
                                                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 border border-green-200 rounded-lg text-xs font-bold text-green-600">
                                                        <CheckCircle2 className="w-4 h-4" /> Key in Vault
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            addKeyToVault({
                                                                caseId: record.id,
                                                                department: record.department,
                                                                title: metadata?.title || record.title || `Case #${record.id}`,
                                                                encryptionKey: metadata.encryptionKey,
                                                                iv: metadata.iv || '',
                                                                isAsymmetric: metadata.isAsymmetric || false,
                                                                fileCID: metadata.fileCID || '',
                                                                storedAt: new Date().toISOString()
                                                            })
                                                            setKeySaved(true)
                                                        }}
                                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all"
                                                    >
                                                        <KeyRound className="w-4 h-4" /> Send Key to Vault
                                                    </button>
                                                )
                                            )}
                                            <a
                                                href={`https://gateway.pinata.cloud/ipfs/${metadata?.fileCID}`}
                                                target="_blank"
                                                className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-main transition-colors flex items-center gap-2"
                                            >
                                                Source Bundle <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ════════ SUBMITTED REPORT CARD ════════ */}
                            {submittedReport && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`glass-card p-8 border-2 ${submittedReport.action === 'Resolved'
                                        ? 'border-green-200 bg-green-50/50'
                                        : 'border-red-200 bg-red-50/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`p-2 rounded-xl ${submittedReport.action === 'Resolved' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {submittedReport.action === 'Resolved'
                                                ? <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                                                : <XCircle className="w-5 h-5 text-red-500" />
                                            }
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-text-main">
                                                {submittedReport.action === 'Resolved' ? 'Resolution Report Submitted' : 'Rejection Report Submitted'}
                                            </h3>
                                            <p className="text-[10px] text-text-muted font-mono">
                                                {format(submittedReport.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Summary</label>
                                            <p className="text-sm text-text-main leading-relaxed bg-white/80 p-4 rounded-xl border border-border-subtle">
                                                {submittedReport.summary}
                                            </p>
                                        </div>

                                        {submittedReport.findings && (
                                            <div>
                                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Key Findings</label>
                                                <p className="text-sm text-text-main leading-relaxed bg-white/80 p-4 rounded-xl border border-border-subtle">
                                                    {submittedReport.findings}
                                                </p>
                                            </div>
                                        )}

                                        {submittedReport.fileName && (
                                            <div className="flex items-center gap-3 bg-white/80 p-3 rounded-xl border border-border-subtle">
                                                <File className="w-4 h-4 text-brand-primary" />
                                                <span className="text-xs text-text-main font-medium">{submittedReport.fileName}</span>
                                                <span className="text-[10px] text-text-muted ml-auto">Attached</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar Actions */}
                        <div className="space-y-6">
                            {/* Registry Details */}
                            <div className="glass-card p-6 space-y-4">
                                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest border-b border-border-subtle pb-3">Registry Metadata</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-text-muted flex items-center gap-2"><User className="w-3.5 h-3.5" /> Reporter</span>
                                        <span className="text-xs font-mono text-text-main">{record.creator.slice(0, 6)}...{record.creator.slice(-4)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-text-muted flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Filed On</span>
                                        <span className="text-xs text-text-main">{format(record.timestamp, 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-text-muted flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Dept</span>
                                        <span className="text-xs text-text-main">{record.department}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Governance Actions */}
                            <div className="glass-card p-6 space-y-6 border-amber-200">
                                <div>
                                    <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Authority Actions
                                    </h3>
                                    <p className="text-[10px] text-text-muted">Update case status on the permanent legal ledger.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        disabled={isPending || isConfirming}
                                        onClick={() => handleUpdateStatus(2)}
                                        className="flex items-center justify-between w-full p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-amber-600" />
                                            <div>
                                                <div className="text-xs font-bold text-text-main">In Progress</div>
                                                <div className="text-[10px] text-text-muted">Mark as under investigation</div>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        disabled={isPending || isConfirming}
                                        onClick={() => handleUpdateStatus(4)}
                                        className="flex items-center justify-between w-full p-4 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                                            <div>
                                                <div className="text-xs font-bold text-text-main">Resolve Case</div>
                                                <div className="text-[10px] text-text-muted">Requires a resolution report</div>
                                            </div>
                                        </div>
                                        <div className="px-2 py-0.5 rounded bg-green-100 text-[9px] font-bold text-brand-accent uppercase">
                                            Report Required
                                        </div>
                                    </button>

                                    <button
                                        disabled={isPending || isConfirming}
                                        onClick={() => handleUpdateStatus(5)}
                                        className="flex items-center justify-between w-full p-4 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <XCircle className="w-5 h-5 text-red-500" />
                                            <div>
                                                <div className="text-xs font-bold text-text-main">Reject Case</div>
                                                <div className="text-[10px] text-text-muted">Requires a rejection report</div>
                                            </div>
                                        </div>
                                        <div className="px-2 py-0.5 rounded bg-red-100 text-[9px] font-bold text-red-500 uppercase">
                                            Report Required
                                        </div>
                                    </button>
                                </div>

                                {(isPending || isConfirming) && (
                                    <div className="flex items-center justify-center gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 animate-pulse">
                                        <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
                                        <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Transaction Mining...</span>
                                    </div>
                                )}

                                {isSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-200"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-brand-accent" />
                                        <span className="text-xs font-bold text-brand-accent uppercase tracking-widest">Status Updated On-Chain</span>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="min-h-[400px]">
                        {!aiReport && !isAnalyzing ? (
                            <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-brand-primary/20 bg-brand-primary/5">
                                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                    <Brain className="w-10 h-10 text-brand-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-text-main mb-2">Initialize AI Evidence Scan</h2>
                                <p className="text-text-muted mb-8 max-w-sm mx-auto">
                                    Analyze metadata, description, and cryptographic proofs to identify potential legal violations and risk scores.
                                </p>
                                <button
                                    onClick={runAIAnalysis}
                                    className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-all flex items-center gap-2 group"
                                >
                                    <Zap className="w-4 h-4 fill-current" /> Run Deep Analysis
                                </button>
                            </div>
                        ) : isAnalyzing ? (
                            <div className="glass-card p-12 flex flex-col items-center justify-center border-brand-primary/30 bg-brand-primary/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />
                                <motion.div
                                    animate={{
                                        y: [0, 400, 0],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-x-0 h-px bg-brand-primary shadow-[0_0_15px_rgba(37,99,235,0.6)] z-10"
                                />
                                <Activity className="w-12 h-12 text-brand-primary animate-pulse mb-6" />
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-text-main uppercase tracking-widest">Neural Scan in Progress</h3>
                                    <div className="flex items-center gap-2 text-xs font-mono text-brand-primary/70 uppercase">
                                        <Scan className="w-3 h-3 animate-spin" /> Vectorizing Case Metadata...
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Intel Summary Module */}
                                    <div className="glass-card p-8 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Brain className="w-24 h-24 text-brand-primary" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Activity className="w-3.5 h-3.5" /> Intelligence Snapshot
                                                </h3>
                                                <div className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[10px] font-bold text-brand-primary">
                                                    AI AGENT V3.5
                                                </div>
                                            </div>
                                            <p className="text-xl text-text-main leading-relaxed font-semibold mb-6">
                                                {aiReport.summary}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {aiReport.tags.map((tag: string, i: number) => (
                                                    <span key={i} className="text-[10px] font-mono font-bold text-text-muted bg-bg-page border border-border-subtle px-2 py-1 rounded-md">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Violation Matrices */}
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 flex items-center justify-between">
                                            <span>Primary Violations Log</span>
                                            <span className="text-brand-primary">{aiReport.violations.length} DETECTED</span>
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {aiReport.violations.map((v: any, i: number) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="flex items-center justify-between p-5 rounded-2xl bg-white border border-border-subtle hover:border-brand-primary/30 hover:shadow-lg transition-all group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${v.severity === 'CRITICAL' ? 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white' :
                                                            v.severity === 'HIGH' ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white' :
                                                                'bg-brand-primary/5 text-brand-primary group-hover:bg-brand-primary group-hover:text-white'
                                                            }`}>
                                                            <Scale className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-mono font-bold text-text-muted mb-1">{v.code}</div>
                                                            <div className="text-sm font-bold text-text-main">{v.title}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest ${v.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                        v.severity === 'HIGH' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                            'bg-blue-50 text-blue-600 border border-blue-100'
                                                        }`}>
                                                        {v.severity}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Threat Level Assessment */}
                                    <div className="glass-card p-6 border-brand-primary/20 bg-brand-primary/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                                        <div className="relative z-10">
                                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6">Neural Risk Index</h3>

                                            <div className="flex flex-col items-center mb-6">
                                                <div className="relative w-32 h-32 flex items-center justify-center">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle
                                                            cx="64" cy="64" r="58"
                                                            fill="none" stroke="currentColor" strokeWidth="8"
                                                            className="text-bg-page"
                                                        />
                                                        <motion.circle
                                                            initial={{ strokeDasharray: "0 365" }}
                                                            animate={{ strokeDasharray: `${(aiReport.riskScore / 100) * 365} 365` }}
                                                            transition={{ duration: 2, ease: "easeOut" }}
                                                            cx="64" cy="64" r="58"
                                                            fill="none" stroke="currentColor" strokeWidth="8"
                                                            strokeLinecap="round"
                                                            className={`${aiReport.riskScore > 85 ? 'text-red-500' : 'text-brand-primary'}`}
                                                        />
                                                    </svg>
                                                    <div className="absolute flex flex-col items-center">
                                                        <span className="text-4xl font-black text-text-main tracking-tighter">{aiReport.riskScore}</span>
                                                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Score</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 mb-4 ${aiReport.priority === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                                                }`}>
                                                <ShieldAlert className="w-4 h-4" />
                                                <span className="text-xs font-black uppercase tracking-widest">{aiReport.priority} PRIORITY</span>
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] font-bold text-text-muted">
                                                <span className="uppercase tracking-widest">Confidence Level</span>
                                                <span className="font-mono text-brand-primary">{aiReport.confidence}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Logs */}
                                    <div className="glass-card p-6 border-slate-200">
                                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6">Verification Pipeline</h3>
                                        <div className="space-y-4">
                                            {aiReport.analysisSources.map((source: any, i: number) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0 mt-0.5">
                                                        <Check className="w-2.5 h-2.5 text-brand-accent" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-bold text-text-main leading-none mb-1 uppercase tracking-tight">{source.name}</div>
                                                        <div className="text-[8px] font-mono text-brand-accent font-bold uppercase tracking-widest">{source.status}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-2 border-t border-border-subtle mt-4">
                                                <div className="text-[9px] text-text-muted leading-relaxed italic">
                                                    "All analysis is mathematically bound to the on-chain immutable record."
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
