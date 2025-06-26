// app/dashboard/(auth)/login-user
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/app/stores/useAuthStore";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";

export default function UserLogin() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken); 
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // 1) Obtain tokens
      const loginRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        toast.error(loginData.detail || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      const access = loginData.access;

      // 2) Verify role by fetching the profile
      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/me/`,
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );
      if (!profileRes.ok) {
        toast.error("Could not verify user profile");
        setIsLoading(false);
        return;
      }
      const profile = await profileRes.json();

      // Allow ADMIN and SUPERVISOR roles
      if (!["ADMIN", "SUPERVISOR"].includes(profile.role)) {
        toast.error("Only admin and supervisor users may log in here");
        setIsLoading(false);
        return;
      }

      // 3) Save tokens under consistent keys
      setToken(access);

      // 4) Set a cookie in browser also
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = `path=/; sameSite=strict; max-age=${rememberMe ? 2592000 : 3600}${isProduction ? '; secure' : ''}`;
      document.cookie = `access_token=${access}; ${cookieOptions}`;
      document.cookie = `user_role=${profile.role}; ${cookieOptions}`;

      toast.success("Login successful!");
      setTimeout(() => {
        router.push("/dashboard/admin");
      }, 500);
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left side - Login form */}
      <div className="w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Image 
              src="/assets/logo.jpg"
              alt="Logo"
              width={150}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          {/* Welcome text */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600 mb-8">Please enter your details</p>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="text"
                name="username"
                required
                placeholder="Enter your email"
                title="Email address field"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                placeholder="Enter your password"
                title="Password field"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember for 30 days
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-500">
                Forgot password
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#1b4965] hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center justify-center gap-2"
            >
              <FcGoogle className="w-5 h-5" />
              Sign in with Google
            </button>

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-purple-600 hover:text-purple-500 font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div 
        className="hidden lg:block w-1/2 bg-white bg-no-repeat bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("/assets/images/3.png")'
        }}
      />
      
      <Toaster position="top-right" />
    </div>
  );
}
