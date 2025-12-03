const express = require("express");
const  { createDonation, getDonations, claimDonation, getClaimedDonations, getDonationById, confirmPickup, cancelClaim, deleteDonation } = require("../controllers/donationController");
const authMiddleware = require("../middleware/authMiddleware");
const authRoles = require("../middleware/authRoles");

const optionalAuth = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
        try {
            const jwt = require("jsonwebtoken");
            const User = require("../models/userModel");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("name email role");
            if (user) {
                req.user = {
                    id: user._id.toString(),
                    role: user.role,
                    name: user.name,
                    email: user.email
                };
            }
        } catch (err) {
        }
    }
    next();
};

const router = express.Router();

router.post("/", authMiddleware, authRoles('donor'), createDonation);
router.get("/", optionalAuth, getDonations);
router.get("/claimed", authMiddleware, authRoles('ngo'), getClaimedDonations);
router.patch("/:id/claim", authMiddleware, authRoles('ngo'), claimDonation);
router.patch("/:id/confirm-pickup", authMiddleware, authRoles('ngo'), confirmPickup);
router.patch("/:id/cancel-claim", authMiddleware, authRoles('ngo'), cancelClaim);
router.delete("/:id", authMiddleware, authRoles('donor'), deleteDonation);
router.get("/:id", optionalAuth, getDonationById);

module.exports = router;