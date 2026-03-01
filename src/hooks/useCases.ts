'use client'

import { usePublicClient } from 'wagmi'
import { useState, useEffect, useCallback } from 'react'
import { addressConfig } from '@/contracts/addresses'
import RegistryABI from '@/contracts/CivicChainRegistry.json'
import { parseAbiItem } from 'viem'

export interface CaseRecord {
    id: number
    creator: string
    metadataCID: string
    department: string
    fileHash: string
    title?: string
    timestamp: number
    status: number
}

const statusMap = [
    'Submitted',
    'Assigned',
    'InProgress',
    'EscalatedToPublic',
    'Closed',
    'Rejected',
    'FalseClaim'
]

export function useCases() {
    const publicClient = usePublicClient()
    const [cases, setCases] = useState<CaseRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchCases = useCallback(async () => {
        if (!publicClient) return
        setIsLoading(true)

        try {
            const logs = await publicClient.getLogs({
                address: addressConfig.CivicChainRegistry as `0x${string}`,
                event: parseAbiItem('event CaseCreated(uint256 indexed caseId, address indexed creator, string metadataCID, string department)'),
                fromBlock: 'earliest'
            })

            const casePromises = logs.map(async (log: any) => {
                const { caseId, creator, metadataCID, department } = log.args

                const caseData = await publicClient.readContract({
                    address: addressConfig.CivicChainRegistry as `0x${string}`,
                    abi: RegistryABI.abi,
                    functionName: 'cases',
                    args: [caseId]
                }) as any

                let title = department
                try {
                    const cleanCID = metadataCID.startsWith('ipfs://') ? metadataCID.slice(7) : metadataCID
                    if (cleanCID && !cleanCID.includes('test')) {
                        const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cleanCID}`)
                        if (res.ok) {
                            const meta = await res.json()
                            title = meta.title || department
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to fetch metadata for ${caseId}`)
                }

                return {
                    id: Number(caseId),
                    creator: creator as string,
                    metadataCID: metadataCID as string,
                    department: department as string,
                    fileHash: caseData[2],
                    title,
                    timestamp: Number(caseData[3]) * 1000,
                    status: Number(caseData[5])
                }
            })

            const resolvedCases = await Promise.all(casePromises)
            setCases(resolvedCases.sort((a, b) => b.id - a.id))
        } catch (err) {
            console.error('Failed to fetch cases:', err)
        } finally {
            setIsLoading(false)
        }
    }, [publicClient])

    useEffect(() => {
        fetchCases()
    }, [fetchCases])

    return {
        cases,
        isLoading,
        refresh: fetchCases,
        statusMap
    }
}
