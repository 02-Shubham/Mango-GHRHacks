/**
 * deploy-deadman.cjs
 * Deploys DeadManSwitch contract and updates deployed-addresses.json + .env
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    console.log("\n⟳  Deploying DeadManSwitch...");
    const DMS = await hre.ethers.getContractFactory("DeadManSwitch");
    const dms = await DMS.deploy();
    await dms.waitForDeployment();
    const dmsAddress = await dms.getAddress();
    console.log("✓  DeadManSwitch deployed at:", dmsAddress);

    // Update deployed-addresses.json
    const addressesPath = path.join(__dirname, "../deployed-addresses.json");
    const existing = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
    fs.writeFileSync(addressesPath, JSON.stringify({
        ...existing,
        DeadManSwitch: dmsAddress,
        deployedAt: new Date().toISOString(),
    }, null, 2));
    console.log("✓  deployed-addresses.json updated");

    // Update .env
    const envPath = path.join(__dirname, "../../.env");
    if (fs.existsSync(envPath)) {
        let env = fs.readFileSync(envPath, "utf8");
        if (env.includes("NEXT_PUBLIC_DEADMAN_ADDRESS=")) {
            env = env.replace(/NEXT_PUBLIC_DEADMAN_ADDRESS=.*/, `NEXT_PUBLIC_DEADMAN_ADDRESS=${dmsAddress}`);
        } else {
            env += `\nNEXT_PUBLIC_DEADMAN_ADDRESS=${dmsAddress}`;
        }
        fs.writeFileSync(envPath, env);
        console.log("✓  .env updated");
    }

    console.log("\n══════════════════════════════════════════");
    console.log("  DeadManSwitch Deployment Complete");
    console.log("  Address:", dmsAddress);
    console.log("══════════════════════════════════════════");
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
