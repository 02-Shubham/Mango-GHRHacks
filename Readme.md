# NyayaSetu – The Whistleblower & Civic Shield Protocol

NyayaSetu is a decentralized, end-to-end encrypted platform designed to protect whistleblowers, journalists, and civic informants when reporting corruption, fraud, or human rights violations to designated authorities. 

By leveraging Blockchain immutability, Zero-Knowledge proofs, advanced Hybrid Cryptography, and AI-powered Forensic Analysis, NyayaSetu establishes a zero-trust environment where the identity of the reporter is cryptographically shielded, and the integrity of the evidence is mathematically guaranteed.

---

## 🎯 The Problem It Solves

Reporting systemic corruption is inherently dangerous. Traditional reporting mechanisms are susceptible to data breaches, insider threats, retroactive tampering, and identity leaks. Whistleblowers often face retaliation because their identities and physical locations are compromised through digital footprints (like IP addresses or hidden EXIF camera data) attached to their submissions. Furthermore, authorities often struggle to verify the authenticity of digital evidence in the age of generative AI.

**NyayaSetu solves this by:**
1. **Ensuring Absolute Anonymity:** Enforcing the use of burner wallets, ShadowVault fund mixers, and actively stripping all EXIF/metadata from uploaded evidence before local encryption.
2. **Preventing Tampering:** Anchoring evidence hashes and metadata directly to a Blockchain registry (CivicChain). Once submitted, the case record cannot be altered or deleted by anyone—not even the system administrators.
3. **Validating Authenticity:** Integrating Google Gemini 2.5 Flash for advanced forensic AI checks to actively block AI-generated images or LLM-hallucinated documents from polluting the justice system.

---

## ✨ Key Features

### For the Whistleblower (Citizen App)
* **Client-Side Hybrid Cryptography**: Evidence is encrypted locally directly within the browser using AES-256-GCM and the specific Authority's RSA-2048 Public Key. Cleartext never touches an external server.
* **Privacy Scrubbing & AI Verification**: Device metadata (GPS, timestamps, hardware IDs) is actively destroyed from images to prevent tracking. Simultaneously, the system checks for and blocks AI-generated manipulations via EXIF footprints and visual scanning.
* **Dead Man's Switch**: A time-locked cryptographic failsafe that automatically decrypts and broadcasts evidence to the public ledger if the whistleblower is silenced or fails to check in.
* **Decentralized Storage**: Encrypted payloads are stored on IPFS, removing centralized single points of failure.

### For the Authorities (Admin/Agency App)
* **Secure Authority Portal**: Designated agencies (Police, Cyber Crime, Anti-Corruption) connect via their authorized Web3 wallets to access their specific jurisdictions.
* **Local Decryption Check**: Authorities use their private keys to decrypt the evidence strictly within their local, secure browser environment.
* **AI Document Forensics**: Authorities can initiate AI-powered forensic scans on submitted PDFs/Documents to detect LLM-generated wording, logical flaws, or structural inconsistencies prior to accepting evidence.
* **Transparent Case Management**: Status updates (In Progress, Resolved, Rejected) are recorded permanently on the blockchain, enforcing SLA accountability and public transparency.

---

## 🛠️ Technology Stack

**Frontend / Client Architecture**
* Next.js 14+ (App Router)
* React & TypeScript
* TailwindCSS & Framer Motion (Fluid UI/UX)
* Wagmi & Viem (Web3 Integration & Wallet Connection)
* Web Crypto API (In-browser AES/RSA encryption layer)

**Backend / AI / Storage**
* Google Gemini 2.5 Flash (`@google/genai`) for Image/Document Forensic Analysis
* Pinata (IPFS Gateway and Pinning infrastructure)
* Next.js Serverless API Routes (Secure backend orchestration)

**Blockchain / Smart Contracts**
* Solidity
* Hardhat (Local Ethereum Environment, Deployment, & Testing)
* Ethers.js
* **Core Contracts:** `CivicChainRegistry`, `ShadowVault`, `DeadManSwitch`

---

## 🚀 Getting Started (Developer Setup)

To run NyayaSetu locally on your machine, you will need to instantiate three distinct environments: the Local Blockchain Node, the Whistleblower App (Frontend), and the Admin App (Authority Panel).

### Prerequisites
* Node.js (v18+)
* npm or yarn
* MetaMask browser extension (configured for Localhost 8545, Chain ID: 1337)
* Pinata API Keys (for IPFS uploads)
* Google Gemini API Key (for AI forensics)

### 1. Environment Variables Configuration
You must create/configure `.env` (or `.env.local`) files in **both** the root directory and the `NyayaSetu-admin-master` directory with the following variables:

```env
NEXT_PUBLIC_PINATA_API_KEY="your_pinata_api_key_here"
NEXT_PUBLIC_PINATA_SECRET_API_KEY="your_pinata_secret_key_here"
NEXT_PUBLIC_IPFS_GATEWAY="gateway.pinata.cloud"
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 2. Bootstrapping the Blockchain Network
Open a terminal and navigate to the `blockchain` directory.

```bash
cd blockchain
npm install
npx hardhat node
```
*⚠️ Keep this terminal running. This process simulates your local Ethereum network.*

In a **new terminal tab**, navigate back to `blockchain` and compile/deploy the smart contracts:
```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.cjs --network localhost
```
*Note: This specific deployment script automatically updates the contract addresses in the `contracts/addresses.ts` files for both frontends.*

### 3. Running the Whistleblower (Citizen) Application
In a **new terminal tab**, navigate to the project root.

```bash
npm install
npm run dev
```
*The Whistleblower portal will now be available at `http://localhost:3000`.*

### 4. Running the Authority (Admin) Application
In a **last terminal tab**, navigate to the admin directory.

```bash
cd NyayaSetu-admin-master
npm install
npm run dev -- -p 3001
```
*The Authority portal will now be available at `http://localhost:3001`.*

---

## 👨‍💻 Developer's Perspective & Technical Architecture

### Evidence Submission Flow (Zero-Trust)
1. **Data Intake & Forensics**: The user uploads `evidence.jpg`. `image-verification.ts` locally parses the EXIF data looking for camera identity and blocking AI tags. It then passes the raw image to the `/api/verify-image` route for visual analysis by Gemini 2.5 Flash.
2. **Metadata Sanitization**: If the evidence is deemed organic and trustworthy, it is run through `browser-image-compression` on a WebWorker to mathematically strip all identifying metadata (GPS coordinates, time taken).
3. **Symmetric + Asymmetric Encryption**: `browser-crypto.ts` operates on the client machine to generate a 256-bit AES key and encrypt the sanitized evidence. It then requests the specific Authority's RSA Public Key from the blockchain and encrypts the AES key.
4. **Decentralized Storage**: The encrypted buffer and its corresponding metadata JSON are pinned to the InterPlanetary File System (IPFS).
5. **Ledger Commitment**: The resulting IPFS Content Identifiers (CIDs) and the SHA-256 hash of the payload are passed to a Web3 Wallet prompt. The user commits these immutable pointers to the `CivicChainRegistry.sol` smart contract.

### Access Control & Governance
The smart contracts implement strictly typed Role-Based Access Control (RBAC). A standard wallet cannot view restricted cases or mutate statuses on the Authority Portal unless its specific address is registered to a department pool (e.g., "Cyber Crime") by a system administrator.

To grant authority access to a testing wallet during local development, run the included utility script:
```bash
cd blockchain
npx hardhat run scripts/add-user-agency.cjs --network localhost
```