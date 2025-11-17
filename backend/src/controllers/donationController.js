const Donation = require("../models/donationModel");

const createDonation = async (req, res) => {
    try {
        const {
            title,
            description,
            quantity,
            pickupAddress,
            pickupGeo,   
            pickupDateTime,
            expireDateTime,
            photos       
        } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Basic server-side validation for dates
        const now = new Date();
        const pickupAt = new Date(pickupDateTime);
        const expireAt = new Date(expireDateTime);

        if (isNaN(pickupAt.getTime()) || isNaN(expireAt.getTime())) {
            return res.status(400).json({ message: 'Invalid pickup or expiry date' });
        }
        if (pickupAt < now) {
            return res.status(400).json({ message: 'Pickup date/time must be in the future' });
        }
        if (expireAt < now) {
            return res.status(400).json({ message: 'Expiry date/time must be in the future' });
        }
        if (expireAt <= pickupAt) {
            return res.status(400).json({ message: 'Expiry must be after pickup date/time' });
        }

        const newDonation = new Donation({
            donorId: req.user.id,
            title,
            description,
            quantity,
            pickupAddress,
            pickupGeo,
            pickupDateTime,
            expireDateTime,
            photos
        });

        console.log("=== Creating donation ===");
        console.log("Donation data:", { title, quantity, donorId: req.user.id });
        await newDonation.save();
        console.log("Donation saved successfully with ID:", newDonation._id.toString());
        console.log("Database:", newDonation.db.databaseName);
        console.log("Collection:", newDonation.collection.name);

        res.status(201).json({ message: 'Donation created successfully', donation: newDonation });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const getDonations = async (req, res) => {
    try{
        console.log("=== getDonations called ===");
        console.log("User:", req.user ? { id: req.user.id, role: req.user.role } : "Not authenticated");
        
        // Check total donations first
        const totalCount = await Donation.countDocuments();
        console.log("Total donations in database:", totalCount);
        
        // If user is authenticated and is a donor, return their donations
        // Otherwise return only available donations for NGOs
        if (req.user && req.user.role === 'donor') {
            const donations = await Donation.find({ donorId: req.user.id })
                .populate("donorId", "name email phoneNumber address")
                .sort({ createdAt: -1 });
            console.log("Returning donor's donations:", donations.length);
            return res.json(donations);
        }
        
        // For NGOs or unauthenticated users, return only available donations
        const donations = await Donation.find({ status: "available" })
            .populate("donorId", "name email phoneNumber address")
            .sort({ createdAt: -1 });
        console.log("Returning available donations:", donations.length);
        res.json(donations);
    } catch (err) {
        console.error("Error in getDonations:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const claimDonation = async (req, res) => {
    try{
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const donation = await Donation.findById(req.params.id);
        if(!donation) return res.status(404).json({ message: "Donation not found" });
        if(donation.status !== "available") return res.status(400).json({ message: "Donation already claimed" });

        donation.status = "reserved";
        donation.reservedBy = req.user.id;
        donation.reservedAt = new Date();
        await donation.save();

        // Populate reservedBy before sending response
        await donation.populate("reservedBy", "name email");
        await donation.populate("donorId", "name email phoneNumber address");

        res.json({ message: "Donation claimed successfully", donation });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getClaimedDonations = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (req.user.role !== 'ngo') {
            return res.status(403).json({ message: 'Only NGOs can view claimed donations' });
        }

        const donations = await Donation.find({ reservedBy: req.user.id })
            .populate("donorId", "name email phoneNumber address")
            .sort({ reservedAt: -1 });
        
        res.json(donations);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getDonationById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("=== getDonationById called ===");
        console.log("Request params:", req.params);
        console.log("Donation ID:", id);
        console.log("Request URL:", req.originalUrl);
        console.log("Request method:", req.method);
        
        // Validate ObjectId format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log("Invalid ID format");
            return res.status(400).json({ message: "Invalid donation ID format" });
        }
        
        console.log("Querying database for donation:", id);
        const donation = await Donation.findById(id)
            .populate("donorId", "name email phoneNumber address")
            .populate("reservedBy", "name email phoneNumber");
        
        if (!donation) {
            console.log("Donation not found in database for ID:", id);
            // Check total donations in database
            const totalCount = await Donation.countDocuments();
            console.log("Total donations in database:", totalCount);
            return res.status(404).json({ message: "Donation not found", id: id });
        }
        
        console.log("Donation found:", donation.title);
        res.json(donation);
    } catch (err) {
        console.error("Error in getDonationById:", err);
        // Check if it's a CastError (invalid ObjectId)
        if (err.name === 'CastError') {
            return res.status(400).json({ message: "Invalid donation ID format", error: err.message });
        }
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const confirmPickup = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (req.user.role !== 'ngo') {
            return res.status(403).json({ message: 'Only NGOs can confirm pickup' });
        }

        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }
        
        // Check if the donation was reserved by this NGO
        if (donation.reservedBy && donation.reservedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only confirm pickup for donations you have claimed' });
        }
        
        if (donation.status !== 'reserved') {
            return res.status(400).json({ message: 'Donation must be reserved before pickup can be confirmed' });
        }

        donation.status = 'collected';
        donation.collectedAt = new Date();
        await donation.save();

        await donation.populate("donorId", "name email phoneNumber address");
        await donation.populate("reservedBy", "name email phoneNumber");

        res.json({ message: "Pickup confirmed successfully", donation });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const cancelClaim = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (req.user.role !== 'ngo') {
            return res.status(403).json({ message: 'Only NGOs can cancel claims' });
        }

        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }
        
        // Check if the donation was reserved by this NGO
        if (donation.reservedBy && donation.reservedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only cancel claims for donations you have claimed' });
        }
        
        if (donation.status !== 'reserved') {
            return res.status(400).json({ message: 'Only reserved donations can have their claim cancelled' });
        }

        donation.status = 'available';
        donation.reservedBy = null;
        donation.reservedAt = null;
        await donation.save();

        await donation.populate("donorId", "name email phoneNumber address");

        res.json({ message: "Claim cancelled successfully", donation });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { createDonation, getDonations, claimDonation, getClaimedDonations, getDonationById, confirmPickup, cancelClaim };