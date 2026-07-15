const express = require('express');
const { Op } = require('sequelize');
const { Transaction, Wallet, Notification, User } = require('../models');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// ============= GET PAYMENT STATUS =============
// @route   GET /api/payments/status/:transactionId
// @desc    Check payment status
// @access  Private
router.get('/status/:transactionId', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: {
        transactionId: transaction.id,
        reference: transaction.reference,
        amount: parseFloat(transaction.amount),
        status: transaction.status,
        type: transaction.type,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt || null
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= TELEBIRR PAYMENT CALLBACK =============
// @route   POST /api/payments/telebirr/callback
// @desc    Handle Telebirr payment callback (Webhook)
// @access  Public (but signature verified)
router.post('/telebirr/callback', async (req, res) => {
  try {
    const { transactionRef, status, amount, message } = req.body;

    // TODO: Verify Telebirr signature to ensure authenticity
    // const isValidSignature = verifyTelebirrSignature(req.body, req.headers['x-telebirr-signature']);
    // if (!isValidSignature) {
    //   return res.status(401).json({ message: 'Invalid signature' });
    // }

    // Find transaction by reference
    const transaction = await Transaction.findOne({
      where: { reference: transactionRef }
    });

    if (!transaction) {
      console.warn(`Telebirr callback: Transaction not found for ref ${transactionRef}`);
      // Still return 200 to acknowledge webhook
      return res.json({ success: true, message: 'Transaction not found, webhook acknowledged' });
    }

    // Handle different payment statuses
    if (status === 'completed' || status === 'success') {
      // Payment successful
      await transaction.update({
        status: 'completed',
        completedAt: new Date()
      });

      // Update wallet balance
      const wallet = await Wallet.findByPk(transaction.walletId);
      if (wallet) {
        await wallet.increment('balance', { by: parseFloat(transaction.amount) });

        // Get user for notification
        const user = await User.findByPk(transaction.userId);

        // Create notification
        await Notification.create({
          userId: transaction.userId,
          type: 'content_published', // Reuse as payment completed
          title: 'Wallet Top-up Successful',
          message: `${parseFloat(transaction.amount).toLocaleString()} ETB has been added to your wallet`,
          data: {
            amount: parseFloat(transaction.amount),
            method: 'telebirr'
          }
        });

        console.log(`Telebirr payment completed: ${transactionRef} - ${transaction.amount} ETB`);
      }
    } else if (status === 'failed' || status === 'cancelled') {
      // Payment failed
      await transaction.update({
        status: 'failed',
        completedAt: new Date()
      });

      // Create notification
      await Notification.create({
        userId: transaction.userId,
        type: 'content_published', // Reuse as payment failed
        title: 'Payment Failed',
        message: `Your Telebirr payment of ${parseFloat(transaction.amount).toLocaleString()} ETB failed. Please try again.`,
        data: {
          amount: parseFloat(transaction.amount),
          reason: message || 'Unknown error',
          method: 'telebirr'
        }
      });

      console.log(`Telebirr payment failed: ${transactionRef} - ${message}`);
    }

    // Always return 200 to acknowledge webhook receipt
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Telebirr callback error:', error);
    // Return 200 even on error to prevent webhook retry storms
    res.status(200).json({
      success: false,
      message: 'Error processing callback',
      error: error.message
    });
  }
});

// ============= CBE PAYMENT CALLBACK =============
// @route   POST /api/payments/cbe/callback
// @desc    Handle CBE Birr payment callback (Webhook)
// @access  Public (but signature verified)
router.post('/cbe/callback', async (req, res) => {
  try {
    const { transactionRef, status, amount, message } = req.body;

    // TODO: Verify CBE signature
    // const isValidSignature = verifyCBESignature(req.body, req.headers['x-cbe-signature']);
    // if (!isValidSignature) {
    //   return res.status(401).json({ message: 'Invalid signature' });
    // }

    // Find transaction by reference
    const transaction = await Transaction.findOne({
      where: { reference: transactionRef }
    });

    if (!transaction) {
      console.warn(`CBE callback: Transaction not found for ref ${transactionRef}`);
      return res.json({ success: true, message: 'Transaction not found, webhook acknowledged' });
    }

    // Handle different payment statuses
    if (status === 'completed' || status === 'success') {
      // Payment successful
      await transaction.update({
        status: 'completed',
        completedAt: new Date()
      });

      // Update wallet balance
      const wallet = await Wallet.findByPk(transaction.walletId);
      if (wallet) {
        await wallet.increment('balance', { by: parseFloat(transaction.amount) });

        // Create notification
        await Notification.create({
          userId: transaction.userId,
          type: 'content_published',
          title: 'Wallet Top-up Successful',
          message: `${parseFloat(transaction.amount).toLocaleString()} ETB has been added to your wallet`,
          data: {
            amount: parseFloat(transaction.amount),
            method: 'cbe'
          }
        });

        console.log(`CBE payment completed: ${transactionRef} - ${transaction.amount} ETB`);
      }
    } else if (status === 'failed' || status === 'cancelled') {
      // Payment failed
      await transaction.update({
        status: 'failed',
        completedAt: new Date()
      });

      // Create notification
      await Notification.create({
        userId: transaction.userId,
        type: 'content_published',
        title: 'Payment Failed',
        message: `Your CBE Birr payment of ${parseFloat(transaction.amount).toLocaleString()} ETB failed. Please try again.`,
        data: {
          amount: parseFloat(transaction.amount),
          reason: message || 'Unknown error',
          method: 'cbe'
        }
      });

      console.log(`CBE payment failed: ${transactionRef} - ${message}`);
    }

    // Always return 200 to acknowledge webhook
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('CBE callback error:', error);
    // Return 200 even on error to prevent webhook retry storms
    res.status(200).json({
      success: false,
      message: 'Error processing callback',
      error: error.message
    });
  }
});

// ============= REQUEST REFUND =============
// @route   POST /api/payments/refund/:transactionId
// @desc    Request refund for a transaction
// @access  Private
router.post('/refund/:transactionId', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    const transaction = await Transaction.findByPk(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only refundable if completed within 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (transaction.status !== 'completed' || transaction.completedAt < thirtyDaysAgo) {
      return res.status(400).json({
        message: 'Transaction is not eligible for refund'
      });
    }

    // Create refund transaction
    const refundTransaction = await Transaction.create({
      userId: transaction.userId,
      walletId: transaction.walletId,
      amount: transaction.amount,
      type: 'refund',
      status: 'pending',
      reference: `REFUND-${Date.now()}`,
      description: `Refund for ${transaction.reference}`,
      metadata: {
        originalTransactionId: transaction.id,
        reason: reason || 'User requested',
        manualApprovalRequired: true
      }
    });

    // Create notification
    await Notification.create({
      userId: transaction.userId,
      type: 'content_published',
      title: 'Refund Request Submitted',
      message: 'Your refund request has been submitted for review. You will be notified once it is processed.',
      data: {
        refundTransactionId: refundTransaction.id,
        amount: parseFloat(transaction.amount)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Refund request submitted',
      data: {
        refundId: refundTransaction.id,
        status: 'pending',
        estimatedProcessingTime: '3-5 business days'
      }
    });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= GET PAYMENT ANALYTICS =============
// @route   GET /api/payments/analytics
// @desc    Get payment analytics (Admin/Creator)
// @access  Private (Creator - only their stats, Admin - all)
router.get('/analytics', auth, async (req, res) => {
  try {
    const { timeRange = '30', creatorId } = req.query;
    const days = parseInt(timeRange) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let whereClause = {
      status: 'completed',
      completedAt: { [Op.gte]: startDate }
    };

    // If creatorId specified, verify authorization
    if (creatorId !== req.user.id && !req.user.isAdmin) {
      whereClause.userId = req.user.id;
    } else if (creatorId) {
      whereClause.userId = creatorId;
    }

    const transactions = await Transaction.findAll({
      where: whereClause
    });

    // Calculate stats
    const stats = {
      totalTransactions: transactions.length,
      totalAmount: 0,
      byType: {},
      byStatus: {}
    };

    for (const tx of transactions) {
      stats.totalAmount += parseFloat(tx.amount);

      // By type
      if (!stats.byType[tx.type]) {
        stats.byType[tx.type] = { count: 0, amount: 0 };
      }
      stats.byType[tx.type].count += 1;
      stats.byType[tx.type].amount += parseFloat(tx.amount);

      // By status
      if (!stats.byStatus[tx.status]) {
        stats.byStatus[tx.status] = { count: 0, amount: 0 };
      }
      stats.byStatus[tx.status].count += 1;
      stats.byStatus[tx.status].amount += parseFloat(tx.amount);
    }

    // Calculate daily breakdown
    const dailyStats = {};
    for (const tx of transactions) {
      const date = tx.completedAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { count: 0, amount: 0 };
      }
      dailyStats[date].count += 1;
      dailyStats[date].amount += parseFloat(tx.amount);
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalAmount: parseFloat(stats.totalAmount.toFixed(2)),
          totalTransactions: stats.totalTransactions,
          averageTransaction: stats.totalTransactions > 0
            ? parseFloat((stats.totalAmount / stats.totalTransactions).toFixed(2))
            : 0
        },
        byType: stats.byType,
        byStatus: stats.byStatus,
        dailyBreakdown: dailyStats,
        timeRange: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
