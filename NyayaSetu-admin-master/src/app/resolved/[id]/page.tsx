'use client'

import { useParams } from 'next/navigation'
import { useCases } from '@/hooks/useCases'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { CaseReport } from '@/components/CaseReport'
import { DEMO_CASES } from '@/data/demo-cases'
import { useAdmin } from '@/hooks/useAdmin'
import { Lock, ArrowLeft, Activity } from 'lucide-react'
import Link from 'next/link'

export default function ResolvedDetailPage() {
    const { id } = useParams()
    const { cases, isLoading } = useCases()
    const { isAdmin } = useAdmin()

    const caseId = Number(id)

    const demoCase = DEMO_CASES.find(c => c.id === caseId)
    const blockchainCase = cases.find(c => c.id === caseId)

    const record = demoCase || blockchainCase

    if (!isAdmin && !isLoading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main mb-2">Access Restricted</h2>
                    <p className="text-text-muted max-w-sm font-medium">
                        Connect an authorized wallet to view this report.
                    </p>
                </div>
            </AdminLayout>
        )
    }

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Activity className="w-12 h-12 text-brand-primary animate-pulse mb-4" />
                    <p className="text-text-muted font-mono text-xs uppercase tracking-widest">Retrieving formal report dossier...</p>
                </div>
            </AdminLayout>
        )
    }

    if (!record || record.status < 4) {
        return (
            <AdminLayout>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-text-main mb-4">Report Not Found</h2>
                    <p className="text-text-muted mb-8">This case has not been resolved or the report index is unavailable.</p>
                    <Link href="/resolved" className="px-6 py-2.5 rounded-xl border border-border-subtle text-sm font-medium text-text-muted hover:bg-bg-page transition-all">
                        Back to Resolved Archive
                    </Link>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                <div className="flex items-center gap-4">
                    <Link href="/resolved" className="p-2.5 bg-bg-page border border-border-subtle rounded-xl hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-text-muted" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-text-main tracking-tight">Formal Investigation Report</h1>
                        <p className="text-xs text-text-muted font-mono">CASE_ID: #{record.id.toString().padStart(4, '0')}</p>
                    </div>
                </div>

                <CaseReport record={record} />

                <div className="flex justify-center pt-10">
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">
                        NYAYSETU_ADMIN_CORE • SECURE_DISSEMINATION_PROTOCOL v1.0
                    </p>
                </div>
            </div>
        </AdminLayout>
    )
}
