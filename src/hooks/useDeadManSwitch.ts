'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from 'wagmi'
import { useState, useCallback } from 'react'
import DeadManSwitchABI from '@blockchain/artifacts/contracts/DeadManSwitch.sol/DeadManSwitch.json'

import { addressConfig } from '@/contracts/addresses'

const CONTRACT_ADDRESS = addressConfig.DeadManSwitch as `0x${string}`

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DeadManEntry {
    id: number
    evidenceCID: string
    publicMessage: string
    registeredAt: number
    releaseAt: number
    triggered: boolean
    cancelled: boolean
    plaintextKeyHex: string
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useDeadManSwitch() {
    const { address } = useAccount()
    const publicClient = usePublicClient()
    const { writeContractAsync, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
    const [error, setError] = useState<string | null>(null)

    const handleError = (err: any) => {
        const msg = err?.message || 'Transaction failed'
        setError(msg)
        throw err
    }

    // ── register ───────────────────────────────────────────────────────────────
    const register = useCallback(async (
        evidenceCID: string,
        encryptedKeyHex: string,
        releaseAtDate: Date,
        publicMessage: string
    ) => {
        if (!address) throw new Error('Wallet not connected')
        setError(null)
        try {
            const releaseAtUnix = BigInt(Math.floor(releaseAtDate.getTime() / 1000))
            await writeContractAsync({
                address: CONTRACT_ADDRESS,
                abi: DeadManSwitchABI.abi,
                functionName: 'register',
                args: [evidenceCID, encryptedKeyHex, releaseAtUnix, publicMessage],
            })
        } catch (err) { handleError(err) }
    }, [address, writeContractAsync])

    // ── cancel ─────────────────────────────────────────────────────────────────
    const cancel = useCallback(async (id: number) => {
        setError(null)
        try {
            await writeContractAsync({
                address: CONTRACT_ADDRESS,
                abi: DeadManSwitchABI.abi,
                functionName: 'cancel',
                args: [BigInt(id)],
            })
        } catch (err) { handleError(err) }
    }, [writeContractAsync])

    // ── extend ─────────────────────────────────────────────────────────────────
    const extend = useCallback(async (id: number, newDate: Date) => {
        setError(null)
        try {
            const newUnix = BigInt(Math.floor(newDate.getTime() / 1000))
            await writeContractAsync({
                address: CONTRACT_ADDRESS,
                abi: DeadManSwitchABI.abi,
                functionName: 'extend',
                args: [BigInt(id), newUnix],
            })
        } catch (err) { handleError(err) }
    }, [writeContractAsync])

    // ── releaseNow ─────────────────────────────────────────────────────────────
    const releaseNow = useCallback(async (id: number, plaintextKeyHex: string) => {
        setError(null)
        try {
            await writeContractAsync({
                address: CONTRACT_ADDRESS,
                abi: DeadManSwitchABI.abi,
                functionName: 'releaseNow',
                args: [BigInt(id), plaintextKeyHex],
            })
        } catch (err) { handleError(err) }
    }, [writeContractAsync])

    // ── trigger ────────────────────────────────────────────────────────────────
    const trigger = useCallback(async (id: number, plaintextKeyHex: string) => {
        setError(null)
        try {
            await writeContractAsync({
                address: CONTRACT_ADDRESS,
                abi: DeadManSwitchABI.abi,
                functionName: 'trigger',
                args: [BigInt(id), plaintextKeyHex],
            })
        } catch (err) { handleError(err) }
    }, [writeContractAsync])

    // ── fetchMySwitches ────────────────────────────────────────────────────────
    const fetchMySwitches = useCallback(async (): Promise<DeadManEntry[]> => {
        if (!address || !publicClient) return []
        try {
            const ids = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: DeadManSwitchABI.abi,
                functionName: 'getSwitchIds',
                args: [address],
            }) as bigint[]

            const entries: DeadManEntry[] = []
            for (const id of ids) {
                const s = await publicClient.readContract({
                    address: CONTRACT_ADDRESS,
                    abi: DeadManSwitchABI.abi,
                    functionName: 'switches',
                    args: [id],
                }) as any[]

                entries.push({
                    id: Number(id),
                    evidenceCID: s[1],
                    encryptedKeyHex: s[2],
                    plaintextKeyHex: s[3],
                    publicMessage: s[4],
                    registeredAt: Number(s[5]),
                    releaseAt: Number(s[6]),
                    triggered: s[7],
                    cancelled: s[8],
                } as DeadManEntry & { encryptedKeyHex: string })
            }
            return entries
        } catch (err) {
            console.error('fetchMySwitches error:', err)
            return []
        }
    }, [address, publicClient])

    return {
        register, cancel, extend, releaseNow, trigger,
        fetchMySwitches,
        isPending, isConfirming, isSuccess,
        isLoading: isPending || isConfirming,
        hash, error,
        contractAddress: CONTRACT_ADDRESS,
    }
}

// ── Read: switch count ────────────────────────────────────────────────────────
export function useSwitchCount() {
    const { data } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: DeadManSwitchABI.abi,
        functionName: 'switchCount',
    })
    return Number(data || 0)
}
