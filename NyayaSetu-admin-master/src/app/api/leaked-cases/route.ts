import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// This endpoint serves leaked case IDs so the public ledger (port 3000) can show them
// Leaked IDs are stored in a JSON file so they persist across restarts

const LEAKED_FILE = path.join(process.cwd(), 'leaked-cases.json')

function getLeakedIds(): number[] {
    try {
        if (fs.existsSync(LEAKED_FILE)) {
            return JSON.parse(fs.readFileSync(LEAKED_FILE, 'utf-8'))
        }
    } catch { }
    return []
}

function saveLeakedIds(ids: number[]) {
    fs.writeFileSync(LEAKED_FILE, JSON.stringify(ids))
}

export async function GET() {
    const res = NextResponse.json({ leakedIds: getLeakedIds() })
    res.headers.set('Access-Control-Allow-Origin', '*')
    return res
}

export async function POST(req: NextRequest) {
    try {
        const { caseId } = await req.json()
        if (!caseId) return NextResponse.json({ error: 'Missing caseId' }, { status: 400 })

        const ids = getLeakedIds()
        if (!ids.includes(caseId)) {
            ids.push(caseId)
            saveLeakedIds(ids)
        }

        const res = NextResponse.json({ success: true, leakedIds: ids })
        res.headers.set('Access-Control-Allow-Origin', '*')
        return res
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function OPTIONS() {
    const res = new NextResponse(null, { status: 204 })
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    return res
}
