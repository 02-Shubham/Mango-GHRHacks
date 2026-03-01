# NyayaSetu User Workflows

This guide outlines the key user journeys within the NyayaSetu platform.

## 1. Filing a Public Civic Complaint

For issues like infrastructure damage, public service failures, or general civic grievances.

1. **Connect Wallet**: Click "Connect Wallet" on the homepage and approve the connection in MetaMask.
2. **Navigate to Submit**: Go to the "Submit Complaint" section.
3. **Fill Form**: Provide the department (e.g., "Roads", "Water"), a clear description, and upload any photo/video evidence.
4. **On-Chain Submission**: Confirm the transaction in MetaMask. Your complaint is now recorded on the `CivicChainRegistry`.
5. **Track Status**: Visit the "Public Ledger" to see your case and its current status (Submitted, Assigned, In Progress).
6. **Automatic Media Leak**: If the agency doesn't resolve the case within 15 days, any user can trigger an "Automatic Media Leak" via the ledger UI, exposing the issue to reporters and the general public.

---

## 2. Anonymous Whistleblowing (End-to-End)

For reporting sensitive information while maintaining absolute anonymity.

### Phase A: Anonymizing Funds (ShadowVault)
1. **Initialize Protocol**: Navigate to "ShadowVault" (ZK-Mixer).
2. **Deposit**: Generate a secret note, save it securely, and deposit 0.1 ETH into the vault.
3. **Wait**: Allow some time to pass to increase the anonymity set.
4. **Withdraw**: Use your secret note to withdraw the 0.1 ETH to a *fresh burner wallet* (one with no previous on-chain history).

### Phase B: Reporting
1. **Connect Burner Wallet**: Switch to your fresh burner wallet in MetaMask.
2. **Submit Report**: Navigate to the "Anonymous Portal", provide the report details and encrypted evidence (stored on IPFS).
3. **Verification**: Your report will enter a "Pending" state, awaiting verification by the community council/DAO.

---

## 3. Setting up a Dead Man's Switch

A safety net for whistleblowers to ensure evidence is released even if they are silenced.

1. **Register Switch**: Provide the IPFS CID of your encrypted evidence and the decryption key (itself encrypted with your public key).
2. **Set Deadline**: Choose a release timestamp (e.g., 30 days from now).
3. **Maintain**: Periodically log in to "Extend" the deadline if you are safe.
4. **Trigger**: If the deadline passes without an extension or cancellation, the "Trigger" function becomes available to anyone, releasing the decryption key and evidence to the public.

---

## 4. Admin & Agency Operations

For authorized personnel to manage the resolution of cases.

1. **Agency Login**: Connect an authorized agency wallet to the Admin Panel (Port 3001).
2. **Assign Cases**: Review new submissions in the dashboard and mark them as "Assigned".
3. **Verify Evidence**: Use the built-in AI tools to verify the authenticity of uploaded documents/images.
4. **Update & Resolve**: Move cases through "In Progress" and finally to "Resolved" once the civic issue is addressed.
5. **Transparency**: All status changes are signed by the agency and recorded on the blockchain.
