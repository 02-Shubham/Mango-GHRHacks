
/**
 * Media mapping for the Public Justice Ledger.
 * Provides curated investigative visuals based on department categories.
 */

export const DEPARTMENT_MEDIA: Record<string, string[]> = {
    "Cyber Crime": [
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1510511459019-5dee2c147acd?auto=format&fit=crop&w=1200"
    ],
    "Anti-Corruption Bureau": [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200"
    ],
    "Ministry of Finance": [
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1454165833767-027eeef1593e?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200"
    ],
    "Narcotics Control": [
        "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1618060932014-4ebec18270f2?auto=format&fit=crop&w=1200"
    ],
    "Human Rights": [
        "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200",
        "https://images.unsplash.com/photo-1453911618012-3269b6623f99?auto=format&fit=crop&w=1200"
    ]
};

export const DEFAULT_MEDIA = [
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200",
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200",
    "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200"
];

export function getCaseImage(department: string, caseId: number): string {
    const images = DEPARTMENT_MEDIA[department] || DEFAULT_MEDIA;
    return images[caseId % images.length];
}

/**
 * Generates an investigative "story" block for a case.
 */
export function getEditorialStory(caseId: number, department: string, title: string) {
    const seeds = [
        {
            intro: "This investigation marks a pivotal moment in legislative transparency.",
            body: "Initial metadata anchored on the blockchain revealed significant discrepancies in reported figures. Our AI engine flagged this case as 'High Stakes' within minutes of submission.",
            conclusion: "The case has set a precedent for future investigative benchmarks."
        },
        {
            intro: "A complex network of illicit patterns was uncovered through decentralized audit trails.",
            body: "Security protocols were strictly observed as agents navigated the cryptographic proofs. The hybrid RSA-AES layer ensured that no data was leaked during the sensitive transition phase.",
            conclusion: "Integrity was maintained as a core principle throughout the lifecycle."
        },
        {
            intro: "Digital footprints led investigators to a conclusive legal finding.",
            body: "Following the first ledger entry, a series of cross-referenced legal patterns emerged. The IPC mapping provided a robust framework for identifying specific violations.",
            conclusion: "Transparency has been achieved without compromising whistleblower anonymity."
        }
    ];

    const seed = seeds[caseId % seeds.length];
    return seed;
}

/**
 * Provides rich synthetic metadata if IPFS fetch fails.
 */
export function getSyntheticMetadata(caseId: number, department: string) {
    const departmentThemes: Record<string, { titles: string[], summaries: string[] }> = {
        "Cyber Crime": {
            titles: [
                "Digital Extortion Network Dismantled",
                "Large-Scale Phishing Infrastructure Neutralized",
                "Crypto-Jacking Syndicate Uncovered"
            ],
            summaries: [
                "A sophisticated network of digital extortionists was identified through cross-border forensic analysis. Decentralized audit trails led to the freezing of illicit assets.",
                "Investigators uncovered a massive cloud-based phishing framework targeting sensitive financial sectors. The operation was halted following a successful cryptographic breach of their command servers.",
                "Unauthorized computational hijacking in the regional data center was traced back to a persistent threat actor. The breach was sealed using multi-signature patch deployment."
            ]
        },
        "Anti-Corruption Bureau": {
            titles: [
                "Bureaucratic Malpractice Case #772",
                "Procurement Integrity Audit Findings",
                "Structural Governance Deficit Investigation"
            ],
            summaries: [
                "Evidence of systemic bribery within the procurement division was substantiated by internal ledger discrepancies. Strategic interviews and data mining confirmed the involvement of high-ranking officials.",
                "A multi-year audit into public infrastructure contracts revealed a pattern of inflated invoicing and ghost vendors. Case files have been anchored to the blockchain for irrevocable transparency.",
                "Whistleblower testimony linked to encrypted communication logs exposed a complex scheme to divert emergency funds. Corrective legislative measures have been recommended."
            ]
        },
        "Ministry of Finance": {
            titles: [
                "Tax Evasion Shell Network Exposed",
                "Market Manipulation Forensic Report",
                "Illicit Capital Outflow Tracking"
            ],
            summaries: [
                "Sophisticated shell companies used for jurisdictional arbitrage were mapped out using decentralized graph analysis. The scheme involved over $50M in diverted tax revenue.",
                "Algorithmic trading patterns suggested coordinated market manipulation in the equity sector. High-frequency forensic logs provided the conclusive evidence needed for prosecution.",
                "Real-time monitoring of cross-border transfers flagged unusual liquidity movements. The investigation successfully repatriated significant state dividends."
            ]
        }
    };

    const theme = departmentThemes[department] || {
        titles: [`Investigation ${caseId}: ${department}`, `Dossier #${caseId.toString().padStart(4, '0')}`],
        summaries: ["Analysis in progress. The official technical dossier has been anchored to the blockchain registry for public verification."]
    };

    return {
        title: theme.titles[caseId % theme.titles.length],
        summary: theme.summaries[caseId % theme.summaries.length]
    };
}
