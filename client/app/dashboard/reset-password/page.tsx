"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { RiLockLine, RiArrowLeftLine, RiShieldCheckLine, RiEyeLine, RiEyeOffLine, RiRefreshLine } from "react-icons/ri";
import { Routes } from "@/app/constants/Routes/Routes";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || '';
  const [userEmail, setUserEmail] = useState('');
  
  const [currentStep, setCurrentStep] = useState<'otp' | 'password'>('otp');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    otp: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!username) {
      router.push(Routes.FORGOT_PASSWORD);
    }
  }, [username, router]);

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (/^\d+$/.test(password)) {
      return 'Password cannot be entirely numeric';
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!(hasLetter && hasNumber) && !hasSpecialChar) {
      return 'Password must contain at least one letter and one number, or include special characters';
    }
    return null;
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setErrors(prev => ({ ...prev, otp: 'Verification code is required' }));
      return;
    }

    if (otp.trim().length !== 6) {
      setErrors(prev => ({ ...prev, otp: 'Verification code must be 6 digits' }));
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Verifying code...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/verify-reset-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          username: username,
          otp: otp.trim()
        }),
        mode: "cors",
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('Email verified successfully!');
        setCurrentStep('password');
        setErrors(prev => ({ ...prev, otp: '' }));
      } else {
        toast.dismiss(loadingToast);
        setErrors(prev => ({ ...prev, otp: data.error || 'Invalid verification code' }));
        toast.error(data.error || 'Invalid verification code');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Verify OTP error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors(prev => ({ ...prev, password: passwordError }));
      return;
    }

    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Resetting password...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/reset-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          new_password: password,
          confirm_password: confirmPassword
        }),
        mode: "cors",
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('Password reset successfully!');
        setTimeout(() => {
          router.push(Routes.LOGIN);
        }, 1500);
      } else {
        toast.dismiss(loadingToast);
        if (data.password) {
          setErrors(prev => ({ ...prev, password: Array.isArray(data.password) ? data.password[0] : data.password }));
        }
        if (data.confirm_password) {
          setErrors(prev => ({ ...prev, confirmPassword: Array.isArray(data.confirm_password) ? data.confirm_password[0] : data.confirm_password }));
        }
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Reset password error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Resending verification code...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username: username }),
        mode: "cors",
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('Verification code resent!');
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.error || 'Failed to resend verification code');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Resend OTP error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b4965] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex items-center justify-end overflow-hidden">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push(Routes.FORGOT_PASSWORD)}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-[#1b4965] hover:bg-[#163a52] rounded-full shadow transition-all border-2 border-white focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
        aria-label="Go back"
      >
        <RiArrowLeftLine className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </button>

      {/* Background gradient image */}
      <div className="absolute inset-0 w-full h-full bg-[url('/assets/images/bg_login.png')] bg-cover bg-center z-0" />

      {/* Reset password form */}
      <div className="w-full md:w-2/3 flex flex-col relative z-10 ml-0 sm:ml-20 md:ml-200 mt-5 sm:mt-10">
        <div className="flex-grow flex items-center justify-center sm:justify-end px-4 sm:px-10 pb-8 mt-5">
          <div className="w-full max-w-md mx-auto my-4 sm:my-8 p-6 sm:p-8 shadow-lg bg-white/60 rounded-xl">
            <div className="text-center mb-6 sm:mb-10">
              <div className="p-2 bg-gradient-to-br from-[#e3f0ff] to-[#cbeafe] rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <RiShieldCheckLine className="text-[#1b4965] text-2xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1b4965] mb-2">
                {currentStep === 'otp' ? 'Verify Your Email' : 'Set New Password'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {currentStep === 'otp' 
                  ? `Enter the code sent to your registered email`
                  : 'Create a new secure password for your account'
                }
              </p>
            </div>

            {/* Step 1: OTP Verification */}
            {currentStep === 'otp' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="relative">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiShieldCheckLine className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      required
                      placeholder="Enter 6-digit code"
                      aria-label="Verification code"
                      aria-required="true"
                      maxLength={6}
                      className={`pl-10 w-full px-4 py-2.5 sm:py-3 border ${
                        errors.otp ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] hover:border-[#1b4965] transition-all hover:shadow-md focus:shadow-md text-center text-2xl tracking-widest`}
                      value={otp}
                      onChange={handleOtpChange}
                    />
                  </div>
                  {errors.otp && (
                    <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="relative w-full py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#1b4965] hover:bg-[#163a52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b4965] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <RiShieldCheckLine className="mr-2 h-5 w-5" />
                      Verify Code
                    </div>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={isLoading}
                    className="text-[#1b4965] hover:text-[#163a52] font-medium text-sm flex items-center justify-center mx-auto"
                  >
                    <RiRefreshLine className="mr-1 h-4 w-4" />
                    Resend Code
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: New Password */}
            {currentStep === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-6">
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiLockLine className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter new password"
                      aria-label="New password"
                      aria-required="true"
                      className={`pl-10 w-full px-4 py-2.5 sm:py-3 border ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] hover:border-[#1b4965] transition-all hover:shadow-md focus:shadow-md pr-10`}
                      value={password}
                      onChange={handlePasswordChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <div className="relative w-5 h-5">
                        <RiEyeOffLine 
                          className={`h-5 w-5 absolute transition-opacity duration-200 ${showPassword ? 'opacity-100' : 'opacity-0'}`} 
                        />
                        <RiEyeLine 
                          className={`h-5 w-5 absolute transition-opacity duration-200 ${showPassword ? 'opacity-0' : 'opacity-100'}`} 
                        />
                      </div>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="relative">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiLockLine className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Confirm new password"
                      aria-label="Confirm new password"
                      aria-required="true"
                      className={`pl-10 w-full px-4 py-2.5 sm:py-3 border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] hover:border-[#1b4965] transition-all hover:shadow-md focus:shadow-md pr-10`}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-700"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      <div className="relative w-5 h-5">
                        <RiEyeOffLine 
                          className={`h-5 w-5 absolute transition-opacity duration-200 ${showConfirmPassword ? 'opacity-100' : 'opacity-0'}`} 
                        />
                        <RiEyeLine 
                          className={`h-5 w-5 absolute transition-opacity duration-200 ${showConfirmPassword ? 'opacity-0' : 'opacity-100'}`} 
                        />
                      </div>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#1b4965] hover:bg-[#163a52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b4965] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting password...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <RiLockLine className="mr-2 h-5 w-5" />
                      Reset Password
                    </div>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Remember your password?</span>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  href={Routes.LOGIN}
                  className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-[#1b4965] rounded-lg shadow-sm bg-white text-[#1b4965] hover:bg-[#f3f8ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b4965] transition-all"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
