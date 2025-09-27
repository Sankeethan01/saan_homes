'use client';

import { motion } from 'framer-motion';

export default function AuthLoader() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        {/* Logo animation with pulse effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 relative"
        >
          <img 
            src="/assets/logo.jpg" 
            alt="SAAN Homes Logo" 
            className="h-16 w-auto relative z-10"
          />
          <motion.div 
            className="absolute inset-0 rounded-full bg-primary-100"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        {/* Loading bar with animated gradient */}
        <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: '30%' }}
            animate={{ 
              width: ['30%', '70%', '100%'],
              x: ['-80%', '0%', '0%']
            }}
            transition={{ 
              duration: 2.5, 
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop"
            }}
            className="h-full bg-gradient-to-r from-blue-400 via-primary-600 to-blue-500 relative"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ opacity: 0.3 }}
            />
          </motion.div>
        </div>
        
        {/* Animated dots */}
        <div className="flex items-center justify-center mt-4">
          <motion.p className="text-gray-700 font-medium">
            Verifying authentication
          </motion.p>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
            className="text-primary-600 ml-1"
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", delay: 0.2 }}
            className="text-primary-600"
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", delay: 0.4 }}
            className="text-primary-600"
          >
            .
          </motion.span>
        </div>
      </div>
    </div>
  );
}
