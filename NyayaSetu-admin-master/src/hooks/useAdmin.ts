'use client'

import { useAccount, useReadContract } from 'wagmi'
import { useState, useEffect } from 'react'
import { addressConfig } from '@/contracts/addresses'
import RegistryABI from '@/contracts/CivicChainRegistry.json'

export function useAdmin() {
    const { address, isConnected } = useAccount()

    // 1. Check if the address is the contract owner/admin
    const { data: adminAddress, isLoading: contractAdminLoading } = useReadContract({
        address: addressConfig.CivicChainRegistry as `0x${string}`,
        abi: RegistryABI.abi,
        functionName: 'admin',
    })

    // 2. Check if the address is an authorized agency
    const { data: isAuthorizedAgency, isLoading: agencyCheckLoading } = useReadContract({
        address: addressConfig.CivicChainRegistry as `0x${string}`,
        abi: RegistryABI.abi,
        functionName: 'authorizedAgencies',
        args: [address],
    })

    // 3. Overall Loading State
    const isLoading = contractAdminLoading || agencyCheckLoading

    // Check for admin/agency status with case-insensitivity
    // We only set isAdmin to false IF we have finished loading and the checks fail
    // MODIFIED: Allow any connected wallet to be admin for demo purposes
    const isAdmin = isConnected

    // Log the current state for debugging if restricted on localhost
    useEffect(() => {
        if (isConnected && !isLoading && !isAdmin && window.location.hostname === 'localhost') {
            console.log('🛡️ Admin Auth Diagnostic:', {
                yourAddress: address,
                contractAdmin: adminAddress,
                isAuthorizedAgency: !!isAuthorizedAgency,
                registryAddress: addressConfig.CivicChainRegistry
            })
        }
    }, [isConnected, isLoading, isAdmin, address, adminAddress, isAuthorizedAgency])

    return {
        isAdmin,
        adminAddress,
        isAgency: !!isAuthorizedAgency,
        isLoading,
    }
}
