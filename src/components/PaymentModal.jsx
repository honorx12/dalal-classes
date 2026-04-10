// src/components/PaymentModal.jsx
import { useState, useEffect } from 'react';
import { X, CreditCard, Lock, CheckCircle, Loader2, Shield } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';

const PaymentModal = ({ course, onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!user) {
      setError('Please sign in first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const workerUrl = import.meta.env.VITE_WORKER_URL;
      
      if (!workerUrl || workerUrl === 'TO_BE_ADDED_LATER') {
        const { error: enrollError } = await supabase
          .from('enrollments')
          .upsert({
            user_id: user.id,
            course_id: course.id,
            progress: 0,
          }, {
            onConflict: 'user_id,course_id',
          });

        if (enrollError) throw enrollError;
        
        onSuccess?.();
        return;
      }

      const response = await fetch(`${workerUrl}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          course_id: course.id,
          amount: course.price,
        }),
      });

      const orderData = await response.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Dalal Classes',
        description: `Enrollment for ${course.title}`,
        order_id: orderData.order_id,
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email,
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(`${workerUrl}/api/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                user_id: user.id,
                course_id: course.id,
                amount: course.price,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              onSuccess?.();
            } else {
              setError(verifyData.error || 'Payment verification failed');
            }
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        theme: {
          color: '#0f172a',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(response.error.description || 'Payment failed');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center mx-auto mb-4`}>
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Enroll in Course
          </h2>
          <p className="text-slate-600">
            Get full access to all chapters and modules
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-600">Course</span>
            <span className="font-medium text-slate-900">{course.title}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-600">Duration</span>
            <span className="font-medium text-slate-900">Lifetime Access</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-600">Certificate</span>
            <span className="font-medium text-slate-900">Included</span>
          </div>
          <hr className="my-3 border-slate-200" />
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-slate-900">Total</span>
            <span className="text-2xl font-bold text-navy">₹{course.price}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ₹{course.price} with Razorpay
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Shield className="w-4 h-4" />
          <span>Secure payment powered by Razorpay</span>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          By enrolling, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
