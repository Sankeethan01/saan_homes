"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { RiUser3Line, RiArrowLeftLine, RiShieldCheckLine } from "react-icons/ri";
import { Routes } from "@/app/constants/Routes/Routes";

export default function ForgotPassword() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const validateUsername = (username: string) => {
    if (!username.trim()) {
      return 'Username is required';
    }
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    return null;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Sending verification code...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username: username.trim() }),
        mode: "cors",
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('Verification code sent to your email!');
        setOtpSent(true);
        setUserEmail(data.email || 'your registered email');
        setError("");
        // Redirect to reset password page with username parameter
        setTimeout(() => {
          router.push(`${Routes.RESET_PASSWORD}?username=${encodeURIComponent(username.trim())}`);
        }, 1500);
      } else {
        toast.dismiss(loadingToast);
        setError(data.error || 'Failed to send verification code');
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Send OTP error:', error);
      setError('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) {
      setError("");
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-end overflow-hidden">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.push(Routes.LOGIN)}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-[#1b4965] hover:bg-[#163a52] rounded-full shadow transition-all border-2 border-white focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
        aria-label="Go back"
      >
        <RiArrowLeftLine className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </button>

      {/* Background gradient image */}
      <div className="absolute inset-0 w-full h-full bg-[url('/assets/images/bg_login.png')] bg-cover bg-center z-0" />

      {/* Forgot password form */}
      <div className="w-full md:w-2/3 flex flex-col relative z-10 ml-0 sm:ml-20 md:ml-200 mt-5 sm:mt-10">
        <div className="flex-grow flex items-center justify-center sm:justify-end px-4 sm:px-10 pb-8 mt-5">
          <div className="w-full max-w-md mx-auto my-4 sm:my-8 p-6 sm:p-8 shadow-lg bg-white/60 rounded-xl">
            <div className="text-center mb-6 sm:mb-10">
              <div className="p-2 bg-gradient-to-br from-[#e3f0ff] to-[#cbeafe] rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <RiShieldCheckLine className="text-[#1b4965] text-2xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1b4965] mb-2">
                {otpSent ? "Check Your Email" : "Forgot Password?"}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {otpSent 
                  ? `We've sent a verification code to ${userEmail}`
                  : "Enter your username and we'll send you a verification code to your registered email"
                }
              </p>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4 sm:space-y-6">
                <div className="relative">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <RiUser3Line className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      required
                      placeholder="Enter your username"
                      aria-label="Username"
                      aria-required="true"
                      className={`pl-10 w-full px-4 py-2.5 sm:py-3 border ${
                        error ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] hover:border-[#1b4965] transition-all hover:shadow-md focus:shadow-md`}
                      value={username}
                      onChange={handleUsernameChange}
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#1b4965] hover:bg-[#163a52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b4965] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  aria-label="Send verification code"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending code...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <RiUser3Line className="mr-2 h-5 w-5" />
                      Send Verification Code
                    </div>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    <strong>Verification code sent!</strong><br />
                    Please check your email and follow the instructions to reset your password.
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setUsername("");
                      setUserEmail("");
                    }}
                    className="text-[#1b4965] hover:text-[#163a52] font-medium"
                  >
                    try again
                  </button>
                </p>
              </div>
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
