// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title AccessControl
 * @dev Centralized access control for the blood donation platform
 */
contract AccessControl is 
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant DONOR_ROLE = keccak256("DONOR_ROLE");
    bytes32 public constant RECIPIENT_ROLE = keccak256("RECIPIENT_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // Permission mappings
    mapping(bytes32 => mapping(string => bool)) public rolePermissions;
    mapping(address => bool) public emergencyStop;
    
    // Circuit breaker
    bool public circuitBreakerActive;
    uint256 public lastBreakTime;
    uint256 public constant CIRCUIT_BREAKER_COOLDOWN = 1 hours;

    // Events
    event PermissionGranted(bytes32 indexed role, string permission);
    event PermissionRevoked(bytes32 indexed role, string permission);
    event CircuitBreakerActivated(address indexed activator, string reason);
    event CircuitBreakerDeactivated(address indexed deactivator);
    event EmergencyStopToggled(address indexed user, bool stopped);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _admin) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);

        // Set up default permissions
        _setupDefaultPermissions();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    /**
     * @dev Set up default permissions for each role
     */
    function _setupDefaultPermissions() internal {
        // Donor permissions
        rolePermissions[DONOR_ROLE]["donate"] = true;
        rolePermissions[DONOR_ROLE]["track_donations"] = true;
        rolePermissions[DONOR_ROLE]["communicate"] = true;
        rolePermissions[DONOR_ROLE]["view_requests"] = true;

        // Recipient permissions
        rolePermissions[RECIPIENT_ROLE]["request_blood"] = true;
        rolePermissions[RECIPIENT_ROLE]["update_request"] = true;
        rolePermissions[RECIPIENT_ROLE]["withdraw_request"] = true;
        rolePermissions[RECIPIENT_ROLE]["communicate"] = true;

        // Moderator permissions
        rolePermissions[MODERATOR_ROLE]["moderate_content"] = true;
        rolePermissions[MODERATOR_ROLE]["verify_documents"] = true;
        rolePermissions[MODERATOR_ROLE]["suspend_users"] = true;

        // Admin permissions
        rolePermissions[ADMIN_ROLE]["override_all"] = true;
        rolePermissions[ADMIN_ROLE]["configure_system"] = true;
        rolePermissions[ADMIN_ROLE]["manage_roles"] = true;
        rolePermissions[ADMIN_ROLE]["emergency_controls"] = true;

        // Verifier permissions
        rolePermissions[VERIFIER_ROLE]["verify_donations"] = true;
        rolePermissions[VERIFIER_ROLE]["verify_requests"] = true;
    }

    /**
     * @dev Check if user has specific permission
     */
    function hasPermission(address _user, string memory _permission) external view returns (bool) {
        if (circuitBreakerActive || emergencyStop[_user]) {
            return false;
        }

        // Check admin override
        if (hasRole(ADMIN_ROLE, _user) && rolePermissions[ADMIN_ROLE]["override_all"]) {
            return true;
        }

        // Check role-specific permissions
        if (hasRole(DONOR_ROLE, _user) && rolePermissions[DONOR_ROLE][_permission]) {
            return true;
        }
        if (hasRole(RECIPIENT_ROLE, _user) && rolePermissions[RECIPIENT_ROLE][_permission]) {
            return true;
        }
        if (hasRole(MODERATOR_ROLE, _user) && rolePermissions[MODERATOR_ROLE][_permission]) {
            return true;
        }
        if (hasRole(VERIFIER_ROLE, _user) && rolePermissions[VERIFIER_ROLE][_permission]) {
            return true;
        }

        return false;
    }

    /**
     * @dev Grant permission to role
     */
    function grantPermission(bytes32 _role, string memory _permission) external onlyRole(ADMIN_ROLE) {
        rolePermissions[_role][_permission] = true;
        emit PermissionGranted(_role, _permission);
    }

    /**
     * @dev Revoke permission from role
     */
    function revokePermission(bytes32 _role, string memory _permission) external onlyRole(ADMIN_ROLE) {
        rolePermissions[_role][_permission] = false;
        emit PermissionRevoked(_role, _permission);
    }

    /**
     * @dev Activate circuit breaker (emergency stop)
     */
    function activateCircuitBreaker(string memory _reason) external onlyRole(ADMIN_ROLE) {
        circuitBreakerActive = true;
        lastBreakTime = block.timestamp;
        emit CircuitBreakerActivated(msg.sender, _reason);
    }

    /**
     * @dev Deactivate circuit breaker
     */
    function deactivateCircuitBreaker() external onlyRole(ADMIN_ROLE) {
        require(circuitBreakerActive, "Circuit breaker not active");
        require(
            block.timestamp >= lastBreakTime + CIRCUIT_BREAKER_COOLDOWN,
            "Cooldown period not elapsed"
        );
        
        circuitBreakerActive = false;
        emit CircuitBreakerDeactivated(msg.sender);
    }

    /**
     * @dev Toggle emergency stop for specific user
     */
    function toggleEmergencyStop(address _user) external onlyRole(ADMIN_ROLE) {
        emergencyStop[_user] = !emergencyStop[_user];
        emit EmergencyStopToggled(_user, emergencyStop[_user]);
    }

    /**
     * @dev Check if system is operational
     */
    function isSystemOperational() external view returns (bool) {
        return !circuitBreakerActive && !paused();
    }

    /**
     * @dev Modifier to check permission
     */
    modifier requiresPermission(string memory _permission) {
        require(this.hasPermission(msg.sender, _permission), "Access denied: insufficient permissions");
        _;
    }

    /**
     * @dev Modifier to check system operational status
     */
    modifier whenOperational() {
        require(!circuitBreakerActive, "System halted: circuit breaker active");
        require(!paused(), "System paused");
        _;
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