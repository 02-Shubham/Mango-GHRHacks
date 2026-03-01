# NyayaSetu – The Whistleblower & Civic Shield Protocol

NyayaSetu is a decentralized, end-to-end encrypted platform designed to protect whistleblowers, journalists, and civic informants when reporting corruption, fraud, or human rights violations to designated authorities.

By leveraging Blockchain immutability, Zero-Knowledge proofs, advanced Hybrid Cryptography, and AI-powered Forensic Analysis, NyayaSetu establishes a zero-trust environment where the identity of the reporter is cryptographically shielded, and the integrity of the evidence is mathematically guaranteed.

---

## 🎯 Project Overview

Reporting systemic corruption is inherently dangerous. Traditional reporting mechanisms are susceptible to data breaches, insider threats, and identity leaks. NyayaSetu solves this by:
1. **Ensuring Absolute Anonymity**: Using ZK-mixers and burner wallets.
2. **Preventing Tampering**: Anchoring evidence to an immutable blockchain.
3. **Validating Authenticity**: Using AI forensics (Gemini 2.5 Flash) to block fake evidence.

---

## 📚 Documentation

Detailed documentation is available in the [docs/](docs/README.md) directory:

- **[Setup & Startup Guide](docs/setup-guide.md)**: How to run the project locally.
- **[Architecture & Technical Flow](docs/architecture.md)**: Deep dive into the system design and ZK-SNARKs.
- **[Smart Contracts](docs/contracts.md)**: Documentation for the on-chain logic.
- **[User Workflows](docs/workflows.md)**: Step-by-step guides for citizens and authorities.

---

## 🛠️ Quick Start

To get started quickly, follow the **[Setup Guide](docs/setup-guide.md)**.

1. **Start Blockchain**: `cd blockchain && npx hardhat node`
2. **Deploy Contracts**: `cd blockchain && npx hardhat run scripts/deploy.cjs --network localhost`
3. **Start Main App**: `npm install && npm run dev`
4. **Start Admin Panel**: `cd NyayaSetu-admin-master && npm install && npm run dev -- -p 3001`

---

## 👨‍💻 Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion.
- **Web3**: Wagmi, Viem, Ethers.js.
- **Blockchain**: Solidity, Hardhat.
- **AI**: Google Gemini 2.5 Flash.
- **Storage**: IPFS (Pinata).

---

For more details, visit the [Documentation Index](docs/README.md).
