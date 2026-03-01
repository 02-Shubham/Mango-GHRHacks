/**
 * recover-historical-case.cjs
 *
 * Use this to re-register a case on the blockchain if the local node was reset.
 * You will need the Metadata CID from your previous Pinata upload.
 *
 * Usage:
 *   npx hardhat run scripts/recover-historical-case.cjs --network localhost
 *
 * (Edit the CID and Department below before running)
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // --- CONFIGURE THESE ---
    const METADATA_CID = "PASTE_YOUR_PINATA_CID_HERE";
    const DEPARTMENT = "Police"; // Should match the department in the metadata
    const FILE_HASH = hre.ethers.ZeroHash; // placeholder if original hash is unknown
    // -----------------------

    console.log("-----------------------------------------");
    console.log("🛠️  NyayaSetu Historical Case Recovery");
    console.log("-----------------------------------------");

    if (METADATA_CID === "PASTE_YOUR_PINATA_CID_HERE") {
        console.error("❌ ERROR: Please edit this script and paste your Pinata CID first!");
        return;
    }

    const addressesPath = path.join(__dirname, "../deployed-addresses.json");
    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
    const Registry = await hre.ethers.getContractAt("CivicChainRegistry", addresses.CivicChainRegistry);

    console.log(`\n⟳  Re-registering historical case...`);
    console.log(`CID: ${METADATA_CID}`);
    console.log(`Dept: ${DEPARTMENT}`);

    try {
        const tx = await Registry.createCase(FILE_HASH, METADATA_CID, DEPARTMENT);
        await tx.wait();
        console.log("\n✅ SUCCESS: Case has been re-indexed on the blockchain.");
        console.log("✨ Refresh the Admin Portal to view your recovered case.");
    } catch (err) {
        console.error("\n❌ FAILED:", err.message);
    }
    console.log("-----------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
