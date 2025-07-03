"use client";

import { motion } from "framer-motion";
import { RiArrowLeftLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import ContactForm from "./_components/ContactForm";
import ContactItems from "./_components/ContactItems";
import HomeButton from "@/app/components/ui/HomeButton";

export default function RentalContact() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <motion.main 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section */}
      <section className="relative h-[20vh] bg-[#1b4965] overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full" />
          <div className="absolute top-20 right-20 w-16 h-16 border border-white/20 rounded-full" />
          <div className="absolute bottom-10 left-1/4 w-12 h-12 border border-white/20 rounded-full" />
          <div className="absolute bottom-20 right-1/3 w-24 h-24 border border-white/20 rounded-full" />
        </motion.div>
        
        <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center"
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
            >
              Rental Inquiry
            </motion.h1>
            <motion.p 
              className="text-xl text-white/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Get in touch about your equipment rental needs
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <ContactItems />

      {/* Contact Form */}
      <ContactForm />

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5, type: "spring" }}
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleGoBack}
        className="fixed bottom-8 left-8 z-50 w-12 h-12 bg-[#1b4965] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <RiArrowLeftLine className="text-white text-2xl" />
      </motion.button>

      {/* Home Icon */}
      <HomeButton />
    </motion.main>
  );
}
