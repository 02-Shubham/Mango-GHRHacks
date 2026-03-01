/**
 * register-test-agency.cjs
 *
 * Registers Account #1 as the 'Police' department and sets a public key.
 * This allows the Whistleblower portal to encrypt cases for this department.
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("-----------------------------------------");
    console.log("🏛️  Registering Test Agency (Police)");
    console.log("-----------------------------------------");

    const addressesPath = path.join(__dirname, "../deployed-addresses.json");
    const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
    const Registry = await hre.ethers.getContractAt("CivicChainRegistry", addresses.CivicChainRegistry);

    const [admin, agency1] = await hre.ethers.getSigners();
    const department = "Police";

    // 1. Add as authorized agency (if not already)
    console.log(`\n⟳  Authorizing ${agency1.address} as agency...`);
    const tx1 = await Registry.addAgency(agency1.address, department);
    await tx1.wait();
    console.log("✅ Authorized.");

    // 2. Register public key (using a test key)
    // This is a dummy public key in PEM format (valid structure, but just for testing)
    const testPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuYzIZccVZW3f6JnSvKeh
923ad6wVF5ktVQJzVFE3mk1fBBaXe67KeuTV/uhDjxIL/lmSIyGPS/NDQ8KblmI+
3XHpwk2SR7miijQZIRas5cNCNxYkr+00pFJ3kykjwyBYyVpmtOm4zv3PHkN2FjuV
zIxEK9mLUoKdmLHj6Je1sDHiLaLDjXPeY8bxyWqlkh0NAXcRFG+eowyrMWhzJKwt
JOyZPbtOBiDBg6ev1merih1EQKO/bh1Nktzmmf4Zjsx0Mt7bdjTruVXsHZAjdZUx
4Aozs1tqtKl8aJX/ztzEfhhoycT8N3vFt87XbyVYzX9dDwUYzDJNMMi6N1dopTcg
6wIDAQAB
-----END PUBLIC KEY-----`;

    console.log(`\n⟳  Registering Public Key for ${department}...`);
    // Need to connect as agency1 to register details
    const RegistryAsAgency = Registry.connect(agency1);
    const tx2 = await RegistryAsAgency.registerAgencyDetails(department, testPublicKey);
    await tx2.wait();
    console.log("✅ Public Key Registered.");

    console.log("\n✨ Setup complete! submissions to 'Police' will now work.");
    console.log("-----------------------------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
