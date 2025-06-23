import Time "mo:base/Time";
import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Option "mo:base/Option";

actor BloodDonationBackend {
    
    // Types
    public type DonationRecord = {
        id: Text;
        donorId: Principal;
        recipientId: ?Principal;
        bloodType: Text;
        amount: Nat;
        location: Text;
        timestamp: Int;
        verified: Bool;
        txHash: Text;
        nftTokenId: ?Nat;
    };

    public type BloodRequest = {
        id: Text;
        recipientId: Principal;
        bloodType: Text;
        amount: Nat;
        urgency: Text; // "low", "medium", "high", "critical"
        location: Text;
        timestamp: Int;
        status: Text; // "open", "fulfilled", "expired"
        description: ?Text;
    };

    public type DonorProfile = {
        id: Principal;
        name: Text;
        bloodType: Text;
        location: Text;
        verified: Bool;
        totalDonations: Nat;
        lastDonation: ?Int;
    };

    // State
    private stable var donationEntries : [(Text, DonationRecord)] = [];
    private stable var requestEntries : [(Text, BloodRequest)] = [];
    private stable var donorEntries : [(Principal, DonorProfile)] = [];
    private stable var nextDonationId : Nat = 1;
    private stable var nextRequestId : Nat = 1;

    private var donations = Map.fromIter<Text, DonationRecord>(donationEntries.vals(), donationEntries.size(), Text.equal, Text.hash);
    private var requests = Map.fromIter<Text, BloodRequest>(requestEntries.vals(), requestEntries.size(), Text.equal, Text.hash);
    private var donors = Map.fromIter<Principal, DonorProfile>(donorEntries.vals(), donorEntries.size(), Principal.equal, Principal.hash);

    // System upgrade hooks
    system func preupgrade() {
        donationEntries := Iter.toArray(donations.entries());
        requestEntries := Iter.toArray(requests.entries());
        donorEntries := Iter.toArray(donors.entries());
    };

    system func postupgrade() {
        donationEntries := [];
        requestEntries := [];
        donorEntries := [];
    };

    // Helper functions
    private func generateId(prefix: Text, counter: Nat) : Text {
        prefix # Nat.toText(counter)
    };

    private func generateTxHash() : Text {
        let timestamp = Time.now();
        "0x" # Int.toText(timestamp)
    };

    // Public functions

    // Register donor
    public func registerDonor(name: Text, bloodType: Text, location: Text) : async Result.Result<DonorProfile, Text> {
        let caller = Principal.fromActor(BloodDonationBackend);
        
        let profile : DonorProfile = {
            id = caller;
            name = name;
            bloodType = bloodType;
            location = location;
            verified = false;
            totalDonations = 0;
            lastDonation = null;
        };
        
        donors.put(caller, profile);
        #ok(profile)
    };

    // Create blood request
    public func createBloodRequest(
        bloodType: Text,
        amount: Nat,
        urgency: Text,
        location: Text,
        description: ?Text
    ) : async Result.Result<BloodRequest, Text> {
        let caller = Principal.fromActor(BloodDonationBackend);
        let id = generateId("REQ", nextRequestId);
        nextRequestId += 1;

        let request : BloodRequest = {
            id = id;
            recipientId = caller;
            bloodType = bloodType;
            amount = amount;
            urgency = urgency;
            location = location;
            timestamp = Time.now();
            status = "open";
            description = description;
        };

        requests.put(id, request);
        #ok(request)
    };

    // Record donation (with verification)
    public func recordDonation(
        recipientId: ?Principal,
        bloodType: Text,
        amount: Nat,
        location: Text
    ) : async Result.Result<DonationRecord, Text> {
        let caller = Principal.fromActor(BloodDonationBackend);
        let id = generateId("DON", nextDonationId);
        nextDonationId += 1;

        // Verify donor exists
        switch (donors.get(caller)) {
            case null { return #err("Donor not registered") };
            case (?donor) {
                // Check if donor can donate (56 days since last donation)
                switch (donor.lastDonation) {
                    case (?lastTime) {
                        let daysSinceLastDonation = (Time.now() - lastTime) / (24 * 60 * 60 * 1000_000_000);
                        if (daysSinceLastDonation < 56) {
                            return #err("Must wait 56 days between donations");
                        };
                    };
                    case null { /* First donation, allowed */ };
                };

                let donation : DonationRecord = {
                    id = id;
                    donorId = caller;
                    recipientId = recipientId;
                    bloodType = bloodType;
                    amount = amount;
                    location = location;
                    timestamp = Time.now();
                    verified = true; // Auto-verified for demo
                    txHash = generateTxHash();
                    nftTokenId = null; // Will be set when NFT is minted
                };

                donations.put(id, donation);

                // Update donor profile
                let updatedDonor : DonorProfile = {
                    id = donor.id;
                    name = donor.name;
                    bloodType = donor.bloodType;
                    location = donor.location;
                    verified = donor.verified;
                    totalDonations = donor.totalDonations + 1;
                    lastDonation = ?Time.now();
                };
                donors.put(caller, updatedDonor);

                #ok(donation)
            };
        }
    };

    // Get all donations
    public query func getDonations() : async [DonationRecord] {
        Iter.toArray(donations.vals())
    };

    // Get donations by donor
    public query func getDonationsByDonor(donorId: Principal) : async [DonationRecord] {
        let donorDonations = Iter.filter(donations.vals(), func(d: DonationRecord) : Bool {
            Principal.equal(d.donorId, donorId)
        });
        Iter.toArray(donorDonations)
    };

    // Get all blood requests
    public query func getBloodRequests() : async [BloodRequest] {
        Iter.toArray(requests.vals())
    };

    // Get open blood requests
    public query func getOpenBloodRequests() : async [BloodRequest] {
        let openRequests = Iter.filter(requests.vals(), func(r: BloodRequest) : Bool {
            r.status == "open"
        });
        Iter.toArray(openRequests)
    };

    // Fulfill blood request
    public func fulfillBloodRequest(requestId: Text, donationId: Text) : async Result.Result<Text, Text> {
        switch (requests.get(requestId)) {
            case null { #err("Request not found") };
            case (?request) {
                if (request.status != "open") {
                    return #err("Request is not open");
                };

                let updatedRequest : BloodRequest = {
                    id = request.id;
                    recipientId = request.recipientId;
                    bloodType = request.bloodType;
                    amount = request.amount;
                    urgency = request.urgency;
                    location = request.location;
                    timestamp = request.timestamp;
                    status = "fulfilled";
                    description = request.description;
                };

                requests.put(requestId, updatedRequest);
                #ok("Request fulfilled successfully")
            };
        }
    };

    // Get donor profile
    public query func getDonorProfile(donorId: Principal) : async ?DonorProfile {
        donors.get(donorId)
    };

    // Verify donation (for medical professionals)
    public func verifyDonation(donationId: Text) : async Result.Result<Text, Text> {
        switch (donations.get(donationId)) {
            case null { #err("Donation not found") };
            case (?donation) {
                let verifiedDonation : DonationRecord = {
                    id = donation.id;
                    donorId = donation.donorId;
                    recipientId = donation.recipientId;
                    bloodType = donation.bloodType;
                    amount = donation.amount;
                    location = donation.location;
                    timestamp = donation.timestamp;
                    verified = true;
                    txHash = donation.txHash;
                    nftTokenId = donation.nftTokenId;
                };
                donations.put(donationId, verifiedDonation);
                #ok("Donation verified successfully")
            };
        }
    };

    // Update NFT token ID for donation
    public func updateDonationNFT(donationId: Text, tokenId: Nat) : async Result.Result<Text, Text> {
        switch (donations.get(donationId)) {
            case null { #err("Donation not found") };
            case (?donation) {
                let updatedDonation : DonationRecord = {
                    id = donation.id;
                    donorId = donation.donorId;
                    recipientId = donation.recipientId;
                    bloodType = donation.bloodType;
                    amount = donation.amount;
                    location = donation.location;
                    timestamp = donation.timestamp;
                    verified = donation.verified;
                    txHash = donation.txHash;
                    nftTokenId = ?tokenId;
                };
                donations.put(donationId, updatedDonation);
                #ok("NFT token ID updated")
            };
        }
    };

    // Get platform statistics
    public query func getPlatformStats() : async {
        totalDonations: Nat;
        totalRequests: Nat;
        totalDonors: Nat;
        verifiedDonations: Nat;
    } {
        let verifiedCount = Array.foldLeft<DonationRecord, Nat>(
            Iter.toArray(donations.vals()),
            0,
            func(acc, donation) = if (donation.verified) acc + 1 else acc
        );

        {
            totalDonations = donations.size();
            totalRequests = requests.size();
            totalDonors = donors.size();
            verifiedDonations = verifiedCount;
        }
    };
}