# Advanced Blockchain & Network Configuration

This guide covers advanced deployment scenarios, network configurations, and testing strategies for the NyayaSetu smart contracts.

---

## 🌐 Network Configurations

The project is configured to work with local development nodes and Ethereum Layer 2 Testnets.

### Localhost (Default)
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `1337`
- **Use Case**: Rapid local development and integration testing.

### Base Sepolia
- **Chain ID**: `84532`
- **Setup**: Requires `BASE_SEPOLIA_RPC_URL` and `PRIVATE_KEY` in your environment variables.
- **Deploy**: `npx hardhat run scripts/deploy.js --network baseSepolia`

### Optimism Sepolia
- **Chain ID**: `11155420`
- **Setup**: Requires `OPTIMISM_SEPOLIA_RPC_URL` and `PRIVATE_KEY` in your environment variables.
- **Deploy**: `npx hardhat run scripts/deploy.js --network optimismSepolia`

---

## 🧪 Testing Strategy

We use Hardhat and Chai for automated contract testing.

### Running Tests
```bash
# Run all tests
cd blockchain
npx hardhat test

# Run specific test suite
npx hardhat test test/CivicChainRegistry.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

### Coverage
Currently, `CivicChainRegistry` has the highest test coverage. Contributions for `WhistleblowerPortal` and `ShadowVault` test suites are welcomed.

---

## 📁 Folder Structure (Blockchain)

- `contracts/`: Core Solidity logic.
- `scripts/`: Deployment and maintenance scripts.
- `test/`: Automated test suites.
- `artifacts/`: Compiled contract ABIs (generated).
- `cache/`: Internal Hardhat cache (generated).

---

## 🔄 Upgrade & Maintenance

### Non-Upgradeable Pattern
Currently, contracts are deployed as immutable instances. To upgrade:
1. Deploy a new version of the contract.
2. Update the contract addresses in the frontend configuration (`.env.local`).
3. If necessary, migrate data manually between contract versions.

### Future: Proxy Upgrades
In production, we recommend moving to the **Transparent Proxy Pattern** (OpenZeppelin) to allow logic upgrades while maintaining the same contract address and state.
