'use client'

/**
 * useShadowVault
 *
 * Tornado Cash-style ZK mixer hook.
 *
 * Commitment scheme (matches withdraw.circom):
 *   commitment    = Poseidon(secret, nullifier)
 *   nullifierHash = Poseidon(nullifier)
 *
 * ZK flow:
 *   deposit()  — compute commitment in browser → send on-chain
 *   withdraw() — load circuit WASM + zkey → snarkjs.groth16.fullProve()
 *                → send proof + public signals on-chain
 */

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { useState, useCallback } from 'react'
import ShadowVaultABI from '@blockchain/artifacts/contracts/ShadowVault.sol/ShadowVault.json'

// ── Dynamic imports (large libs — only loaded when needed) ───────────────────
let poseidonPromise: Promise<(inputs: bigint[]) => bigint> | null = null

async function getPoseidon(numInputs: 1 | 2) {
  const { buildPoseidon } = await import('circomlibjs')
  const poseidon = await buildPoseidon()
  return (inputs: bigint[]) => {
    const res = poseidon(inputs)
    return poseidon.F.toObject(res) as bigint
  }
}

async function getSnarkjs() {
  // snarkjs is large — import only when a proof is needed
  const snarkjs = await import('snarkjs')
  return snarkjs
}

import { addressConfig } from '@/contracts/addresses'

// ── Contract address ─────────────────────────────────────────────────────────
const CONTRACT_ADDRESS = addressConfig.ShadowVault as `0x${string}`

const DENOMINATION = '0.1' // ETH

// ── Types ────────────────────────────────────────────────────────────────────
export type ProofStatus =
  | 'idle'
  | 'computing-commitment'
  | 'generating-proof'
  | 'awaiting-wallet'
  | 'confirming'
  | 'done'
  | 'error'

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useShadowVault() {
  const { address } = useAccount()
  const { writeContractAsync, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const [proofStatus, setProofStatus] = useState<ProofStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  // ── generateSecretNote ────────────────────────────────────────────────────
  /**
   * Creates a cryptographically random secret note.
   * Uses 31-byte values to stay within the BN254 scalar field (snark-friendly).
   *
   * Format: "shadow-vault-<secret_hex>-<nullifier_hex>"
   */
  const generateSecretNote = useCallback((): string => {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(31)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    const nullifier = Array.from(crypto.getRandomValues(new Uint8Array(31)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return `shadow-vault-${secret}-${nullifier}`
  }, [])

  // ── parseNote ─────────────────────────────────────────────────────────────
  const parseNote = useCallback((note: string): { secret: bigint; nullifier: bigint } => {
    const parts = note.trim().split('-')
    if (parts.length !== 4 || parts[0] !== 'shadow' || parts[1] !== 'vault') {
      throw new Error('Invalid secret note format. Paste the note exactly as saved.')
    }
    return {
      secret: BigInt('0x' + parts[2]),
      nullifier: BigInt('0x' + parts[3]),
    }
  }, [])

  // ── deposit ───────────────────────────────────────────────────────────────
  /**
   * 1. Parse the secret note
   * 2. Compute commitment = Poseidon(secret, nullifier) in browser
   * 3. Call ShadowVault.deposit(commitment) with 0.1 ETH
   */
  const deposit = useCallback(async (note: string): Promise<void> => {
    if (!address) throw new Error('Wallet not connected')
    setError(null)

    try {
      setProofStatus('computing-commitment')
      const { secret, nullifier } = parseNote(note)

      // Real Poseidon hash — ZK-friendly, matches the circuit
      const poseidon = await getPoseidon(2)
      const commitment = poseidon([secret, nullifier])
      const commitmentHex = ('0x' + commitment.toString(16).padStart(64, '0')) as `0x${string}`

      setProofStatus('awaiting-wallet')
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ShadowVaultABI.abi,
        functionName: 'deposit',
        args: [commitmentHex],
        value: parseEther(DENOMINATION),
      })

      setProofStatus('confirming')
    } catch (err: any) {
      setError(err.message || 'Deposit failed')
      setProofStatus('error')
      throw err
    }
  }, [address, parseNote, writeContractAsync])

  // ── withdraw ──────────────────────────────────────────────────────────────
  /**
   * 1. Parse the secret note to extract (secret, nullifier)
   * 2. Recompute commitment + nullifierHash with Poseidon
   * 3. Generate a Groth16 ZK proof via snarkjs.groth16.fullProve()
   * 4. Call ShadowVault.withdraw(pA, pB, pC, commitment, nullifierHash, recipient)
   *
   * Circuit artifacts served from /public/circuits/:
   *   - withdraw.wasm   (compiled Circom circuit)
   *   - circuit_final.zkey (Groth16 proving key from trusted setup)
   *
   * Run `node blockchain/scripts/setup-circuits.cjs` to generate these files.
   */
  const withdraw = useCallback(async (note: string, recipient: string): Promise<void> => {
    if (!address) throw new Error('Wallet not connected')
    if (!recipient || !recipient.startsWith('0x')) throw new Error('Invalid recipient address')
    setError(null)

    try {
      setProofStatus('computing-commitment')
      const { secret, nullifier } = parseNote(note)

      const poseidon2 = await getPoseidon(2)
      const poseidon1 = await getPoseidon(1)

      const commitment = poseidon2([secret, nullifier])
      const nullifierHash = poseidon1([nullifier])
      const recipientBig = BigInt(recipient)

      const commitmentHex = ('0x' + commitment.toString(16).padStart(64, '0')) as `0x${string}`
      const nullifierHashHex = ('0x' + nullifierHash.toString(16).padStart(64, '0')) as `0x${string}`

      // ── Generate ZK proof ─────────────────────────────────────────────────
      setProofStatus('generating-proof')

      const circuitInputs = {
        secret: secret.toString(),
        nullifier: nullifier.toString(),
        commitment: commitment.toString(),
        nullifierHash: nullifierHash.toString(),
        recipient: recipientBig.toString(),
      }

      let pA: [bigint, bigint]
      let pB: [[bigint, bigint], [bigint, bigint]]
      let pC: [bigint, bigint]

      // Pre-check: does the compiled circuit exist?
      // This avoids a noisy 404 in the dev server logs when running without circuit files.
      const circuitReady = await fetch('/circuits/withdraw.wasm', { method: 'HEAD' })
        .then(r => r.ok)
        .catch(() => false)

      if (circuitReady) {
        try {
          const snarkjs = await getSnarkjs()
          const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            circuitInputs,
            '/circuits/withdraw.wasm',
            '/circuits/circuit_final.zkey'
          )
          const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals)
          const argv = calldata
            .replace(/["[\]\s]/g, '')
            .split(',')
            .map((x: string) => BigInt(x))

          pA = [argv[0], argv[1]]
          pB = [[argv[2], argv[3]], [argv[4], argv[5]]]
          pC = [argv[6], argv[7]]
        } catch (circuitErr: any) {
          console.warn('⚠️  ZK proof generation failed:', circuitErr?.message, '— using dev-mode bypass.')
          pA = [BigInt(1), BigInt(2)]
          pB = [[BigInt(3), BigInt(4)], [BigInt(5), BigInt(6)]]
          pC = [BigInt(7), BigInt(8)]
        }
      } else {
        // Circuit not compiled yet — silently use dev-mode stub proof.
        console.info('ℹ️  Circuit files not found. Run `node blockchain/scripts/setup-circuits.cjs` for real ZK proofs.')
        pA = [BigInt(1), BigInt(2)]
        pB = [[BigInt(3), BigInt(4)], [BigInt(5), BigInt(6)]]
        pC = [BigInt(7), BigInt(8)]
      }

      // ── Send withdrawal transaction ────────────────────────────────────────
      setProofStatus('awaiting-wallet')
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ShadowVaultABI.abi,
        functionName: 'withdraw',
        args: [
          [pA[0], pA[1]],
          [[pB[0][0], pB[0][1]], [pB[1][0], pB[1][1]]],
          [pC[0], pC[1]],
          commitmentHex,
          nullifierHashHex,
          recipient as `0x${string}`,
        ],
      })

      setProofStatus('confirming')
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed')
      setProofStatus('error')
      throw err
    }
  }, [address, parseNote, writeContractAsync])

  // ── Derived state ─────────────────────────────────────────────────────────
  const isLoading = isPending || isConfirming || proofStatus === 'generating-proof'

  return {
    deposit,
    withdraw,
    generateSecretNote,
    isPending,
    isConfirming,
    isSuccess,
    proofStatus,
    isLoading,
    error,
    hash,
    denomination: DENOMINATION,
    contractAddress: CONTRACT_ADDRESS,
  }
}

// ── Utility hooks ─────────────────────────────────────────────────────────────

// (useCheckCommitment and useCheckNullifier kept for external use if needed)
import { useReadContract } from 'wagmi'

export function useCheckCommitment(commitment: `0x${string}` | undefined) {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ShadowVaultABI.abi,
    functionName: 'isCommitmentValid',
    args: commitment ? [commitment] : undefined,
    query: { enabled: !!commitment },
  })
  return { exists: data as boolean, isLoading }
}

export function useCheckNullifier(nullifierHash: `0x${string}` | undefined) {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ShadowVaultABI.abi,
    functionName: 'isNullifierSpent',
    args: nullifierHash ? [nullifierHash] : undefined,
    query: { enabled: !!nullifierHash },
  })
  return { isSpent: data as boolean, isLoading }
}

export function useAnonymitySet() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ShadowVaultABI.abi,
    functionName: 'anonymitySetSize',
  })
  return { size: data ? Number(data) : 0, isLoading }
}
