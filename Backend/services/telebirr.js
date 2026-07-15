const axios = require('axios');
const crypto = require('crypto');

class TelebirrService {
  constructor() {
    this.apiUrl = process.env.TELEBIRR_API_URL;
    this.appId = process.env.TELEBIRR_APP_ID;
    this.appKey = process.env.TELEBIRR_APP_KEY;
    this.publicKey = process.env.TELEBIRR_PUBLIC_KEY;
    this.privateKey = process.env.TELEBIRR_PRIVATE_KEY;
  }

  // Generate signature for API requests
  generateSignature(data) {
    const sortedKeys = Object.keys(data).sort();
    const signString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    return crypto
      .createHmac('sha256', this.appKey)
      .update(signString)
      .digest('hex');
  }

  // Generate unique transaction reference
  generateTransactionRef() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TBR-${timestamp}-${random}`;
  }

  // Initialize payment request
  async initiatePayment({
    phoneNumber,
    amount,
    description,
    merchantReference,
    callbackUrl
  }) {
    try {
      const transactionRef = this.generateTransactionRef();
      const timestamp = Date.now();

      const requestData = {
        appId: this.appId,
        phoneNumber: phoneNumber.replace(/^\+251/, '0'), // Convert to local format
        amount: amount.toString(),
        currency: 'ETB',
        description: description || 'Fanora Wallet Top-up',
        merchantReference: merchantReference || transactionRef,
        transactionRef,
        timestamp: timestamp.toString(),
        callbackUrl: callbackUrl || `${process.env.BACKEND_URL}/api/payments/telebirr/callback`
      };

      // Generate signature
      requestData.signature = this.generateSignature(requestData);

      const response = await axios.post(`${this.apiUrl}/payment/initiate`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-APP-ID': this.appId
        },
        timeout: 30000 // 30 seconds timeout
      });

      if (response.data.status === 'success') {
        return {
          success: true,
          data: {
            transactionId: response.data.transactionId,
            transactionRef,
            paymentUrl: response.data.paymentUrl,
            qrCode: response.data.qrCode,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
          }
        };
      } else {
        throw new Error(response.data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Telebirr payment initiation error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Payment initiation failed'
      };
    }
  }

  // Check payment status
  async checkPaymentStatus(transactionId) {
    try {
      const timestamp = Date.now();
      const requestData = {
        appId: this.appId,
        transactionId,
        timestamp: timestamp.toString()
      };

      requestData.signature = this.generateSignature(requestData);

      const response = await axios.post(`${this.apiUrl}/payment/status`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-APP-ID': this.appId
        },
        timeout: 15000
      });

      return {
        success: true,
        status: response.data.status, // pending, success, failed, cancelled
        amount: response.data.amount,
        currency: response.data.currency,
        transactionId: response.data.transactionId,
        paymentMethod: response.data.paymentMethod,
        completedAt: response.data.completedAt
      };
    } catch (error) {
      console.error('Telebirr status check error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Status check failed'
      };
    }
  }

  // Verify callback signature
  verifyCallbackSignature(callbackData, receivedSignature) {
    const expectedSignature = this.generateSignature(callbackData);
    return expectedSignature === receivedSignature;
  }

  // Process callback from Telebirr
  processCallback(callbackData) {
    try {
      const {
        transactionId,
        transactionRef,
        status,
        amount,
        currency,
        phoneNumber,
        completedAt,
        signature
      } = callbackData;

      // Verify signature
      const dataToVerify = {
        transactionId,
        transactionRef,
        status,
        amount,
        currency,
        phoneNumber,
        completedAt
      };

      if (!this.verifyCallbackSignature(dataToVerify, signature)) {
        throw new Error('Invalid callback signature');
      }

      return {
        success: true,
        data: {
          transactionId,
          transactionRef,
          status,
          amount: parseFloat(amount),
          currency,
          phoneNumber,
          completedAt: new Date(completedAt)
        }
      };
    } catch (error) {
      console.error('Telebirr callback processing error:', error);
      return {
        success: false,
        error: error.message || 'Callback processing failed'
      };
    }
  }

  // Refund payment
  async refundPayment(transactionId, amount, reason) {
    try {
      const timestamp = Date.now();
      const refundRef = this.generateTransactionRef();

      const requestData = {
        appId: this.appId,
        originalTransactionId: transactionId,
        refundAmount: amount.toString(),
        refundRef,
        reason: reason || 'Refund requested',
        timestamp: timestamp.toString()
      };

      requestData.signature = this.generateSignature(requestData);

      const response = await axios.post(`${this.apiUrl}/payment/refund`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-APP-ID': this.appId
        },
        timeout: 30000
      });

      if (response.data.status === 'success') {
        return {
          success: true,
          data: {
            refundId: response.data.refundId,
            refundRef,
            status: response.data.status,
            amount: response.data.amount
          }
        };
      } else {
        throw new Error(response.data.message || 'Refund failed');
      }
    } catch (error) {
      console.error('Telebirr refund error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Refund failed'
      };
    }
  }

  // Validate Ethiopian phone number for Telebirr
  validatePhoneNumber(phoneNumber) {
    // Remove any spaces or special characters
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Check if it matches Ethiopian phone number format
    const ethPattern = /^(\+251|251|0)[1-9]\d{8}$/;
    
    if (!ethPattern.test(cleanNumber)) {
      return {
        valid: false,
        error: 'Invalid Ethiopian phone number format'
      };
    }

    // Normalize to international format
    let normalized = cleanNumber;
    if (normalized.startsWith('0')) {
      normalized = '+251' + normalized.substring(1);
    } else if (normalized.startsWith('251')) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+251')) {
      normalized = '+251' + normalized;
    }

    return {
      valid: true,
      normalized
    };
  }

  // Get supported payment methods
  getSupportedPaymentMethods() {
    return [
      {
        id: 'telebirr_wallet',
        name: 'Telebirr Wallet',
        description: 'Pay using your Telebirr mobile wallet',
        icon: 'telebirr-icon',
        minAmount: 1,
        maxAmount: 50000,
        currency: 'ETB'
      },
      {
        id: 'telebirr_ussd',
        name: 'Telebirr USSD',
        description: 'Pay using USSD code *127#',
        icon: 'ussd-icon',
        minAmount: 1,
        maxAmount: 10000,
        currency: 'ETB'
      }
    ];
  }
}

module.exports = TelebirrService;
