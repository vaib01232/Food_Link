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

        await newDonation.save();

        res.status(201).json({ 
            success: true,
            message: 'Donation created successfully', 
            donation: newDonation 
        });
    } catch (err) {
        console.error('[Donation] Create error:', err);
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
};

const getDonations = async (req, res) => {
    try{
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        // If user is authenticated and is a donor, return their donations
        if (req.user && req.user.role === 'donor') {
            const [donations, total] = await Promise.all([
                Donation.find({ donorId: req.user.id })
                    .populate("donorId", "name email phoneNumber address")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Donation.countDocuments({ donorId: req.user.id })
            ]);
            
            return res.json({
                success: true,
                data: donations,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        
        // For NGOs or unauthenticated users, return only available donations
        const [donations, total] = await Promise.all([
            Donation.find({ status: "available" })
                .populate("donorId", "name email phoneNumber address")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Donation.countDocuments({ status: "available" })
        ]);
        
        res.json({
            success: true,
            data: donations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("[Donation] Get donations error:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

const claimDonation = async (req, res) => {
    try{
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }

        // Use atomic findOneAndUpdate to prevent race conditions
        const donation = await Donation.findOneAndUpdate(
            { 
                _id: req.params.id,
                status: 'available' // Only claim if still available
            },
            {
                $set: {
                    status: 'reserved',
                    reservedBy: req.user.id,
                    reservedAt: new Date()
                }
            },
            { 
                new: true, // Return updated document
                runValidators: true
            }
        )
        .populate("reservedBy", "name email")
        .populate("donorId", "name email phoneNumber address");

        if(!donation) {
            return res.status(404).json({ 
                success: false,
                message: "Donation not found or already claimed" 
            });
        }

        res.json({ 
            success: true,
            message: "Donation claimed successfully", 
            donation 
        });
    } catch (err) {
        console.error('[Donation] Claim error:', err);
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

const getClaimedDonations = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }
        if (req.user.role !== 'ngo') {
            return res.status(403).json({ 
                success: false,
                message: 'Only NGOs can view claimed donations' 
            });
        }

        const donations = await Donation.find({ reservedBy: req.user.id })
            .populate("donorId", "name email phoneNumber address")
            .sort({ reservedAt: -1 });
        
        res.json({
            success: true,
            data: donations
        });
    } catch (err) {
        console.error('[Donation] Get claimed error:', err);
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

const getDonationById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid donation ID format" 
            });
        }
        
        const donation = await Donation.findById(id)
            .populate("donorId", "name email phoneNumber address")
            .populate("reservedBy", "name email phoneNumber");
        
        if (!donation) {
            return res.status(404).json({ 
                success: false,
                message: "Donation not found"
            });
        }
        
        res.json({
            success: true,
            data: donation
        });
    } catch (err) {
        console.error("[Donation] Get by ID error:", err);
        // Check if it's a CastError (invalid ObjectId)
        if (err.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                message: "Invalid donation ID format"
            });
        }
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

const confirmPickup = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }
        if (req.user.role !== 'ngo') {
            return res.status(403).json({ 
                success: false,
                message: 'Only NGOs can confirm pickup' 
            });
        }

        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ 
                success: false,
                message: "Donation not found" 
            });
        }
        
        // Check if the donation was reserved by this NGO
        if (donation.reservedBy && donation.reservedBy.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                message: 'You can only confirm pickup for donations you have claimed' 
            });
        }
        
        if (donation.status !== 'reserved') {
            return res.status(400).json({ 
                success: false,
                message: 'Donation must be reserved before pickup can be confirmed' 
            });
        }

        donation.status = 'collected';
        donation.collectedAt = new Date();
        await donation.save();

        await donation.populate("donorId", "name email phoneNumber address");
        await donation.populate("reservedBy", "name email phoneNumber");

        res.json({ 
            success: true,
            message: "Pickup confirmed successfully", 
            donation 
        });
    } catch (err) {
        console.error('[Donation] Confirm pickup error:', err);
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

const cancelClaim = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }
        if (req.user.role !== 'ngo') {
            return res.status(403).json({ 
                success: false,
                message: 'Only NGOs can cancel claims' 
            });
        }

        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ 
                success: false,
                message: "Donation not found" 
            });
        }
        
        // Check status first
        if (donation.status !== 'reserved') {
            return res.status(400).json({ 
                success: false,
                message: 'Only reserved donations can have their claim cancelled' 
            });
        }
        
        // Check if the donation has a reservedBy (should always be true for reserved status)
        if (!donation.reservedBy) {
            return res.status(400).json({ 
                success: false,
                message: 'This donation is not claimed by anyone' 
            });
        }
        
        // Check if the donation was reserved by this NGO
        if (donation.reservedBy.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                message: 'You can only cancel claims for donations you have claimed' 
            });
        }

        donation.status = 'available';
        donation.reservedBy = null;
        donation.reservedAt = null;
        await donation.save();

        await donation.populate("donorId", "name email phoneNumber address");

        res.json({ 
            success: true,
            message: "Claim cancelled successfully", 
            donation 
        });
    } catch (err) {
        console.error('[Donation] Cancel claim error:', err);
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

module.exports = { createDonation, getDonations, claimDonation, getClaimedDonations, getDonationById, confirmPickup, cancelClaim };