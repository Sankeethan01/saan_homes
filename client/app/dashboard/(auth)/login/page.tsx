"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { setAuthCookies } from "@/app/utils/auth";
import { RiLockLine, RiMailLine, RiLoginBoxLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { Routes } from "@/app/constants/Routes/Routes";
import { UserRoles } from "@/app/constants/UserRoles/UserRols";

export default function Login() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const setUserRole = useAuthStore((s) => s.setUserRole);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRememberMe(checked);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Logging in...");
    
    try {
      // 1) Obtain tokens
      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token/`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(formData),
          mode: "cors",
          credentials: "include", // Include cookies in the request
        }
      );
      
      if (!loginRes.ok) {
        const errorData = await loginRes.json();
        throw new Error(errorData.detail || "Invalid credentials");
      }
      
      const loginData = await loginRes.json();
      const access = loginData.access;

      if (!access) {
        throw new Error("No access token received");
      }

      // 2) Verify role by fetching the profile
      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/me/`,
        {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${access}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          mode: "cors",
          credentials: "include", // Include cookies in the request
        }
      );
      
      if (!profileRes.ok) {
        throw new Error("Could not verify user profile");
      }
      
      const profile = await profileRes.json();
      const userRole = profile.role;

      if (!userRole) {
        throw new Error("User role not found");
      }

      // 3) Save tokens and user data in Zustand store
      setToken(access);
      setUserRole(userRole);
      
      // 4) Save tokens and user data in localStorage for redundancy
      localStorage.setItem('username', profile.username);
      
      // 5) Set cookies with proper expiration
      setAuthCookies(access, userRole, rememberMe);

      // 6) Show success message and redirect based on role
      toast.success(`Welcome back, ${profile.username}!`);
      toast.dismiss(loadingToast);
      
      // Delay redirect slightly to ensure cookies are set
      setTimeout(() => {
        if (userRole === UserRoles.ADMIN) {
          router.push(Routes.ADMIN);
        } else if (userRole === UserRoles.SUPERVISOR) {
          router.push(Routes.SUPERVISOR);
        } else {
          router.push(Routes.USER);
        }
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : "Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex flex-col bg-white">
        {/* Logo section */}
        <div className="p-8">
          <Image 
            src="/assets/logo.jpg"
            alt="SAAN Homes Logo"
            width={120}
            height={40}
            className="h-12 w-auto object-contain"
          />
        </div>
        
        {/* Form section */}
        <div className="flex-grow flex items-center justify-center px-8 pb-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
              <p className="text-gray-600">Sign in to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RiMailLine className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    required
                    placeholder="Enter your username"
                    aria-label="Username"
                    aria-required="true"
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Enter your password"
                    aria-label="Password"
                    aria-required="true"
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10"
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    checked={rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="Remember me for 30 days"

                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                    Remember for 30 days
                  </label>
                </div>
                <Link href={Routes.FORGOT_PASSWORD} className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label="Sign in"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <RiLoginBoxLine className="mr-2 h-5 w-5" />
                    Sign in
                  </div>
                )}
              </button>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Don&apos;t have an account?</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link 
                    href={Routes.REGISTER} 
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden bg-white">
        <div className="flex items-center justify-center h-full">
          <Image
            src="/assets/images/3.png"
            alt="Login illustration"
            width={1000}
            height={800}
            style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
            priority
            className="h-auto w-auto"
          />
        </div>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}
