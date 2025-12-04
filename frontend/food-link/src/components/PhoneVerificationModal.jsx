import React, { useState, useEffect } from 'react';
import { X, Phone, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, auth } from '../config/firebase';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const PhoneVerificationModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'success'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (isOpen && !window.recaptchaVerifier) {
      setupRecaptcha();
    }
  }, [isOpen]);

  const setupRecaptcha = () => {
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          toast.error('reCAPTCHA expired. Please try again.');
        }
      });
    } catch (error) {
    }
  };

  const formatPhoneNumber = (phone) => {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If doesn't start with country code, assume +1 (US/Canada)
    if (!phone.startsWith('+')) {
      cleaned = '1' + cleaned;
    }
    
    return '+' + cleaned;
  };

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    // Should have at least 10 digits (without country code) or 11+ with country code
    return cleaned.length >= 10;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number (min 10 digits)');
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const appVerifier = window.recaptchaVerifier;
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
      setResendTimer(60); // 60 seconds cooldown
      toast.success('OTP sent successfully!');
    } catch (error) {
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Phone Authentication is not enabled. Please enable Phone Authentication in Firebase Console (Authentication → Sign-in method → Phone).';
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please include country code (e.g., +1 for US).';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      } else if (error.code === 'auth/missing-phone-number') {
        errorMessage = 'Please enter a phone number.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA verification failed. Please try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        setupRecaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // Verify OTP with Firebase
      await confirmationResult.confirm(otp);
      
      // OTP verified successfully, now save to backend
      const token = localStorage.getItem('token');
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const response = await axios.post(
        API_ENDPOINTS.AUTH.VERIFY_PHONE,
        { phoneNumber: formattedPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update user in localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.phoneNumber = formattedPhone;
          user.isPhoneVerified = true;
          localStorage.setItem('user', JSON.stringify(user));
        }

        setStep('success');
        toast.success('Phone number verified successfully!');
        
        // Wait a moment then close and trigger success callback
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      }
    } catch (error) {
      let errorMessage = 'Invalid OTP. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP has expired. Please request a new one.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setOtp('');
    setError('');
    await handleSendOTP({ preventDefault: () => {} });
  };

  const handleClose = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
    setError('');
    setConfirmationResult(null);
    setResendTimer(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-green-100 p-8 max-w-md w-full animate-fadeInUp">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'phone' && '📞 Verify Phone Number'}
            {step === 'otp' && '🔐 Enter OTP'}
            {step === 'success' && '✅ Verified!'}
          </h2>
          {step !== 'success' && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4 mb-6">
          <p className="text-blue-800 text-sm font-medium">
            {step === 'phone' && 'We need to verify your phone number to complete this action.'}
            {step === 'otp' && `OTP sent to ${phoneNumber}. Please enter the 6-digit code.`}
            {step === 'success' && 'Your phone number has been verified successfully!'}
          </p>
        </div>

        {/* Phone Number Step */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setError('');
                  }}
                  placeholder="+1 (555) 123-4567"
                  className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-sm font-medium"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +1 for US/Canada, +91 for India)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:scale-[1.02] shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          </form>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  setError('');
                }}
                placeholder="000000"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-center text-2xl font-bold tracking-widest"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Resend OTP */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || loading}
                className={`text-sm font-medium ${
                  resendTimer > 0 || loading
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-green-600 hover:text-green-700 hover:underline'
                }`}
              >
                {resendTimer > 0
                  ? `Resend OTP in ${resendTimer}s`
                  : 'Resend OTP'}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                }}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading || otp.length !== 6
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:scale-[1.02] shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Verification Successful!
            </h3>
            <p className="text-gray-600">
              Your phone number has been verified and saved.
            </p>
          </div>
        )}

        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default PhoneVerificationModal;
