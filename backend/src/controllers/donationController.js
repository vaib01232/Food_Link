const Donation = require("../models/donationModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const { sendDonationClaimEmail } = require("../services/emailService");

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
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
};

const getDonations = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
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
        
        // For NGOs and unauthenticated users: only return available donations
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

        const donation = await Donation.findOneAndUpdate(
            { 
                _id: req.params.id,
                status: 'available'
            },
            {
                $set: {
                    status: 'reserved',
                    reservedBy: req.user.id,
                    reservedAt: new Date()
                }
            },
            { 
                new: true,
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

        // Create notification for donor
        try {
            const ngoUser = await User.findById(req.user.id).select('name');
            await Notification.create({
                userId: donation.donorId._id,
                message: `NGO "${ngoUser.name}" has claimed your donation (${donation.donationId}). They will contact you soon.`,
                type: 'donation_claimed',
                donationId: donation.donationId,
                metadata: {
                    ngoName: ngoUser.name,
                    donationTitle: donation.title
                }
            });
        } catch (notifErr) {
            console.error('Failed to create notification:', notifErr);
        }

        // Send email to NGO with donor details
        try {
            const ngoUser = await User.findById(req.user.id);
            await sendDonationClaimEmail(
                ngoUser.email,
                ngoUser.name,
                {
                    donationId: donation.donationId,
                    donationTitle: donation.title,
                    donorName: donation.donorId.name,
                    donorEmail: donation.donorId.email,
                    donorPhone: donation.donorId.phoneNumber || 'Not provided',
                    donorAddress: donation.donorId.address || donation.pickupAddress,
                    pickupDateTime: donation.pickupDateTime,
                    pickupGeo: donation.pickupGeo
                }
            );
        } catch (emailErr) {
            console.error('Failed to send claim email to NGO:', emailErr);
        }

        res.json({ 
            success: true,
            message: "Donation claimed successfully", 
            donation 
        });
    } catch (err) {
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
        
        if (donation.status !== 'reserved') {
            return res.status(400).json({ 
                success: false,
                message: 'Only reserved donations can have their claim cancelled' 
            });
        }
        
        if (!donation.reservedBy) {
            return res.status(400).json({ 
                success: false,
                message: 'This donation is not claimed by anyone' 
            });
        }
        
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

        // Create notification for donor about unclaim
        try {
            await Notification.create({
                userId: donation.donorId._id,
                message: `An NGO has unclaimed your donation (${donation.donationId}). It is now available for other NGOs.`,
                type: 'donation_unclaimed',
                donationId: donation.donationId,
                metadata: {
                    donationTitle: donation.title
                }
            });
        } catch (notifErr) {
            console.error('Failed to create unclaim notification for donor:', notifErr);
        }

        res.json({ 
            success: true,
            message: "Claim cancelled successfully", 
            donation 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

const deleteDonation = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }

        const donation = await Donation.findById(req.params.id);
        
        if (!donation) {
            return res.status(404).json({ 
                success: false,
                message: "Donation not found" 
            });
        }

        // Check if the user is the donor
        if (donation.donorId.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false,
                message: 'You can only delete your own donations' 
            });
        }

        const donationId = donation.donationId;
        const donationTitle = donation.title;

        // If donation was claimed, notify the NGO
        if (donation.reservedBy) {
            try {
                await Notification.create({
                    userId: donation.reservedBy,
                    message: `Donation ${donationId} has been deleted by the donor.`,
                    type: 'donation_deleted',
                    donationId: donationId,
                    metadata: {
                        donationTitle: donationTitle
                    }
                });
            } catch (notifErr) {
                console.error('Failed to create notification for NGO:', notifErr);
            }
        }

        // Delete the donation
        await Donation.findByIdAndDelete(req.params.id);

        res.json({ 
            success: true,
            message: "Donation deleted successfully"
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

module.exports = { createDonation, getDonations, claimDonation, getClaimedDonations, getDonationById, confirmPickup, cancelClaim, deleteDonation };