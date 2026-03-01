'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { useCases } from '@/hooks/useCases'
import { useAdmin } from '@/hooks/useAdmin'
import { AlertTriangle, ArrowUpRight, Lock, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Link from 'next/link'

export default function EscalatedCasesPage() {
    const { cases, isLoading, statusMap } = useCases()
    const { isAdmin } = useAdmin()

    const escalatedCases = cases.filter(c => c.status === 3)

    if (!isAdmin && !isLoading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main mb-2">Access Restricted</h2>
                    <p className="text-text-muted max-w-sm font-medium">
                        Connect an authorized wallet to view escalated cases.
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
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-6 h-6 text-red-500" />
                            <h1 className="text-3xl font-bold text-text-main tracking-tight">Critical Escalations</h1>
                        </div>
                        <p className="text-text-muted font-medium">Cases that have passed SLA deadlines or were manually escalated for public viewing.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-red-500 font-bold text-sm flex items-center gap-2 animate-pulse">
                            <AlertTriangle className="w-4 h-4" /> {escalatedCases.length} Active Escalations
                        </div>
                    </div>
                </div>

                <div className="document-card overflow-hidden border-red-200 shadow-lg">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-red-100 bg-red-50/50">
                                <th className="px-8 py-5 text-[10px] font-bold text-red-500 uppercase tracking-[0.15em]">ID</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-red-500 uppercase tracking-[0.15em]">Reporter</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-red-500 uppercase tracking-[0.15em]">SLA Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-red-500 uppercase tracking-[0.15em]">Escalation Date</th>
                                <th className="px-8 py-5 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-red-100">
                            {escalatedCases.map((record) => (
                                <tr key={record.id} className="group hover:bg-red-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-mono font-bold text-red-500">#{record.id}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-mono text-text-muted">
                                            {record.creator.slice(0, 12)}...
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-500 text-[10px] font-bold uppercase">SLA EXPIRED</span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-xs text-text-muted">
                                        {format(record.timestamp, 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Link href={`/cases/${record.id}`} className="p-2.5 inline-flex rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 text-text-muted hover:text-red-500 transition-all">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {escalatedCases.length === 0 && !isLoading && (
                        <div className="p-12 text-center text-text-muted text-sm">No critical escalations matching current criteria.</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
