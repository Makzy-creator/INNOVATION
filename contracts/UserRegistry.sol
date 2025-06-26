// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title UserRegistry
 * @dev Manages user registration and role-based access control
 */
contract UserRegistry is 
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant DONOR_ROLE = keccak256("DONOR_ROLE");
    bytes32 public constant RECIPIENT_ROLE = keccak256("RECIPIENT_ROLE");

    struct UserProfile {
        address userAddress;
        string name;
        string email;
        string bloodType;
        string location;
        bool verified;
        bool active;
        uint256 registrationTime;
        bytes32[] roles;
    }

    mapping(address => UserProfile) public userProfiles;
    mapping(string => address) public emailToAddress;
    mapping(bytes32 => uint256) public roleCount;
    
    address[] public allUsers;
    uint256 public totalUsers;

    // Events
    event UserRegistered(address indexed user, string name, string email, bytes32 role);
    event UserVerified(address indexed user, address indexed verifier);
    event RoleGranted(address indexed user, bytes32 indexed role, address indexed granter);
    event RoleRevoked(address indexed user, bytes32 indexed role, address indexed revoker);
    event UserDeactivated(address indexed user, address indexed admin);
    event UserReactivated(address indexed user, address indexed admin);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _admin) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    /**
     * @dev Register a new user
     */
    function registerUser(
        string memory _name,
        string memory _email,
        string memory _bloodType,
        string memory _location,
        bytes32 _role
    ) external whenNotPaused nonReentrant {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        require(_role == DONOR_ROLE || _role == RECIPIENT_ROLE, "Invalid role");
        require(userProfiles[msg.sender].userAddress == address(0), "User already registered");
        require(emailToAddress[_email] == address(0), "Email already registered");

        UserProfile storage profile = userProfiles[msg.sender];
        profile.userAddress = msg.sender;
        profile.name = _name;
        profile.email = _email;
        profile.bloodType = _bloodType;
        profile.location = _location;
        profile.verified = false;
        profile.active = true;
        profile.registrationTime = block.timestamp;
        profile.roles.push(_role);

        emailToAddress[_email] = msg.sender;
        allUsers.push(msg.sender);
        totalUsers++;

        _grantRole(_role, msg.sender);
        roleCount[_role]++;

        emit UserRegistered(msg.sender, _name, _email, _role);
    }

    /**
     * @dev Verify a user (admin only)
     */
    function verifyUser(address _user) external onlyRole(ADMIN_ROLE) {
        require(userProfiles[_user].userAddress != address(0), "User not registered");
        require(!userProfiles[_user].verified, "User already verified");

        userProfiles[_user].verified = true;
        emit UserVerified(_user, msg.sender);
    }

    /**
     * @dev Grant additional role to user
     */
    function grantUserRole(address _user, bytes32 _role) external onlyRole(ADMIN_ROLE) {
        require(userProfiles[_user].userAddress != address(0), "User not registered");
        require(_role == DONOR_ROLE || _role == RECIPIENT_ROLE || _role == MODERATOR_ROLE, "Invalid role");

        if (!hasRole(_role, _user)) {
            _grantRole(_role, _user);
            userProfiles[_user].roles.push(_role);
            roleCount[_role]++;
            emit RoleGranted(_user, _role, msg.sender);
        }
    }

    /**
     * @dev Revoke role from user
     */
    function revokeUserRole(address _user, bytes32 _role) external onlyRole(ADMIN_ROLE) {
        require(userProfiles[_user].userAddress != address(0), "User not registered");
        require(hasRole(_role, _user), "User does not have this role");

        _revokeRole(_role, _user);
        
        // Remove role from user's roles array
        bytes32[] storage userRoles = userProfiles[_user].roles;
        for (uint256 i = 0; i < userRoles.length; i++) {
            if (userRoles[i] == _role) {
                userRoles[i] = userRoles[userRoles.length - 1];
                userRoles.pop();
                break;
            }
        }
        
        roleCount[_role]--;
        emit RoleRevoked(_user, _role, msg.sender);
    }

    /**
     * @dev Deactivate user account
     */
    function deactivateUser(address _user) external onlyRole(ADMIN_ROLE) {
        require(userProfiles[_user].userAddress != address(0), "User not registered");
        require(userProfiles[_user].active, "User already deactivated");

        userProfiles[_user].active = false;
        emit UserDeactivated(_user, msg.sender);
    }

    /**
     * @dev Reactivate user account
     */
    function reactivateUser(address _user) external onlyRole(ADMIN_ROLE) {
        require(userProfiles[_user].userAddress != address(0), "User not registered");
        require(!userProfiles[_user].active, "User already active");

        userProfiles[_user].active = true;
        emit UserReactivated(_user, msg.sender);
    }

    /**
     * @dev Update user profile
     */
    function updateProfile(
        string memory _name,
        string memory _bloodType,
        string memory _location
    ) external whenNotPaused {
        require(userProfiles[msg.sender].userAddress != address(0), "User not registered");
        require(userProfiles[msg.sender].active, "User account deactivated");

        UserProfile storage profile = userProfiles[msg.sender];
        if (bytes(_name).length > 0) profile.name = _name;
        if (bytes(_bloodType).length > 0) profile.bloodType = _bloodType;
        if (bytes(_location).length > 0) profile.location = _location;
    }

    /**
     * @dev Get user profile
     */
    function getUserProfile(address _user) external view returns (UserProfile memory) {
        return userProfiles[_user];
    }

    /**
     * @dev Get user roles
     */
    function getUserRoles(address _user) external view returns (bytes32[] memory) {
        return userProfiles[_user].roles;
    }

    /**
     * @dev Check if user is verified and active
     */
    function isUserActive(address _user) external view returns (bool) {
        return userProfiles[_user].active && userProfiles[_user].userAddress != address(0);
    }

    /**
     * @dev Check if user is verified
     */
    function isUserVerified(address _user) external view returns (bool) {
        return userProfiles[_user].verified;
    }

    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalDonors,
        uint256 _totalRecipients,
        uint256 _verifiedUsers
    ) {
        _totalUsers = totalUsers;
        _totalDonors = roleCount[DONOR_ROLE];
        _totalRecipients = roleCount[RECIPIENT_ROLE];
        
        uint256 verified = 0;
        for (uint256 i = 0; i < allUsers.length; i++) {
            if (userProfiles[allUsers[i]].verified) {
                verified++;
            }
        }
        _verifiedUsers = verified;
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}