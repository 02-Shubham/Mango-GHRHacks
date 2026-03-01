'use client'

import { Navbar } from '@/components/Navbar'
import { useAgencyAuth } from '@/hooks/useAgencyAuth'
import { useCases, type CaseRecord } from '@/hooks/useCases'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { addressConfig } from '@/contracts/addresses'
import RegistryABI from '@/contracts/CivicChainRegistry.json'
import {
  ShieldCheck,
  BookOpen,
  Lock,
  Wallet,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Building2,
  ArrowRight,
  Filter,
  FileText,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'

const statusMap: Record<number, { label: string, color: string, bg: string, border: string }> = {
  0: { label: 'Submitted', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  1: { label: 'Assigned', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  2: { label: 'In Progress', color: 'text-brand-primary', bg: 'bg-brand-primary/5', border: 'border-brand-primary/20' },
  3: { label: 'Escalated', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  4: { label: 'Resolved', color: 'text-brand-accent', bg: 'bg-green-50', border: 'border-green-200' },
  5: { label: 'Rejected', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  6: { label: 'False Claim', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
}

export default function AgencyPortal() {
  const { isAgency, department, isLoading: authLoading, isConnected, address } = useAgencyAuth()
  const { cases, isLoading: casesLoading, refresh } = useCases()
  const [statusFilter, setStatusFilter] = useState<number | null>(null)

  // Filter cases by agency's department
  const departmentCases = cases.filter(c => c.department === department)
  const filteredCases = statusFilter !== null
    ? departmentCases.filter(c => c.status === statusFilter)
    : departmentCases

  const casesByStatus = {
    pending: departmentCases.filter(c => c.status === 0).length,
    inProgress: departmentCases.filter(c => c.status === 2).length,
    resolved: departmentCases.filter(c => c.status >= 4).length,
  }

  // Not connected state
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-bg-page relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 opacity-30" />
        <Navbar />
        <div className="w-full max-w-2xl mx-auto relative z-10 px-6 pt-40 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border-subtle rounded-3xl p-12 shadow-lg"
          >
            <div className="w-20 h-20 bg-brand-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-brand-primary/10">
              <Wallet className="w-10 h-10 text-brand-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-main mb-3">Agency Portal</h1>
            <p className="text-text-muted mb-8 max-w-md mx-auto leading-relaxed">
              Connect your authorized agency wallet to access your department's cases.
              Your wallet address serves as your secure login — no passwords needed.
            </p>
            <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 text-sm text-text-muted">
              <strong className="text-brand-primary">How it works:</strong> The admin registers your wallet address to a department on-chain. Once authorized, simply connect that wallet here to access your cases.
            </div>
          </motion.div>
        </div>
      </main>
    )
  }

  // Loading state
  if (authLoading) {
    return (
      <main className="min-h-screen bg-bg-page">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
          <p className="text-text-muted font-mono text-xs uppercase tracking-widest">Verifying on-chain authorization...</p>
        </div>
      </main>
    )
  }

  // Not authorized state
  if (!isAgency) {
    return (
      <main className="min-h-screen bg-bg-page relative overflow-hidden">
        <Navbar />
        <div className="w-full max-w-2xl mx-auto relative z-10 px-6 pt-40 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-red-200 rounded-3xl p-12 shadow-lg"
          >
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-100">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-text-main mb-3">Access Denied</h1>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              Your connected wallet is not registered as an authorized agency.
            </p>
            <div className="p-4 bg-bg-page rounded-2xl border border-border-subtle text-left space-y-2">
              <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-2">Connected Wallet</div>
              <div className="text-xs font-mono text-text-main">{address}</div>
            </div>
            <p className="text-xs text-text-muted mt-6">
              Contact the NyayaSetu admin to register your wallet as an authorized agency.
            </p>
          </motion.div>
        </div>
      </main>
    )
  }

  // Authorized — show the portal
  return (
    <main className="min-h-screen bg-bg-page relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 opacity-30" />

      <Navbar />

      <div className="w-full max-w-6xl mx-auto relative z-10 px-6 pt-32 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="w-8 h-8 text-brand-primary" />
              <h1 className="text-4xl font-black text-text-main tracking-tight">Agency Portal</h1>
            </div>
            <p className="text-text-muted max-w-2xl leading-relaxed">
              Authorized access for <strong className="text-brand-primary">{department}</strong> department.
              View, accept, and manage cases assigned to your jurisdiction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-brand-primary/5 border border-brand-primary/10 rounded-xl">
              <div className="text-[9px] text-text-muted uppercase tracking-widest font-bold">Department</div>
              <div className="text-sm font-bold text-brand-primary flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" /> {department}
              </div>
            </div>
            <button
              onClick={refresh}
              className="p-3 bg-white border border-border-subtle rounded-xl hover:bg-bg-page transition-colors"
              title="Refresh cases"
            >
              <RefreshCw className={`w-4 h-4 text-text-muted ${casesLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Pending Review', value: casesByStatus.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
            { label: 'In Progress', value: casesByStatus.inProgress, icon: FileText, color: 'text-brand-primary', bg: 'bg-brand-primary/5', border: 'border-brand-primary/20' },
            { label: 'Resolved', value: casesByStatus.resolved, icon: CheckCircle2, color: 'text-brand-accent', bg: 'bg-green-50', border: 'border-green-200' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl border ${stat.border} ${stat.bg} flex items-center gap-4`}
            >
              <div className={`p-3 rounded-xl bg-white border ${stat.border}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-3xl font-bold text-text-main">{stat.value}</div>
                <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-2 text-text-muted mr-2">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Filter:</span>
          </div>
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === null
              ? 'bg-brand-primary text-white shadow-sm'
              : 'bg-white border border-border-subtle text-text-muted hover:text-text-main'
              }`}
          >
            All ({departmentCases.length})
          </button>
          {[0, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === s
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-white border border-border-subtle text-text-muted hover:text-text-main'
                }`}
            >
              {statusMap[s]?.label} ({departmentCases.filter(c => c.status === s).length})
            </button>
          ))}
        </div>

        {/* Cases Grid */}
        {casesLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-4" />
            <p className="text-text-muted text-xs font-mono uppercase tracking-widest">
              Fetching blockchain records...
            </p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="bg-white border border-border-subtle rounded-2xl p-12 text-center shadow-sm">
            <Shield className="w-12 h-12 text-text-muted/20 mx-auto mb-4" />
            <p className="text-text-muted">
              {departmentCases.length === 0
                ? `No cases have been filed for the ${department} department yet.`
                : 'No cases match the selected filter.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCases.map((c, i) => (
                <CaseCard key={c.id} record={c} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  )
}

function CaseCard({ record, index }: { record: CaseRecord, index: number }) {
  const status = statusMap[record.status] || statusMap[0]
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleStatusUpdate = (newStatus: number) => {
    writeContract({
      address: addressConfig.CivicChainRegistry as `0x${string}`,
      abi: RegistryABI.abi,
      functionName: 'updateStatus',
      args: [BigInt(record.id), newStatus],
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-border-subtle hover:border-brand-primary/30 transition-all rounded-2xl p-6 flex flex-col h-full shadow-sm hover:shadow-lg relative overflow-hidden group"
    >
      {record.status === 3 && <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />}

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-mono text-text-muted">#{record.id}</span>
          <h3 className="text-lg font-bold text-text-main line-clamp-2 mt-1">{record.title}</h3>
        </div>
        <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg border font-bold shrink-0 ml-3 ${status.color} ${status.bg} ${status.border}`}>
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-text-muted mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {format(record.timestamp, 'MMM dd, yyyy')}
        </span>
        <span className="font-mono">{record.creator.slice(0, 8)}...</span>
      </div>

      <div className="mt-auto pt-4 border-t border-border-subtle space-y-3">
        {/* Action Buttons based on status */}
        {(isPending || isConfirming) ? (
          <div className="flex items-center justify-center gap-2 py-3 text-brand-primary animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold">Transaction Processing...</span>
          </div>
        ) : isSuccess ? (
          <div className="flex items-center justify-center gap-2 py-3 text-brand-accent">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold">Status Updated!</span>
          </div>
        ) : (
          <>
            {record.status === 0 && (
              <button
                onClick={() => handleStatusUpdate(2)}
                className="w-full bg-brand-primary/5 hover:bg-brand-primary/10 text-brand-primary px-4 py-3 rounded-xl transition-colors text-xs font-bold border border-brand-primary/10 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Accept & Start Investigation
              </button>
            )}
            {record.status === 2 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate(4)}
                  className="flex-1 bg-green-50 hover:bg-green-100 text-brand-accent px-3 py-3 rounded-xl transition-colors text-xs font-bold border border-green-200 flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                </button>
                <button
                  onClick={() => handleStatusUpdate(5)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 px-3 py-3 rounded-xl transition-colors text-xs font-bold border border-red-200 flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            )}
          </>
        )}

        <Link
          href={`/agency/case/${record.id}`}
          className="w-full bg-bg-page hover:bg-border-subtle text-text-main px-4 py-2.5 rounded-xl transition-colors text-xs font-bold border border-border-subtle flex items-center justify-center gap-2"
        >
          View Full Details <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  )
}
