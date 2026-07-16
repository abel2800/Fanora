const DEFAULT_TIMEOUT_MS = 10000;

const normalizeEthiopianPhone = (phoneNumber) => {
  const value = String(phoneNumber || '').replace(/\s+/g, '');
  if (value.startsWith('0')) return `251${value.slice(1)}`;
  return value.replace(/^\+/, '');
};

async function requestJson(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const body = await response.text();
    let data;
    try {
      data = body ? JSON.parse(body) : {};
    } catch {
      data = { raw: body };
    }
    if (!response.ok) {
      throw new Error(data.message || data.error || `SMS provider returned ${response.status}`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function sendWithAfroMessage({ to, message }) {
  const token = process.env.AFRO_MESSAGE_TOKEN;
  const from = process.env.AFRO_MESSAGE_IDENTIFIER_ID;
  const sender = process.env.AFRO_MESSAGE_SENDER_NAME;
  if (!token || !from || !sender) throw new Error('AfroMessage credentials are incomplete');

  const params = new URLSearchParams({
    from,
    sender,
    to: normalizeEthiopianPhone(to),
    message,
  });

  return requestJson(`https://api.afromessage.com/api/send?${params.toString()}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function sendWithGenericProvider({ to, message }) {
  const url = process.env.SMS_API_URL;
  const apiKey = process.env.SMS_API_KEY;
  if (!url || !apiKey) throw new Error('Generic SMS credentials are incomplete');

  return requestJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      to: normalizeEthiopianPhone(to),
      message,
      senderId: process.env.SMS_SENDER_ID || 'Fanora',
    }),
  });
}

async function sendSms({ to, message }) {
  const provider = (process.env.SMS_PROVIDER || 'console').toLowerCase();

  if (provider === 'afromessage') {
    await sendWithAfroMessage({ to, message });
    return { provider, delivered: true };
  }

  if (provider === 'generic') {
    await sendWithGenericProvider({ to, message });
    return { provider, delivered: true };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SMS_PROVIDER must be configured in production');
  }

  console.log(`[SMS:console] ${to}: ${message}`);
  return { provider: 'console', delivered: false };
}

module.exports = { sendSms, normalizeEthiopianPhone };
