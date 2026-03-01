/**
 * authorize-agency.cjs
 *
 * Grant 'Authorized Agency' status to a specific address.
 * Use this if you are seeing 'Access Restricted' on the admin portal.
 *
 * Usage:
 *   npx hardhat run scripts/authorize-agency.cjs --network localhost
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // AUTHORIZING MULTIPLE ACCOUNTS FOR LOCAL TESTING
    const ACCOUNTS_TO_AUTHORIZE = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Account #0
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Account #1
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account #2
        "0xC3C9C58AFeD577238f5DF5D9448DDCa006aD35C5"  // USER'S SPECIFIC WALLET
    ];

    console.log("-----------------------------------------");
    console.log("⚖️ NyayaAdmin Authority Authorization");
    console.log("-----------------------------------------");

    const [deployer] = await hre.ethers.getSigners();
    const addressesPath = path.join(__dirname, "../deployed-addresses.json");
    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));

    console.log("Connecting to Registry at:", addresses.CivicChainRegistry);
    const Registry = await hre.ethers.getContractAt("CivicChainRegistry", addresses.CivicChainRegistry);

    for (const address of ACCOUNTS_TO_AUTHORIZE) {
        console.log(`\n⟳  Authorizing: ${address}...`);
        try {
            const isAuth = await Registry.authorizedAgencies(address);
            if (isAuth && address !== deployer.address) {
                console.log("ℹ️ Already authorized.");
                continue;
            }
            const tx = await Registry.addAgency(address, "Legal Authority");
            await tx.wait();
            console.log("✅ SUCCESS: Authorized.");
        } catch (err) {
            console.log("❌ FAILED:", err.message);
        }
    }
    console.log("\n✨ Admin accounts set up successfully.");
    console.log("-----------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
