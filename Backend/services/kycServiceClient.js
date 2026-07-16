const DEFAULT_TIMEOUT_MS = 30_000;

class KycServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'KycServiceError';
    this.status = status;
  }
}

function assertAnalysis(data) {
  if (!data || typeof data !== 'object'
    || !data.document || !data.face || !data.liveness
    || !['manual_review', 'reject'].includes(data.recommendation)
    || typeof data.riskScore !== 'number') {
    throw new KycServiceError('KYC service returned an invalid response');
  }
  return data;
}

async function analyzeIdentity(payload, options = {}) {
  const baseUrl = options.baseUrl || process.env.KYC_SERVICE_URL;
  if (!baseUrl) throw new KycServiceError('KYC service is not configured');

  const timeoutMs = Number(options.timeoutMs || process.env.KYC_SERVICE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const token = options.token === undefined ? process.env.KYC_SERVICE_TOKEN : options.token;

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/verify`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new KycServiceError(`KYC analysis failed with status ${response.status}`, response.status);
    }
    return assertAnalysis(await response.json());
  } catch (error) {
    if (error.name === 'AbortError') throw new KycServiceError('KYC analysis timed out');
    if (error instanceof KycServiceError) throw error;
    throw new KycServiceError('KYC service is unavailable');
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { analyzeIdentity, KycServiceError };
