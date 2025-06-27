'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { RiUserLine, RiMailLine, RiLockLine, RiUserAddLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { Routes } from '@/app/constants/Routes/Routes';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else {
      // Check password length
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
        isValid = false;
      }
      
      // Check if password is not entirely numeric
      if (/^\d+$/.test(formData.password)) {
        newErrors.password = 'Password cannot be entirely numeric';
        isValid = false;
      }
      
      // Check for password complexity
      const hasLetter = /[a-zA-Z]/.test(formData.password);
      const hasNumber = /\d/.test(formData.password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      
      if (!(hasLetter && hasNumber) && !hasSpecialChar) {
        newErrors.password = 'Password must contain at least one letter and one number, or include special characters';
        isValid = false;
      }

      // Check for common passwords
      const commonPasswords = ['password', '12345678', '87654321', 'qwerty123', '11111111'];
      if (commonPasswords.includes(formData.password.toLowerCase())) {
        newErrors.password = 'This password is too common. Please choose a stronger password';
        isValid = false;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Creating your account...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.confirmPassword
        }),
        mode: "cors",
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success('Registration successful!');
        setTimeout(() => {
          router.push(Routes.LOGIN);
        }, 1500);
      } else {
        toast.dismiss(loadingToast);
        // Handle specific backend validation errors
        if (data.username) {
          setErrors(prev => ({
            ...prev,
            username: Array.isArray(data.username) ? data.username[0] : data.username
          }));
        }
        if (data.email) {
          setErrors(prev => ({
            ...prev,
            email: Array.isArray(data.email) ? data.email[0] : data.email
          }));
        }
        if (data.password) {
          setErrors(prev => ({
            ...prev,
            password: Array.isArray(data.password) ? data.password[0] : data.password
          }));
        }
        if (data.password2) {
          setErrors(prev => ({
            ...prev,
            confirmPassword: Array.isArray(data.password2) ? data.password2[0] : data.password2
          }));
        }
        toast.error('Registration failed. Please check the form for errors.');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Registration error:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-start overflow-hidden">
      {/* Background gradient image */}
      <div className="absolute inset-0 w-full h-full bg-[url('/assets/images/bg_register.png')] bg-cover bg-center z-0" />
      {/* Register form on left */}
      <div className="w-full md:w-2/3 flex flex-col relative z-10 mt-5 -ml-30">
        <div className="flex-grow flex items-center justify-start px-10 pb-8 mt-5">
          <div className="w-full max-w-lg mx-auto my-8 p-10 shadow-lg bg-white/60 rounded-xl">
            <div className="text-center mb-3">
              <h1 className="text-3xl font-bold text-[#1b4965] mb-1">Create an account</h1>
              <p className="text-gray-600 mb-2">Join SAAN Homes to get started</p>
              <div className="flex justify-center mb-2">
                <Image
                  src="/assets/logo.jpg"
                  alt="SAAN Homes Logo"
                  width={70}
                  height={45}
                  className="h-auto w-auto object-contain"
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="relative">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RiUserLine className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Choose a username"
                    aria-label="Username"
                    aria-required="true"
                    className={`pl-10 w-full px-4 py-3 border ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] hover:border-[#1b4965] transition-all hover:shadow-md focus:shadow-md`}
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RiMailLine className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    aria-label="Email address"
                    aria-required="true"
                    className={`pl-10 w-full px-4 py-3 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] hover:border-[#1b4965] transition-all hover:shadow-md focus:shadow-md`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RiLockLine className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Create a strong password"
                    aria-label="Password"
                    aria-required="true"
                    className={`pl-10 w-full px-4 py-3 border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] hover:border-[#1b4965] transition-all hover:shadow-md focus:shadow-md pr-10`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <div className="relative w-5 h-5">
                      <RiEyeOffLine 
                        className={`h-5 w-5 absolute transition-opacity duration-200 ${showPassword ? 'opacity-100' : 'opacity-0'}`} 
                        aria-hidden="true" 
                      />
                      <RiEyeLine 
                        className={`h-5 w-5 absolute transition-opacity duration-200 ${showPassword ? 'opacity-0' : 'opacity-100'}`} 
                        aria-hidden="true" 
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
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RiLockLine className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirm your password"
                    aria-label="Confirm password"
                    aria-required="true"
                    className={`pl-10 w-full px-4 py-3 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] hover:border-[#1b4965] transition-all hover:shadow-md focus:shadow-md pr-10`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    <div className="relative w-5 h-5">
                      <RiEyeOffLine 
                        className={`h-5 w-5 absolute transition-opacity duration-200 ${showConfirmPassword ? 'opacity-100' : 'opacity-0'}`} 
                        aria-hidden="true" 
                      />
                      <RiEyeLine 
                        className={`h-5 w-5 absolute transition-opacity duration-200 ${showConfirmPassword ? 'opacity-0' : 'opacity-100'}`} 
                        aria-hidden="true" 
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
                className="relative w-full py-3 px-4 mt-6 border border-transparent rounded-lg shadow-sm text-white bg-[#1b4965] hover:bg-[#163a52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b4965] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label="Create account"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <RiUserAddLine className="mr-2 h-5 w-5" />
                    Create Account
                  </div>
                )}
              </button>

              <div className="mt-3">
                <div className="relative mb-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>
                <div className="mt-2">
                  <Link 
                    href={Routes.LOGIN}
                    className="w-full flex justify-center py-2 px-4 border border-[#1b4965] rounded-lg shadow-sm bg-white text-[#1b4965] hover:bg-[#f3f8ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b4965] transition-all"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}
