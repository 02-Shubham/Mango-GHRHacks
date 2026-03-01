# NyayaSetu Smart Contracts Documentation

NyayaSetu relies on several Ethereum-based smart contracts to ensure transparency, security, and anonymity for its users.

## 1. `CivicChainRegistry.sol`

The primary registry for public civic complaints.

### Key Functions
- `createCase(bytes32 _fileHash, string _metadataCID, string _department)`: Submits a new civic complaint.
- `updateStatus(uint256 _caseId, CaseStatus _newStatus)`: Allows authorized agencies to update the status of a case (Assigned, InProgress, Closed, etc.).
- `triggerEscalation(uint256 _caseId)`: Automatically escalates a case to "Public" if the 15-day SLA deadline has passed without resolution.
- `addAgency(address agency, string department)`: (Admin only) Authorizes a new government agency for a specific department.

### Key Events
- `CaseCreated`: Emitted when a new complaint is filed.
- `StatusUpdated`: Emitted when an agency updates a case's status.
- `PublicEscalationTriggered`: Emitted when a case passes its SLA deadline.

---

## 2. `WhistleblowerPortal.sol`

A secure platform for anonymous whistleblowing reports.

### Key Functions
- `submitReport(bytes32 _caseId, string _cid)`: Submits an anonymous report with encrypted evidence stored on IPFS.
- `verifyCase(bytes32 _caseId)`: Allows council members to vote on the validity of a report. Requires 3 votes for verification.

### Key Events
- `ReportSubmitted`: Emitted when a new anonymous report is created.
- `CaseVerified`: Emitted when a report receives the required number of council votes.

---

## 3. `ShadowVault.sol`

A ZK-Mixer inspired by Tornado Cash for breaking transaction links and ensuring financial privacy.

### Key Functions
- `deposit(bytes32 _commitment)`: Deposits 0.1 ETH into the vault with a hidden commitment.
- `withdraw(uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, bytes32 _commitment, bytes32 _nullifierHash, address _recipient)`: Withdraws 0.1 ETH to a fresh address using a ZK-SNARK proof.

### Key Events
- `Deposit`: Emitted when funds are added to the anonymity set.
- `Withdrawal`: Emitted when funds are successfully withdrawn using a valid ZK proof.

---

## 4. `DeadManSwitch.sol`

An automated mechanism to release sensitive evidence if a whistleblower is compromised or becomes inactive.

### Key Functions
- `register(string _evidenceCID, string _encryptedKeyHex, uint256 _releaseAt, string _publicMessage)`: Creates a new switch with a set release time.
- `cancel(uint256 id)`: Deletes the switch before the deadline (Whistleblower only).
- `extend(uint256 id, uint256 newReleaseAt)`: Pushes the release deadline further into the future.
- `releaseNow(uint256 id, string _plaintextKeyHex)`: Manually triggers the release of evidence.
- `trigger(uint256 id, string _plaintextKeyHex)`: Trustless release of the decryption key after the deadline has passed.

### Key Events
- `SwitchRegistered`: Emitted when a new dead man's switch is created.
- `KeyReleased`: Emitted when the evidence decryption key becomes public on-chain.

---

## 5. `Groth16Verifier.sol`

A generated contract used to verify the mathematical validity of ZK-SNARK proofs submitted to the `ShadowVault`.
