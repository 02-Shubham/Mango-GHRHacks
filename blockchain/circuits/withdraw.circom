pragma circom 2.0.0;

/*
 * ShadowVault Withdrawal Circuit
 * 
 * Proves knowledge of (secret, nullifier) such that:
 *   commitment   = Poseidon(secret, nullifier)
 *   nullifierHash = Poseidon(nullifier)
 *
 * Public inputs  : commitment, nullifierHash, recipient  
 * Private inputs : secret, nullifier
 *
 * This is a simplified Tornado-Cash-style circuit without the full Merkle
 * tree inclusion proof (suitable for hackathon / small anonymity set).
 * To add Merkle tree levels, include circomlib/circuits/merkleProof.circom.
 */

include "../node_modules/circomlib/circuits/poseidon.circom";

template Withdraw() {
    // ── Private inputs (the whistleblower's secret) ─────────────────────────
    signal input secret;
    signal input nullifier;

    // ── Public inputs (visible on-chain for verification) ───────────────────
    signal input commitment;      // stored in contract on deposit
    signal input nullifierHash;   // prevents double-spend
    signal input recipient;       // the fresh burner wallet address

    // ── Commitment check ─────────────────────────────────────────────────────
    // Prove: commitment == Poseidon(secret, nullifier)
    component commitHasher = Poseidon(2);
    commitHasher.inputs[0] <== secret;
    commitHasher.inputs[1] <== nullifier;
    commitment === commitHasher.out;

    // ── Nullifier hash check ─────────────────────────────────────────────────
    // Prove: nullifierHash == Poseidon(nullifier)
    component nullHasher = Poseidon(1);
    nullHasher.inputs[0] <== nullifier;
    nullifierHash === nullHasher.out;

    // ── Recipient binding ────────────────────────────────────────────────────
    // Bind recipient address to the proof so it cannot be front-run
    signal recipientSquare;
    recipientSquare <== recipient * recipient;
}

component main {public [commitment, nullifierHash, recipient]} = Withdraw();
