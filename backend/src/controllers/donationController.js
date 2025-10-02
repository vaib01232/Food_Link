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

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const newDonation = new Donation({
            donorId: req.user._id,
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

        res.status(201).json({ message: 'Donation created successfully', donation: newDonation });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const getDonations = async (req, res) => {
    console.log("REQ.USER:", req.user);

    try{
        const donations = await Donation.find({ status: "available" }).populate("donorId", "name email phoneNumber address");
        res.json(donations);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const claimDonation = async (req, res) => {
    try{
        const donation = await Donation.findById(req.params.id);
        if(!donation) return res.status(404).json({ message: "Donation not found" });
        if(donation.status !== "available") return res.status(400).json({ message: "Donation already claimed" });

        donation.status = "calimed";
        await donation.save();

        res.json({ message: "Donation claimed successfully", donation });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = { createDonation, getDonations, claimDonation };