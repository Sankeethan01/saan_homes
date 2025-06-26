'use client';

import { useAuthStore } from '@/app/stores/useAuthStore';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

type UserRole = 'admin' | 'supervisor';

export default function Login() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const setToken = useAuthStore((s) => s.setToken);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    const loadingToast = toast.loading(`Logging in as ${selectedRole}...`);
    setIsLoading(true);

    try {
      // Step 1: Login and get token
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
        throw new Error(loginData.detail || "Invalid credentials");
      }

      const access = loginData.access;
      setToken(access);

      // Step 2: Get user profile
      const profileRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/users/me/`,
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );
      
      if (!profileRes.ok) {
        throw new Error("Could not verify user profile");
      }
      
      const profile = await profileRes.json();
      localStorage.setItem('username', profile.username);
      localStorage.setItem('user_role', profile.role); 
      const uiSelectedRole = selectedRole.toUpperCase();

      // Step 3: Verify role and redirect
      if (profile.role === "ADMIN" && uiSelectedRole === "ADMIN") {
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = `path=/; sameSite=strict; max-age=3600${isProduction ? '; secure' : ''}`;
        document.cookie = `access_token=${access}; ${cookieOptions}`;
        document.cookie = `user_role=${profile.role}; ${cookieOptions}`;
        toast.success("Welcome back, Admin! 👋", {
          duration: 3000,
          icon: '🔐'
        });
        router.push("/dashboard/admin");
      } else if (profile.role === "SUPERVISOR" && uiSelectedRole === "SUPERVISOR") {
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = `path=/; sameSite=strict; max-age=3600${isProduction ? '; secure' : ''}`;
        document.cookie = `access_token=${access}; ${cookieOptions}`;
        document.cookie = `user_role=${profile.role}; ${cookieOptions}`;
        toast.success("Welcome back, Site Supervisor! 👋", {
          duration: 3000,
          icon: '🔐'
        });
        router.push("/dashboard/supervisor");
      } else {
        throw new Error(`Access denied. Your account does not have ${selectedRole} privileges.`);
      }
    } catch (err) {
      console.error(err);
      setToken(null);
      toast.error(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-lg shadow-lg"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-700">
            SAAN HOMES
          </h1>
          <p className="text-gray-600 mt-2">Construction Management System</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 p-1 bg-gray-100 rounded-lg"
          >
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setSelectedRole('admin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } ${
                selectedRole === 'admin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setSelectedRole('supervisor')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                selectedRole === 'supervisor'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Site Supervisor
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              disabled={isLoading}
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder={`Enter ${selectedRole === 'admin' ? 'admin' : 'supervisor'} username`}
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              disabled={isLoading}
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              placeholder="Enter your password"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="pt-4"
          >
            <button
              disabled={isLoading}
              type="submit"
              className={`w-full bg-gradient-to-r from-blue-600 to-red-700 text-white py-2 px-4 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isLoading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:opacity-90'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                `Login as ${selectedRole === 'admin' ? 'Admin' : 'Site Supervisor'}`
              )}
            </button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-sm"
        >
          <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
            Forgot your password?
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
