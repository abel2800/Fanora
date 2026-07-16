const express = require('express');
const crypto = require('crypto');
const { CreatorVerification, Notification, User } = require('../models');
const { auth } = require('../middleware/auth');
const { analyzeIdentity } = require('../services/kycServiceClient');

const router = express.Router();

function isHttpUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function isStoredUploadUrl(value) {
  return typeof value === 'string'
    && /^\/uploads\/[A-Za-z0-9._/-]+$/.test(value)
    && !value.includes('..');
}

function isImageUrl(value) {
  return isHttpUrl(value) || isStoredUploadUrl(value);
}

function toAnalysisUrl(value) {
  if (isHttpUrl(value)) return value;
  const baseUrl = process.env.KYC_IMAGE_BASE_URL || process.env.BACKEND_URL;
  if (!baseUrl || !isStoredUploadUrl(value)) {
    throw new Error('KYC_IMAGE_BASE_URL is required for local uploads');
  }
  return `${baseUrl.replace(/\/$/, '')}${value}`;
}

function isValidChallenge(challenge) {
  return challenge
    && challenge.type === 'blink_turn'
    && Array.isArray(challenge.frameUrls)
    && challenge.frameUrls.length === 3
    && challenge.frameUrls.every(isImageUrl);
}

function ownerView(verification) {
  const data = verification.toJSON ? verification.toJSON() : { ...verification };
  if (data.ocrData) {
    data.ocrData = {
      fields: data.ocrData.fields || {},
      confidence: data.ocrData.confidence,
    };
    data.ocrFields = data.ocrData.fields;
  }
  data.manualFallbackAllowed = String(process.env.KYC_ALLOW_MANUAL_FALLBACK).toLowerCase() === 'true';
  data.analysisRequired = !data.manualFallbackAllowed;
  return data;
}

router.get('/', auth, async (req, res) => {
  try {
    const verification = await CreatorVerification.findOne({ where: { userId: req.user.id } });
    res.json({
      success: true,
      data: verification ? ownerView(verification) : {
        status: 'draft',
        currentStep: 1,
        analysisStatus: 'pending',
        steps: ['identity', 'payout', 'profile', 'guidelines'],
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/identity', auth, async (req, res) => {
  try {
    const {
      idType,
      idFrontUrl,
      idBackUrl,
      selfieUrl,
      challenge: legacyChallenge,
      livenessChallenge,
    } = req.body;
    const challenge = livenessChallenge || legacyChallenge;
    if (!['fayda', 'kebele', 'passport'].includes(idType)
        || !isImageUrl(idFrontUrl) || !isImageUrl(selfieUrl) || !isValidChallenge(challenge)) {
      return res.status(400).json({
        message: 'ID front, selfie, and an ordered neutral/blink/turn challenge are required',
      });
    }
    if (idBackUrl && !isImageUrl(idBackUrl)) {
      return res.status(400).json({ message: 'ID back URL must use HTTP or HTTPS' });
    }
    const [verification] = await CreatorVerification.findOrCreate({
      where: { userId: req.user.id },
      defaults: { userId: req.user.id },
    });
    if (verification.status === 'approved') {
      return res.status(409).json({ message: 'Approved identity changes require admin assistance' });
    }
    await verification.update({
      idType,
      idFrontUrl,
      idBackUrl: idBackUrl || null,
      selfieUrl,
      livenessChallenge: challenge,
      ocrData: null,
      faceSimilarity: null,
      livenessScore: null,
      automatedChecks: null,
      analyzedAt: null,
      analysisStatus: 'pending',
      status: 'draft',
      submittedAt: null,
      reviewedAt: null,
      rejectionReason: null,
      currentStep: Math.max(verification.currentStep, 2),
    });
    res.json({ success: true, data: ownerView(verification) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/analyze', auth, async (req, res) => {
  let verification;
  try {
    verification = await CreatorVerification.findOne({ where: { userId: req.user.id } });
    if (!verification || !isImageUrl(verification.idFrontUrl)
        || !isImageUrl(verification.selfieUrl) || !isValidChallenge(verification.livenessChallenge)) {
      return res.status(400).json({ message: 'Complete identity images and liveness challenge first' });
    }
    if (verification.analysisStatus === 'processing') {
      return res.status(409).json({ message: 'Identity analysis is already processing' });
    }
    if (verification.status === 'approved') {
      return res.status(409).json({ message: 'This identity has already been approved' });
    }

    await verification.update({ analysisStatus: 'processing' });
    const analysis = await analyzeIdentity({
      idImageUrl: toAnalysisUrl(verification.idFrontUrl),
      selfieImageUrl: toAnalysisUrl(verification.selfieUrl),
      challenge: {
        ...verification.livenessChallenge,
        frameUrls: verification.livenessChallenge.frameUrls.map(toAnalysisUrl),
      },
    });
    await verification.update({
      ocrData: analysis.document,
      faceSimilarity: analysis.face.similarity,
      livenessScore: analysis.liveness.score,
      automatedChecks: {
        face: analysis.face,
        liveness: analysis.liveness,
        riskScore: analysis.riskScore,
        recommendation: analysis.recommendation,
      },
      analyzedAt: new Date(),
      analysisStatus: 'completed',
      status: 'reviewing',
    });
    return res.json({
      success: true,
      message: 'Automated checks completed; manual admin review is still required',
      data: ownerView(verification),
      analysis,
    });
  } catch (error) {
    if (verification) {
      try {
        await verification.update({ analysisStatus: 'failed', analyzedAt: new Date() });
      } catch {
        // Preserve the original service/database failure response.
      }
    }
    return res.status(error.status && error.status < 500 ? 400 : 502).json({
      message: 'Identity analysis could not be completed',
    });
  }
});

router.put('/payout', auth, async (req, res) => {
  try {
    const { payoutMethod, payoutDetails } = req.body;
    if (!payoutMethod || !payoutDetails) return res.status(400).json({ message: 'Payout method is required' });
    const verification = await CreatorVerification.findOne({ where: { userId: req.user.id } });
    if (!verification || verification.currentStep < 2) {
      return res.status(400).json({ message: 'Complete identity verification first' });
    }
    await verification.update({
      payoutMethod,
      payoutDetails,
      currentStep: Math.max(verification.currentStep, 3),
    });
    res.json({ success: true, data: ownerView(verification) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/submit', auth, async (req, res) => {
  try {
    const verification = await CreatorVerification.findOne({ where: { userId: req.user.id } });
    if (!verification || verification.currentStep < 3 || !req.body.guidelinesAccepted) {
      return res.status(400).json({ message: 'Complete identity, payout, profile, and guidelines' });
    }
    const checks = verification.automatedChecks || {};
    const checksPassed = verification.analysisStatus === 'completed'
      && checks.face?.match === true
      && checks.liveness?.passed === true;
    const manualFallback = String(process.env.KYC_ALLOW_MANUAL_FALLBACK).toLowerCase() === 'true';
    if (!checksPassed && !manualFallback) {
      return res.status(400).json({
        message: 'Completed face-match and liveness checks are required before submission',
      });
    }
    await verification.update({
      status: 'submitted',
      currentStep: 4,
      submittedAt: new Date(),
    });
    await Notification.create({
      userId: req.user.id,
      type: 'verification_update',
      title: 'Verification submitted',
      message: 'Your creator verification is now under review',
      data: { deepLink: '/creator/onboarding' },
    });
    res.json({ success: true, data: ownerView(verification) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Generic provider callback. Positive results only advance to manual review.
// { userId, status: "approved"|"rejected", reason? }
router.post('/webhook', async (req, res) => {
  try {
    const secret = process.env.KYC_WEBHOOK_SECRET;
    if (!secret) return res.status(503).json({ message: 'KYC webhook is not configured' });
    const signature = String(req.header('x-fanora-signature') || '');
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (!signature || signature.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    const { userId, status, reason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }
    const verification = await CreatorVerification.findOne({ where: { userId } });
    const user = await User.findByPk(userId);
    if (!verification || !user) return res.status(404).json({ message: 'Application not found' });

    verification.status = status === 'approved' ? 'reviewing' : 'rejected';
    verification.rejectionReason = status === 'rejected' ? reason || 'Verification failed' : null;
    verification.reviewedAt = new Date();
    await Promise.all([verification.save(), user.save()]);
    await Notification.create({
      userId,
      type: 'verification_update',
      title: `Creator verification ${verification.status}`,
      message: status === 'approved'
        ? 'Automated checks completed; an admin must still review your application'
        : verification.rejectionReason,
      data: { deepLink: '/creator/onboarding' },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('KYC webhook error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
