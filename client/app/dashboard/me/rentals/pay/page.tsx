"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { 
  RiShieldCheckLine, 
  RiLockLine, 
  RiTimeLine, 
  RiFileTextLine, 
  RiMoneyDollarCircleLine,
  RiArrowRightLine
} from "react-icons/ri";
import Image from "next/image";

interface Booking {
  id: string;
  equipment_name: string;
  equipment_image?: string;
  start_date: string;
  end_date: string;
  duration: number;
  total_cost: number;
  status?: string;
}

export default function PaymentTermsPage() {
  const token = useAuthStore((s) => s.token);
  const [accepted, setAccepted] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    if (!token) {
      router.push("/dashboard/login");
      return;
    }

    if (!bookingId) {
      router.push("/dashboard/me/rentals");
      return;
    }

    // Fetch booking details
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        
        const response = await fetch(`${API_BASE_URL}/equipments/bookings/${bookingId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        
        const data = await response.json();
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [token, bookingId, router]);

  const conditions = [
    {
      title: "Secure Payment",
      description: "Your payment information is encrypted and secure.",
      icon: <RiLockLine className="text-3xl text-[#1b4965]" />
    },
    {
      title: "Security Deposit",
      description: "A security deposit of 20% is required for all rentals.",
      icon: <RiMoneyDollarCircleLine className="text-3xl text-[#1b4965]" />
    },
    {
      title: "Required Documentation",
      description: "Valid ID and proof of insurance must be presented at pickup.",
      icon: <RiFileTextLine className="text-3xl text-[#1b4965]" />
    },
    {
      title: "Rental Period",
      description: "Charges apply for the full rental period regardless of early returns.",
      icon: <RiTimeLine className="text-3xl text-[#1b4965]" />
    },
    {
      title: "Damage Policy",
      description: "Renter is responsible for any damage beyond normal wear and tear.",
      icon: <RiShieldCheckLine className="text-3xl text-[#1b4965]" />
    },
  ];

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'LKR 0.00';
    }
    return `LKR ${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1b4965] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#1b4965] text-white p-6">
            <h1 className="text-2xl font-bold">Complete Your Booking</h1>
            <p className="text-blue-100 mt-1">Review terms and proceed to payment</p>
          </div>
          
          {booking && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={booking.equipment_image || '/assets/images/equipments/excavator.jpeg'}
                    alt={booking.equipment_name || 'Equipment'}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{booking.equipment_name}</h2>
                  <p className="text-sm text-gray-500 mb-4">Booking #{booking.id.substring(0, 8)}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Rental Period</p>
                      <p className="text-sm font-medium">
                        {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-medium">
                        {booking.duration} day{booking.duration > 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="text-lg font-bold text-[#1b4965]">
                        {formatCurrency(booking.total_cost)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Rental Terms & Conditions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {conditions.map((condition, index) => (
                <motion.div
                  key={condition.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {condition.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{condition.title}</h4>
                    <p className="text-sm text-gray-600">{condition.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center mb-6">
                <input
                  id="accept-terms"
                  type="checkbox"
                  checked={accepted}
                  onChange={() => setAccepted((prev) => !prev)}
                  className="w-5 h-5 text-[#1b4965] bg-gray-100 border-gray-300 rounded focus:ring-[#1b4965] focus:ring-2 mr-3"
                />
                <label htmlFor="accept-terms" className="text-gray-700 select-none cursor-pointer">
                  I accept the <span className="font-semibold">terms and conditions</span> for this equipment rental
                </label>
              </div>
              
              {accepted ? (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full py-4 px-6 bg-[#1b4965] text-white font-semibold rounded-lg shadow hover:bg-[#0d3b59] transition-colors text-base flex items-center justify-center gap-2"
                  onClick={() => {
                    if (bookingId) {
                      router.push(`/dashboard/me/rentals/pay/pay-now?bookingId=${bookingId}`);
                    }
                  }}
                >
                  Continue to Payment
                  <RiArrowRightLine />
                </motion.button>
              ) : (
                <button
                  className="w-full py-4 px-6 bg-gray-300 text-gray-500 font-semibold rounded-lg shadow text-base cursor-not-allowed"
                  disabled
                >
                  Continue to Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
