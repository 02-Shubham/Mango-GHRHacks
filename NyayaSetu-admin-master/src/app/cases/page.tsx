'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { useCases } from '@/hooks/useCases'
import {
    Shield,
    Search,
    Filter,
    ArrowUpRight,
    ChevronRight,
    Megaphone,
    AlertTriangle,
    Loader2,
    CheckCircle2,
    X,
    Mail,
    Plus,
    Trash2,
    Send,
    Lock,
    ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MEDIA_RECIPIENTS } from '@/config/media-recipients'

// Helper to get leaked case IDs from localStorage
function getLeakedCases(): number[] {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem('nyayasetu_leaked_cases')
    return raw ? JSON.parse(raw) : []
}
function markCaseLeaked(caseId: number) {
    const leaked = getLeakedCases()
    if (!leaked.includes(caseId)) {
        leaked.push(caseId)
        localStorage.setItem('nyayasetu_leaked_cases', JSON.stringify(leaked))
    }
}

export default function CasesPage() {
    const { cases, isLoading, statusMap } = useCases()
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<number | 'all'>('all')

    // Leak to media state
    const [leakModalOpen, setLeakModalOpen] = useState(false)
    const [leakCase, setLeakCase] = useState<any>(null)
    const [leakMetadata, setLeakMetadata] = useState<any>(null)
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
    const [recipients, setRecipients] = useState<string[]>([''])
    const [isSending, setIsSending] = useState(false)
    const [leakResult, setLeakResult] = useState<{ success: boolean; message: string } | null>(null)
    const [leakedCases, setLeakedCases] = useState<number[]>([])
    const [confirmText, setConfirmText] = useState('')

    useEffect(() => {
        setLeakedCases(getLeakedCases())
    }, [])

    const filteredCases = cases.filter(c => {
        const matchesSearch = c.id.toString().includes(searchQuery) ||
            c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.creator.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = filterStatus === 'all'
            ? c.status < 4
            : c.status === filterStatus

        return matchesSearch && matchesStatus
    })

    const openLeakModal = async (record: any, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setLeakCase(record)
        setLeakResult(null)
        setConfirmText('')
        setRecipients(MEDIA_RECIPIENTS.length > 0 ? [...MEDIA_RECIPIENTS] : [''])
        setLeakMetadata(null)
        setLeakModalOpen(true)

        // Fetch IPFS metadata
        if (record.metadataCID) {
            setIsLoadingMetadata(true)
            try {
                const cleanCID = record.metadataCID.startsWith('ipfs://') ? record.metadataCID.slice(7) : record.metadataCID
                const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cleanCID}`)
                const data = await res.json()
                setLeakMetadata(data)
            } catch { }
            setIsLoadingMetadata(false)
        }
    }

    const addRecipient = () => setRecipients([...recipients, ''])
    const removeRecipient = (i: number) => setRecipients(recipients.filter((_, idx) => idx !== i))
    const updateRecipient = (i: number, val: string) => {
        const updated = [...recipients]
        updated[i] = val
        setRecipients(updated)
    }

    const validRecipients = recipients.filter(r => r.includes('@') && r.includes('.'))

    const handleSendLeak = async () => {
        if (!leakCase || validRecipients.length === 0 || confirmText !== 'LEAK') return
        setIsSending(true)
        setLeakResult(null)

        try {
            const payload = {
                caseId: leakCase.id,
                title: leakMetadata?.title || leakCase.title || leakCase.department,
                description: leakMetadata?.description || 'No description available.',
                department: leakCase.department,
                status: statusMap[leakCase.status],
                reporter: leakCase.creator,
                filedDate: format(leakCase.timestamp, 'MMM dd, yyyy HH:mm'),
                fileHash: leakCase.fileHash,
                metadataCID: leakCase.metadataCID,
                fileCID: leakMetadata?.fileCID || '',
                encryptionInfo: leakMetadata?.isAsymmetric ? 'RSA-2048 + AES-256-GCM (Hybrid)' : 'AES-256-GCM',
                ipfsMetadataUrl: `https://gateway.pinata.cloud/ipfs/${leakCase.metadataCID}`,
                ipfsFileUrl: leakMetadata?.fileCID ? `https://gateway.pinata.cloud/ipfs/${leakMetadata.fileCID}` : null,
                recipients: validRecipients,
            }

            const res = await fetch('/api/leak-to-media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const result = await res.json()

            if (result.success) {
                markCaseLeaked(leakCase.id)
                setLeakedCases(getLeakedCases())

                // If SMTP failed, open Gmail compose in new tab
                if (result.method === 'compose' && result.composeUrl) {
                    window.open(result.composeUrl, '_blank')
                    setLeakResult({ success: true, message: `Gmail compose window opened — review and hit Send. Recipients: ${validRecipients.length}` })
                } else {
                    setLeakResult({ success: true, message: `Email dispatched to ${validRecipients.length} recipient(s). Message ID: ${result.auditLog?.messageId || 'N/A'}` })
                }
            } else {
                setLeakResult({ success: false, message: result.error || 'Failed to send.' })
            }
        } catch (err: any) {
            setLeakResult({ success: false, message: err.message || 'Network error' })
        }
        setIsSending(false)
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-main tracking-tight mb-2">Internal Registry</h1>
                    <p className="text-text-muted">Complete archive of all whistleblower submissions and legal proceedings.</p>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-border-subtle shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search Case ID, Dept, or Address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-bg-page border border-border-subtle rounded-xl pl-12 pr-4 py-2.5 text-sm text-text-main focus:border-brand-primary/40 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-text-muted hidden md:block" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="flex-1 md:w-48 bg-bg-page border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-main transition-all outline-none"
                        >
                            <option value="all">All Statuses</option>
                            {statusMap.map((label, i) => (
                                <option key={i} value={i}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Cases Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="h-24 bg-bg-page rounded-2xl animate-pulse border border-border-subtle" />
                        ))
                    ) : (
                        filteredCases.map((record, i) => {
                            const isLeaked = leakedCases.includes(record.id)
                            return (
                                <motion.div
                                    key={record.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link href={`/cases/${record.id}`} className="group">
                                        <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between group-hover:border-brand-primary/30 transition-all">
                                            <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                                                <div className="w-12 h-12 bg-brand-primary/5 rounded-2xl flex items-center justify-center border border-brand-primary/10 group-hover:bg-brand-primary/10 group-hover:border-brand-primary/20 transition-all">
                                                    <span className="text-sm font-mono font-bold text-brand-primary">#{record.id}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-text-main font-bold">{record.title || record.department}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${record.status === 4 ? 'bg-brand-accent/10 text-brand-accent' :
                                                            record.status === 3 ? 'bg-red-500/10 text-red-500' :
                                                                'bg-brand-primary/10 text-brand-primary'
                                                            }`}>
                                                            {statusMap[record.status]}
                                                        </span>
                                                        {isLeaked && (
                                                            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                                <Megaphone className="w-3 h-3" /> Leaked
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <div className="text-xs text-text-muted font-mono">
                                                            Reporter: {record.creator.slice(0, 8)}...{record.creator.slice(-6)}
                                                        </div>
                                                        {record.title !== record.department && (
                                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-primary/5 border border-brand-primary/10">
                                                                <div className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" />
                                                                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-tighter">IPFS Live</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Filed Date</div>
                                                    <div className="text-xs text-text-main font-medium">
                                                        {format(record.timestamp, 'MMM dd, yyyy')}
                                                    </div>
                                                </div>

                                                {/* Leak to Media Button */}
                                                <button
                                                    onClick={(e) => openLeakModal(record, e)}
                                                    disabled={isLeaked}
                                                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isLeaked
                                                        ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-60'
                                                        : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 hover:shadow-md'
                                                        }`}
                                                    title={isLeaked ? 'Already leaked' : 'Leak to Media'}
                                                >
                                                    <Megaphone className="w-3.5 h-3.5" />
                                                    {isLeaked ? 'Leaked' : 'Leak'}
                                                </button>

                                                <div className="p-2 rounded-xl bg-bg-page border border-border-subtle group-hover:bg-brand-primary group-hover:border-brand-primary text-text-muted group-hover:text-white transition-all">
                                                    <ChevronRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })
                    )}

                    {!isLoading && filteredCases.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-bg-page rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border-subtle">
                                <Shield className="w-8 h-8 text-text-muted" />
                            </div>
                            <p className="text-text-muted font-medium">No records matching your query.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════════ LEAK CONFIRMATION MODAL ═══════════════ */}
            <AnimatePresence>
                {leakModalOpen && leakCase && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[60]"
                            onClick={() => !isSending && setLeakModalOpen(false)}
                        />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-[70] p-4 pointer-events-none"
                        >
                            <div className="bg-white rounded-3xl shadow-2xl pointer-events-auto overflow-hidden border-2 border-red-200">
                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-red-600 to-red-800 px-8 py-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                                                <Megaphone className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">Leak to Media</h2>
                                                <p className="text-red-200 text-xs">Case #{leakCase.id} — {leakMetadata?.title || leakCase.department}</p>
                                            </div>
                                        </div>
                                        {!isSending && (
                                            <button onClick={() => setLeakModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Success State */}
                                {leakResult?.success ? (
                                    <div className="p-8 text-center">
                                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-200">
                                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-text-main mb-2">Disclosure Dispatched</h3>
                                        <p className="text-sm text-text-muted mb-6">{leakResult.message}</p>
                                        <div className="p-4 bg-slate-50 border border-border-subtle rounded-xl text-left">
                                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Audit Log</div>
                                            <div className="text-xs text-text-main space-y-1 font-mono">
                                                <div>Case: #{leakCase.id}</div>
                                                <div>Time: {new Date().toISOString()}</div>
                                                <div>Recipients: {validRecipients.join(', ')}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => setLeakModalOpen(false)}
                                            className="mt-6 px-8 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all"
                                        >
                                            Close
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                                        {/* Warning Banner */}
                                        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="text-sm font-bold text-red-700 mb-1">⚠️ IRREVERSIBLE ACTION</h4>
                                                    <p className="text-xs text-red-600 leading-relaxed">
                                                        This will send <strong>all case data</strong> — including description, evidence hashes, IPFS links, and cryptographic proofs —
                                                        directly to the media recipients below. <strong>This cannot be undone.</strong> The case will be permanently marked as leaked.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Case Summary */}
                                        <div className="p-4 bg-slate-50 border border-border-subtle rounded-xl">
                                            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">What will be disclosed</div>
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div><span className="text-text-muted">Title:</span> <span className="text-text-main font-bold">{isLoadingMetadata ? 'Loading...' : (leakMetadata?.title || leakCase.department)}</span></div>
                                                <div><span className="text-text-muted">Department:</span> <span className="text-text-main font-bold">{leakCase.department}</span></div>
                                                <div><span className="text-text-muted">Filed:</span> <span className="text-text-main">{format(leakCase.timestamp, 'MMM dd, yyyy')}</span></div>
                                                <div><span className="text-text-muted">Status:</span> <span className="text-text-main">{statusMap[leakCase.status]}</span></div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-border-subtle text-[10px] text-text-muted">
                                                + Evidence hash, IPFS metadata/file links, reporter wallet, encryption details
                                            </div>
                                        </div>

                                        {/* Recipients */}
                                        <div>
                                            <label className="text-xs font-bold text-text-main uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-red-500" /> Media Recipients <span className="text-red-500 text-[10px]">*</span>
                                            </label>
                                            <div className="space-y-2">
                                                {recipients.map((email, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <input
                                                            type="email"
                                                            value={email}
                                                            onChange={(e) => updateRecipient(i, e.target.value)}
                                                            placeholder="journalist@newsoutlet.com"
                                                            className="flex-1 bg-bg-page border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-main focus:border-red-300 focus:outline-none"
                                                        />
                                                        {recipients.length > 1 && (
                                                            <button onClick={() => removeRecipient(i)} className="p-2 hover:bg-red-50 rounded-lg">
                                                                <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-red-500" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={addRecipient}
                                                className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-brand-primary hover:text-brand-secondary transition-colors"
                                            >
                                                <Plus className="w-3 h-3" /> Add another recipient
                                            </button>
                                        </div>

                                        {/* Confirmation */}
                                        <div>
                                            <label className="text-xs font-bold text-text-main uppercase tracking-wider mb-2 block">
                                                Type <span className="text-red-600 font-mono">LEAK</span> to confirm
                                            </label>
                                            <input
                                                type="text"
                                                value={confirmText}
                                                onChange={(e) => setConfirmText(e.target.value)}
                                                placeholder='Type "LEAK" here'
                                                className="w-full bg-bg-page border-2 border-red-200 rounded-xl px-4 py-3 text-sm text-text-main font-mono tracking-widest text-center focus:border-red-400 focus:outline-none"
                                            />
                                        </div>

                                        {/* Error */}
                                        {leakResult && !leakResult.success && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                                <span className="text-xs text-red-600 font-medium">{leakResult.message}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Footer */}
                                {!leakResult?.success && (
                                    <div className="px-8 py-5 bg-slate-50 border-t border-border-subtle flex items-center justify-between">
                                        <button onClick={() => setLeakModalOpen(false)} disabled={isSending}
                                            className="px-5 py-2.5 text-sm text-text-muted hover:text-text-main disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSendLeak}
                                            disabled={isSending || confirmText !== 'LEAK' || validRecipients.length === 0}
                                            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
                                        >
                                            {isSending ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                                            ) : (
                                                <><Send className="w-4 h-4" /> Dispatch Disclosure</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </AdminLayout>
    )
}
