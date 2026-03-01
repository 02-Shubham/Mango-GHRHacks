/**
 * debug-registry.cjs
 *
 * Check the current admin and authorized agencies in the registry.
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("-----------------------------------------");
    console.log("🔍 NyayaSetu Registry Diagnostic");
    console.log("-----------------------------------------");

    const addressesPath = path.join(__dirname, "../deployed-addresses.json");
    if (!fs.existsSync(addressesPath)) {
        console.error("❌ deployed-addresses.json not found!");
        return;
    }
    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

    console.log("Registry Address:", addresses.CivicChainRegistry);
    const Registry = await hre.ethers.getContractAt("CivicChainRegistry", addresses.CivicChainRegistry);

    const admin = await Registry.admin();
    console.log("Contract Admin (Owner):", admin);

    // List some common accounts to see if they are authorized
    const accounts = await hre.ethers.getSigners();
    console.log("\nChecking authorization for Hardhat default accounts:");
    for (let i = 0; i < 5; i++) {
        const addr = accounts[i].address;
        const isAuth = await Registry.authorizedAgencies(addr);
        console.log(`Account #${i} (${addr}): ${isAuth ? "✅ AUTHORIZED" : "❌ NOT AUTHORIZED"}`);
    }

    console.log("-----------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
