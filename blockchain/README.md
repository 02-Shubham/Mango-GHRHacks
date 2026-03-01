# 🔗 Blockchain Smart Contracts

This folder contains all smart contracts for the WhistleblowerX + NyayaSetu platform.

---

## 📦 Contracts

### 1. WhistleblowerPortal.sol
**Purpose:** Anonymous whistleblowing with DAO verification

**Features:**
- Submit anonymous reports with IPFS CID
- DAO council verification (3 votes required)
- Case status tracking (Pending → Under Review → Verified/Rejected)
- Event emission for transparency

**Key Functions:**
```solidity
submitReport(bytes32 caseId, string cid)  // Submit anonymous report
verifyCase(bytes32 caseId)                // Council member votes
getCaseStatus(bytes32 caseId)             // Get current status
```

**Events:**
- `ReportSubmitted(bytes32 caseId, string cid)`
- `CaseVerified(bytes32 caseId)`
- `StatusChanged(bytes32 caseId, CaseStatus newStatus)`

---

### 2. ShadowVault.sol
**Purpose:** ZK-Mixer for breaking transaction links (anonymity layer)

**Features:**
- Fixed denomination deposits (0.1 ETH)
- Commitment-based deposits
- ZK-proof based withdrawals (simplified for demo)
- Nullifier prevents double-spending

**Key Functions:**
```solidity
deposit(uint256 commitment)                                    // Deposit 0.1 ETH
withdraw(uint256 nullifierHash, uint256 root, bytes proof, address recipient)  // Withdraw anonymously
```

**Events:**
- `Deposit(uint256 commitment, uint32 leafIndex, uint256 timestamp)`
- `Withdrawal(address to, uint256 nullifierHash, uint256 timestamp)`

---

### 3. CivicChainRegistry.sol
**Purpose:** Public civic complaints with SLA tracking

**Features:**
- Submit complaints to specific departments
- 15-day SLA deadline
- Auto-escalation if ignored
- Agency status updates
- Public transparency

**Key Functions:**
```solidity
createCase(bytes32 fileHash, string ipfsCID, string department)  // Create complaint
updateStatus(uint256 caseId, CaseStatus newStatus)               // Agency updates
triggerEscalation(uint256 caseId)                                // Escalate if SLA missed
```

**Events:**
- `CaseCreated(uint256 caseId, address creator, string department)`
- `StatusUpdated(uint256 caseId, CaseStatus newStatus)`
- `PublicEscalationTriggered(uint256 caseId)`

---

## 🚀 Quick Commands

### Compile Contracts
```bash
npx hardhat compile
```

### Start Local Blockchain
```bash
npx hardhat node
```
Starts a local Ethereum node on `http://127.0.0.1:8545` (Chain ID: 1337)

### Deploy Contracts
```bash
# Deploy to localhost
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.js --network baseSepolia

# Deploy to Optimism Sepolia
npx hardhat run scripts/deploy.js --network optimismSepolia
```

### Run Tests
```bash
# Run all tests
npx hardhat test

# Run specific test
npx hardhat test test/CivicChainRegistry.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

### Clean Build
```bash
npx hardhat clean
```

---

## 📁 Folder Structure

```
blockchain/
├── contracts/
│   ├── WhistleblowerPortal.sol    # Anonymous whistleblowing
│   ├── ShadowVault.sol            # ZK-Mixer for anonymity
│   └── CivicChainRegistry.sol     # Public civic complaints
│
├── scripts/
│   └── deploy.js                  # Deployment script for all contracts
│
├── test/
│   └── CivicChainRegistry.js      # Test file
│
├── artifacts/                     # Compiled contracts (auto-generated)
├── cache/                         # Hardhat cache (auto-generated)
├── hardhat.config.js              # Hardhat configuration
└── package.json                   # Dependencies
```

---

## ⚙️ Configuration

### Networks (hardhat.config.js)

**Localhost:**
- URL: `http://127.0.0.1:8545`
- Chain ID: `1337`
- Accounts: Hardhat's default test accounts

**Base Sepolia:**
- Chain ID: `84532`
- RPC: Uses environment variable `BASE_SEPOLIA_RPC_URL`
- Requires: Private key in `PRIVATE_KEY` env variable

**Optimism Sepolia:**
- Chain ID: `11155420`
- RPC: Uses environment variable `OPTIMISM_SEPOLIA_RPC_URL`
- Requires: Private key in `PRIVATE_KEY` env variable

---

## 🔐 Security Notes

### WhistleblowerPortal
- ✅ Case IDs are generated client-side (no on-chain link to reporter)
- ✅ Only IPFS CID stored (encrypted data off-chain)
- ✅ Council members are set at deployment
- ⚠️ Production: Implement proper DAO governance for council

### ShadowVault
- ✅ Fixed denomination prevents amount-based tracking
- ✅ Nullifier prevents double-spending
- ⚠️ ZK-proof verification disabled for demo (implement for production)
- ⚠️ Production: Use proper Merkle tree implementation
- ⚠️ Production: Implement real ZK-SNARK circuits

### CivicChainRegistry
- ✅ SLA deadline enforced on-chain
- ✅ Only authorized agencies can update status
- ✅ Public escalation mechanism
- ⚠️ Production: Implement proper role management

---

## 🧪 Testing

### Test Coverage
- ✅ CivicChainRegistry - Basic functionality tested
- ⚠️ WhistleblowerPortal - Add comprehensive tests
- ⚠️ ShadowVault - Add ZK-proof tests

### Add More Tests
Create test files in `test/` folder:

```javascript
// test/WhistleblowerPortal.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WhistleblowerPortal", function () {
  it("Should submit a report", async function () {
    const [owner] = await ethers.getSigners();
    const Portal = await ethers.getContractFactory("WhistleblowerPortal");
    const portal = await Portal.deploy([owner.address]);
    
    const caseId = ethers.keccak256(ethers.toUtf8Bytes("test-case"));
    await portal.submitReport(caseId, "QmTestCID");
    
    const report = await portal.reports(caseId);
    expect(report.exists).to.be.true;
  });
});
```

---

## 📊 Gas Optimization

### Current Status
- ✅ Using `calldata` for string parameters
- ✅ Minimal storage usage
- ✅ Event emission for off-chain indexing

### Future Optimizations
- Use `uint8` for status enums
- Pack struct variables efficiently
- Consider ERC-1167 proxy pattern for multiple instances

---

## 🌐 Deployment Addresses

After deployment, addresses are saved to:
- `deployed-addresses.json` (this folder)
- `../deployed-addresses.json` (project root)
- `../.env.local` (environment variables)

### Example deployed-addresses.json
```json
{
  "WhistleblowerPortal": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "ShadowVault": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  "CivicChainRegistry": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "network": "localhost",
  "chainId": 1337,
  "deployer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "deployedAt": "2024-02-26T10:30:00.000Z"
}
```

---

## 🔄 Upgrade Strategy

### Current: Non-Upgradeable
Contracts are deployed as-is. To update:
1. Deploy new version
2. Update frontend contract addresses
3. Migrate data if needed

### Future: Upgradeable Pattern
Consider using OpenZeppelin's upgradeable contracts:
```bash
npm install @openzeppelin/contracts-upgradeable
```

---

## 📚 Resources

### Hardhat
- Docs: https://hardhat.org/docs
- Plugins: https://hardhat.org/plugins

### OpenZeppelin
- Contracts: https://docs.openzeppelin.com/contracts
- Wizard: https://wizard.openzeppelin.com/

### Solidity
- Docs: https://docs.soliditylang.org/
- Style Guide: https://docs.soliditylang.org/en/latest/style-guide.html

### Testing
- Chai: https://www.chaijs.com/
- Ethers.js: https://docs.ethers.org/

---

## 🐛 Common Issues

### "Cannot find module 'hardhat'"
```bash
npm install
```

### "Error: Cannot find module '@nomicfoundation/hardhat-toolbox'"
```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

### "Error: Network localhost not found"
Make sure Hardhat node is running:
```bash
npx hardhat node
```

### Compilation errors
```bash
# Clean and recompile
npx hardhat clean
npx hardhat compile
```

---

## 🎯 Next Steps

1. **Add comprehensive tests** for all contracts
2. **Implement real ZK-proofs** for ShadowVault
3. **Add DAO governance** for WhistleblowerPortal council
4. **Deploy to testnet** (Base Sepolia / Optimism Sepolia)
5. **Get contract verified** on block explorers
6. **Add events indexing** with The Graph
7. **Implement upgradeable pattern** for future updates

---

**Happy Building! 🚀**
