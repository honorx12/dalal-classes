// src/lib/razorpay.js
import { getRazorpayKeyId, isRazorpayConfigured } from './env';

const razorpayKeyId = getRazorpayKeyId();

/**
 * Check if Razorpay payments are properly configured
 * @returns {boolean}
 */
export const isRazorpayAvailable = () => isRazorpayConfigured();

export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.head.appendChild(script);
  });
};

export const getRazorpayInstance = async () => {
  if (!isRazorpayConfigured()) {
    throw new Error('Razorpay is not configured. Please check your environment variables.');
  }
  await loadRazorpayScript();
  return new window.Razorpay({
    key: razorpayKeyId,
  });
};

export const openRazorpayCheckout = async (options) => {
  const rzp = await getRazorpayInstance();
  
  return new Promise((resolve, reject) => {
    rzp.on('payment.success', (response) => resolve(response));
    rzp.on('payment.error', (response) => reject(response));
    rzp.open(options);
  });
};

export { razorpayKeyId };
