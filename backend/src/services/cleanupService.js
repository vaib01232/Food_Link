const Donation = require('../models/donationModel');
const fs = require('fs');
const path = require('path');

const removeExpiredDonations = async () => {
  try {
    const now = new Date();
    
    const expiredDonations = await Donation.find({
      expireDateTime: { $lt: now },
      status: { $nin: ['collected', 'expired'] }
    });

    if (expiredDonations.length === 0) {
      return { removed: 0, failed: 0 };
    }

    let removed = 0;
    let failed = 0;

    for (const donation of expiredDonations) {
      try {
        if (donation.photos && donation.photos.length > 0) {
          for (const photoUrl of donation.photos) {
            try {
              const filename = photoUrl.split('/uploads/').pop();
              if (filename) {
                const filePath = path.join(process.cwd(), 'uploads', filename);
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                }
              }
            } catch (fileErr) {
            }
          }
        }

        await Donation.findByIdAndDelete(donation._id);
        removed++;
      } catch (err) {
        failed++;
      }
    }

    return { removed, failed };
  } catch (err) {
    throw err;
  }
};

const markExpiredDonations = async () => {
  try {
    const now = new Date();
    
    const result = await Donation.updateMany(
      {
        expireDateTime: { $lt: now },
        status: { $nin: ['collected', 'expired', 'cancelled'] }
      },
      {
        $set: { status: 'expired' }
      }
    );

    return result;
  } catch (err) {
    throw err;
  }
};

const removeOldExpiredDonations = async (daysOld = 7) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const oldExpiredDonations = await Donation.find({
      status: 'expired',
      expireDateTime: { $lt: cutoffDate }
    });

    if (oldExpiredDonations.length === 0) {
      return { removed: 0, failed: 0 };
    }

    let removed = 0;
    let failed = 0;

    for (const donation of oldExpiredDonations) {
      try {
        if (donation.photos && donation.photos.length > 0) {
          for (const photoUrl of donation.photos) {
            try {
              const filename = photoUrl.split('/uploads/').pop();
              if (filename) {
                const filePath = path.join(process.cwd(), 'uploads', filename);
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                }
              }
            } catch (fileErr) {
            }
          }
        }

        await Donation.findByIdAndDelete(donation._id);
        removed++;
      } catch (err) {
        failed++;
      }
    }

    return { removed, failed };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  removeExpiredDonations,
  markExpiredDonations,
  removeOldExpiredDonations
};
