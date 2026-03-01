/**
 * deploy-v2.cjs
 *
 * Deploys Groth16Verifier + ShadowVault (v2 with real ZK proofs)
 * and updates deployed-addresses.json.
 *
 * Usage:
 *   cd blockchain
 *   npx hardhat run scripts/deploy-v2.cjs --network localhost
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // ── 1. Deploy Groth16Verifier ─────────────────────────────────────────────
    console.log("\n⟳  Deploying Groth16Verifier...");
    const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
    const verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
    const verifierAddress = await verifier.getAddress();
    console.log("✓  Groth16Verifier deployed at:", verifierAddress);

    // ── 2. Deploy ShadowVault ─────────────────────────────────────────────────
    console.log("\n⟳  Deploying ShadowVault...");
    const Vault = await hre.ethers.getContractFactory("ShadowVault");
    const vault = await Vault.deploy(verifierAddress);
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();
    console.log("✓  ShadowVault deployed at:", vaultAddress);

    // ── 3. Update deployed-addresses.json ────────────────────────────────────
    const addressesPath = path.join(__dirname, "../deployed-addresses.json");
    let existing = {};
    if (fs.existsSync(addressesPath)) {
        existing = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
    }

    const updated = {
        ...existing,
        ShadowVault: vaultAddress,
        Groth16Verifier: verifierAddress,
        deployedAt: new Date().toISOString(),
    };

    fs.writeFileSync(addressesPath, JSON.stringify(updated, null, 2));
    console.log("\n✓  deployed-addresses.json updated");

    // ── 4. Update Next.js .env.local ─────────────────────────────────────────
    const envPath = path.join(__dirname, "../../.env.local");
    if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, "utf8");
        if (envContent.includes("NEXT_PUBLIC_VAULT_ADDRESS=")) {
            envContent = envContent.replace(
                /NEXT_PUBLIC_VAULT_ADDRESS=.*/,
                `NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddress}`
            );
        } else {
            envContent += `\nNEXT_PUBLIC_VAULT_ADDRESS=${vaultAddress}`;
        }
        fs.writeFileSync(envPath, envContent);
        console.log("✓  .env.local updated with new vault address");
    }

    console.log("\n══════════════════════════════════════════");
    console.log("  ShadowVault V2 Deployment Complete");
    console.log("══════════════════════════════════════════");
    console.log(`  Verifier : ${verifierAddress}`);
    console.log(`  Vault    : ${vaultAddress}`);
    console.log(`  Mode     : ${await verifier.DEV_MODE() ? "DEV (accepts all proofs)" : "PRODUCTION"}`);
    console.log("\n  Next steps:");
    console.log("  1. Run setup-circuits.cjs to compile the ZK circuit");
    console.log("  2. Restart the Next.js dev server to pick up the new address");
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
