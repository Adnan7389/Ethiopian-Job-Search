const axios = require('axios');
const chapaConfig = require('../config/chapaConfig');

class PaymentService {
  constructor() {
    this.CHAPA_API_URL = 'https://api.chapa.co/v1/transaction/initialize';
    this.CHAPA_AUTH_KEY = chapaConfig.chapaSecretKey;
    this.BASE_URL = chapaConfig.baseUrl;
  }

  async initiateChapaPayment(paymentData) {
    try {
      console.log('Initiating Chapa payment with data:', paymentData);

      const response = await axios.post(
        this.CHAPA_API_URL,
        {
          amount: paymentData.amount,
          currency: 'ETB',
          email: paymentData.customerEmail,
          first_name: paymentData.customerFirstName,
          last_name: paymentData.customerLastName,
          tx_ref: paymentData.tx_ref,
          callback_url: `${this.BASE_URL}/api/payments/verify/${paymentData.tx_ref}`,
          customization: {
            title: 'Job Posting',
            description: 'Payment for job posting service',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.CHAPA_AUTH_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Chapa payment initiated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Chapa payment initiation error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initiate Chapa payment');
    }
  }

  async verifyChapaPayment(tx_ref) {
    try {
      console.log('Verifying Chapa payment with tx_ref:', tx_ref);

      const response = await axios.get(
        `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
        {
          headers: {
            Authorization: `Bearer ${this.CHAPA_AUTH_KEY}`,
          },
        }
      );

      console.log('Chapa payment verified successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Chapa payment verification error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify Chapa payment');
    }
  }
}

module.exports = new PaymentService();