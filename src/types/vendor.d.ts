/**
 * Module declarations for ZK libraries that ship without TypeScript types.
 * circomlibjs — provides Poseidon hash, Pedersen, etc. (no @types package)
 * snarkjs      — Groth16/PLONK proof generation (types sometimes not resolved)
 */
declare module 'circomlibjs' {
    export function buildPoseidon(): Promise<{
        (inputs: (bigint | number | string)[]): Uint8Array;
        F: {
            toObject(fieldElement: Uint8Array): bigint;
            toString(fieldElement: Uint8Array, radix?: number): string;
        };
    }>;
    export function buildBabyjub(): Promise<any>;
    export function buildEddsa(): Promise<any>;
    export function buildMimcSponge(): Promise<any>;
}

declare module 'snarkjs' {
    export namespace groth16 {
        function fullProve(
            input: Record<string, string>,
            wasmFile: string,
            zkeyFile: string
        ): Promise<{ proof: any; publicSignals: string[] }>;

        function exportSolidityCallData(
            proof: any,
            publicSignals: string[]
        ): Promise<string>;

        function verify(
            vkJson: object,
            publicSignals: string[],
            proof: any
        ): Promise<boolean>;
    }
}
