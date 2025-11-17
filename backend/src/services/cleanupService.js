const Donation = require('../models/donationModel');
const fs = require('fs');
const path = require('path');

/**
 * Cleanup service to remove expired donations and their associated files
 */

/**
 * Remove expired donations from database
 * Donations are considered expired when expireDateTime < current time
 */
const removeExpiredDonations = async () => {
  try {
    const now = new Date();
    
    // Find all expired donations that haven't been collected
    const expiredDonations = await Donation.find({
      expireDateTime: { $lt: now },
      status: { $nin: ['collected', 'expired'] } // Don't re-process already handled donations
    });

    if (expiredDonations.length === 0) {
      console.log('[Cleanup Service] No expired donations found');
      return { removed: 0, failed: 0 };
    }

    console.log(`[Cleanup Service] Found ${expiredDonations.length} expired donation(s) to remove`);

    let removed = 0;
    let failed = 0;

    for (const donation of expiredDonations) {
      try {
        // Delete associated photos from filesystem
        if (donation.photos && donation.photos.length > 0) {
          for (const photoUrl of donation.photos) {
            try {
              // Extract filename from URL (handles both full URLs and relative paths)
              const filename = photoUrl.split('/uploads/').pop();
              if (filename) {
                const filePath = path.join(process.cwd(), 'uploads', filename);
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                  console.log(`[Cleanup Service] Deleted file: ${filename}`);
                }
              }
            } catch (fileErr) {
              console.error(`[Cleanup Service] Failed to delete file ${photoUrl}:`, fileErr.message);
            }
          }
        }

        // Delete the donation from database
        await Donation.findByIdAndDelete(donation._id);
        removed++;
        console.log(`[Cleanup Service] Removed expired donation: ${donation.title} (ID: ${donation._id})`);
      } catch (err) {
        failed++;
        console.error(`[Cleanup Service] Failed to remove donation ${donation._id}:`, err.message);
      }
    }

    console.log(`[Cleanup Service] Cleanup completed: ${removed} removed, ${failed} failed`);
    return { removed, failed };
  } catch (err) {
    console.error('[Cleanup Service] Error during cleanup:', err.message);
    throw err;
  }
};

/**
 * Alternative: Mark donations as expired instead of deleting
 * This preserves data for analytics/history
 */
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

    console.log(`[Cleanup Service] Marked ${result.modifiedCount} donation(s) as expired`);
    return result;
  } catch (err) {
    console.error('[Cleanup Service] Error marking expired donations:', err.message);
    throw err;
  }
};

/**
 * Cleanup old expired donations (older than X days)
 * Use this to remove expired donations after they've been expired for a while
 */
const removeOldExpiredDonations = async (daysOld = 7) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const oldExpiredDonations = await Donation.find({
      status: 'expired',
      expireDateTime: { $lt: cutoffDate }
    });

    if (oldExpiredDonations.length === 0) {
      console.log('[Cleanup Service] No old expired donations found');
      return { removed: 0, failed: 0 };
    }

    console.log(`[Cleanup Service] Found ${oldExpiredDonations.length} old expired donation(s) to remove`);

    let removed = 0;
    let failed = 0;

    for (const donation of oldExpiredDonations) {
      try {
        // Delete associated photos
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
              console.error(`[Cleanup Service] Failed to delete file:`, fileErr.message);
            }
          }
        }

        await Donation.findByIdAndDelete(donation._id);
        removed++;
      } catch (err) {
        failed++;
        console.error(`[Cleanup Service] Failed to remove old donation:`, err.message);
      }
    }

    console.log(`[Cleanup Service] Old expired cleanup completed: ${removed} removed, ${failed} failed`);
    return { removed, failed };
  } catch (err) {
    console.error('[Cleanup Service] Error during old expired cleanup:', err.message);
    throw err;
  }
};

module.exports = {
  removeExpiredDonations,
  markExpiredDonations,
  removeOldExpiredDonations
};
