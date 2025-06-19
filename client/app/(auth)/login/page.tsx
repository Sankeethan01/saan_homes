'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import React from 'react';

const gradientAnimation = {
  background: {
    background: [
      'linear-gradient(135deg, #2563eb 0%, #f43f5e 100%)',
      'linear-gradient(135deg, #f43f5e 0%, #2563eb 100%)',
      'linear-gradient(135deg, #2563eb 0%, #f43f5e 100%)',
    ],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, when: 'beforeChildren', staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login attempt with:', { email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-red-400 to-blue-900 relative overflow-hidden">
      {/* Floating/Parallax Orbs */}
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-blue-500 rounded-full filter blur-3xl opacity-30 z-0"
        animate={{
          y: [0, 30, 0, -20, 0],
          x: [0, 20, 40, 20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-red-500 rounded-full filter blur-3xl opacity-30 z-0"
        animate={{
          y: [0, -25, 0, 25, 0],
          x: [0, -20, -40, -20, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="flex w-full max-w-4xl shadow-2xl rounded-3xl overflow-hidden bg-white/10 backdrop-blur-lg"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side with animated gradient */}
        <motion.div
          className="hidden md:flex flex-col items-center justify-center w-1/2 p-10 relative"
          variants={itemVariants}
          animate="visible"
          initial="hidden"
          style={{ minHeight: '500px' }}
        >
          <motion.div
            className="absolute inset-0 rounded-3xl"
            variants={itemVariants}
            initial="hidden"
            style={{ zIndex: 1 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            animate={gradientAnimation.background}
          />
          <div className="absolute inset-0 bg-black/20 rounded-3xl z-10" />
          <div className="relative z-20 flex flex-col items-center">
            <motion.div className="bg-white/30 rounded-full p-6 mb-6 shadow-lg backdrop-blur-xl" variants={itemVariants}>
              <svg width="60" height="60" fill="none" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#fff" fillOpacity="0.2"/><circle cx="30" cy="30" r="18" fill="#fff" fillOpacity="0.4"/></svg>
            </motion.div>
            <motion.h2 className="text-white text-2xl font-bold mb-2 drop-shadow-lg" variants={itemVariants}>Welcome Back!</motion.h2>
            <motion.p className="text-white/80 text-center max-w-xs" variants={itemVariants}>Join the community and explore new opportunities.</motion.p>
          </div>
        </motion.div>
        {/* Right Side (Login Form) */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white/80 backdrop-blur-2xl"
          variants={itemVariants}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="w-full max-w-sm space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 className="text-2xl font-bold text-gray-900 mb-2 text-center" variants={itemVariants}>Sign in to your account</motion.h2>
            <motion.div className="space-y-4" variants={itemVariants}>
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white/80"
                required
                variants={itemVariants}
              />
              <motion.input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white/80"
                required
                variants={itemVariants}
              />
            </motion.div>
            <motion.div className="flex justify-between items-center text-sm" variants={itemVariants}>
              <span></span>
              <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
            </motion.div>
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-red-500 text-white py-3 rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-red-600 transition"
              variants={itemVariants}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue
            </motion.button>
            <div className="text-center text-sm text-gray-500 mt-4">
              Don&apos;t have an account? <a href="#" className="text-blue-600 hover:underline">Sign up</a>
            </div>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
}
