'use client'

import { useAccount, usePublicClient } from 'wagmi'
import { useState, useEffect, useCallback } from 'react'
import { addressConfig } from '@/contracts/addresses'
import RegistryABI from '@/contracts/CivicChainRegistry.json'

const DEPARTMENTS = [
    'Police',
    'Cyber Crime',
    'Anti-Corruption Bureau',
    'Ministry of Finance',
    'Human Rights'
]

export function useAgencyAuth() {
    const { address, isConnected } = useAccount()
    const publicClient = usePublicClient()
    const [isAgency, setIsAgency] = useState(false)
    const [department, setDepartment] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const checkAuth = useCallback(async () => {
        if (!publicClient || !address || !isConnected) {
            setIsAgency(false)
            setDepartment(null)
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        try {
            // 1. Check if wallet is authorized
            const authorized = await publicClient.readContract({
                address: addressConfig.CivicChainRegistry as `0x${string}`,
                abi: RegistryABI.abi,
                functionName: 'authorizedAgencies',
                args: [address]
            }) as boolean

            if (!authorized) {
                setIsAgency(false)
                setDepartment(null)
                setIsLoading(false)
                return
            }

            // 2. Find which department this wallet belongs to
            // Check all 5 departments to find the match
            for (const dept of DEPARTMENTS) {
                try {
                    const deptAgency = await publicClient.readContract({
                        address: addressConfig.CivicChainRegistry as `0x${string}`,
                        abi: RegistryABI.abi,
                        functionName: 'departmentToAgency',
                        args: [dept]
                    }) as string

                    if (deptAgency.toLowerCase() === address.toLowerCase()) {
                        setIsAgency(true)
                        setDepartment(dept)
                        setIsLoading(false)
                        return
                    }
                } catch (e) {
                    // Continue checking other departments
                }
            }

            // Authorized but no department match found (edge case)
            setIsAgency(true)
            setDepartment('Unknown Department')
        } catch (err) {
            console.error('Agency auth check failed:', err)
            setIsAgency(false)
            setDepartment(null)
        } finally {
            setIsLoading(false)
        }
    }, [publicClient, address, isConnected])

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    return {
        isAgency,
        department,
        isLoading,
        isConnected,
        address,
        refresh: checkAuth
    }
}
