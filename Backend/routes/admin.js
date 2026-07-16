const express = require('express');
const { Op } = require('sequelize');
const {
  User, Content, TrustReport, Transaction, CreatorVerification, Notification,
} = require('../models');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(auth, isAdmin);

router.get('/stats', async (req, res) => {
  try {
    const [creators, fans, gmv, openReports] = await Promise.all([
      User.count({ where: { isCreator: true } }),
      User.count({ where: { isCreator: false } }),
      Transaction.sum('amount', { where: { status: 'completed', type: { [Op.in]: ['subscription', 'content_purchase', 'tip'] } } }),
      TrustReport.count({ where: { status: 'open' } }),
    ]);
    res.json({
      success: true,
      data: {
        activeCreators: creators,
        activeFans: fans,
        gmv: parseFloat(gmv || 0),
        openReports,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/verification-queue', async (req, res) => {
  try {
    const creators = await CreatorVerification.findAll({
      where: { status: { [Op.in]: ['submitted', 'reviewing'] } },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'profileImage', 'createdAt'],
      }],
      order: [['submittedAt', 'ASC']],
      limit: 50,
    });
    res.json({ success: true, data: creators });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verification/:userId', async (req, res) => {
  try {
    const { action, reason } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be approve or reject' });
    }
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const verification = await CreatorVerification.findOne({ where: { userId: user.id } });
    if (!verification) return res.status(404).json({ message: 'Verification application not found' });
    if (!['submitted', 'reviewing'].includes(verification.status)) {
      return res.status(409).json({ message: 'Only submitted applications can be reviewed' });
    }
    if (action === 'approve') {
      user.isVerified = true;
      user.isCreator = true;
      user.role = 'creator';
      verification.status = 'approved';
    } else {
      verification.status = 'rejected';
      verification.rejectionReason = reason || 'Application did not meet verification requirements';
    }
    verification.reviewedAt = new Date();
    await Promise.all([user.save(), verification.save()]);
    await Notification.create({
      userId: user.id,
      type: 'verification_update',
      title: `Creator verification ${verification.status}`,
      message: action === 'approve' ? 'Your creator account is verified' : verification.rejectionReason,
      data: { deepLink: '/creator/onboarding' },
    });
    res.json({ success: true, message: `Verification ${action}`, data: verification });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/moderation-queue', async (req, res) => {
  try {
    const content = await Content.findAll({
      where: { status: 'under_review' },
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
      order: [['createdAt', 'ASC']],
      limit: 50,
    });
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/moderation/:contentId', async (req, res) => {
  try {
    const { action } = req.body;
    const content = await Content.findByPk(req.params.contentId);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    content.status = action === 'approve' ? 'published' : 'rejected';
    await content.save();
    res.json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/payout-queue', async (req, res) => {
  try {
    const payouts = await Transaction.findAll({
      where: { type: 'withdrawal', status: 'pending' },
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
      order: [['createdAt', 'ASC']],
      limit: 50,
    });
    res.json({ success: true, data: payouts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/payout/:transactionId', async (req, res) => {
  try {
    const { action } = req.body;
    const tx = await Transaction.findByPk(req.params.transactionId);
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    tx.status = action === 'approve' ? 'completed' : 'failed';
    await tx.save();
    res.json({ success: true, data: tx });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/disputes', async (req, res) => {
  try {
    const disputes = await TrustReport.findAll({
      where: { type: { [Op.in]: ['refund', 'dispute'] }, status: { [Op.in]: ['open', 'reviewing'] } },
      order: [['createdAt', 'ASC']],
      limit: 50,
    });
    res.json({ success: true, data: disputes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/disputes/:reportId', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await TrustReport.findByPk(req.params.reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    report.status = status || 'resolved';
    report.adminNotes = adminNotes || report.adminNotes;
    report.resolvedAt = new Date();
    await report.save();
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
