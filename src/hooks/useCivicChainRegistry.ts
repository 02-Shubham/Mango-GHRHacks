'use client'

import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import CivicChainRegistryABI from '@blockchain/artifacts/contracts/CivicChainRegistry.sol/CivicChainRegistry.json'
import { localhostChain } from '@/lib/web3-config'

import { addressConfig } from '@/contracts/addresses'

const CONTRACT_ADDRESS = addressConfig.CivicChainRegistry as `0x${string}`

export function useCivicChainRegistry() {
  const { address } = useAccount()
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash, chainId: localhostChain.id })

  // Create Case
  const createCase = async (fileHash: `0x${string}`, metadataCID: string, department: string) => {
    if (!address) throw new Error('Wallet not connected')

    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CivicChainRegistryABI.abi,
      functionName: 'createCase',
      args: [fileHash, metadataCID, department],
    })
  }

  // Register or Update Agency Details
  const registerAgencyDetails = async (department: string, publicKey: string) => {
    if (!address) throw new Error('Wallet not connected')

    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CivicChainRegistryABI.abi,
      functionName: 'registerAgencyDetails',
      args: [department, publicKey],
    })
  }

  // Update Status (Agency only)
  const updateStatus = async (caseId: number, newStatus: number) => {
    if (!address) throw new Error('Wallet not connected')

    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CivicChainRegistryABI.abi,
      functionName: 'updateStatus',
      args: [caseId, newStatus],
    })
  }

  // Trigger Escalation
  const triggerEscalation = async (caseId: number) => {
    if (!address) throw new Error('Wallet not connected')

    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CivicChainRegistryABI.abi,
      functionName: 'triggerEscalation',
      args: [caseId],
    })
  }

  return {
    createCase,
    updateStatus,
    triggerEscalation,
    registerAgencyDetails,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

// Hook to read case data
export function useGetCase(caseId: number | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CivicChainRegistryABI.abi,
    functionName: 'cases',
    args: caseId !== undefined ? [caseId] : undefined,
    query: {
      enabled: caseId !== undefined,
    },
  })

  return {
    caseData: data as any,
    isLoading,
    error,
    refetch,
  }
}

// Hook to get case count
export function useCaseCount() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CivicChainRegistryABI.abi,
    functionName: 'caseCount',
  })

  return {
    caseCount: data as bigint,
    isLoading,
  }
}

// Hook to check if address is authorized agency
export function useIsAuthorizedAgency(address: string | undefined) {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CivicChainRegistryABI.abi,
    functionName: 'authorizedAgencies',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return {
    isAuthorized: data as boolean,
    isLoading,
  }
}

// Hook to get agency public key
export function useAgencyPublicKey(department: string | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CivicChainRegistryABI.abi,
    functionName: 'getAgencyPublicKey',
    args: department ? [department] : undefined,
    query: {
      enabled: !!department,
    },
  })

  return {
    publicKey: data as string,
    isLoading,
    error,
  }
}

// Case Status Enum
export enum CaseStatus {
  Submitted = 0,
  Assigned = 1,
  InProgress = 2,
  EscalatedToPublic = 3,
  Closed = 4,
  Rejected = 5,
  FalseClaim = 6,
}

export const CaseStatusLabels = {
  [CaseStatus.Submitted]: 'Submitted',
  [CaseStatus.Assigned]: 'Assigned',
  [CaseStatus.InProgress]: 'In Progress',
  [CaseStatus.EscalatedToPublic]: 'Escalated to Public',
  [CaseStatus.Closed]: 'Closed',
  [CaseStatus.Rejected]: 'Rejected',
  [CaseStatus.FalseClaim]: 'False Claim',
}
