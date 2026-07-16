/**
 * Basic API smoke tests — run with: npm test (from Backend)
 * These verify route modules load and key contracts exist.
 */
describe('Fanora backend contracts', () => {
  test('content router exports', () => {
    const content = require('../routes/content');
    expect(typeof content).toBe('function');
  });

  test('wallet router exports', () => {
    const wallet = require('../routes/wallet');
    expect(typeof wallet).toBe('function');
  });

  test('upload router exports', () => {
    const upload = require('../routes/upload');
    expect(typeof upload).toBe('function');
  });

  test('live router exports', () => {
    const live = require('../routes/live');
    expect(typeof live).toBe('function');
  });

  test('auth router exports', () => {
    const auth = require('../routes/auth');
    expect(typeof auth).toBe('function');
  });

  test.each([
    'requests',
    'gifts',
    'creatorOnboarding',
    'mediaSecurity',
    'admin',
    'trust',
    'bundles',
    'wishlist',
  ])('%s router exports', (route) => {
    expect(typeof require(`../routes/${route}`)).toBe('function');
  });

  test('cloudinary util exports uploadBuffer', () => {
    const { uploadBuffer, isConfigured } = require('../utils/cloudinary');
    expect(typeof uploadBuffer).toBe('function');
    expect(typeof isConfigured).toBe('function');
  });

  test('Transaction model includes topup and content_purchase types', () => {
    const Transaction = require('../models/Transaction');
    const typeAttr = Transaction.rawAttributes.type;
    expect(typeAttr.values).toEqual(
      expect.arrayContaining(['topup', 'deposit', 'subscription_payment', 'content_purchase'])
    );
  });

  test('Content model includes allowComments', () => {
    const Content = require('../models/Content');
    expect(Content.rawAttributes.allowComments).toBeDefined();
  });

  test('new v2 models expose required state fields', () => {
    const CustomRequest = require('../models/CustomRequest');
    const GiftVoucher = require('../models/GiftVoucher');
    const CreatorVerification = require('../models/CreatorVerification');
    const LiveStream = require('../models/LiveStream');
    const WishlistItem = require('../models/WishlistItem');
    expect(CustomRequest.rawAttributes.paymentStatus).toBeDefined();
    expect(GiftVoucher.rawAttributes.code).toBeDefined();
    expect(CreatorVerification.rawAttributes.status).toBeDefined();
    expect(CreatorVerification.rawAttributes.livenessChallenge.type.key).toBe('JSONB');
    expect(CreatorVerification.rawAttributes.ocrData.type.key).toBe('JSONB');
    expect(CreatorVerification.rawAttributes.faceSimilarity).toBeDefined();
    expect(CreatorVerification.rawAttributes.livenessScore).toBeDefined();
    expect(CreatorVerification.rawAttributes.automatedChecks.type.key).toBe('JSONB');
    expect(CreatorVerification.rawAttributes.analyzedAt).toBeDefined();
    expect(CreatorVerification.rawAttributes.analysisStatus.values).toEqual(
      ['pending', 'processing', 'completed', 'failed']
    );
    expect(LiveStream.rawAttributes.playbackUrl).toBeDefined();
    expect(WishlistItem.rawAttributes.contentId).toBeDefined();
  });
});
