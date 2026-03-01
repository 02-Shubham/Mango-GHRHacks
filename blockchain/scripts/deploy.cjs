const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 WhistleblowerX + NyayaSetu Deployment");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
    console.log("");

    // Deploy ShadowVault (ZK-Mixer for anonymity)
    console.log("📦 Deploying ShadowVault...");
    const ShadowVault = await hre.ethers.getContractFactory("ShadowVault");
    const vault = await ShadowVault.deploy(deployer.address); // Using deployer as dummy verifier
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();
    console.log("✅ ShadowVault deployed to:", vaultAddress);
    console.log("");

    // Deploy WhistleblowerPortal (Anonymous whistleblowing)
    console.log("📦 Deploying WhistleblowerPortal...");
    const WhistleblowerPortal = await hre.ethers.getContractFactory("WhistleblowerPortal");
    const portal = await WhistleblowerPortal.deploy([deployer.address]);
    await portal.waitForDeployment();
    const portalAddress = await portal.getAddress();
    console.log("✅ WhistleblowerPortal deployed to:", portalAddress);
    console.log("");

    // Deploy CivicChainRegistry (Public civic complaints)
    console.log("📦 Deploying CivicChainRegistry...");
    const CivicChainRegistry = await hre.ethers.getContractFactory("CivicChainRegistry");
    const registry = await CivicChainRegistry.deploy();
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("✅ CivicChainRegistry deployed to:", registryAddress);
    console.log("");

    // Save deployment addresses
    const addresses = {
        WhistleblowerPortal: portalAddress,
        ShadowVault: vaultAddress,
        CivicChainRegistry: registryAddress,
        network: hre.network.name,
        chainId: hre.network.config.chainId || 1337,
        deployer: deployer.address,
        deployedAt: new Date().toISOString()
    };

    // Save to blockchain folder
    const blockchainPath = path.join(__dirname, "../deployed-addresses.json");
    fs.writeFileSync(blockchainPath, JSON.stringify(addresses, null, 2));
    
    // Save to project root
    const rootPath = path.join(__dirname, "../../deployed-addresses.json");
    fs.writeFileSync(rootPath, JSON.stringify(addresses, null, 2));
    
    console.log("✅ Contract addresses saved to:");
    console.log("   - blockchain/deployed-addresses.json");
    console.log("   - deployed-addresses.json");
    console.log("");
    
    // Create/Update .env.local
    const envContent = `# Contract Addresses - Auto-generated on ${new Date().toISOString()}

# WhistleblowerX Contracts (Anonymous Whistleblowing)
NEXT_PUBLIC_PORTAL_ADDRESS=${portalAddress}
NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddress}

# NyayaSetu Contract (Public Civic Complaints)
NEXT_PUBLIC_REGISTRY_ADDRESS=${registryAddress}

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=${hre.network.config.chainId || 1337}
NEXT_PUBLIC_NETWORK_NAME=${hre.network.name}
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# IPFS Configuration (Optional - Add your keys)
# NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_here
# NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_key_here
`;

    const envPath = path.join(__dirname, "../../.env.local");
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Created/Updated .env.local with contract addresses");
    console.log("");
    
    console.log("🎉 Deployment Complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 Contract Addresses:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("WhistleblowerPortal:", portalAddress);
    console.log("ShadowVault:        ", vaultAddress);
    console.log("CivicChainRegistry: ", registryAddress);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Network:            ", hre.network.name);
    console.log("Chain ID:           ", hre.network.config.chainId || 1337);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");
    console.log("📝 Next Steps:");
    console.log("1. Contracts are deployed and addresses saved");
    console.log("2. .env.local has been created/updated");
    console.log("3. Start frontend: cd .. && npm run dev");
    console.log("4. Connect MetaMask to localhost:8545 (Chain ID: 1337)");
    console.log("");
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});
