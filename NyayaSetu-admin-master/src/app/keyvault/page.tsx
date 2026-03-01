'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import {
    KeyRound,
    Copy,
    Check,
    Trash2,
    Shield,
    Eye,
    EyeOff,
    Lock,
    Search,
    Download,
    FileText
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export interface VaultKey {
    caseId: number
    department: string
    title: string
    encryptionKey: string
    iv: string
    isAsymmetric: boolean
    fileCID: string
    storedAt: string
}

function getVaultKeys(): VaultKey[] {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem('nyayasetu_keyvault')
    return raw ? JSON.parse(raw) : []
}

function saveVaultKeys(keys: VaultKey[]) {
    localStorage.setItem('nyayasetu_keyvault', JSON.stringify(keys))
}

export function addKeyToVault(key: VaultKey) {
    const existing = getVaultKeys()
    const alreadyExists = existing.some(k => k.caseId === key.caseId)
    if (alreadyExists) {
        // Update existing
        const updated = existing.map(k => k.caseId === key.caseId ? key : k)
        saveVaultKeys(updated)
    } else {
        saveVaultKeys([key, ...existing])
    }
}

export function removeKeyFromVault(caseId: number) {
    const existing = getVaultKeys()
    saveVaultKeys(existing.filter(k => k.caseId !== caseId))
}

export default function KeyVaultPage() {
    const [keys, setKeys] = useState<VaultKey[]>([])
    const [copied, setCopied] = useState<string | null>(null)
    const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set())
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        setKeys(getVaultKeys())
    }, [])

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        setCopied(label)
        setTimeout(() => setCopied(null), 2000)
    }

    const handleDelete = (caseId: number) => {
        removeKeyFromVault(caseId)
        setKeys(getVaultKeys())
    }

    const toggleReveal = (caseId: number) => {
        setRevealedKeys(prev => {
            const next = new Set(prev)
            if (next.has(caseId)) next.delete(caseId)
            else next.add(caseId)
            return next
        })
    }

    const handleExportAll = () => {
        const data = JSON.stringify(keys, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'nyayasetu-keyvault-export.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    const filteredKeys = searchQuery
        ? keys.filter(k =>
            k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            k.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(k.caseId).includes(searchQuery)
        )
        : keys

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                                <KeyRound className="w-6 h-6 text-amber-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-text-main tracking-tight">Key Vault</h1>
                        </div>
                        <p className="text-text-muted">
                            Secure storage for evidence decryption keys. Keys are stored locally in your browser.
                        </p>
                    </div>
                    {keys.length > 0 && (
                        <button
                            onClick={handleExportAll}
                            className="flex items-center gap-2 px-4 py-2.5 bg-bg-page border border-border-subtle rounded-xl text-xs font-bold text-text-muted hover:text-text-main transition-colors"
                        >
                            <Download className="w-3.5 h-3.5" /> Export All Keys
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                        <div className="text-2xl font-bold text-text-main">{keys.length}</div>
                        <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Total Keys</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                        <div className="text-2xl font-bold text-text-main">{keys.filter(k => !k.isAsymmetric).length}</div>
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">AES Direct</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200">
                        <div className="text-2xl font-bold text-text-main">{keys.filter(k => k.isAsymmetric).length}</div>
                        <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">RSA Wrapped</div>
                    </div>
                </div>

                {/* Search */}
                {keys.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by case ID, title, or department..."
                            className="w-full bg-white border border-border-subtle rounded-xl pl-12 pr-4 py-3 text-sm text-text-main focus:border-brand-primary/40 focus:outline-none"
                        />
                    </div>
                )}

                {/* Keys List */}
                {filteredKeys.length === 0 ? (
                    <div className="bg-white border border-border-subtle rounded-2xl p-16 text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-border-subtle">
                            <Lock className="w-8 h-8 text-text-muted/30" />
                        </div>
                        <h3 className="text-lg font-bold text-text-main mb-2">
                            {keys.length === 0 ? 'No Keys Stored' : 'No Matching Keys'}
                        </h3>
                        <p className="text-sm text-text-muted max-w-md mx-auto">
                            {keys.length === 0
                                ? 'Open a case detail page and click "Send Key to Vault" to store decryption keys here.'
                                : 'Try a different search term.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredKeys.map((key, i) => {
                                const isRevealed = revealedKeys.has(key.caseId)
                                return (
                                    <motion.div
                                        key={key.caseId}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[10px] font-mono text-text-muted">Case #{key.caseId}</span>
                                                    <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg font-bold ${key.isAsymmetric
                                                        ? 'bg-purple-50 text-purple-600 border border-purple-200'
                                                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                                                        }`}>
                                                        {key.isAsymmetric ? 'RSA Wrapped' : 'AES Direct'}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-bold text-text-main">{key.title}</h3>
                                                <span className="text-[10px] text-text-muted">{key.department} • Stored {new Date(key.storedAt).toLocaleDateString()}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(key.caseId)}
                                                className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
                                                title="Remove from vault"
                                            >
                                                <Trash2 className="w-4 h-4 text-text-muted group-hover:text-red-500" />
                                            </button>
                                        </div>

                                        {/* Key Display */}
                                        <div className="space-y-3">
                                            <div className="p-4 bg-slate-50 rounded-xl border border-border-subtle">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                                        <KeyRound className="w-3 h-3" /> Encryption Key
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => toggleReveal(key.caseId)}
                                                            className="p-1.5 rounded-lg hover:bg-white transition-colors"
                                                            title={isRevealed ? 'Hide' : 'Reveal'}
                                                        >
                                                            {isRevealed
                                                                ? <EyeOff className="w-3.5 h-3.5 text-text-muted" />
                                                                : <Eye className="w-3.5 h-3.5 text-text-muted" />
                                                            }
                                                        </button>
                                                        <button
                                                            onClick={() => handleCopy(key.encryptionKey, `key-${key.caseId}`)}
                                                            className="p-1.5 rounded-lg hover:bg-white transition-colors"
                                                            title="Copy key"
                                                        >
                                                            {copied === `key-${key.caseId}`
                                                                ? <Check className="w-3.5 h-3.5 text-brand-accent" />
                                                                : <Copy className="w-3.5 h-3.5 text-text-muted" />
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                                <code className="text-[11px] font-mono text-text-main break-all leading-relaxed">
                                                    {isRevealed ? key.encryptionKey : '•'.repeat(Math.min(key.encryptionKey.length, 64))}
                                                </code>
                                            </div>

                                            <div className="flex gap-3">
                                                <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-border-subtle">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">IV</span>
                                                        <button
                                                            onClick={() => handleCopy(key.iv, `iv-${key.caseId}`)}
                                                            className="p-1 rounded hover:bg-white transition-colors"
                                                        >
                                                            {copied === `iv-${key.caseId}`
                                                                ? <Check className="w-3 h-3 text-brand-accent" />
                                                                : <Copy className="w-3 h-3 text-text-muted" />
                                                            }
                                                        </button>
                                                    </div>
                                                    <code className="text-[10px] font-mono text-text-main break-all">
                                                        {isRevealed ? key.iv : '•'.repeat(24)}
                                                    </code>
                                                </div>
                                                <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-border-subtle">
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Evidence CID</span>
                                                    <code className="text-[10px] font-mono text-brand-primary break-all">{key.fileCID || 'N/A'}</code>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
