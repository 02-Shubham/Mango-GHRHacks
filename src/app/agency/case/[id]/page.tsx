'use client'

import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { useAgencyAuth } from '@/hooks/useAgencyAuth'
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
    Lock,
    Building2,
    Upload,
    File,
    X,
    Scale,
    KeyRound,
    Unlock,
    Download,
    FileSearch,
    Eye,
    EyeOff,
    Copy,
    Trash2,
    Check
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { decryptWithPrivateKey, decryptFile } from '@/lib/browser-crypto'

const statusLabels: Record<number, string> = {
    0: 'Submitted', 1: 'Assigned', 2: 'In Progress',
    3: 'Escalated', 4: 'Resolved', 5: 'Rejected', 6: 'False Claim'
}

export default function AgencyCaseDetailPage() {
    const { id } = useParams()
    const router = useRouter()
    const { isAgency, department, isLoading: authLoading } = useAgencyAuth()
    const { cases, isLoading: casesLoading } = useCases()
    const [metadata, setMetadata] = useState<any>(null)
    const [isMetadataLoading, setIsMetadataLoading] = useState(false)

    // Report modal
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportAction, setReportAction] = useState<number | null>(null)
    const [reportSummary, setReportSummary] = useState('')
    const [reportFindings, setReportFindings] = useState('')
    const [reportFile, setReportFile] = useState<File | null>(null)
    const [reportError, setReportError] = useState<string | null>(null)
    const [submittedReport, setSubmittedReport] = useState<{
        action: string, summary: string, findings: string, fileName?: string, timestamp: Date
    } | null>(null)

    // Decrypt state
    const [privateKey, setPrivateKey] = useState('')
    const [isDecrypting, setIsDecrypting] = useState(false)
    const [decryptedFileUrl, setDecryptedFileUrl] = useState<string | null>(null)
    const [decryptionError, setDecryptionError] = useState<string | null>(null)
    const [showDecryptModal, setShowDecryptModal] = useState(false)
    const [keySaved, setKeySaved] = useState(false)

    // Key Vault state
    const [vaultKeys, setVaultKeys] = useState<any[]>([])
    const [revealedVaultKey, setRevealedVaultKey] = useState<number | null>(null)
    const [copiedVault, setCopiedVault] = useState<string | null>(null)

    useEffect(() => {
        const raw = localStorage.getItem('nyayasetu_keyvault')
        if (raw) setVaultKeys(JSON.parse(raw))
    }, [keySaved])

    const record = cases.find(c => c.id === Number(id))
    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        if (record?.metadataCID) {
            setIsMetadataLoading(true)
            const cleanCID = record.metadataCID.startsWith('ipfs://') ? record.metadataCID.slice(7) : record.metadataCID
            fetch(`https://gateway.pinata.cloud/ipfs/${cleanCID}`)
                .then(res => res.json())
                .then(data => { setMetadata(data); setIsMetadataLoading(false) })
                .catch(() => setIsMetadataLoading(false))
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
        if (!reportSummary.trim() || reportSummary.trim().length < 20) {
            setReportError('Report summary is required (min. 20 characters).')
            return
        }
        setSubmittedReport({
            action: reportAction === 4 ? 'Resolved' : 'Rejected',
            summary: reportSummary.trim(),
            findings: reportFindings.trim(),
            fileName: reportFile?.name,
            timestamp: new Date()
        })
        setShowReportModal(false)
        writeContract({
            address: addressConfig.CivicChainRegistry as `0x${string}`,
            abi: RegistryABI.abi,
            functionName: 'updateStatus',
            args: [BigInt(id as string), reportAction!],
        })
    }

    const handleUpdateStatus = (newStatus: number) => {
        if (newStatus === 4 || newStatus === 5) {
            openReportModal(newStatus)
            return
        }
        writeContract({
            address: addressConfig.CivicChainRegistry as `0x${string}`,
            abi: RegistryABI.abi,
            functionName: 'updateStatus',
            args: [BigInt(id as string), newStatus],
        })
    }

    const handleDecrypt = async () => {
        if (!metadata?.encryptionKey || !metadata?.fileCID) return
        setIsDecrypting(true)
        setDecryptionError(null)
        try {
            const cleanCID = metadata.fileCID.startsWith('ipfs://') ? metadata.fileCID.slice(7) : metadata.fileCID
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cleanCID}`)
            const encryptedBlob = await response.blob()

            let aesKey = metadata.encryptionKey
            if (metadata.isAsymmetric && privateKey) {
                aesKey = await decryptWithPrivateKey(privateKey, metadata.encryptionKey)
            }

            const decryptedBuffer = await decryptFile(encryptedBlob, aesKey, metadata.iv)
            const mimeType = metadata.fileType || 'application/octet-stream'
            const blob = new Blob([decryptedBuffer], { type: mimeType })
            setDecryptedFileUrl(URL.createObjectURL(blob))
        } catch (err: any) {
            setDecryptionError(err.message || 'Decryption failed')
        } finally {
            setIsDecrypting(false)
        }
    }

    const handleSaveKeyLocally = () => {
        if (!metadata?.encryptionKey || !record) return
        const vaultKeys = JSON.parse(localStorage.getItem('nyayasetu_keyvault') || '[]')
        const newKey = {
            caseId: record.id,
            department: record.department,
            title: metadata?.title || `Case #${record.id}`,
            encryptionKey: metadata.encryptionKey,
            iv: metadata.iv || '',
            isAsymmetric: metadata.isAsymmetric || false,
            fileCID: metadata.fileCID || '',
            storedAt: new Date().toISOString()
        }
        const exists = vaultKeys.findIndex((k: any) => k.caseId === record.id)
        if (exists >= 0) vaultKeys[exists] = newKey
        else vaultKeys.unshift(newKey)
        localStorage.setItem('nyayasetu_keyvault', JSON.stringify(vaultKeys))
        setKeySaved(true)
    }

    if (authLoading || casesLoading || isMetadataLoading) {
        return (
            <main className="min-h-screen bg-bg-page">
                <Navbar />
                <div className="flex items-center justify-center min-h-[70vh]">
                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                </div>
            </main>
        )
    }

    if (!isAgency) {
        return (
            <main className="min-h-screen bg-bg-page">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main mb-2">Access Denied</h2>
                    <p className="text-text-muted">Connect an authorized agency wallet.</p>
                </div>
            </main>
        )
    }

    if (!record) {
        return (
            <main className="min-h-screen bg-bg-page">
                <Navbar />
                <div className="text-center pt-40">
                    <h2 className="text-xl font-bold text-text-main mb-4">Case #{id} Not Found</h2>
                    <button onClick={() => router.back()} className="text-brand-primary hover:underline text-sm">Go Back</button>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-bg-page relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 opacity-30" />
            <Navbar />

            {/* ════ Report Modal ════ */}
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
                                <div className={`px-8 py-6 border-b ${reportAction === 4 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl ${reportAction === 4 ? 'bg-green-100' : 'bg-red-100'}`}>
                                                {reportAction === 4 ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <XCircle className="w-6 h-6 text-red-500" />}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-text-main">
                                                    {reportAction === 4 ? 'Resolution Report' : 'Rejection Report'}
                                                </h2>
                                                <p className="text-xs text-text-muted">Mandatory before {reportAction === 4 ? 'resolving' : 'rejecting'}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-white rounded-xl"><X className="w-5 h-5 text-text-muted" /></button>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-text-main uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 text-brand-primary" /> Report Summary <span className="text-red-500 text-[10px]">* Required</span>
                                        </label>
                                        <textarea value={reportSummary} onChange={(e) => { setReportSummary(e.target.value); setReportError(null) }} rows={4}
                                            placeholder="Describe the outcome, actions taken, and justification..."
                                            className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-main focus:border-brand-primary/50 focus:outline-none resize-none"
                                        />
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[10px] text-text-muted">Min. 20 characters</span>
                                            <span className={`text-[10px] font-mono ${reportSummary.length >= 20 ? 'text-brand-accent' : 'text-text-muted'}`}>{reportSummary.length}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-main uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Scale className="w-3.5 h-3.5 text-brand-primary" /> Key Findings <span className="text-text-muted text-[10px]">(Optional)</span>
                                        </label>
                                        <textarea value={reportFindings} onChange={(e) => setReportFindings(e.target.value)} rows={3}
                                            placeholder="Violations confirmed/denied, evidence references..."
                                            className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-main focus:border-brand-primary/50 focus:outline-none resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-main uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Upload className="w-3.5 h-3.5 text-brand-primary" /> Attach Document <span className="text-text-muted text-[10px]">(Optional)</span>
                                        </label>
                                        {!reportFile ? (
                                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border-subtle rounded-xl bg-bg-page hover:border-brand-primary/30 cursor-pointer group">
                                                <Upload className="w-5 h-5 text-text-muted group-hover:text-brand-primary mb-1" />
                                                <span className="text-xs text-text-muted group-hover:text-brand-primary">Upload PDF, DOCX, or image</span>
                                                <input type="file" className="hidden" accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                                                    onChange={(e) => { if (e.target.files?.[0]) setReportFile(e.target.files[0]) }}
                                                />
                                            </label>
                                        ) : (
                                            <div className="flex items-center justify-between p-3 bg-brand-primary/5 border border-brand-primary/10 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <File className="w-4 h-4 text-brand-primary" />
                                                    <span className="text-xs text-text-main font-medium">{reportFile.name}</span>
                                                </div>
                                                <button onClick={() => setReportFile(null)} className="p-1 hover:bg-red-50 rounded-lg"><X className="w-3.5 h-3.5 text-text-muted" /></button>
                                            </div>
                                        )}
                                    </div>
                                    {reportError && (
                                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                            <p className="text-xs text-red-600">{reportError}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="px-8 py-5 bg-slate-50 border-t border-border-subtle flex justify-between">
                                    <button onClick={() => setShowReportModal(false)} className="px-5 py-2.5 text-sm text-text-muted">Cancel</button>
                                    <button onClick={handleSubmitReport} disabled={reportSummary.trim().length < 20}
                                        className={`px-8 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 disabled:opacity-40 ${reportAction === 4 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}
                                    >
                                        {reportAction === 4 ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        Submit & {reportAction === 4 ? 'Resolve' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ════ Decrypt Modal ════ */}
            <AnimatePresence>
                {showDecryptModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60]"
                            onClick={() => setShowDecryptModal(false)}
                        />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[70] p-4 pointer-events-none"
                        >
                            <div className="bg-white border border-brand-primary/20 rounded-3xl p-8 shadow-2xl pointer-events-auto">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-brand-primary/10 rounded-xl"><Unlock className="w-6 h-6 text-brand-primary" /></div>
                                    <h2 className="text-xl font-bold text-text-main">Decrypt Evidence</h2>
                                </div>
                                <p className="text-sm text-text-muted mb-6 leading-relaxed">
                                    This evidence is encrypted with RSA + AES. Provide your <strong>Private Key</strong> (PEM format) to decrypt.
                                </p>
                                <textarea
                                    value={privateKey}
                                    onChange={(e) => setPrivateKey(e.target.value)}
                                    rows={5}
                                    placeholder="-----BEGIN PRIVATE KEY-----..."
                                    className="w-full bg-bg-page border border-border-subtle rounded-xl px-4 py-3 text-text-main text-xs font-mono focus:border-brand-primary/50 focus:outline-none resize-none mb-6"
                                />
                                {decryptionError && (
                                    <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                        <p className="text-xs text-red-600 font-bold">{decryptionError}</p>
                                    </div>
                                )}
                                <button
                                    onClick={handleDecrypt}
                                    disabled={isDecrypting || !privateKey}
                                    className="w-full py-4 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDecrypting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                                    {isDecrypting ? 'Decrypting...' : 'Unlock Evidence'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="w-full max-w-5xl mx-auto relative z-10 px-6 pt-32 pb-20 space-y-8">
                {/* Back */}
                <button onClick={() => router.push('/agency')}
                    className="flex items-center gap-2 text-text-muted hover:text-text-main text-sm font-medium group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Portal
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-bold text-brand-primary uppercase tracking-widest">Case File</span>
                            <span className="text-text-muted font-mono text-sm">ID: {id}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-text-main tracking-tight">{metadata?.title || record.title || 'Loading...'}</h1>
                    </div>
                    <div className="px-4 py-2 bg-brand-primary/5 border border-brand-primary/10 rounded-xl">
                        <div className="text-[9px] text-text-muted uppercase tracking-widest font-bold">Your Department</div>
                        <div className="text-sm font-bold text-brand-primary flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" /> {department}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-border-subtle rounded-2xl p-8 shadow-sm">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Description
                            </h3>
                            <p className="text-text-main leading-relaxed whitespace-pre-wrap">
                                {metadata?.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Evidence */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-border-subtle rounded-2xl p-5 shadow-sm">
                                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Evidence Hash</h3>
                                <div className="flex items-center gap-2 bg-bg-page p-2 rounded-lg border border-border-subtle">
                                    <Hash className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                    <span className="text-[9px] font-mono text-text-muted break-all">{record.fileHash}</span>
                                </div>
                            </div>
                            <div className="bg-white border border-border-subtle rounded-2xl p-5 shadow-sm">
                                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">IPFS Metadata</h3>
                                <a href={`https://gateway.pinata.cloud/ipfs/${record.metadataCID}`} target="_blank"
                                    className="flex items-center gap-2 bg-brand-primary/5 p-2 rounded-lg border border-brand-primary/10 group">
                                    <span className="text-[9px] font-mono text-brand-primary truncate">{record.metadataCID}</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                </a>
                            </div>
                        </div>

                        {/* ════ Encrypted Evidence Bundle ════ */}
                        <div className="bg-white border-2 border-brand-primary/20 rounded-2xl p-8 shadow-sm" style={{ background: 'linear-gradient(135deg, rgba(var(--brand-primary-rgb, 59,130,246), 0.03), transparent)' }}>
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 flex items-center justify-center shrink-0">
                                    {decryptedFileUrl ? <FileSearch className="w-8 h-8 text-brand-primary" /> : <Shield className="w-8 h-8 text-brand-primary" />}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-bold text-text-main mb-1">
                                        {decryptedFileUrl ? 'Evidence Decrypted' : 'Encrypted Evidence Bundle'}
                                    </h3>
                                    <p className="text-sm text-text-muted mb-4">
                                        {decryptedFileUrl
                                            ? 'Successfully decrypted locally. You can view or download the cleartext file.'
                                            : 'Secured with AES-256-GCM encryption. Use decryption key to access evidence.'
                                        }
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        {!decryptedFileUrl ? (
                                            <button
                                                onClick={() => {
                                                    if (metadata?.encryptionKey && !metadata?.isAsymmetric) {
                                                        handleDecrypt()
                                                    } else {
                                                        setShowDecryptModal(true)
                                                    }
                                                }}
                                                disabled={isDecrypting}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-secondary transition-all disabled:opacity-50"
                                            >
                                                {isDecrypting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                                                {isDecrypting ? 'Decrypting...' : 'Unlock Evidence'}
                                            </button>
                                        ) : (
                                            <>
                                                <a href={decryptedFileUrl} target="_blank"
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-secondary transition-all"
                                                >
                                                    <Download className="w-4 h-4" /> Download Cleartext
                                                </a>
                                                <button onClick={() => setDecryptedFileUrl(null)}
                                                    className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-main"
                                                >
                                                    Clear Memory
                                                </button>
                                            </>
                                        )}
                                        {metadata?.encryptionKey && (
                                            keySaved ? (
                                                <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-xs font-bold text-green-600">
                                                    <CheckCircle2 className="w-4 h-4" /> Key Saved
                                                </span>
                                            ) : (
                                                <button onClick={handleSaveKeyLocally}
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all"
                                                >
                                                    <KeyRound className="w-4 h-4" /> Send Key to Vault
                                                </button>
                                            )
                                        )}
                                        <a href={`https://gateway.pinata.cloud/ipfs/${metadata?.fileCID}`} target="_blank"
                                            className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-main flex items-center gap-2"
                                        >
                                            Source Bundle <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                    {decryptionError && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                            <span className="text-xs text-red-600 font-medium">{decryptionError}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submitted Report */}
                        {submittedReport && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className={`bg-white rounded-2xl p-8 border-2 shadow-sm ${submittedReport.action === 'Resolved' ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    {submittedReport.action === 'Resolved' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                    <h3 className="text-sm font-bold text-text-main">{submittedReport.action} — Report Filed</h3>
                                    <span className="text-[10px] text-text-muted font-mono ml-auto">{format(submittedReport.timestamp, 'HH:mm:ss')}</span>
                                </div>
                                <p className="text-sm text-text-main bg-white p-4 rounded-xl border border-border-subtle mb-3">{submittedReport.summary}</p>
                                {submittedReport.findings && <p className="text-sm text-text-muted bg-white p-3 rounded-xl border border-border-subtle">{submittedReport.findings}</p>}
                                {submittedReport.fileName && (
                                    <div className="flex items-center gap-2 mt-3 text-xs text-text-muted"><File className="w-3.5 h-3.5" /> {submittedReport.fileName}</div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Metadata */}
                        <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest border-b border-border-subtle pb-3">Registry Info</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-muted flex items-center gap-2"><User className="w-3.5 h-3.5" /> Reporter</span>
                                <span className="text-xs font-mono text-text-main">{record.creator.slice(0, 6)}...{record.creator.slice(-4)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-muted flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Filed</span>
                                <span className="text-xs text-text-main">{format(record.timestamp, 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-muted flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Status</span>
                                <span className="text-xs font-bold text-brand-primary">{statusLabels[record.status]}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Case Actions
                            </h3>

                            {record.status === 0 && (
                                <button disabled={isPending || isConfirming} onClick={() => handleUpdateStatus(2)}
                                    className="w-full p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10 hover:bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center justify-center gap-2 transition-all">
                                    <CheckCircle2 className="w-4 h-4" /> Accept & Start Investigation
                                </button>
                            )}
                            {record.status === 2 && (
                                <div className="space-y-3">
                                    <button disabled={isPending || isConfirming} onClick={() => handleUpdateStatus(4)}
                                        className="w-full p-4 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 text-xs font-bold flex items-center justify-between transition-all">
                                        <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-4 h-4" /> Resolve Case</div>
                                        <span className="px-2 py-0.5 bg-green-100 rounded text-[9px] text-green-600 font-bold">REPORT</span>
                                    </button>
                                    <button disabled={isPending || isConfirming} onClick={() => handleUpdateStatus(5)}
                                        className="w-full p-4 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-xs font-bold flex items-center justify-between transition-all">
                                        <div className="flex items-center gap-2 text-red-500"><XCircle className="w-4 h-4" /> Reject Case</div>
                                        <span className="px-2 py-0.5 bg-red-100 rounded text-[9px] text-red-500 font-bold">REPORT</span>
                                    </button>
                                </div>
                            )}

                            {(isPending || isConfirming) && (
                                <div className="flex items-center justify-center gap-2 p-4 bg-brand-primary/5 rounded-xl animate-pulse">
                                    <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
                                    <span className="text-xs font-bold text-brand-primary">Processing...</span>
                                </div>
                            )}
                            {isSuccess && (
                                <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-xl border border-green-200">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-bold text-green-600">Updated!</span>
                                </div>
                            )}
                        </div>

                        {/* ════ Key Vault ════ */}
                        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                <KeyRound className="w-4 h-4" /> Key Vault
                            </h3>
                            <p className="text-[10px] text-text-muted leading-relaxed">
                                Saved decryption keys from evidence bundles. Use these to unlock encrypted files.
                            </p>
                            {vaultKeys.length === 0 ? (
                                <div className="p-4 bg-slate-50 border border-border-subtle rounded-xl text-center">
                                    <Lock className="w-5 h-5 text-text-muted/30 mx-auto mb-2" />
                                    <span className="text-[10px] text-text-muted">No keys saved yet. Click "Send Key to Vault" on a case to save.</span>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {vaultKeys.map((vk: any) => (
                                        <div key={vk.caseId} className={`p-3 rounded-xl border transition-all ${vk.caseId === Number(id)
                                                ? 'bg-brand-primary/5 border-brand-primary/20'
                                                : 'bg-slate-50 border-border-subtle'
                                            }`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-text-main">Case #{vk.caseId}</span>
                                                <div className="flex items-center gap-0.5">
                                                    <button
                                                        onClick={() => setRevealedVaultKey(revealedVaultKey === vk.caseId ? null : vk.caseId)}
                                                        className="p-1 rounded hover:bg-white transition-colors"
                                                        title={revealedVaultKey === vk.caseId ? 'Hide' : 'Reveal'}
                                                    >
                                                        {revealedVaultKey === vk.caseId
                                                            ? <EyeOff className="w-3 h-3 text-text-muted" />
                                                            : <Eye className="w-3 h-3 text-text-muted" />
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(vk.encryptionKey)
                                                            setCopiedVault(`key-${vk.caseId}`)
                                                            setTimeout(() => setCopiedVault(null), 2000)
                                                        }}
                                                        className="p-1 rounded hover:bg-white transition-colors"
                                                        title="Copy key"
                                                    >
                                                        {copiedVault === `key-${vk.caseId}`
                                                            ? <Check className="w-3 h-3 text-green-500" />
                                                            : <Copy className="w-3 h-3 text-text-muted" />
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const updated = vaultKeys.filter((k: any) => k.caseId !== vk.caseId)
                                                            localStorage.setItem('nyayasetu_keyvault', JSON.stringify(updated))
                                                            setVaultKeys(updated)
                                                        }}
                                                        className="p-1 rounded hover:bg-red-50 transition-colors group"
                                                        title="Delete key"
                                                    >
                                                        <Trash2 className="w-3 h-3 text-text-muted group-hover:text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-[9px] text-text-muted mb-1">{vk.department} • {vk.title?.slice(0, 30)}{vk.title?.length > 30 ? '...' : ''}</div>
                                            {revealedVaultKey === vk.caseId && (
                                                <div className="mt-2 space-y-1.5">
                                                    <div className="p-2 bg-white border border-border-subtle rounded-lg">
                                                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest block mb-0.5">Key</span>
                                                        <code className="text-[9px] font-mono text-text-main break-all">{vk.encryptionKey}</code>
                                                    </div>
                                                    <div className="p-2 bg-white border border-border-subtle rounded-lg">
                                                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest block mb-0.5">IV</span>
                                                        <code className="text-[9px] font-mono text-text-main break-all">{vk.iv}</code>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
