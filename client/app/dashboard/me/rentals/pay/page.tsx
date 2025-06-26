"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";

export default function PaymentTermsPage() {
  const token = useAuthStore((s) => s.token);
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  const conditions = [
    {
      title: "Login Required",
      description: "You must be logged in to book equipment.",
      icon: "🔐",
    },
    {
      title: "Security Deposit",
      description: "A security deposit of 20% is required for all rentals.",
      icon: "💰",
    },
    {
      title: "Valid Documentation",
      description: "Must provide valid ID and proof of insurance.",
      icon: "📄",
    },
    {
      title: "Minimum Rental Period",
      description: "Minimum rental period is 24 hours.",
      icon: "⏰",
    },
    {
      title: "Damage Policy",
      description: "Renter is responsible for any damage beyond normal wear.",
      icon: "🛡️",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Terms & Conditions for Payment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {conditions.map((condition, index) => (
            <motion.div
              key={condition.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-100 p-6 rounded-xl shadow"
            >
              <div className="text-4xl mb-4">{condition.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{condition.title}</h3>
              <p className="text-gray-600 text-sm">{condition.description}</p>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center mb-6">
          <input
            id="accept-terms"
            type="checkbox"
            checked={accepted}
            onChange={() => setAccepted((prev) => !prev)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-3"
            required
          />
          <label htmlFor="accept-terms" className="text-gray-700 text-base select-none cursor-pointer">
            I accept the <span className="font-semibold">terms and conditions</span>
          </label>
        </div>
        {accepted && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-lg"
            onClick={() => {
              if (bookingId) {
                router.push(`/dashboard/me/rentals/pay/pay-now?bookingId=${bookingId}`);
              } else {
                alert('Booking ID not found.');
              }
            }}
          >
            Continue to Pay
          </motion.button>
        )}
        {!accepted && (
          <button
            className="w-full py-3 px-6 bg-gray-300 text-gray-500 font-semibold rounded-lg shadow text-lg cursor-not-allowed mt-0"
            disabled
          >
            Continue to Pay
          </button>
        )}
      </div>
    </div>
  );
}
