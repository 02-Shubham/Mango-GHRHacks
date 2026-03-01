import { createPublicClient, http, parseAbiItem } from 'viem';
import { localhost } from 'viem/chains';
import { addressConfig } from '@/contracts/addresses';
import CivicChainRegistryABI from '@blockchain/artifacts/contracts/CivicChainRegistry.sol/CivicChainRegistry.json';

const CONTRACT_ADDRESS = addressConfig.CivicChainRegistry as `0x${string}`;

export interface BlockchainCase {
    id: number;
    creator: string;
    department: string;
    metadataCID: string;
    timestamp: number;
    status: number;
}

const publicClient = createPublicClient({
    chain: localhost,
    transport: http('http://127.0.0.1:8545'),
});

export async function fetchAllBlockchainCases(): Promise<BlockchainCase[]> {
    try {
        const logs = await publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            event: parseAbiItem('event CaseCreated(uint256 indexed caseId, address indexed creator, string metadataCID, string department)'),
            fromBlock: 0n,
            toBlock: 'latest',
        });

        const results = await Promise.all(
            logs.map(async (log): Promise<BlockchainCase | null> => {
                try {
                    const args = log.args as any;
                    const caseId = args.caseId;

                    const caseData = await publicClient.readContract({
                        address: CONTRACT_ADDRESS,
                        abi: CivicChainRegistryABI.abi,
                        functionName: 'cases',
                        args: [caseId],
                    }) as any;

                    // caseData structure based on ABI:
                    // 0: caseId, 1: creator, 2: fileHash, 3: createdAt, 4: slaDeadline, 5: status
                    return {
                        id: Number(caseId),
                        creator: args.creator,
                        department: args.department,
                        metadataCID: args.metadataCID,
                        timestamp: Number(caseData[3]) * 1000,
                        status: Number(caseData[5]),
                    };
                } catch (err) {
                    console.error(`Error reading case ${log.args.caseId}:`, err);
                    return null;
                }
            })
        );

        return results.filter((c): c is BlockchainCase => c !== null);
    } catch (err) {
        console.error('Failed to fetch blockchain cases on server:', err);
        return [];
    }
}
