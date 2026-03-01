import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { fetchAllBlockchainCases, BlockchainCase } from '@/lib/blockchain-server'
import { DEMO_CASES } from '@/data/demo-cases'
import { getSyntheticMetadata } from '@/lib/media'

const statusLabels: Record<number, string> = {
    0: "Submitted", 1: "Assigned", 2: "In Progress",
    3: "Escalated", 4: "Resolved", 5: "Rejected", 6: "False Claim"
};

const SYSTEM_PROMPT_HEADER = `You are NyayaSetu NewsBot — an AI assistant that provides current news updates, headlines, and information about ongoing cases and events specifically found in the NyayaSetu Public Justice Ledger.

CORE KNOWLEDGE:
You have access to the real-time Public Ledger of cases. Use the "LEDGER CONTEXT" below to answer user questions about specific cases, their status, departments involved, and overall activity.

INSTRUCTIONS:
1. When asked about news or cases, ALWAYS check the LEDGER CONTEXT first.
2. If the user mentions a specific case ID or topic (like "railway" or "cyber"), search the context for matches.
3. Provide accurate status updates: [Submitted, Assigned, In Progress, Escalated, Resolved, Rejected].
4. For resolved cases, highlight the outcome if available.
5. If a user asks for "headlines" or "updates", provide 5-6 items, mixing the latest ledger cases with general news.
6. For whistleblower/corruption queries, emphasize how NyayaSetu's blockchain tech ensures these cases can't be deleted.
7. Keep responses concise and well-formatted.

LEDGER CONTEXT:
`;

const SYSTEM_PROMPT_FOOTER = `
RESPONSE FORMAT:
- Use bold **headlines** for news titles
- Use bullet points for multiple items
- Keep each item to 2-3 lines max
- Add relevant category tags like [POLITICS], [LEGAL], [CRIME], [ECONOMY], [TECH] etc.

Be informative, neutral, and helpful. You are a news digest assistant.`;

async function getLedgerContext(): Promise<string> {
    try {
        const liveCases = await fetchAllBlockchainCases();

        // Merge demo and live cases
        const allCases = [...DEMO_CASES];
        liveCases.forEach(lc => {
            if (!allCases.find(dc => dc.id === lc.id)) {
                const { title, summary } = getSyntheticMetadata(lc.id, lc.department);
                allCases.push({
                    ...lc,
                    title,
                    summary,
                    description: summary,
                    story: { intro: '', body: '', conclusion: '' },
                    outcome: '',
                    fileHash: '0x...', // Placeholder
                } as any);
            }
        });

        // Sort by id/date descending (latest first)
        allCases.sort((a, b) => b.id - a.id);
        const latestCases = allCases.slice(0, 15); // Top 15 for context

        let context = "";
        latestCases.forEach(c => {
            context += `- [ID: ${c.id}] ${c.title} | Dept: ${c.department} | Status: ${statusLabels[c.status] || 'Unknown'} | Summary: ${c.summary}\n`;
        });

        return context || "No active cases found on the ledger yet.";
    } catch (err) {
        console.error("Context fetch error:", err);
        return "Error fetching ledger data.";
    }
}

export async function POST(req: NextRequest) {
    try {
        const { message, history } = await req.json()

        if (!message?.trim()) {
            return NextResponse.json({ error: 'No message provided' }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        const ledgerContext = await getLedgerContext();
        const fullSystemPrompt = SYSTEM_PROMPT_HEADER + ledgerContext + SYSTEM_PROMPT_FOOTER;

        // Try Gemini AI
        if (apiKey && apiKey !== 'your-gemini-api-key-here') {
            try {
                const genAI = new GoogleGenerativeAI(apiKey)
                const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

                const chatHistory = (history || []).map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                }))

                const chat = model.startChat({
                    history: [
                        { role: 'user', parts: [{ text: fullSystemPrompt }] },
                        { role: 'model', parts: [{ text: 'I am NyayaSetu NewsBot, integrated with the Public Justice Ledger. I can provide updates on any case in our registry. How can I help you today?' }] },
                        ...chatHistory,
                    ],
                })

                const result = await chat.sendMessage(message)
                return NextResponse.json({ reply: result.response.text(), method: 'ai' })
            } catch (err: any) {
                console.warn('Gemini unavailable:', err?.message)
            }
        }

        // Fallback: use local search through context
        return NextResponse.json({
            reply: getLocalContextResponse(message, ledgerContext),
            method: 'local'
        })
    } catch (err: any) {
        return NextResponse.json({ reply: "I'm having trouble connecting. Try again shortly!", method: 'local' })
    }
}

function getLocalContextResponse(query: string, context: string): string {
    const q = query.toLowerCase();
    const cases = context.split('\n').filter(line => line.startsWith('- '));

    // Find matching cases
    const matches = cases.filter(c => c.toLowerCase().includes(q));

    if (matches.length > 0) {
        let reply = `🔍 **Information Found on Ledger**\n\n`;
        matches.slice(0, 5).forEach(m => {
            reply += `${m.replace('- ', '• ')}\n\n`;
        });
        reply += `--- \n*This information is fetched directly from the immutable blockchain ledger.*`;
        return reply;
    }

    // Default "latest" response
    if (q.includes('latest') || q.includes('headline') || q.includes('news')) {
        let reply = `📰 **Latest from NyayaSetu Ledger**\n\n`;
        cases.slice(0, 5).forEach(m => {
            reply += `${m.replace('- ', '• ')}\n\n`;
        });
        reply += `--- \n*NyayaSetu ensures all public investigations are permanently recorded.*`;
        return reply;
    }

    return `📰 **NyayaSetu NewsBot**\n\nI couldn't find a specific match for "${query}" on the public ledger. 

**Try asking about:**
- "Latest headlines"
- "Railway fraud case"
- "Cyber crime updates"
- "Anti-corruption investigations"

*Note: I am currently in Offline Mode, but I can still search the last 15 ledger entries for you.*`;
}
