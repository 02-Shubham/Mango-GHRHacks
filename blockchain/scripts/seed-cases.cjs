/**
 * seed-cases.cjs
 *
 * Submits a few test cases to the registry so the dashboard isn't empty.
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("-----------------------------------------");
    console.log("🌱 Seeding NyayaSetu Test Cases");
    console.log("-----------------------------------------");

    const addressesPath = path.join(__dirname, "../deployed-addresses.json");
    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

    const Registry = await hre.ethers.getContractAt("CivicChainRegistry", addresses.CivicChainRegistry);
    const [deployer] = await hre.ethers.getSigners();

    const testCases = [
        { hash: hre.ethers.id("evidence-1"), cid: "ipfs://test-1", dept: "Police" },
        { hash: hre.ethers.id("evidence-2"), cid: "ipfs://test-2", dept: "Cyber Cell" },
        { hash: hre.ethers.id("evidence-3"), cid: "ipfs://test-3", dept: "Anti-Corruption" }
    ];

    for (const c of testCases) {
        console.log(`\n⟳  Submitting case for ${c.dept}...`);
        const tx = await Registry.createCase(c.hash, c.cid, c.dept);
        await tx.wait();
        console.log(`✅ SUCCESS: Case submitted.`);
    }

    console.log("\n✨ Seeding complete. Refresh the Admin Portal!");
    console.log("-----------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
