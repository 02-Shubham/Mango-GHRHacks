# ⚖️ NyayaSetu: The Decentralized Justice Protocol

> **Securing Truth. Protecting Identity. Ensuring Accountability.**

NyayaSetu is a state-of-the-art decentralized ecosystem built to empower citizens and whistleblowers. By combining **Blockchain Immutability**, **ZK-SNARKs Privacy**, and **Account Abstraction**, NyayaSetu provides a secure, scalable, and user-centric platform for the modern age of digital justice.

---

## 🛡️ Core Pillars of Security

### ⛓️ Blockchain-Native Integrity
Every complaint and report is anchored on an immutable blockchain ledger. Once submitted, evidence cannot be tampered with, deleted, or hidden by any centralized authority.
- **On-Chain SLAs**: Automated tracking of government response times.
- **Transparent Auditing**: A public record of all resolved and escalated cases.

### 🎭 Zero-Knowledge Privacy (ShadowVault)
Utilizing high-grade **ZK-SNARKs** (Groth16), NyayaSetu allows whistleblowers to prove their right to report and mix their funds without revealing their identity.
- **Anonymity Sets**: Large-scale mixers break the link between your personal wallet and your public reports.
- **Local Proof Generation**: Cryptographic proofs are computed in your browser—your secrets never leave your device.

### 🕒 Dead Man's Switch
A fail-safe mechanism ensures that truth survives even if you can't. If you become inactive, your encrypted evidence and decryption keys are automatically released to the public.

---

## ⚡ Scalability & Next-Gen Infrastructure

NyayaSetu is built for the masses, focusing on performance and cross-network scalability.

- **L2 Scalability Ready**: Architected for seamless deployment on Ethereum Layer-2s (like Arbitrum or Polygon) to handle thousands of reports with minimal gas costs.
- **Modular Component Design**: Decoupled frontend, admin, and blockchain layers allow for independent scaling and maintenance.
- **IPFS Distributed Storage**: High-fidelity evidence is stored on decentralized IPFS (via Pinata), ensuring data availability without central points of failure.

---

## 🔑 Seamless UX with Account Abstraction (AA)

Bridging the gap between Web2 simplicity and Web3 security.

- **Simplified Identity**: Advanced wallet integration (via Wagmi/MetaMask) paves the way for gasless transactions and social recovery features.
- **Human-Readable Interactions**: Complex blockchain operations are abstracted into intuitive, beautiful UI components.
- **Multi-Role Governance**: Securely managed agency and admin portals with role-based access control (RBAC) enforced on-chain.

---

## 🛠️ Premium Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (React), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Blockchain** | [Solidity](https://soliditylang.org/), [Hardhat](https://hardhat.org/), [Ethers.js](https://docs.ethers.org/v6/), [Wagmi](https://wagmi.sh/) |
| **Security** | [ZK-SNARKs](https://github.com/iden3/snarkjs), [Circom](https://github.com/iden3/circomlibjs), [Dead Man's Switch](CONTRACTS.md) |
| **Data & Storage**| [PostgreSQL](https://neon.tech/) (Prisma), [IPFS](https://www.pinata.cloud/) (Pinata) |
| **AI** | [Google Generative AI](https://ai.google.dev/) (For evidence verification Layer) |

---

## 🏗️ Architecture & Flows

Explore our deep-dive documentation to understand how NyayaSetu works under the hood.

- 📐 **[Technical Architecture](ARCHITECTURE.md)**: Diagrams showing ZK-flows and system interaction.
- 📜 **[Smart Contract Logic](CONTRACTS.md)**: Detailed API of our Solidity enforcers.
- 🗺️ **[User Workflows](WORKFLOWS.md)**: Step-by-step guides for citizens and whistleblowers.

---

## 🚦 Getting Started

### Quick Start (Local Development)

1. **Clone & Install**:
   ```bash
   npm install && cd blockchain && npm install && cd ../NyayaSetu-admin-master && npm install
   ```

2. **Launch Blockchain**:
   ```bash
   # Terminal 1
   cd blockchain && npx hardhat node
   # Terminal 2
   cd blockchain && npx hardhat run scripts/deploy.cjs --network localhost
   ```

3. **Run App**:
   ```bash
   # Terminal 3 (Main App)
   npm run dev
   # Terminal 4 (Admin Panel)
   cd NyayaSetu-admin-master && npm run dev -- -p 3001
   ```

---

## 📄 License
Licensed under the **MIT License**. Join us in building a more transparent future!