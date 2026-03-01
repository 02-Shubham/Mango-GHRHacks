// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CivicChainRegistry {
    enum CaseStatus {
        Submitted,
        Assigned,
        InProgress,
        EscalatedToPublic,
        Closed,
        Rejected,
        FalseClaim
    }

    struct Case {
        uint256 caseId;
        address creator;
        bytes32 fileHash;
        uint256 createdAt;
        uint256 slaDeadline;
        CaseStatus status;
    }

    mapping(uint256 => Case) public cases;
    uint256 public caseCount;

    // Define roles/governance mapping
    address public admin;
    mapping(address => bool) public authorizedAgencies;
    mapping(string => address) public departmentToAgency; // Map department names to agency addresses
    mapping(address => string) public agencyPublicKeys;   // Store Agency Public Keys for encryption flow

    event CaseCreated(uint256 indexed caseId, address indexed creator, string metadataCID, string department);
    event StatusUpdated(uint256 indexed caseId, CaseStatus newStatus);
    event PublicEscalationTriggered(uint256 indexed caseId);
    event AgencyRegistered(address indexed agency, string department, string publicKey);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlyAgency() {
        require(authorizedAgencies[msg.sender] || msg.sender == admin, "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addAgency(address agency, string memory department) external onlyAdmin {
        authorizedAgencies[agency] = true;
        departmentToAgency[department] = agency;
    }

    function removeAgency(address agency, string memory department) external onlyAdmin {
        authorizedAgencies[agency] = false;
        departmentToAgency[department] = address(0);
        agencyPublicKeys[agency] = "";
    }

    function registerAgencyDetails(string memory department, string memory publicKey) external onlyAgency {
        agencyPublicKeys[msg.sender] = publicKey;
        departmentToAgency[department] = msg.sender;
        emit AgencyRegistered(msg.sender, department, publicKey);
    }

    function createCase(
        bytes32 _fileHash,
        string memory _metadataCID,
        string memory _department
    ) external returns (uint256) {
        caseCount++;
        uint256 newCaseId = caseCount;

        cases[newCaseId] = Case({
            caseId: newCaseId,
            creator: msg.sender,
            fileHash: _fileHash,
            createdAt: block.timestamp,
            slaDeadline: block.timestamp + 15 days,
            status: CaseStatus.Submitted
        });

        emit CaseCreated(newCaseId, msg.sender, _metadataCID, _department);
        return newCaseId;
    }

    function updateStatus(uint256 _caseId, CaseStatus _newStatus) external onlyAgency {
        require(_caseId > 0 && _caseId <= caseCount, "Invalid case ID");
        require(cases[_caseId].status != CaseStatus.EscalatedToPublic, "Cannot update escalated case natively");

        cases[_caseId].status = _newStatus;
        emit StatusUpdated(_caseId, _newStatus);
    }

    function triggerEscalation(uint256 _caseId) external {
        require(_caseId > 0 && _caseId <= caseCount, "Invalid case ID");
        Case storage c = cases[_caseId];
        
        // Ensure SLA deadline has passed
        require(block.timestamp > c.slaDeadline, "SLA deadline not yet reached");
        
        // Ensure case hasn't already been resolved appropriately
        require(
            c.status == CaseStatus.Submitted ||
            c.status == CaseStatus.Assigned ||
            c.status == CaseStatus.InProgress,
            "Case is not in an escalatable state"
        );

        c.status = CaseStatus.EscalatedToPublic;
        
        emit StatusUpdated(_caseId, CaseStatus.EscalatedToPublic);
        emit PublicEscalationTriggered(_caseId);
    }

    /**
     * @dev Helper to get an agency's public key for a given department.
     */
    function getAgencyPublicKey(string memory department) external view returns (string memory) {
        address agency = departmentToAgency[department];
        require(agency != address(0), "Department not registered");
        return agencyPublicKeys[agency];
    }
}
