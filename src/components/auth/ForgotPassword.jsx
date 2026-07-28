import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  ArrowLeft, 
  Send, 
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import LiquidChrome from '../LiquidChrome';

const STEPS = {
  REQUEST: 'request',
  VERIFY: 'verify',
  RESET: 'reset',
  SUCCESS: 'success'
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(STEPS.REQUEST);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [method, setMethod] = useState('email'); // 'email' or 'phone'

  // Handle resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Generate 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send OTP via email (using Supabase email template)
  const sendOTPEmail = async (emailAddress, code) => {
    try {
      // Store OTP in database
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      const { error: dbError } = await supabase
        .from('password_reset_otp')
        .insert({
          email: emailAddress.toLowerCase().trim(),
          otp: code,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      if (dbError) throw dbError;

      // Send email using Supabase auth (this triggers the email template)
      // Note: In production, you should use a proper email service like SendGrid, AWS SES, or Cloudflare Email
      const { error: emailError } = await supabase.auth.resetPasswordForEmail(emailAddress, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (emailError) throw emailError;

      // For demo purposes, we'll log the OTP to console
      // In production, this should be sent via a secure email service
      console.log('OTP sent to email:', code);
      
      return true;
    } catch (err) {
      console.error('Error sending OTP:', err);
      throw err;
    }
  };

  // Handle initial OTP request
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check if email exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (userError || !userData) {
        setError('No account found with this email address');
        setIsLoading(false);
        return;
      }

      // Generate and send OTP
      const code = generateOTP();
      await sendOTPEmail(email, code);

      // Move to verification step
      setCurrentStep(STEPS.VERIFY);
      setResendTimer(60); // 60 seconds cooldown
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      console.error('Request OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      const code = generateOTP();
      await sendOTPEmail(email, code);
      setResendTimer(60);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input
  const handleOTPChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^[0-9]*$/.test(value)) return; // Only allow numbers

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      setIsLoading(false);
      return;
    }

    try {
      // Verify OTP from database
      const { data: otpData, error: otpError } = await supabase
        .from('password_reset_otp')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('otp', code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpData) {
        setError('Invalid or expired OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      // Mark OTP as used
      await supabase
        .from('password_reset_otp')
        .update({ used: true })
        .eq('id', otpData.id);

      // Move to password reset step
      setCurrentStep(STEPS.RESET);
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
      console.error('Verify OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Show success
      setCurrentStep(STEPS.SUCCESS);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.REQUEST:
        return (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-vivid flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-content mb-2">
                Forgot Password?
              </h2>
              <p className="text-content-secondary">
                Enter your email and we'll send you an OTP to reset your password
              </p>
            </div>

            {/* Method selection */}
            <div className="flex gap-2 p-1 bg-surface/5 rounded-xl">
              <button
                type="button"
                onClick={() => setMethod('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
                  method === 'email' 
                    ? 'bg-brand text-white' 
                    : 'text-content-secondary hover:text-content'
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setMethod('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all ${
                  method === 'phone' 
                    ? 'bg-brand text-white' 
                    : 'text-content-secondary hover:text-content'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Phone
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-content mb-1.5">
                {method === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder={method === 'email' ? 'you@example.com' : '+1 (555) 000-0000'}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send OTP
                </>
              )}
            </button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-1 text-sm text-content-secondary hover:text-content transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </form>
        );

      case STEPS.VERIFY:
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-vivid flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-content mb-2">
                Verify OTP
              </h2>
              <p className="text-content-secondary">
                Enter the 6-digit code sent to {email}
              </p>
            </div>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && index > 0) {
                      const prevInput = document.getElementById(`otp-${index - 1}`);
                      if (prevInput) prevInput.focus();
                    }
                  }}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-elevated/80 border border-line/10 text-content focus:border-brand/50 focus:ring-2 focus:ring-brand/20 focus:outline-none transition-all"
                />
              ))}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-content-secondary">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || isLoading}
                className="text-sm text-brand hover:text-accent-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 
                  ? `Resend OTP in ${resendTimer}s` 
                  : 'Resend OTP'
                }
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setCurrentStep(STEPS.REQUEST)}
                className="inline-flex items-center gap-1 text-sm text-content-secondary hover:text-content transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Use different email
              </button>
            </div>
          </form>
        );

      case STEPS.RESET:
        return (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-vivid flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-content mb-2">
                Reset Password
              </h2>
              <p className="text-content-secondary">
                Create a new password for your account
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-content mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-content mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        );

      case STEPS.SUCCESS:
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>

            <div>
              <h2 className="font-display text-2xl font-bold text-content mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-content-secondary">
                Your password has been updated. You can now log in with your new password.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full py-3"
            >
              Go to Login
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <LiquidChrome intensity={0.3} speed={0.2} />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="glass-card p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
