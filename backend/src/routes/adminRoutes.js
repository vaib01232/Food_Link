const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authRoles = require('../middleware/authRoles');
const { removeExpiredDonations, markExpiredDonations, removeOldExpiredDonations } = require('../services/cleanupService');

const router = express.Router();

router.post('/cleanup', authMiddleware, authRoles('admin'), async (req, res) => {
  try {
    const { mode = 'delete', oldDays = 7 } = req.body;

    let result;
    if (mode === 'delete') {
      result = await removeExpiredDonations();
    } else if (mode === 'mark') {
      const markResult = await markExpiredDonations();
      const deleteResult = await removeOldExpiredDonations(oldDays);
      result = {
        marked: markResult.modifiedCount,
        removed: deleteResult.removed,
        failed: deleteResult.failed
      };
    } else {
      return res.status(400).json({ message: 'Invalid cleanup mode. Use "delete" or "mark"' });
    }

    res.json({
      message: 'Cleanup completed successfully',
      result
    });
  } catch (err) {
    res.status(500).json({ message: 'Cleanup failed', error: err.message });
  }
});

router.get('/cleanup/status', authMiddleware, authRoles('admin'), async (req, res) => {
  try {
    const Donation = require('../models/donationModel');
    const now = new Date();

    const stats = await Donation.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          expired: [
            { $match: { expireDateTime: { $lt: now }, status: { $ne: 'collected' } } },
            { $count: 'count' }
          ],
          markedExpired: [
            { $match: { status: 'expired' } },
            { $count: 'count' }
          ],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    res.json({
      cleanupMode: process.env.CLEANUP_MODE || 'delete',
      cleanupInterval: process.env.CLEANUP_INTERVAL || '*/30 * * * *',
      statistics: {
        total: stats[0].total[0]?.count || 0,
        expired: stats[0].expired[0]?.count || 0,
        markedExpired: stats[0].markedExpired[0]?.count || 0,
        byStatus: stats[0].byStatus
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get status', error: err.message });
  }
});

module.exports = router;
