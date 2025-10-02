const express = require("express");
const  { createDonation, getDonations, claimDonation } = require("../controllers/donationController");
const authMiddleware = require("../middleware/authMiddleware");
const authRoles = require("../middleware/authRoles");

const router = express.Router();

router.post("/", authMiddleware, authRoles('donor'), createDonation);

console.log("getdonation reached");
router.get("/", getDonations);
router.patch("/:id/claim", authMiddleware, authRoles('ngo'), claimDonation);

module.exports = router;