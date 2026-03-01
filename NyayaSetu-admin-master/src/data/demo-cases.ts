export interface DemoCase {
    id: number;
    creator: string;
    department: string;
    metadataCID: string;
    fileHash: string;
    timestamp: number;
    status: number;
    title: string;
    summary: string;
    description: string;
    story: {
        intro: string;
        body: string;
        conclusion: string;
    };
    outcome: string;
}

export const DEMO_CASES: DemoCase[] = [
    {
        id: 1001,
        creator: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        department: "Anti-Corruption Bureau",
        metadataCID: "QmXoypizjW3Wkn2Zxc2u2Kon2Co4hxX6nq1P29iS163K7u",
        fileHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        timestamp: 1715843200000,
        status: 4,
        title: "Public Procurement Fraud Investigation",
        summary: "Detailed audit into infrastructure project allocation reveals systemic kickbacks and ghost contractors.",
        description: "This case involves a multi-year deep dive into the 'Green City' infrastructure project. Whistleblower evidence, cross-referenced with blockchain-anchored procurement logs, exposed a network of officials receiving kickbacks from non-existent service providers.",
        story: {
            intro: "A landmark victory for public accountability in urban development.",
            body: "The investigation leveraged decentralized audit trails to trace fund diversion across multiple shell entities. Despite internal resistance, the cryptographic proofs provided an undeniable paper trail of the fraudulent allocations.",
            conclusion: "Three high-ranking officials were sanctioned, and the misused funds were successfully frozen on-chain."
        },
        outcome: "Full recovery of diverted funds and legal action initiated against the syndicate."
    },
    {
        id: 1002,
        creator: "0x1234567890123456789012345678901234567890",
        department: "Cyber Crime",
        metadataCID: "QmW2uKon2Co4hxX6nq1P29iS163K7uXoypizjW3Wkn2Zxc",
        fileHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        timestamp: 1718521600000,
        status: 4,
        title: "Large-Scale Phishing Syndicate Takedown",
        summary: "International coordination leads to the dismantling of a cloud-based phishing infrastructure targeting elderly citizens.",
        description: "Following a surge in 'vishing' reports, investigators mapped the tactical infrastructure used by a transnational syndicate. By decrypting their command and control servers, investigators recovered over 5,000 victim profiles.",
        story: {
            intro: "Protecting the most vulnerable from digital predators.",
            body: "The operation, dubbed 'Silent Guardian', used AI-enhanced pattern matching to identify server clusters across four continents. Secure evidence submission allowed victims to provide testimony without fear of retaliation.",
            conclusion: "The syndicate's digital assets were seized, and their operational capacity has been effectively neutralized."
        },
        outcome: "Complete shutdown of the phishing network and repatriation of stolen digital identity data."
    },
    {
        id: 1003,
        creator: "0x9876543210987654321098765432109876543210",
        department: "Ministry of Finance",
        metadataCID: "Qmn2P29iS163K7uXoypizjW3Wkn2Zxc2u2Kon2Co4hxX6nq",
        fileHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
        timestamp: 1721113600000,
        status: 4,
        title: "Offshore Tax Evasion Shell Network",
        summary: "Strategic data mining exposes jurisdictional arbitrage scheme involving over $120M in diverted revenue.",
        description: "A complex network of shell companies spanning several tax havens was identified through automated graph analysis of financial reports. The investigation revealed a systematic diversion of corporate profits to avoid regional taxes.",
        story: {
            intro: "Ensuring fiscal integrity through technological oversight.",
            body: "By cross-matching corporate filings with decentralized financial logs, investigators identified a 'round-tripping' scheme designed to inflate operational costs while hiding actual profits.",
            conclusion: "A record-breaking tax settlement was reached, and new transparency protocols were implemented for cross-border transactions."
        },
        outcome: "Recovery of $45M in back taxes and permanent suspension of the primary shell entities."
    }
];
