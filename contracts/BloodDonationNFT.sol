// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title BloodDonationNFT
 * @dev NFT contract for blood donation certificates
 */
contract BloodDonationNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _tokenIds;
    
    // Events
    event CertificateMinted(uint256 indexed tokenId, address indexed recipient, string donationId);
    
    // Struct for NFT metadata
    struct CertificateMetadata {
        uint256 tokenId;
        address owner;
        string donationId;
        string bloodType;
        uint256 amount;
        string location;
        uint256 timestamp;
        string imageUrl;
    }
    
    // Mapping from token ID to certificate metadata
    mapping(uint256 => CertificateMetadata) public certificates;
    
    // Mapping from donation ID to token ID (prevent duplicate certificates)
    mapping(string => uint256) public donationToToken;
    
    // Authorized minters (blood donation platform contract)
    mapping(address => bool) public authorizedMinters;
    
    constructor() ERC721("Blood Donation Certificate", "BDC") {
        // Contract deployer is authorized minter
        authorizedMinters[msg.sender] = true;
    }
    
    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        _;
    }
    
    /**
     * @dev Mint a new blood donation certificate NFT
     */
    function mintCertificate(
        address _to,
        string memory _donationId,
        string memory _bloodType,
        uint256 _amount,
        string memory _location,
        uint256 _timestamp
    ) external onlyAuthorizedMinter returns (uint256) {
        require(_to != address(0), "Cannot mint to zero address");
        require(bytes(_donationId).length > 0, "Donation ID cannot be empty");
        require(donationToToken[_donationId] == 0, "Certificate already exists for this donation");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Store certificate metadata
        certificates[newTokenId] = CertificateMetadata({
            tokenId: newTokenId,
            owner: _to,
            donationId: _donationId,
            bloodType: _bloodType,
            amount: _amount,
            location: _location,
            timestamp: _timestamp,
            imageUrl: generateImageUrl(_bloodType, _amount)
        });
        
        // Map donation ID to token ID
        donationToToken[_donationId] = newTokenId;
        
        // Mint the NFT
        _safeMint(_to, newTokenId);
        
        // Set token URI with metadata
        string memory tokenURI = generateTokenURI(newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        emit CertificateMinted(newTokenId, _to, _donationId);
        
        return newTokenId;
    }
    
    /**
     * @dev Generate token URI with metadata
     */
    function generateTokenURI(uint256 _tokenId) internal view returns (string memory) {
        CertificateMetadata memory cert = certificates[_tokenId];
        
        // Create JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name": "Blood Donation Certificate #', _tokenId.toString(), '",',
            '"description": "Blockchain-verified blood donation certificate from LIFEFLOW platform",',
            '"image": "', cert.imageUrl, '",',
            '"attributes": [',
                '{"trait_type": "Blood Type", "value": "', cert.bloodType, '"},',
                '{"trait_type": "Amount (ml)", "value": "', cert.amount.toString(), '"},',
                '{"trait_type": "Location", "value": "', cert.location, '"},',
                '{"trait_type": "Date", "value": "', cert.timestamp.toString(), '"},',
                '{"trait_type": "Certificate Type", "value": "Blood Donation"},',
                '{"trait_type": "Verified", "value": "true"}',
            ']}'
        ));
        
        // Encode as base64
        string memory encodedJson = Base64.encode(bytes(json));
        
        return string(abi.encodePacked("data:application/json;base64,", encodedJson));
    }
    
    /**
     * @dev Generate image URL for certificate
     */
    function generateImageUrl(string memory _bloodType, uint256 _amount) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "https://lifeflow-nft.vercel.app/certificate/",
            _bloodType,
            "_",
            _amount.toString(),
            ".png"
        ));
    }
    
    /**
     * @dev Add authorized minter
     */
    function addAuthorizedMinter(address _minter) external onlyOwner {
        authorizedMinters[_minter] = true;
    }
    
    /**
     * @dev Remove authorized minter
     */
    function removeAuthorizedMinter(address _minter) external onlyOwner {
        authorizedMinters[_minter] = false;
    }
    
    /**
     * @dev Get certificate metadata
     */
    function getCertificate(uint256 _tokenId) external view returns (CertificateMetadata memory) {
        require(_exists(_tokenId), "Certificate does not exist");
        return certificates[_tokenId];
    }
    
    /**
     * @dev Get token ID by donation ID
     */
    function getTokenByDonationId(string memory _donationId) external view returns (uint256) {
        return donationToToken[_donationId];
    }
    
    /**
     * @dev Get all tokens owned by address
     */
    function getTokensByOwner(address _owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (ownerOf(i) == _owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get total supply of certificates
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Override transfer to update certificate owner
     */
    function _transfer(address from, address to, uint256 tokenId) internal override {
        super._transfer(from, to, tokenId);
        certificates[tokenId].owner = to;
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}