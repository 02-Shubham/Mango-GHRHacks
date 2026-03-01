// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title WhistleblowerPortal
 * @dev The primary registry for anonymous reports.
 * Encrypted data is stored on IPFS, and only the CID and metadata are recorded here.
 */
contract WhistleblowerPortal {
    enum CaseStatus { Pending, UnderReview, Verified, Rejected }

    struct Report {
        string cid;             // IPFS CID of encrypted evidence
        uint256 timestamp;      // Block timestamp
        CaseStatus status;      // Current review status
        uint8 verificationCount;// Number of council votes
        bool exists;
    }

    mapping(bytes32 => Report) public reports; // CaseID -> Report
    mapping(address => bool) public isCouncilMember;
    mapping(bytes32 => mapping(address => bool)) public hasVoted;

    uint8 public constant VOTES_REQUIRED = 3;

    event ReportSubmitted(bytes32 indexed caseId, string cid);
    event CaseVerified(bytes32 indexed caseId);
    event StatusChanged(bytes32 indexed caseId, CaseStatus newStatus);

    constructor(address[] memory _initialCouncil) {
        for (uint256 i = 0; i < _initialCouncil.length; i++) {
            isCouncilMember[_initialCouncil[i]] = true;
        }
    }

    /**
     * @dev Submit an anonymous report.
     * @param _caseId A unique ID generated locally by the whistleblower.
     * @param _cid The IPFS content identifier for the encrypted investigation files.
     */
    function submitReport(bytes32 _caseId, string calldata _cid) external {
        require(!reports[_caseId].exists, "Case ID already exists");

        reports[_caseId] = Report({
            cid: _cid,
            timestamp: block.timestamp,
            status: CaseStatus.Pending,
            verificationCount: 0,
            exists: true
        });

        emit ReportSubmitted(_caseId, _cid);
    }

    /**
     * @dev Council members vote to verify a report.
     * @param _caseId The report being verified.
     */
    function verifyCase(bytes32 _caseId) external {
        require(isCouncilMember[msg.sender], "Not a council member");
        require(reports[_caseId].exists, "Case does not exist");
        require(!hasVoted[_caseId][msg.sender], "Already voted");
        require(reports[_caseId].status == CaseStatus.Pending || reports[_caseId].status == CaseStatus.UnderReview, "Invalid status");

        hasVoted[_caseId][msg.sender] = true;
        reports[_caseId].verificationCount++;

        if (reports[_caseId].status == CaseStatus.Pending) {
            reports[_caseId].status = CaseStatus.UnderReview;
            emit StatusChanged(_caseId, CaseStatus.UnderReview);
        }

        if (reports[_caseId].verificationCount >= VOTES_REQUIRED) {
            reports[_caseId].status = CaseStatus.Verified;
            emit CaseVerified(_caseId);
            emit StatusChanged(_caseId, CaseStatus.Verified);
        }
    }

    // --- View Functions ---

    function getCaseStatus(bytes32 _caseId) external view returns (CaseStatus) {
        return reports[_caseId].status;
    }
}
