const { analyzeIdentity, KycServiceError } = require('../services/kycServiceClient');

const payload = {
  idImageUrl: 'https://images.example/id.jpg',
  selfieImageUrl: 'https://images.example/selfie.jpg',
  challenge: {
    type: 'blink_turn',
    frameUrls: [
      'https://images.example/neutral.jpg',
      'https://images.example/blink.jpg',
      'https://images.example/turn.jpg',
    ],
  },
};

const analysis = {
  document: { text: 'PASSPORT', fields: {}, confidence: 0.9 },
  face: { detected: true, similarity: 0.88, match: true },
  liveness: {
    passed: true,
    score: 1,
    checks: { orderedFrames: true, blink: true, headTurn: true },
  },
  riskScore: 0.1,
  recommendation: 'manual_review',
};

describe('KYC service client', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test('posts the contract and optional bearer token', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(analysis),
    });

    await expect(analyzeIdentity(payload, {
      baseUrl: 'http://kyc:8000/',
      token: 'test-token',
      timeoutMs: 1000,
    })).resolves.toEqual(analysis);

    expect(global.fetch).toHaveBeenCalledWith('http://kyc:8000/verify', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ authorization: 'Bearer test-token' }),
      body: JSON.stringify(payload),
    }));
  });

  test('rejects malformed service responses', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ recommendation: 'approved' }),
    });

    await expect(analyzeIdentity(payload, {
      baseUrl: 'http://kyc:8000',
      timeoutMs: 1000,
    })).rejects.toBeInstanceOf(KycServiceError);
  });

  test('does not expose upstream response content on failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });

    await expect(analyzeIdentity(payload, {
      baseUrl: 'http://kyc:8000',
      timeoutMs: 1000,
    })).rejects.toMatchObject({ message: 'KYC analysis failed with status 503' });
  });
});
