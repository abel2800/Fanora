const crypto = require('crypto');
const PhoneOtp = require('../models/PhoneOtp');

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const VERIFIED_PHONE_TTL_MS = 30 * 60 * 1000;

function normalizePhone(phone) {
  let p = String(phone || '').trim();
  if (p.startsWith('0')) p = `+251${p.slice(1)}`;
  if (!p.startsWith('+')) p = `+${p}`;
  return p;
}

function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

function hashCode(phone, code) {
  return crypto.createHash('sha256').update(`${phone}:${code}`).digest('hex');
}

async function sendOtp(phoneNumber, purpose = 'register') {
  const phone = normalizePhone(phoneNumber);
  const existing = await PhoneOtp.findByPk(phone);
  if (existing && Date.now() - existing.sentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - (Date.now() - existing.sentAt.getTime())) / 1000);
    return { ok: false, message: `Please wait ${waitSec}s before resending`, waitSec };
  }

  const code = generateOtp();
  await PhoneOtp.upsert({
    phoneNumber: phone,
    codeHash: hashCode(phone, code),
    purpose,
    sentAt: new Date(),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    verifiedAt: null,
    attempts: 0,
  });
  return { ok: true, phone, code, expiresIn: OTP_TTL_MS / 1000 };
}

async function verifyOtp(phoneNumber, code, purpose = 'register') {
  const phone = normalizePhone(phoneNumber);
  const entry = await PhoneOtp.findByPk(phone);
  if (!entry) return { ok: false, message: 'No OTP sent for this number' };
  if (entry.purpose !== purpose) return { ok: false, message: 'OTP was issued for a different action' };
  if (Date.now() > entry.expiresAt.getTime()) {
    await entry.destroy();
    return { ok: false, message: 'OTP expired' };
  }
  if (entry.attempts >= 5) {
    await entry.destroy();
    return { ok: false, message: 'Too many attempts' };
  }
  const suppliedHash = hashCode(phone, String(code).trim());
  const valid = crypto.timingSafeEqual(Buffer.from(entry.codeHash), Buffer.from(suppliedHash));
  if (!valid) {
    entry.attempts += 1;
    await entry.save();
    return { ok: false, message: 'Invalid OTP' };
  }

  entry.verifiedAt = new Date();
  entry.expiresAt = new Date(Date.now() + VERIFIED_PHONE_TTL_MS);
  await entry.save();
  return { ok: true, phone };
}

async function isPhoneVerified(phoneNumber) {
  const phone = normalizePhone(phoneNumber);
  const entry = await PhoneOtp.findByPk(phone);
  return Boolean(entry?.verifiedAt && entry.expiresAt > new Date());
}

async function consumePhoneVerification(phoneNumber) {
  const phone = normalizePhone(phoneNumber);
  const entry = await PhoneOtp.findByPk(phone);
  if (!entry?.verifiedAt || entry.expiresAt <= new Date()) return false;
  await entry.destroy();
  return true;
}

module.exports = {
  normalizePhone,
  sendOtp,
  verifyOtp,
  isPhoneVerified,
  consumePhoneVerification,
};
