'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { useAdmin } from '@/hooks/useAdmin'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from 'wagmi'
import { addressConfig } from '@/contracts/addresses'
import RegistryABI from '@/contracts/CivicChainRegistry.json'
import {
    Shield,
    UserPlus,
    Lock,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Building2,
    Wallet,
    Users,
    Copy,
    Check,
    RefreshCw,
    ExternalLink,
    Trash2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'

const DEPARTMENTS = [
    'Police',
    'Cyber Crime',
    'Anti-Corruption Bureau',
    'Ministry of Finance',
    'Human Rights'
]

// Hardhat default accounts for easy demo
const HARDHAT_ACCOUNTS = [
    { label: 'Account #1 (Deployer/Admin)', address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' },
    { label: 'Account #2', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
    { label: 'Account #3', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' },
    { label: 'Account #4', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' },
    { label: 'Account #5', address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65' },
    { label: 'Account #6', address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc' },
]

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

interface RegistryEntry {
    department: string
    address: string
    isActive: boolean
}

export default function AgenciesPage() {
    const { isAdmin } = useAdmin()
    const publicClient = usePublicClient()
    const [agencyAddress, setAgencyAddress] = useState('')
    const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0])
    const [copied, setCopied] = useState<string | null>(null)

    // Authorized agencies tracking
    const [authorizedList, setAuthorizedList] = useState<{ address: string, department: string, timestamp: Date }[]>([])

    // On-chain registry
    const [registry, setRegistry] = useState<RegistryEntry[]>([])
    const [registryLoading, setRegistryLoading] = useState(true)

    const fetchRegistry = useCallback(async () => {
        if (!publicClient) return
        setRegistryLoading(true)
        try {
            const entries: RegistryEntry[] = []
            for (const dept of DEPARTMENTS) {
                try {
                    const addr = await publicClient.readContract({
                        address: addressConfig.CivicChainRegistry as `0x${string}`,
                        abi: RegistryABI.abi,
                        functionName: 'departmentToAgency',
                        args: [dept]
                    }) as string
                    entries.push({
                        department: dept,
                        address: addr,
                        isActive: addr !== ZERO_ADDRESS
                    })
                } catch {
                    entries.push({ department: dept, address: ZERO_ADDRESS, isActive: false })
                }
            }
            setRegistry(entries)
        } catch (err) {
            console.error('Failed to fetch registry:', err)
        } finally {
            setRegistryLoading(false)
        }
    }, [publicClient])

    useEffect(() => { fetchRegistry() }, [fetchRegistry])

    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    // Remove agency hook
    const { writeContract: writeRemove, data: removeHash, isPending: isRemoving, error: removeError } = useWriteContract()
    const { isLoading: isRemoveConfirming, isSuccess: isRemoveSuccess } = useWaitForTransactionReceipt({ hash: removeHash })
    const [removingDept, setRemovingDept] = useState<string | null>(null)

    // Re-fetch registry after successful add or remove
    useEffect(() => {
        if (isSuccess || isRemoveSuccess) {
            const timer = setTimeout(() => { fetchRegistry(); setRemovingDept(null) }, 1500)
            return () => clearTimeout(timer)
        }
    }, [isSuccess, isRemoveSuccess, fetchRegistry])

    const handleRemoveAgency = (entry: RegistryEntry) => {
        setRemovingDept(entry.department)
        writeRemove({
            address: addressConfig.CivicChainRegistry as `0x${string}`,
            abi: RegistryABI.abi,
            functionName: 'removeAgency',
            args: [entry.address as `0x${string}`, entry.department],
        })
    }

    // Check if a specific address is authorized
    const checkAuth = (addr: string) => {
        return authorizedList.some(a => a.address.toLowerCase() === addr.toLowerCase())
    }

    const handleAuthorize = () => {
        if (!agencyAddress || !selectedDept) return

        writeContract({
            address: addressConfig.CivicChainRegistry as `0x${string}`,
            abi: RegistryABI.abi,
            functionName: 'addAgency',
            args: [agencyAddress as `0x${string}`, selectedDept],
        })

        // Add to local tracking list
        setAuthorizedList(prev => [...prev, {
            address: agencyAddress,
            department: selectedDept,
            timestamp: new Date()
        }])
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(text)
        setTimeout(() => setCopied(null), 2000)
    }

    const handleQuickAssign = (address: string) => {
        setAgencyAddress(address)
    }

    if (!isAdmin) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main mb-2">Admin Access Required</h2>
                    <p className="text-text-muted max-w-sm font-medium">
                        Only the contract deployer can authorize agencies.
                    </p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-7 h-7 text-brand-primary" />
                        <h1 className="text-3xl font-bold text-text-main tracking-tight">Agency Authorization</h1>
                    </div>
                    <p className="text-text-muted">Register government agencies on-chain and assign them to departments. Once authorized, agencies can log in to the Agency Portal with their wallet.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Authorize Form */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="glass-card p-8 space-y-6">
                            <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-brand-primary" /> Register New Agency
                            </h3>

                            {/* Department Selection */}
                            <div>
                                <label className="text-xs font-bold text-text-main uppercase tracking-widest mb-3 block">
                                    Department
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {DEPARTMENTS.map((dept) => (
                                        <button
                                            key={dept}
                                            onClick={() => setSelectedDept(dept)}
                                            className={`p-4 rounded-xl border text-left transition-all ${selectedDept === dept
                                                ? 'bg-brand-primary/5 border-brand-primary/30 ring-1 ring-brand-primary/20'
                                                : 'bg-bg-page border-border-subtle hover:border-brand-primary/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Building2 className={`w-4 h-4 ${selectedDept === dept ? 'text-brand-primary' : 'text-text-muted'}`} />
                                                <span className={`text-xs font-bold uppercase tracking-wider ${selectedDept === dept ? 'text-brand-primary' : 'text-text-main'}`}>
                                                    {dept}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Wallet Address */}
                            <div>
                                <label className="text-xs font-bold text-text-main uppercase tracking-widest mb-2 block">
                                    Agency Wallet Address
                                </label>
                                <div className="relative">
                                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        value={agencyAddress}
                                        onChange={(e) => setAgencyAddress(e.target.value)}
                                        placeholder="0x..."
                                        className="w-full bg-bg-page border border-border-subtle rounded-xl pl-12 pr-4 py-3 text-sm text-text-main font-mono focus:border-brand-primary/40 focus:outline-none transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-text-muted mt-2">
                                    The agency will use this wallet to log in to the Agency Portal.
                                </p>
                            </div>

                            {/* Error */}
                            {writeError && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-red-600 font-medium">{writeError.message?.slice(0, 100)}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleAuthorize}
                                disabled={!agencyAddress || isPending || isConfirming}
                                className="w-full py-4 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                            >
                                {isPending || isConfirming ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing Transaction...</>
                                ) : (
                                    <><Shield className="w-5 h-5" /> Authorize Agency On-Chain</>
                                )}
                            </button>

                            {/* Success */}
                            <AnimatePresence>
                                {isSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3"
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                                        <div>
                                            <p className="text-sm font-bold text-brand-accent">Agency Authorized Successfully!</p>
                                            <p className="text-[10px] text-text-muted">The agency can now connect their wallet to the Agency Portal.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Quick Assign Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-6 space-y-4">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">
                                Quick Assign — Hardhat Accounts
                            </h3>
                            <p className="text-[10px] text-text-muted leading-relaxed">
                                Click an account to auto-fill for quick demo setup.
                            </p>

                            <div className="space-y-2">
                                {HARDHAT_ACCOUNTS.slice(1).map((acc) => (
                                    <button
                                        key={acc.address}
                                        onClick={() => handleQuickAssign(acc.address)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all group ${agencyAddress.toLowerCase() === acc.address.toLowerCase()
                                            ? 'bg-brand-primary/5 border-brand-primary/20'
                                            : 'bg-bg-page border-border-subtle hover:border-brand-primary/20'
                                            }`}
                                    >
                                        <div>
                                            <div className="text-[10px] font-bold text-text-main">{acc.label}</div>
                                            <div className="text-[9px] font-mono text-text-muted">{acc.address.slice(0, 14)}...{acc.address.slice(-6)}</div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCopy(acc.address) }}
                                            className="p-1.5 rounded-lg hover:bg-white transition-colors"
                                        >
                                            {copied === acc.address
                                                ? <Check className="w-3 h-3 text-brand-accent" />
                                                : <Copy className="w-3 h-3 text-text-muted" />
                                            }
                                        </button>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Authorized Agencies List */}
                        {authorizedList.length > 0 && (
                            <div className="glass-card p-6 space-y-4">
                                <h3 className="text-xs font-bold text-brand-accent uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Recently Authorized
                                </h3>
                                <div className="space-y-3">
                                    {authorizedList.map((entry, i) => (
                                        <div key={i} className="p-3 bg-green-50/50 border border-green-200 rounded-xl">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-brand-accent uppercase">{entry.department}</span>
                                                <span className="text-[9px] text-text-muted font-mono">
                                                    {entry.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="text-[9px] font-mono text-text-muted">
                                                {entry.address.slice(0, 16)}...{entry.address.slice(-8)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ════════ ON-CHAIN REGISTRY TABLE ════════ */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                                <Shield className="w-5 h-5 text-brand-primary" />
                                On-Chain Agency Registry
                            </h2>
                            <p className="text-xs text-text-muted mt-1">Live data from the CivicChainRegistry smart contract.</p>
                        </div>
                        <button
                            onClick={fetchRegistry}
                            disabled={registryLoading}
                            className="p-2.5 bg-bg-page border border-border-subtle rounded-xl hover:bg-slate-100 transition-colors"
                            title="Refresh registry"
                        >
                            <RefreshCw className={`w-4 h-4 text-text-muted ${registryLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="document-card overflow-hidden shadow-lg">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border-subtle bg-slate-50">
                                    <th className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Department</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Wallet Address</th>
                                    <th className="px-8 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                                {registryLoading ? (
                                    <tr><td colSpan={4} className="px-8 py-12 text-center">
                                        <Loader2 className="w-6 h-6 text-brand-primary animate-spin mx-auto mb-2" />
                                        <span className="text-xs text-text-muted">Reading from blockchain...</span>
                                    </td></tr>
                                ) : (
                                    registry.map((entry) => (
                                        <tr key={entry.department} className="group hover:bg-slate-50 transition-colors">
                                            <td className="px-8 py-5">
                                                {entry.isActive ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-brand-accent shadow-sm" />
                                                        <span className="text-[10px] font-bold text-brand-accent uppercase">Active</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                                                        <span className="text-[10px] font-bold text-text-muted uppercase">Unassigned</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className={`w-4 h-4 ${entry.isActive ? 'text-brand-primary' : 'text-text-muted/40'}`} />
                                                    <span className={`text-sm font-bold ${entry.isActive ? 'text-text-main' : 'text-text-muted'}`}>{entry.department}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {entry.isActive ? (
                                                    <span className="text-xs font-mono text-text-main bg-bg-page px-3 py-1.5 rounded-lg border border-border-subtle inline-block">
                                                        {entry.address}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-text-muted italic">No agency assigned</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {entry.isActive && (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleCopy(entry.address)}
                                                            className="p-2 rounded-lg hover:bg-bg-page transition-colors inline-flex"
                                                            title="Copy address"
                                                        >
                                                            {copied === entry.address
                                                                ? <Check className="w-3.5 h-3.5 text-brand-accent" />
                                                                : <Copy className="w-3.5 h-3.5 text-text-muted" />
                                                            }
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveAgency(entry)}
                                                            disabled={isRemoving || isRemoveConfirming}
                                                            className="p-2 rounded-lg hover:bg-red-50 transition-colors inline-flex group"
                                                            title="Remove agency"
                                                        >
                                                            {(isRemoving || isRemoveConfirming) && removingDept === entry.department
                                                                ? <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" />
                                                                : <Trash2 className="w-3.5 h-3.5 text-text-muted group-hover:text-red-500 transition-colors" />
                                                            }
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <div className="px-8 py-4 bg-slate-50 border-t border-border-subtle flex items-center justify-between">
                            <span className="text-[10px] text-text-muted font-mono uppercase">
                                {registry.filter(e => e.isActive).length} of {DEPARTMENTS.length} departments assigned
                            </span>
                            <span className="text-[10px] text-text-muted flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" /> Live from CivicChainRegistry
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
