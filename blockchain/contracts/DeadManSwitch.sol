// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DeadManSwitch
 * @dev Time-Lock Dead Man's Switch for whistleblowers.
 *
 * Flow:
 *   1. Whistleblower calls register() with:
 *      - evidenceCID  : IPFS CID of encrypted evidence
 *      - encryptedKey : the AES decryption key, itself encrypted with the
 *                       whistleblower's own public key (stored but not usable
 *                       until they choose to release the plaintext key)
 *      - releaseAt    : unix timestamp when evidence auto-releases
 *      - message      : optional public statement to attach
 *
 *   2. Before releaseAt:
 *      - Whistleblower can cancel()   → deletes the switch
 *      - Whistleblower can extend()   → pushes releaseAt further
 *      - Whistleblower can releaseNow() → releases immediately (voluntary)
 *
 *   3. After releaseAt:
 *      - ANYONE can call trigger(id) → emits KeyReleased event with the
 *        decryption key, making the evidence permanently readable on-chain
 *      - Cannot be stopped — the whistleblower is no longer needed
 *
 * Privacy:
 *   - The evidenceCID and encryptedKey are stored on-chain but the evidence
 *     itself is on IPFS and unreadable without the decryption key.
 *   - After trigger(), the key is public forever — irreversible.
 */
contract DeadManSwitch {

    // ── Structs ───────────────────────────────────────────────────────────────
    struct Switch {
        address whistleblower;
        string  evidenceCID;       // IPFS CID of encrypted evidence
        string  encryptedKeyHex;   // AES key encrypted with whistleblower pub key, stored for release
        string  plaintextKeyHex;   // Filled only after trigger/releaseNow
        string  publicMessage;     // Optional message to release with the evidence
        uint256 registeredAt;
        uint256 releaseAt;         // Timestamp after which anyone can trigger
        bool    triggered;         // True once the key is released
        bool    cancelled;
    }

    // ── State ─────────────────────────────────────────────────────────────────
    uint256 public switchCount;
    mapping(uint256 => Switch) public switches;
    mapping(address => uint256[]) public mySwitches; // whistleblower → their switch IDs

    // ── Constants ─────────────────────────────────────────────────────────────
    uint256 public constant MIN_LOCK_PERIOD  = 1 days;
    uint256 public constant MAX_LOCK_PERIOD  = 365 days * 10; // 10 years

    // ── Events ────────────────────────────────────────────────────────────────
    event SwitchRegistered(
        uint256 indexed id,
        address indexed whistleblower,
        string  evidenceCID,
        uint256 releaseAt,
        uint256 timestamp
    );

    event SwitchCancelled(uint256 indexed id, uint256 timestamp);

    event SwitchExtended(
        uint256 indexed id,
        uint256 oldReleaseAt,
        uint256 newReleaseAt,
        uint256 timestamp
    );

    event KeyReleased(
        uint256 indexed id,
        address indexed triggeredBy,
        string  evidenceCID,
        string  plaintextKeyHex,
        string  publicMessage,
        uint256 timestamp
    );

    // ── Modifiers ─────────────────────────────────────────────────────────────
    modifier onlyWhistleblower(uint256 id) {
        require(switches[id].whistleblower == msg.sender, "Not your switch");
        _;
    }

    modifier exists(uint256 id) {
        require(id < switchCount, "Switch does not exist");
        _;
    }

    modifier notFinished(uint256 id) {
        require(!switches[id].triggered, "Already triggered");
        require(!switches[id].cancelled,  "Already cancelled");
        _;
    }

    // ── Core: Register ────────────────────────────────────────────────────────

    /**
     * @notice Register a new dead man's switch.
     * @param _evidenceCID      IPFS CID of the AES-256 encrypted evidence file.
     * @param _encryptedKeyHex  The decryption key, stored here but NOT revealed yet.
     *                          In production: encrypt this with the whistleblower's
     *                          own asymmetric public key so only they can retrieve it.
     * @param _releaseAt        Unix timestamp for automatic release.
     * @param _publicMessage    Statement to be released with the decryption key.
     */
    function register(
        string calldata _evidenceCID,
        string calldata _encryptedKeyHex,
        uint256         _releaseAt,
        string calldata _publicMessage
    ) external returns (uint256 id) {
        require(bytes(_evidenceCID).length > 0,     "Evidence CID required");
        require(bytes(_encryptedKeyHex).length > 0, "Encrypted key required");
        require(_releaseAt > block.timestamp + MIN_LOCK_PERIOD,     "Release must be >1 day away");
        require(_releaseAt < block.timestamp + MAX_LOCK_PERIOD,     "Release too far in future");

        id = switchCount++;
        switches[id] = Switch({
            whistleblower:   msg.sender,
            evidenceCID:     _evidenceCID,
            encryptedKeyHex: _encryptedKeyHex,
            plaintextKeyHex: "",
            publicMessage:   _publicMessage,
            registeredAt:    block.timestamp,
            releaseAt:       _releaseAt,
            triggered:       false,
            cancelled:       false
        });

        mySwitches[msg.sender].push(id);

        emit SwitchRegistered(id, msg.sender, _evidenceCID, _releaseAt, block.timestamp);
    }

    // ── Core: Cancel ──────────────────────────────────────────────────────────
    /**
     * @notice Cancel the switch before it triggers.
     *         Only callable by the original whistleblower.
     */
    function cancel(uint256 id)
        external
        exists(id)
        onlyWhistleblower(id)
        notFinished(id)
    {
        require(block.timestamp < switches[id].releaseAt, "Deadline passed - cannot cancel");
        switches[id].cancelled = true;
        emit SwitchCancelled(id, block.timestamp);
    }

    // ── Core: Extend ──────────────────────────────────────────────────────────
    /**
     * @notice Push the release date further into the future.
     *         Useful if the whistleblower is still active and safe.
     */
    function extend(uint256 id, uint256 newReleaseAt)
        external
        exists(id)
        onlyWhistleblower(id)
        notFinished(id)
    {
        require(block.timestamp < switches[id].releaseAt, "Deadline passed - cannot extend");
        require(newReleaseAt > switches[id].releaseAt, "Must extend, not shorten");
        require(newReleaseAt < block.timestamp + MAX_LOCK_PERIOD, "Too far in future");

        uint256 old = switches[id].releaseAt;
        switches[id].releaseAt = newReleaseAt;
        emit SwitchExtended(id, old, newReleaseAt, block.timestamp);
    }

    // ── Core: Release Now (Voluntary) ────────────────────────────────────────
    /**
     * @notice Voluntarily release the evidence immediately.
     *         The whistleblower provides the plaintext decryption key.
     */
    function releaseNow(uint256 id, string calldata _plaintextKeyHex)
        external
        exists(id)
        onlyWhistleblower(id)
        notFinished(id)
    {
        require(bytes(_plaintextKeyHex).length > 0, "Plaintext key required");
        _doRelease(id, _plaintextKeyHex, msg.sender);
    }

    // ── Core: Trigger (Trustless) ─────────────────────────────────────────────
    /**
     * @notice Anyone can trigger the switch after the release deadline.
     *         The whistleblower must have pre-uploaded their plaintext key
     *         through triggerWithKey() OR the key was stored as plaintext in encryptedKeyHex.
     *
     *         For a real deployment, use a Shamir Secret Sharing scheme so the
     *         plaintext key is reconstructed from on-chain + off-chain shares.
     *         For this demo, the whistleblower uploads the plaintext key at trigger time.
     */
    function trigger(uint256 id, string calldata _plaintextKeyHex)
        external
        exists(id)
        notFinished(id)
    {
        require(block.timestamp >= switches[id].releaseAt, "Not yet time");
        require(bytes(_plaintextKeyHex).length > 0, "Plaintext key required");
        _doRelease(id, _plaintextKeyHex, msg.sender);
    }

    // ── Internal ──────────────────────────────────────────────────────────────
    function _doRelease(uint256 id, string memory _plaintextKeyHex, address triggeredBy) internal {
        switches[id].triggered       = true;
        switches[id].plaintextKeyHex = _plaintextKeyHex;

        emit KeyReleased(
            id,
            triggeredBy,
            switches[id].evidenceCID,
            _plaintextKeyHex,
            switches[id].publicMessage,
            block.timestamp
        );
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    /// @notice Returns all switch IDs registered by a given address.
    function getSwitchIds(address who) external view returns (uint256[] memory) {
        return mySwitches[who];
    }

    /// @notice Returns whether a switch is past its deadline and triggerable.
    function isTriggerReady(uint256 id) external view returns (bool) {
        Switch storage s = switches[id];
        return !s.triggered && !s.cancelled && block.timestamp >= s.releaseAt;
    }

    /// @notice Seconds remaining until the switch triggers (0 if past deadline).
    function timeRemaining(uint256 id) external view returns (uint256) {
        Switch storage s = switches[id];
        if (block.timestamp >= s.releaseAt) return 0;
        return s.releaseAt - block.timestamp;
    }
}
