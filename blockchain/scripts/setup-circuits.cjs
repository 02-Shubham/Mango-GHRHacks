/**
 * setup-circuits.cjs
 *
 * Compiles the ShadowVault ZK circuit and generates proving / verification keys.
 *
 * Prerequisites:
 *   npm install -g circom                  (Rust-based compiler)
 *   npm install -g snarkjs
 *
 * Usage:
 *   cd blockchain
 *   node scripts/setup-circuits.cjs
 *
 * Outputs:
 *   circuits/withdraw.wasm                 → copy to public/circuits/
 *   circuits/circuit_final.zkey            → copy to public/circuits/
 *   contracts/Groth16Verifier.sol          → replace the dev verifier
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CIRCUITS_DIR = path.join(__dirname, "../circuits");
const CONTRACTS_DIR = path.join(__dirname, "../contracts");
const PUBLIC_CIRCUITS = path.join(__dirname, "../../public/circuits");

// Hermez Powers of Tau (ptau) for up to 2^12 constraints — publicly available
const PTAU_URL =
    "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau";
const PTAU_FILE = path.join(CIRCUITS_DIR, "pot12_final.ptau");

function run(cmd, cwd = CIRCUITS_DIR) {
    console.log(`\n$ ${cmd}`);
    execSync(cmd, { stdio: "inherit", cwd });
}

async function main() {
    fs.mkdirSync(CIRCUITS_DIR, { recursive: true });
    fs.mkdirSync(PUBLIC_CIRCUITS, { recursive: true });

    // ── Step 1: Download Powers of Tau ──────────────────────────────────────
    if (!fs.existsSync(PTAU_FILE)) {
        console.log("\n⟳  Downloading Powers of Tau (Hermez trusted setup)...");
        run(`curl -L "${PTAU_URL}" -o "${PTAU_FILE}"`, CIRCUITS_DIR);
        console.log("✓  Powers of Tau downloaded");
    } else {
        console.log("✓  Powers of Tau already present");
    }

    // ── Step 2: Compile the Circom circuit ───────────────────────────────────
    console.log("\n⟳  Compiling withdraw.circom...");
    run(
        `circom withdraw.circom --r1cs --wasm --sym --output .`,
        CIRCUITS_DIR
    );
    console.log("✓  Circuit compiled → withdraw.r1cs, withdraw_js/withdraw.wasm");

    // ── Step 3: Groth16 trusted setup (circuit-specific) ────────────────────
    console.log("\n⟳  Running Groth16 setup (phase 2)...");
    run(
        `snarkjs groth16 setup withdraw.r1cs "${PTAU_FILE}" circuit_0000.zkey`,
        CIRCUITS_DIR
    );

    // Contribute randomness (in production use multiple contributors, ceremony etc.)
    run(
        `echo "shadow vault random beacon" | snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="ShadowVault Setup" -v`,
        CIRCUITS_DIR
    );
    console.log("✓  circuit_final.zkey generated");

    // ── Step 4: Export verification key ─────────────────────────────────────
    run(
        `snarkjs zkey export verificationkey circuit_final.zkey verification_key.json`,
        CIRCUITS_DIR
    );
    console.log("✓  verification_key.json exported");

    // ── Step 5: Generate Groth16Verifier.sol ────────────────────────────────
    console.log("\n⟳  Generating Solidity verifier...");
    const verifierPath = path.join(CONTRACTS_DIR, "Groth16Verifier.sol");
    run(
        `snarkjs zkey export solidityverifier circuit_final.zkey "${verifierPath}"`,
        CIRCUITS_DIR
    );
    console.log("✓  Groth16Verifier.sol generated with real verification keys");

    // ── Step 6: Copy artifacts to public/circuits/ ───────────────────────────
    console.log("\n⟳  Copying circuit artifacts to public/circuits/...");
    const wasmSrc = path.join(CIRCUITS_DIR, "withdraw_js", "withdraw.wasm");
    const zkeyDst = path.join(PUBLIC_CIRCUITS, "circuit_final.zkey");
    const wasmDst = path.join(PUBLIC_CIRCUITS, "withdraw.wasm");
    const vkDst = path.join(PUBLIC_CIRCUITS, "verification_key.json");

    fs.copyFileSync(wasmSrc, wasmDst);
    fs.copyFileSync(path.join(CIRCUITS_DIR, "circuit_final.zkey"), zkeyDst);
    fs.copyFileSync(path.join(CIRCUITS_DIR, "verification_key.json"), vkDst);
    console.log("✓  Artifacts copied to public/circuits/");

    console.log("\n══════════════════════════════════════════════════");
    console.log("  ZK Circuit Setup Complete!");
    console.log("══════════════════════════════════════════════════");
    console.log("  Next: Redeploy contracts to pick up the real verifier:");
    console.log("    npx hardhat node");
    console.log("    npx hardhat run scripts/deploy-v2.cjs --network localhost");
}

main().catch(console.error);
