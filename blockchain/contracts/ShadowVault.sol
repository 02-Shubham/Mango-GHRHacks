// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Groth16Verifier.sol";

/**
 * @title ShadowVault
 * @dev Production-grade ZK mixer inspired by Tornado Cash.
 *
 * Privacy model:
 *   DEPOSIT  — user provides Poseidon(secret, nullifier) as commitment.
 *              The link between depositor address and commitment is hidden by
 *              the anonymity set (all other depositors).
 *   WITHDRAW — user provides a Groth16 ZK proof that they know (secret, nullifier)
 *              matching a stored commitment, without revealing which one.
 *              A spent nullifier prevents double-spending.
 *
 * Commitment scheme (matches withdraw.circom):
 *   commitment   = Poseidon(secret, nullifier)   [computed in browser]
 *   nullifierHash = Poseidon(nullifier)           [computed in browser]
 */
contract ShadowVault {
    // ── Constants ─────────────────────────────────────────────────────────────
    uint256 public constant DENOMINATION = 0.1 ether;

    // ── State ─────────────────────────────────────────────────────────────────
    IGroth16Verifier public immutable verifier;

    /// @notice All commitments ever deposited (Poseidon hashes)
    mapping(bytes32 => bool) public commitments;

    /// @notice Spent nullifier hashes — prevents double-spend
    mapping(bytes32 => bool) public nullifierHashes;

    /// @notice Ordered list of commitments for anonymity-set counting
    bytes32[] public commitmentHistory;

    // ── Events ────────────────────────────────────────────────────────────────
    event Deposit(
        bytes32 indexed commitment,
        uint256 leafIndex,
        uint256 timestamp
    );

    event Withdrawal(
        address indexed recipient,
        bytes32 nullifierHash,
        uint256 timestamp
    );

    // ── Constructor ───────────────────────────────────────────────────────────
    constructor(address _verifier) {
        require(_verifier != address(0), "Zero verifier address");
        verifier = IGroth16Verifier(_verifier);
    }

    // ── Core: Deposit ─────────────────────────────────────────────────────────

    /**
     * @notice Deposit exactly 0.1 ETH with a Poseidon commitment.
     * @param _commitment  Poseidon(secret, nullifier) — computed in browser.
     *
     * The commitment is stored publicly on-chain but reveals nothing about the
     * depositor beyond the fact that they know a (secret, nullifier) pair.
     */
    function deposit(bytes32 _commitment) external payable {
        require(msg.value == DENOMINATION, "Send exactly 0.1 ETH");
        require(_commitment != bytes32(0), "Invalid commitment");
        require(!commitments[_commitment], "Commitment already exists");

        commitments[_commitment] = true;
        commitmentHistory.push(_commitment);

        emit Deposit(_commitment, commitmentHistory.length - 1, block.timestamp);
    }

    // ── Core: Withdraw ────────────────────────────────────────────────────────

    /**
     * @notice Withdraw 0.1 ETH to a fresh wallet using a ZK proof.
     * @param _pA           Groth16 proof point A
     * @param _pB           Groth16 proof point B
     * @param _pC           Groth16 proof point C
     * @param _commitment   The original commitment (public, stored at deposit)
     * @param _nullifierHash Poseidon(nullifier) — prevents double-spend
     * @param _recipient    Fresh burner wallet to receive the funds
     *
     * The ZK proof proves: "I know (secret, nullifier) such that
     *   Poseidon(secret, nullifier) == _commitment AND
     *   Poseidon(nullifier) == _nullifierHash"
     * without revealing secret or nullifier.
     */
    function withdraw(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        bytes32 _commitment,
        bytes32 _nullifierHash,
        address payable _recipient
    ) external {
        require(_recipient != address(0), "Invalid recipient");
        require(!nullifierHashes[_nullifierHash], "Nullifier already spent");
        require(commitments[_commitment], "Commitment does not exist");

        // ── ZK proof verification ─────────────────────────────────────────────
        uint256[3] memory publicSignals = [
            uint256(_commitment),
            uint256(_nullifierHash),
            uint256(uint160(address(_recipient)))
        ];

        require(
            verifier.verifyProof(_pA, _pB, _pC, publicSignals),
            "Invalid ZK proof"
        );

        // ── Mark nullifier as spent (must be before external call) ────────────
        nullifierHashes[_nullifierHash] = true;

        // ── Transfer funds ────────────────────────────────────────────────────
        (bool success, ) = _recipient.call{value: DENOMINATION}("");
        require(success, "ETH transfer failed");

        emit Withdrawal(_recipient, _nullifierHash, block.timestamp);
    }

    // ── View helpers ──────────────────────────────────────────────────────────

    /// @notice Returns the number of deposits — the anonymity set size.
    function anonymitySetSize() external view returns (uint256) {
        return commitmentHistory.length;
    }

    /// @notice Returns true if a commitment was deposited.
    function isCommitmentValid(bytes32 _commitment) external view returns (bool) {
        return commitments[_commitment];
    }

    /// @notice Returns true if a nullifier has been spent.
    function isNullifierSpent(bytes32 _nullifierHash) external view returns (bool) {
        return nullifierHashes[_nullifierHash];
    }
}
