import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [emailOrEmpId, setEmailOrEmpId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!emailOrEmpId.trim()) {
      setError('Please enter your email address or employee ID');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrEmpId: emailOrEmpId.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Header */}
        <button
          onClick={handleBackToLogin}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Login</span>
        </button>

        {!submitted ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-3">
              Reset Your Password
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Enter your email address or employee ID, and we'll send you a link to reset your password.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address or Employee ID
                </label>
                <input
                  type="text"
                  value={emailOrEmpId}
                  onChange={(e) => setEmailOrEmpId(e.target.value)}
                  placeholder="example@company.com or EMP001"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white py-3 rounded-xl font-bold uppercase tracking-wide hover:shadow-lg hover:shadow-orange-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            {/* Additional Info */}
            <p className="text-center text-xs text-gray-500 mt-6">
              The reset link will expire in 15 minutes for security reasons.
            </p>
          </div>
        ) : (
          /* Success Screen */
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              If an account exists with the email or employee ID you entered, you will receive a password reset link shortly.
            </p>

            {/* Supporting Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">What's next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your email inbox for the reset link</li>
                <li>• Click the link to set a new password</li>
                <li>• The link will expire in 15 minutes</li>
                <li>• Log in with your new password</li>
              </ul>
            </div>

            {/* Back to Login Button */}
            <button
              onClick={handleBackToLogin}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 rounded-xl font-bold uppercase tracking-wide hover:shadow-lg active:scale-95 transition-all"
            >
              Back to Login
            </button>

            {/* Resend Link */}
            <button
              onClick={() => {
                setSubmitted(false);
                setEmailOrEmpId('');
              }}
              className="w-full mt-3 text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
