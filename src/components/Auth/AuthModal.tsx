import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Eye, EyeOff, ArrowLeft, Calendar, Target, Star, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetPasswordMessage, setResetPasswordMessage] = useState('');
  const [migrationResult, setMigrationResult] = useState<any>(null);

  const { signIn, signUp, hasGuestDataToMigrate, getGuestDataCounts } = useAuthStore();
  
  const guestDataCounts = getGuestDataCounts();
  const hasGuestData = hasGuestDataToMigrate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isResettingPassword) {
      await handleResetPassword();
      return;
    }

    setLoading(true);
    setError('');
    setMigrationResult(null);

    try {
      if (isSignUp) {
        const result = await signUp(email, password);
        setMigrationResult(result);
        
        // Show success message briefly before closing
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setResetPasswordMessage('');

    try {
      console.log('Attempting password reset for:', email);
      console.log('Current origin:', window.location.origin);
      
      // First try without redirect to isolate the issue
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      
      console.log('Reset password response:', { data, error });

      if (error) {
        console.error('Reset password error details:', {
          message: error.message,
          status: error.status,
          details: error
        });
        
        // Try with different approaches based on the error
        if (error.message.includes('rate limit')) {
          setError('Too many reset attempts. Please wait a few minutes and try again.');
        } else if (error.message.includes('not found') || error.message.includes('user')) {
          setError('No account found with this email address. Please check your email or sign up for a new account.');
        } else if (error.message.includes('redirect')) {
          // If redirect is the issue, try with a simpler redirect
          console.log('Trying with redirect...');
          const { error: redirectError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          
          if (redirectError) {
            setError(`Reset email error: ${redirectError.message}`);
          } else {
            setResetPasswordMessage(
              'Password reset email sent! Please check your inbox and follow the instructions to reset your password.'
            );
          }
        } else {
          setError(`Error: ${error.message}`);
        }
      } else {
        setResetPasswordMessage(
          'Password reset email sent! Please check your inbox and follow the instructions to reset your password.'
        );
      }
    } catch (err: any) {
      console.error('Unexpected error in password reset:', err);
      setError(err.message || 'An unexpected error occurred while sending the reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setIsResettingPassword(false);
    setError('');
    setResetPasswordMessage('');
    setEmail('');
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setResetPasswordMessage('');
    setEmail('');
    setPassword('');
  };

  const handleForgotPassword = () => {
    setIsResettingPassword(true);
    setError('');
    setResetPasswordMessage('');
    setPassword('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-red-500/50 dark:border-red-500/20"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {isResettingPassword 
                  ? 'Reset Password' 
                  : isSignUp 
                    ? 'Join the Experience' 
                    : 'Welcome Back'
                }
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isResettingPassword
                  ? 'Enter your email address and we\'ll send you a link to reset your password'
                  : isSignUp 
                    ? 'Create your account to save your agenda and track your bar visits'
                    : 'Sign in to access your personalized experience'
                }
              </p>
            </div>

            {/* Guest Data Preview for Sign Up */}
            {isSignUp && hasGuestData && !isResettingPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-700/30 rounded-xl p-4"
              >
                <div className="flex items-start space-x-3">
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                      We'll save your current progress!
                    </h3>
                    <div className="space-y-2">
                      {guestDataCounts.agenda > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                          <Calendar size={14} className="text-green-600 dark:text-green-400" />
                          <span>{guestDataCounts.agenda} agenda {guestDataCounts.agenda === 1 ? 'item' : 'items'}</span>
                        </div>
                      )}
                      {guestDataCounts.predictions > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                          <Target size={14} className="text-green-600 dark:text-green-400" />
                          <span>{guestDataCounts.predictions} {guestDataCounts.predictions === 1 ? 'prediction' : 'predictions'}</span>
                        </div>
                      )}
                      {guestDataCounts.barVisits > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                          <Star size={14} className="text-green-600 dark:text-green-400" />
                          <span>{guestDataCounts.barVisits} bar {guestDataCounts.barVisits === 1 ? 'visit' : 'visits'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {!isResettingPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-500 dark:text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              {resetPasswordMessage && (
                <div className="text-green-600 dark:text-green-400 text-sm text-center bg-green-400/10 border border-green-400/20 rounded-lg p-3">
                  {resetPasswordMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
              >
                {loading 
                  ? 'Please wait...' 
                  : isResettingPassword 
                    ? 'Send Reset Email'
                    : isSignUp 
                      ? 'Create Account' 
                      : 'Sign In'
                }
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              {isResettingPassword ? (
                <button
                  onClick={handleBackToSignIn}
                  className="flex items-center justify-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors mx-auto"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Sign In</span>
                </button>
              ) : (
                <>
                  {!isSignUp && (
                    <button
                      onClick={handleForgotPassword}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors text-sm"
                    >
                      Forgot your password?
                    </button>
                  )}
                  <div>
                    <button
                      onClick={handleToggleMode}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      {isSignUp 
                        ? 'Already have an account? Sign in'
                        : "Don't have an account? Sign up"
                      }
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
