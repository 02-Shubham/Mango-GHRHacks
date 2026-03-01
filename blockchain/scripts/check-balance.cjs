const hre = require("hardhat");

async function main() {
    try {
        const [deployer] = await hre.ethers.getSigners();
        const balance = await hre.ethers.provider.getBalance(deployer.address);
        console.log("Network:", hre.network.name);
        console.log("Deployer:", deployer.address);
        console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
    } catch (e) {
        console.error("Error connecting to network:", e.message);
    }
}

main().catch(console.error);
