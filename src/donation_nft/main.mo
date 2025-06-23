import Time "mo:base/Time";
import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Option "mo:base/Option";

actor DonationNFT {
    
    // Types
    public type TokenId = Nat;
    
    public type NFTMetadata = {
        tokenId: TokenId;
        owner: Principal;
        donationId: Text;
        bloodType: Text;
        amount: Nat;
        location: Text;
        timestamp: Int;
        imageUrl: Text;
        attributes: [(Text, Text)];
    };

    public type MintRequest = {
        to: Principal;
        donationId: Text;
        bloodType: Text;
        amount: Nat;
        location: Text;
        timestamp: Int;
    };

    // State
    private stable var tokenEntries : [(TokenId, NFTMetadata)] = [];
    private stable var ownerEntries : [(Principal, [TokenId])] = [];
    private stable var nextTokenId : TokenId = 1;
    private stable var totalSupply : Nat = 0;

    private var tokens = Map.fromIter<TokenId, NFTMetadata>(tokenEntries.vals(), tokenEntries.size(), Nat.equal, func(x: Nat) : Nat32 { Nat32.fromNat(x) });
    private var owners = Map.fromIter<Principal, [TokenId]>(ownerEntries.vals(), ownerEntries.size(), Principal.equal, Principal.hash);

    // System upgrade hooks
    system func preupgrade() {
        tokenEntries := Iter.toArray(tokens.entries());
        ownerEntries := Iter.toArray(owners.entries());
    };

    system func postupgrade() {
        tokenEntries := [];
        ownerEntries := [];
    };

    // Helper functions
    private func generateImageUrl(bloodType: Text, amount: Nat) : Text {
        "https://innovation-nft.com/certificates/" # bloodType # "_" # Nat.toText(amount) # ".png"
    };

    private func generateAttributes(bloodType: Text, amount: Nat, location: Text, timestamp: Int) : [(Text, Text)] {
        [
            ("Blood Type", bloodType),
            ("Amount (ml)", Nat.toText(amount)),
            ("Location", location),
            ("Date", Int.toText(timestamp)),
            ("Certificate Type", "Blood Donation"),
            ("Verified", "true")
        ]
    };

    private func addTokenToOwner(owner: Principal, tokenId: TokenId) {
        switch (owners.get(owner)) {
            case null {
                owners.put(owner, [tokenId]);
            };
            case (?existingTokens) {
                owners.put(owner, Array.append(existingTokens, [tokenId]));
            };
        }
    };

    private func removeTokenFromOwner(owner: Principal, tokenId: TokenId) {
        switch (owners.get(owner)) {
            case null { /* No tokens to remove */ };
            case (?existingTokens) {
                let filteredTokens = Array.filter<TokenId>(existingTokens, func(id) = id != tokenId);
                if (filteredTokens.size() == 0) {
                    owners.delete(owner);
                } else {
                    owners.put(owner, filteredTokens);
                };
            };
        }
    };

    // Public functions

    // Mint NFT certificate for blood donation
    public func mintDonationCertificate(request: MintRequest) : async Result.Result<TokenId, Text> {
        let tokenId = nextTokenId;
        nextTokenId += 1;
        totalSupply += 1;

        let metadata : NFTMetadata = {
            tokenId = tokenId;
            owner = request.to;
            donationId = request.donationId;
            bloodType = request.bloodType;
            amount = request.amount;
            location = request.location;
            timestamp = request.timestamp;
            imageUrl = generateImageUrl(request.bloodType, request.amount);
            attributes = generateAttributes(request.bloodType, request.amount, request.location, request.timestamp);
        };

        tokens.put(tokenId, metadata);
        addTokenToOwner(request.to, tokenId);

        #ok(tokenId)
    };

    // Get NFT metadata
    public query func getTokenMetadata(tokenId: TokenId) : async ?NFTMetadata {
        tokens.get(tokenId)
    };

    // Get tokens owned by address
    public query func getTokensByOwner(owner: Principal) : async [TokenId] {
        switch (owners.get(owner)) {
            case null { [] };
            case (?tokenIds) { tokenIds };
        }
    };

    // Get owner of token
    public query func getTokenOwner(tokenId: TokenId) : async ?Principal {
        switch (tokens.get(tokenId)) {
            case null { null };
            case (?metadata) { ?metadata.owner };
        }
    };

    // Transfer token
    public func transferToken(tokenId: TokenId, to: Principal) : async Result.Result<Text, Text> {
        let caller = Principal.fromActor(DonationNFT);
        
        switch (tokens.get(tokenId)) {
            case null { #err("Token does not exist") };
            case (?metadata) {
                if (not Principal.equal(metadata.owner, caller)) {
                    return #err("Not authorized to transfer this token");
                };

                let updatedMetadata : NFTMetadata = {
                    tokenId = metadata.tokenId;
                    owner = to;
                    donationId = metadata.donationId;
                    bloodType = metadata.bloodType;
                    amount = metadata.amount;
                    location = metadata.location;
                    timestamp = metadata.timestamp;
                    imageUrl = metadata.imageUrl;
                    attributes = metadata.attributes;
                };

                tokens.put(tokenId, updatedMetadata);
                removeTokenFromOwner(caller, tokenId);
                addTokenToOwner(to, tokenId);

                #ok("Token transferred successfully")
            };
        }
    };

    // Get total supply
    public query func getTotalSupply() : async Nat {
        totalSupply
    };

    // Get all tokens (for marketplace/gallery)
    public query func getAllTokens() : async [NFTMetadata] {
        Iter.toArray(tokens.vals())
    };

    // Get tokens by donation ID
    public query func getTokenByDonationId(donationId: Text) : async ?NFTMetadata {
        let tokenOpt = Iter.find(tokens.vals(), func(metadata: NFTMetadata) : Bool {
            metadata.donationId == donationId
        });
        tokenOpt
    };

    // Burn token (if needed)
    public func burnToken(tokenId: TokenId) : async Result.Result<Text, Text> {
        let caller = Principal.fromActor(DonationNFT);
        
        switch (tokens.get(tokenId)) {
            case null { #err("Token does not exist") };
            case (?metadata) {
                if (not Principal.equal(metadata.owner, caller)) {
                    return #err("Not authorized to burn this token");
                };

                tokens.delete(tokenId);
                removeTokenFromOwner(caller, tokenId);
                totalSupply -= 1;

                #ok("Token burned successfully")
            };
        }
    };

    // Get collection stats
    public query func getCollectionStats() : async {
        totalSupply: Nat;
        totalOwners: Nat;
        totalDonationsCertified: Nat;
    } {
        {
            totalSupply = totalSupply;
            totalOwners = owners.size();
            totalDonationsCertified = tokens.size();
        }
    };
}