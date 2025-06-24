// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BloodDonationPlatform
 * @dev Main smart contract for blood donation management
 */
contract BloodDonationPlatform is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _donationIds;
    Counters.Counter private _requestIds;
    Counters.Counter private _donorIds;
    
    // Events
    event DonorRegistered(address indexed donor, string name, string bloodType, string location);
    event DonationRecorded(uint256 indexed donationId, address indexed donor, string bloodType, uint256 amount, string location);
    event BloodRequestCreated(uint256 indexed requestId, address indexed recipient, string bloodType, uint256 amount, string urgency);
    event RequestFulfilled(uint256 indexed requestId, uint256 indexed donationId, address indexed donor);
    event DonationVerified(uint256 indexed donationId, address indexed verifier);
    
    // Structs
    struct DonorProfile {
        uint256 id;
        address donorAddress;
        string name;
        string bloodType;
        string location;
        bool verified;
        uint256 totalDonations;
        uint256 lastDonationTime;
        bool isRegistered;
    }
    
    struct DonationRecord {
        uint256 id;
        address donor;
        address recipient;
        string bloodType;
        uint256 amount; // in ml
        string location;
        uint256 timestamp;
        bool verified;
        string txHash;
        uint256 nftTokenId;
        bool nftMinted;
    }
    
    struct BloodRequest {
        uint256 id;
        address recipient;
        string bloodType;
        uint256 amount; // number of units needed
        string urgency; // "low", "medium", "high", "critical"
        string location;
        uint256 timestamp;
        string status; // "open", "fulfilled", "expired"
        string description;
        bool isActive;
    }
    
    // State variables
    mapping(address => DonorProfile) public donors;
    mapping(uint256 => DonationRecord) public donations;
    mapping(uint256 => BloodRequest) public bloodRequests;
    mapping(address => uint256[]) public donorDonations;
    mapping(address => uint256[]) public recipientRequests;
    mapping(address => bool) public verifiedMedicalProfessionals;
    
    // Constants
    uint256 public constant DONATION_COOLDOWN = 56 days; // 56 days between donations
    uint256 public constant MIN_DONATION_AMOUNT = 350; // minimum 350ml
    uint256 public constant MAX_DONATION_AMOUNT = 500; // maximum 500ml
    
    // Modifiers
    modifier onlyRegisteredDonor() {
        require(donors[msg.sender].isRegistered, "Not a registered donor");
        _;
    }
    
    modifier onlyMedicalProfessional() {
        require(verifiedMedicalProfessionals[msg.sender] || msg.sender == owner(), "Not authorized medical professional");
        _;
    }
    
    modifier validBloodType(string memory bloodType) {
        require(isValidBloodType(bloodType), "Invalid blood type");
        _;
    }
    
    constructor() {
        // Add contract deployer as verified medical professional
        verifiedMedicalProfessionals[msg.sender] = true;
    }
    
    /**
     * @dev Register a new blood donor
     */
    function registerDonor(
        string memory _name,
        string memory _bloodType,
        string memory _location
    ) external validBloodType(_bloodType) {
        require(!donors[msg.sender].isRegistered, "Donor already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_location).length > 0, "Location cannot be empty");
        
        _donorIds.increment();
        uint256 newDonorId = _donorIds.current();
        
        donors[msg.sender] = DonorProfile({
            id: newDonorId,
            donorAddress: msg.sender,
            name: _name,
            bloodType: _bloodType,
            location: _location,
            verified: false,
            totalDonations: 0,
            lastDonationTime: 0,
            isRegistered: true
        });
        
        emit DonorRegistered(msg.sender, _name, _bloodType, _location);
    }
    
    /**
     * @dev Record a blood donation
     */
    function recordDonation(
        address _recipient,
        string memory _bloodType,
        uint256 _amount,
        string memory _location
    ) external onlyRegisteredDonor validBloodType(_bloodType) nonReentrant {
        require(_amount >= MIN_DONATION_AMOUNT && _amount <= MAX_DONATION_AMOUNT, "Invalid donation amount");
        require(bytes(_location).length > 0, "Location cannot be empty");
        
        DonorProfile storage donor = donors[msg.sender];
        
        // Check donation cooldown period
        if (donor.lastDonationTime > 0) {
            require(
                block.timestamp >= donor.lastDonationTime + DONATION_COOLDOWN,
                "Must wait 56 days between donations"
            );
        }
        
        _donationIds.increment();
        uint256 newDonationId = _donationIds.current();
        
        // Generate transaction hash (simplified for demo)
        string memory txHash = string(abi.encodePacked("0x", toHexString(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, newDonationId))))));
        
        donations[newDonationId] = DonationRecord({
            id: newDonationId,
            donor: msg.sender,
            recipient: _recipient,
            bloodType: _bloodType,
            amount: _amount,
            location: _location,
            timestamp: block.timestamp,
            verified: true, // Auto-verified for demo
            txHash: txHash,
            nftTokenId: 0,
            nftMinted: false
        });
        
        // Update donor profile
        donor.totalDonations++;
        donor.lastDonationTime = block.timestamp;
        
        // Add to donor's donation list
        donorDonations[msg.sender].push(newDonationId);
        
        emit DonationRecorded(newDonationId, msg.sender, _bloodType, _amount, _location);
    }
    
    /**
     * @dev Create a blood request
     */
    function createBloodRequest(
        string memory _bloodType,
        uint256 _amount,
        string memory _urgency,
        string memory _location,
        string memory _description
    ) external validBloodType(_bloodType) {
        require(_amount > 0, "Amount must be greater than 0");
        require(bytes(_location).length > 0, "Location cannot be empty");
        require(isValidUrgency(_urgency), "Invalid urgency level");
        
        _requestIds.increment();
        uint256 newRequestId = _requestIds.current();
        
        bloodRequests[newRequestId] = BloodRequest({
            id: newRequestId,
            recipient: msg.sender,
            bloodType: _bloodType,
            amount: _amount,
            urgency: _urgency,
            location: _location,
            timestamp: block.timestamp,
            status: "open",
            description: _description,
            isActive: true
        });
        
        // Add to recipient's request list
        recipientRequests[msg.sender].push(newRequestId);
        
        emit BloodRequestCreated(newRequestId, msg.sender, _bloodType, _amount, _urgency);
    }
    
    /**
     * @dev Fulfill a blood request
     */
    function fulfillBloodRequest(uint256 _requestId, uint256 _donationId) external {
        require(bloodRequests[_requestId].isActive, "Request not active");
        require(donations[_donationId].donor != address(0), "Donation does not exist");
        require(keccak256(bytes(bloodRequests[_requestId].status)) == keccak256(bytes("open")), "Request not open");
        
        // Update request status
        bloodRequests[_requestId].status = "fulfilled";
        bloodRequests[_requestId].isActive = false;
        
        emit RequestFulfilled(_requestId, _donationId, donations[_donationId].donor);
    }
    
    /**
     * @dev Verify a donation (for medical professionals)
     */
    function verifyDonation(uint256 _donationId) external onlyMedicalProfessional {
        require(donations[_donationId].donor != address(0), "Donation does not exist");
        
        donations[_donationId].verified = true;
        
        emit DonationVerified(_donationId, msg.sender);
    }
    
    /**
     * @dev Add verified medical professional
     */
    function addMedicalProfessional(address _professional) external onlyOwner {
        verifiedMedicalProfessionals[_professional] = true;
    }
    
    /**
     * @dev Remove medical professional
     */
    function removeMedicalProfessional(address _professional) external onlyOwner {
        verifiedMedicalProfessionals[_professional] = false;
    }
    
    /**
     * @dev Update NFT token ID for donation
     */
    function updateDonationNFT(uint256 _donationId, uint256 _tokenId) external {
        require(donations[_donationId].donor != address(0), "Donation does not exist");
        require(donations[_donationId].donor == msg.sender, "Not donation owner");
        
        donations[_donationId].nftTokenId = _tokenId;
        donations[_donationId].nftMinted = true;
    }
    
    // View functions
    function getDonation(uint256 _donationId) external view returns (DonationRecord memory) {
        return donations[_donationId];
    }
    
    function getBloodRequest(uint256 _requestId) external view returns (BloodRequest memory) {
        return bloodRequests[_requestId];
    }
    
    function getDonorProfile(address _donor) external view returns (DonorProfile memory) {
        return donors[_donor];
    }
    
    function getDonorDonations(address _donor) external view returns (uint256[] memory) {
        return donorDonations[_donor];
    }
    
    function getRecipientRequests(address _recipient) external view returns (uint256[] memory) {
        return recipientRequests[_recipient];
    }
    
    function getOpenBloodRequests() external view returns (uint256[] memory) {
        uint256[] memory openRequests = new uint256[](_requestIds.current());
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _requestIds.current(); i++) {
            if (bloodRequests[i].isActive && keccak256(bytes(bloodRequests[i].status)) == keccak256(bytes("open"))) {
                openRequests[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = openRequests[i];
        }
        
        return result;
    }
    
    function getPlatformStats() external view returns (
        uint256 totalDonations,
        uint256 totalRequests,
        uint256 totalDonors,
        uint256 verifiedDonations
    ) {
        totalDonations = _donationIds.current();
        totalRequests = _requestIds.current();
        totalDonors = _donorIds.current();
        
        // Count verified donations
        uint256 verified = 0;
        for (uint256 i = 1; i <= _donationIds.current(); i++) {
            if (donations[i].verified) {
                verified++;
            }
        }
        verifiedDonations = verified;
    }
    
    // Helper functions
    function isValidBloodType(string memory _bloodType) internal pure returns (bool) {
        bytes32 bloodTypeHash = keccak256(bytes(_bloodType));
        return (
            bloodTypeHash == keccak256(bytes("A+")) ||
            bloodTypeHash == keccak256(bytes("A-")) ||
            bloodTypeHash == keccak256(bytes("B+")) ||
            bloodTypeHash == keccak256(bytes("B-")) ||
            bloodTypeHash == keccak256(bytes("AB+")) ||
            bloodTypeHash == keccak256(bytes("AB-")) ||
            bloodTypeHash == keccak256(bytes("O+")) ||
            bloodTypeHash == keccak256(bytes("O-"))
        );
    }
    
    function isValidUrgency(string memory _urgency) internal pure returns (bool) {
        bytes32 urgencyHash = keccak256(bytes(_urgency));
        return (
            urgencyHash == keccak256(bytes("low")) ||
            urgencyHash == keccak256(bytes("medium")) ||
            urgencyHash == keccak256(bytes("high")) ||
            urgencyHash == keccak256(bytes("critical"))
        );
    }
    
    function toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 4;
        }
        bytes memory buffer = new bytes(2 * length);
        for (uint256 i = 2 * length; i > 0; --i) {
            buffer[i - 1] = bytes1(uint8(48 + uint256(value & 0xf)));
            if (uint256(value & 0xf) > 9) {
                buffer[i - 1] = bytes1(uint8(87 + uint256(value & 0xf)));
            }
            value >>= 4;
        }
        return string(buffer);
    }
}