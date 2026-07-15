const axios = require('axios');
const crypto = require('crypto');

class CBEService {
  constructor() {
    this.apiUrl = process.env.CBE_API_URL;
    this.merchantId = process.env.CBE_MERCHANT_ID;
    this.apiKey = process.env.CBE_API_KEY;
    this.secretKey = process.env.CBE_SECRET_KEY;
  }

  // Generate signature for API requests
  generateSignature(data, timestamp) {
    const sortedKeys = Object.keys(data).sort();
    const signString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&') + `&timestamp=${timestamp}`;
    
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(signString)
      .digest('hex');
  }

  // Generate unique transaction reference
  generateTransactionRef() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CBE-${timestamp}-${random}`;
  }

  // Initialize payment request
  async initiatePayment({
    phoneNumber,
    accountNumber,
    amount,
    description,
    merchantReference,
    callbackUrl
  }) {
    try {
      const transactionRef = this.generateTransactionRef();
      const timestamp = Date.now();

      const requestData = {
        merchantId: this.merchantId,
        phoneNumber: phoneNumber.replace(/^\+251/, '0'), // Convert to local format
        accountNumber: accountNumber || phoneNumber.replace(/^\+251/, '0'),
        amount: amount.toString(),
        currency: 'ETB',
        description: description || 'Fanora Wallet Top-up',
        merchantReference: merchantReference || transactionRef,
        transactionRef,
        callbackUrl: callbackUrl || `${process.env.BACKEND_URL}/api/payments/cbe/callback`
      };

      // Generate signature
      const signature = this.generateSignature(requestData, timestamp);

      const response = await axios.post(`${this.apiUrl}/payment/initiate`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
          'X-SIGNATURE': signature,
          'X-TIMESTAMP': timestamp.toString()
        },
        timeout: 30000 // 30 seconds timeout
      });

      if (response.data.status === 'success' || response.data.responseCode === '00') {
        return {
          success: true,
          data: {
            transactionId: response.data.transactionId || response.data.transactionReference,
            transactionRef,
            paymentUrl: response.data.paymentUrl,
            ussdCode: response.data.ussdCode, // For USSD-based payments
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
          }
        };
      } else {
        throw new Error(response.data.message || response.data.responseMessage || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('CBE payment initiation error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 
               error.response?.data?.responseMessage || 
               error.message || 
               'Payment initiation failed'
      };
    }
  }

  // Check payment status
  async checkPaymentStatus(transactionId) {
    try {
      const timestamp = Date.now();
      const requestData = {
        merchantId: this.merchantId,
        transactionId
      };

      const signature = this.generateSignature(requestData, timestamp);

      const response = await axios.post(`${this.apiUrl}/payment/status`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
          'X-SIGNATURE': signature,
          'X-TIMESTAMP': timestamp.toString()
        },
        timeout: 15000
      });

      const status = response.data.status || response.data.transactionStatus;
      
      // Map CBE status to standardized status
      let standardStatus = 'pending';
      if (status === 'SUCCESS' || status === 'COMPLETED' || response.data.responseCode === '00') {
        standardStatus = 'success';
      } else if (status === 'FAILED' || status === 'DECLINED' || response.data.responseCode !== '00') {
        standardStatus = 'failed';
      } else if (status === 'CANCELLED') {
        standardStatus = 'cancelled';
      }

      return {
        success: true,
        status: standardStatus,
        amount: parseFloat(response.data.amount || response.data.transactionAmount || 0),
        currency: response.data.currency || 'ETB',
        transactionId: response.data.transactionId || response.data.transactionReference,
        accountNumber: response.data.accountNumber,
        phoneNumber: response.data.phoneNumber,
        completedAt: response.data.completedAt || response.data.transactionDate
      };
    } catch (error) {
      console.error('CBE status check error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 
               error.response?.data?.responseMessage || 
               error.message || 
               'Status check failed'
      };
    }
  }

  // Verify callback signature
  verifyCallbackSignature(callbackData, receivedSignature, timestamp) {
    const expectedSignature = this.generateSignature(callbackData, timestamp);
    return expectedSignature === receivedSignature;
  }

  // Process callback from CBE
  processCallback(callbackData, signature, timestamp) {
    try {
      const {
        transactionId,
        transactionRef,
        status,
        amount,
        currency,
        phoneNumber,
        accountNumber,
        completedAt,
        responseCode
      } = callbackData;

      // Verify signature
      if (!this.verifyCallbackSignature(callbackData, signature, timestamp)) {
        throw new Error('Invalid callback signature');
      }

      // Map CBE status to standardized status
      let standardStatus = 'pending';
      if (status === 'SUCCESS' || status === 'COMPLETED' || responseCode === '00') {
        standardStatus = 'success';
      } else if (status === 'FAILED' || status === 'DECLINED' || (responseCode && responseCode !== '00')) {
        standardStatus = 'failed';
      } else if (status === 'CANCELLED') {
        standardStatus = 'cancelled';
      }

      return {
        success: true,
        data: {
          transactionId: transactionId || callbackData.transactionReference,
          transactionRef,
          status: standardStatus,
          amount: parseFloat(amount),
          currency: currency || 'ETB',
          phoneNumber,
          accountNumber,
          completedAt: completedAt ? new Date(completedAt) : new Date()
        }
      };
    } catch (error) {
      console.error('CBE callback processing error:', error);
      return {
        success: false,
        error: error.message || 'Callback processing failed'
      };
    }
  }

  // Account inquiry (check if account exists and is valid)
  async accountInquiry(accountNumber, phoneNumber) {
    try {
      const timestamp = Date.now();
      const requestData = {
        merchantId: this.merchantId,
        accountNumber: accountNumber || phoneNumber.replace(/^\+251/, '0'),
        phoneNumber: phoneNumber.replace(/^\+251/, '0')
      };

      const signature = this.generateSignature(requestData, timestamp);

      const response = await axios.post(`${this.apiUrl}/account/inquiry`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
          'X-SIGNATURE': signature,
          'X-TIMESTAMP': timestamp.toString()
        },
        timeout: 15000
      });

      if (response.data.responseCode === '00' || response.data.status === 'SUCCESS') {
        return {
          success: true,
          data: {
            accountNumber: response.data.accountNumber,
            accountName: response.data.accountName,
            phoneNumber: response.data.phoneNumber,
            accountStatus: response.data.accountStatus,
            availableBalance: response.data.availableBalance
          }
        };
      } else {
        throw new Error(response.data.responseMessage || 'Account inquiry failed');
      }
    } catch (error) {
      console.error('CBE account inquiry error:', error);
      return {
        success: false,
        error: error.response?.data?.responseMessage || 
               error.response?.data?.message || 
               error.message || 
               'Account inquiry failed'
      };
    }
  }

  // Refund payment
  async refundPayment(originalTransactionId, amount, reason) {
    try {
      const timestamp = Date.now();
      const refundRef = this.generateTransactionRef();

      const requestData = {
        merchantId: this.merchantId,
        originalTransactionId,
        refundAmount: amount.toString(),
        refundReference: refundRef,
        reason: reason || 'Refund requested'
      };

      const signature = this.generateSignature(requestData, timestamp);

      const response = await axios.post(`${this.apiUrl}/payment/refund`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
          'X-SIGNATURE': signature,
          'X-TIMESTAMP': timestamp.toString()
        },
        timeout: 30000
      });

      if (response.data.responseCode === '00' || response.data.status === 'SUCCESS') {
        return {
          success: true,
          data: {
            refundId: response.data.refundId || response.data.transactionId,
            refundRef,
            status: response.data.status,
            amount: parseFloat(response.data.refundAmount || amount)
          }
        };
      } else {
        throw new Error(response.data.responseMessage || 'Refund failed');
      }
    } catch (error) {
      console.error('CBE refund error:', error);
      return {
        success: false,
        error: error.response?.data?.responseMessage || 
               error.response?.data?.message || 
               error.message || 
               'Refund failed'
      };
    }
  }

  // Validate Ethiopian phone number and account number for CBE
  validateAccountDetails(phoneNumber, accountNumber = null) {
    // Validate phone number
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    const ethPhonePattern = /^(\+251|251|0)[1-9]\d{8}$/;
    
    if (!ethPhonePattern.test(cleanPhone)) {
      return {
        valid: false,
        error: 'Invalid Ethiopian phone number format'
      };
    }

    // Normalize phone number
    let normalizedPhone = cleanPhone;
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '+251' + normalizedPhone.substring(1);
    } else if (normalizedPhone.startsWith('251')) {
      normalizedPhone = '+' + normalizedPhone;
    } else if (!normalizedPhone.startsWith('+251')) {
      normalizedPhone = '+251' + normalizedPhone;
    }

    // Validate account number if provided
    let normalizedAccount = null;
    if (accountNumber) {
      const cleanAccount = accountNumber.replace(/[\s\-]/g, '');
      // CBE account numbers are typically 13-16 digits
      if (!/^\d{13,16}$/.test(cleanAccount)) {
        return {
          valid: false,
          error: 'Invalid CBE account number format'
        };
      }
      normalizedAccount = cleanAccount;
    }

    return {
      valid: true,
      normalizedPhone,
      normalizedAccount: normalizedAccount || normalizedPhone.replace('+251', '0')
    };
  }

  // Get supported payment methods
  getSupportedPaymentMethods() {
    return [
      {
        id: 'cbe_mobile',
        name: 'CBE Mobile Banking',
        description: 'Pay using CBE Mobile Banking app',
        icon: 'cbe-mobile-icon',
        minAmount: 1,
        maxAmount: 100000,
        currency: 'ETB'
      },
      {
        id: 'cbe_ussd',
        name: 'CBE USSD',
        description: 'Pay using USSD code *847#',
        icon: 'ussd-icon',
        minAmount: 1,
        maxAmount: 50000,
        currency: 'ETB'
      },
      {
        id: 'cbe_account',
        name: 'CBE Bank Account',
        description: 'Pay directly from your CBE bank account',
        icon: 'bank-icon',
        minAmount: 10,
        maxAmount: 200000,
        currency: 'ETB'
      }
    ];
  }
}

module.exports = CBEService;
