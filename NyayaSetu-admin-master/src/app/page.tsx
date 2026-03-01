'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { useCases, type CaseRecord } from '@/hooks/useCases'
import { useAdmin } from '@/hooks/useAdmin'
import {
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Lock,
  Activity,
  TrendingUp,
  Building2,
  FileText,
  Zap,
  Eye,
  Users,
  Globe
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function DashboardPage() {
  const { cases, isLoading, statusMap } = useCases()
  const { isAdmin } = useAdmin()

  const totalCases = cases.length
  const underReview = cases.filter(c => c.status === 1 || c.status === 2).length
  const resolved = cases.filter(c => c.status === 4).length
  const escalated = cases.filter(c => c.status === 3).length
  const submitted = cases.filter(c => c.status === 0).length
  const resolveRate = totalCases > 0 ? Math.round((resolved / totalCases) * 100) : 0

  // Department breakdown
  const deptCounts: Record<string, number> = {}
  cases.forEach(c => { deptCounts[c.department] = (deptCounts[c.department] || 0) + 1 })
  const deptList = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])
  const deptColors: Record<string, string> = {
    'Police': 'bg-blue-500',
    'Cyber Crime': 'bg-violet-500',
    'Anti-Corruption Bureau': 'bg-amber-500',
    'Ministry of Finance': 'bg-emerald-500',
    'Human Rights': 'bg-rose-500',
  }

  // Recent cases (last 5)
  const recentCases = [...cases].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)

  if (!isAdmin && !isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-text-main mb-2">Access Restricted</h2>
          <p className="text-text-muted max-w-sm font-medium">
            This portal is only accessible to authorized legal authorities. Please connect an authorized wallet to continue.
          </p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* ═══════════════ HEADER ═══════════════ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1.5 bg-brand-primary text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-full shadow-md">
                Command Center
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" /> Registry Active
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tight">
              Legal Intelligence Dashboard
            </h1>
            <p className="text-sm text-text-muted mt-1 max-w-xl">
              Real-time overview of whistleblower evidence and case progression across the decentralized legal network.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/cases"
              className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-secondary transition-all flex items-center gap-2 shadow-md"
            >
              <Eye className="w-3.5 h-3.5" /> View All Cases
            </Link>
          </div>
        </div>

        {/* ═══════════════ STATS ROW ═══════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Cases', value: totalCases, icon: Shield, color: 'text-brand-primary', bg: 'bg-brand-primary/5', border: 'border-brand-primary/10' },
            { label: 'New / Pending', value: submitted, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
            { label: 'Under Review', value: underReview, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
            { label: 'Resolved', value: resolved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
            { label: 'Escalated', value: escalated, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`${stat.bg} border ${stat.border} rounded-2xl p-5 group hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl bg-white/80 border ${stat.border}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="flex items-center gap-1 text-[8px] font-bold text-text-muted uppercase tracking-widest">
                  Live <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                </span>
              </div>
              <div className={`text-3xl font-bold ${stat.color} tracking-tight mb-0.5`}>
                {isLoading ? '—' : stat.value}
              </div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ═══════════════ MAIN GRID ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Recent Cases Table ─── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-primary" /> Recent Cases
              </h2>
              <Link href="/cases" className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider flex items-center gap-1">
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-subtle bg-slate-50/80">
                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Reporter</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Filed</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {isLoading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-6 py-5"><div className="h-4 bg-slate-100 rounded-lg" /></td>
                      </tr>
                    ))
                  ) : recentCases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Shield className="w-8 h-8 text-text-muted/20 mx-auto mb-3" />
                        <p className="text-sm text-text-muted">No cases filed yet.</p>
                      </td>
                    </tr>
                  ) : (
                    recentCases.map((record, i) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-brand-primary font-mono">#{record.id.toString().padStart(3, '0')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-[9px] font-bold text-brand-primary">
                              {record.creator.slice(2, 4).toUpperCase()}
                            </div>
                            <span className="text-[10px] font-mono text-text-muted">
                              {record.creator.slice(0, 6)}…{record.creator.slice(-4)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-border-subtle text-[10px] text-text-muted font-bold">
                            {record.department}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] text-text-muted">
                            {formatDistanceToNow(record.timestamp, { addSuffix: true })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${record.status === 4 ? 'bg-green-500' :
                              record.status === 3 ? 'bg-red-500' :
                                record.status === 5 ? 'bg-gray-400' :
                                  record.status === 0 ? 'bg-blue-400' : 'bg-amber-400'
                              }`} />
                            <span className="text-[10px] font-bold text-text-main uppercase tracking-wider">
                              {statusMap[record.status]}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/cases/${record.id}`}
                            className="p-2 inline-flex rounded-xl bg-slate-50 border border-border-subtle hover:border-brand-primary/30 text-text-muted hover:text-brand-primary transition-all group/btn"
                          >
                            <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </Link>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── Right Sidebar ─── */}
          <div className="space-y-5">

            {/* Resolution Rate */}
            <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-primary" /> Resolution Rate
                </h3>
                <span className="text-2xl font-bold text-text-main">{isLoading ? '—' : `${resolveRate}%`}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${resolveRate}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full"
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[9px] text-text-muted font-mono">{resolved} resolved</span>
                <span className="text-[9px] text-text-muted font-mono">{totalCases} total</span>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2 mb-5">
                <Building2 className="w-4 h-4 text-brand-primary" /> By Department
              </h3>
              {deptList.length === 0 ? (
                <p className="text-[10px] text-text-muted text-center py-4">No cases yet</p>
              ) : (
                <div className="space-y-3">
                  {deptList.map(([dept, count]) => {
                    const pct = totalCases > 0 ? Math.round((count / totalCases) * 100) : 0
                    return (
                      <div key={dept}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-text-main">{dept}</span>
                          <span className="text-[10px] text-text-muted font-mono">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={`h-full rounded-full ${deptColors[dept] || 'bg-brand-primary'}`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white border border-border-subtle rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/3 blur-[40px] -mr-8 -mt-8" />
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2 mb-5">
                <Activity className="w-4 h-4 text-brand-primary animate-pulse" /> Live Feed
              </h3>
              <div className="space-y-3">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 bg-slate-50 rounded-lg animate-pulse" />
                  ))
                ) : recentCases.length === 0 ? (
                  <p className="text-[10px] text-text-muted text-center py-4">Waiting for activity…</p>
                ) : (
                  recentCases.slice(0, 4).map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-border-subtle hover:border-brand-primary/10 transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${c.status === 4 ? 'bg-green-500' :
                        c.status === 3 ? 'bg-red-500' :
                          c.status === 0 ? 'bg-blue-400' : 'bg-amber-400'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-text-main">Case #{c.id}</span>
                        <span className="text-[9px] text-text-muted ml-1.5">{c.department}</span>
                      </div>
                      <span className="text-[9px] text-text-muted font-mono shrink-0">
                        {formatDistanceToNow(c.timestamp, { addSuffix: false })}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Security Infrastructure */}
            <div className="bg-slate-50 border border-border-subtle rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-brand-primary" /> Security Infra
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'RSA-2048 Key Vault', active: true },
                  { label: 'AES-256-GCM Encryption', active: true },
                  { label: 'IPFS Decentralized Store', active: true },
                  { label: 'Dead Man Switch Armed', active: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-brand-accent' : 'bg-gray-300'} shadow-sm`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${item.active ? 'text-text-main' : 'text-text-muted'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
