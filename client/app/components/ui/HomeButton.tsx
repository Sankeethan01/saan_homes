'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { RiHome5Line } from 'react-icons/ri';

export default function HomeButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <Link href="/">
        <motion.div
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 bg-gradient-to-r bg-[#1b4965] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer"
        >
          <RiHome5Line className="text-white text-2xl" />
        </motion.div>
      </Link>
    </motion.div>
  );
}
