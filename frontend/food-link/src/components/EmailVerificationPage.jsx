import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [email, setEmail] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      setStatus('verifying');
      const response = await axios.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`);
      
      if (response.status === 200) {
        setStatus('success');
        
        if (response.data && typeof response.data === 'object') {
          if (response.data.success === true || response.data.status === 'success' || response.data.verified === true) {
            setMessage(response.data.message || 'Your email has been successfully verified.');
          } else if (response.data.message) {
            setMessage(response.data.message);
          } else {
            setMessage('Your email has been successfully verified.');
          }
        } else if (typeof response.data === 'string') {
          setMessage(response.data);
        } else {
          setMessage('Your email has been successfully verified.');
        }
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      setStatus('error');
      
      if (error.response) {
        if (error.response.data?.expired === true) {
          setIsExpired(true);
          setMessage(error.response.data?.message || 'Your verification link has expired. Please request a new one.');
        } else if (error.response.data?.message === 'Email is already verified') {
          setMessage('This email has already been verified.');
        } else if (error.response.data?.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage('Verification failed. Invalid or expired link.');
        }
      } else if (error.request) {
        setMessage('Unable to connect to the server. Please check your internet connection.');
      } else {
        setMessage('Verification failed. Invalid or expired link.');
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setResendingEmail(true);
    try {
      await axios.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
      toast.success('Verification email sent! Please check your inbox.');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-2xl shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
              Food Link
            </span>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Verifying Your Email</h2>
              <p className="text-gray-600 text-lg">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-green-900 mb-3">Email Verified!</h2>
              <p className="text-gray-600 mb-8 text-lg">{message}</p>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-5 mb-8">
                <p className="text-sm text-green-800 font-medium">
                  ✓ Your account is now active
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-lg flex items-center justify-center gap-2"
              >
                Go to Login
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-red-900 mb-3">Verification Failed</h2>
              <p className="text-gray-600 mb-6 text-lg">{message}</p>

              {isExpired && (
                <div className="mb-6">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4 mb-5">
                    <p className="text-sm text-yellow-800 font-medium">
                      Don't worry! You can request a new verification email below.
                    </p>
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-bold text-gray-700 mb-2 text-left">
                      Enter your email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-gray-900"
                    />
                  </div>

                  <button
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-3 text-lg"
                  >
                    {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              )}

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-100 border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 hover:shadow-lg transition-all duration-300 text-lg"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Need help?{' '}
            <button 
              onClick={() => navigate('/')}
              className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-all duration-300"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
