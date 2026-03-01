'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { useCases } from '@/hooks/useCases'
import { useAdmin } from '@/hooks/useAdmin'
import { Shield, CheckCircle, ArrowUpRight, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Link from 'next/link'
import { DEMO_CASES } from '@/data/demo-cases'

export default function ResolvedCasesPage() {
    const { cases, isLoading, statusMap } = useCases()
    const { isAdmin } = useAdmin()

    const resolvedCases = [
        ...DEMO_CASES.map(c => ({
            id: c.id,
            creator: c.creator,
            department: c.department,
            metadataCID: c.metadataCID,
            timestamp: c.timestamp,
            status: c.status,
            title: c.title,
            summary: c.summary
        })),
        ...cases.filter(c => c.status >= 4)
    ]

    if (!isAdmin && !isLoading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main mb-2">Access Restricted</h2>
                    <p className="text-text-muted max-w-sm font-medium">
                        Connect an authorized wallet to view resolved cases.
                    </p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-text-main tracking-tight mb-2">Resolved Archive</h1>
                        <p className="text-text-muted">Permanently closed cases with a verified resolution.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl text-brand-accent font-bold text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> {resolvedCases.length} Cases Resolved
                        </div>
                    </div>
                </div>

                <div className="document-card overflow-hidden shadow-lg">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border-subtle bg-slate-50">
                                <th className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">ID</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Reporter</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Department</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Outcome</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Resolution Date</th>
                                <th className="px-8 py-5 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {resolvedCases.map((record) => (
                                <tr key={record.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-mono font-bold text-brand-primary">#{record.id}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-mono text-text-muted">
                                            {record.creator.slice(0, 12)}...
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs text-text-main font-medium">{record.department}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${record.status === 4 ? 'bg-green-50 border border-green-200 text-brand-accent' :
                                            record.status === 5 ? 'bg-red-50 border border-red-200 text-red-500' :
                                                'bg-amber-50 border border-amber-200 text-amber-600'
                                            }`}>
                                            {statusMap[record.status]}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="text-xs text-text-muted">
                                            {format(record.timestamp, 'MMM dd, yyyy')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Link href={`/resolved/${record.id}`} className="p-2.5 inline-flex rounded-xl hover:bg-green-50 border border-transparent hover:border-green-200 text-text-muted hover:text-brand-accent transition-all">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {resolvedCases.length === 0 && !isLoading && (
                        <div className="p-12 text-center text-text-muted text-sm">No resolved cases found.</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
