"use client";

import { motion } from "framer-motion";
import ContactForm from "./_components/ContactForm";
import ContactItems from "./_components/ContactItems";
import HomeButton from "@/app/components/ui/HomeButton";

export default function RentalContact() {

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gradient-to-br from-blue-600 to-red-700">
        <div className="absolute inset-0 bg-black/30" />
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center z-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-white/90">
              Get in touch about your equipment rental needs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <ContactItems />

      {/* Contact Form */}
      <ContactForm />

      {/* Home Icon */}
      <HomeButton />
    </main>
  );
}
