"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { 
  RiLockLine, 
  RiCheckLine, 
  RiArrowLeftLine, 
  RiLoader4Line, 
  RiVisaLine, 
  RiMastercardLine, 
  RiSecurePaymentLine,
  RiShieldCheckLine
} from "react-icons/ri";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

export default function PayNowPage() {
  const token = useAuthStore(state => state.token);
  const clear = useAuthStore(state => state.clear);
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardName: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvv: ""
  });
  const [errors, setErrors] = useState({
    cardName: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvv: ""
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    // Check if token exists and redirect if not
    if (!token) {
      router.push("/dashboard/login");
      return;
    }

    // Validate booking ID
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
        toast.error("Could not load booking details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [token, bookingId, router]);

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add space after every 4 digits
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += digits[i];
    }
    
    return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      setCardDetails({
        ...cardDetails,
        cardNumber: formatCardNumber(value)
      });
    } else {
      setCardDetails({
        ...cardDetails,
        [name]: value
      });
    }
    
    // Clear error when user types
    setErrors({
      ...errors,
      [name]: ""
    });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    // Card name validation
    if (!cardDetails.cardName.trim()) {
      newErrors.cardName = "Cardholder name is required";
      valid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(cardDetails.cardName)) {
      newErrors.cardName = "Name should contain only letters";
      valid = false;
    }
    
    // Card number validation
    const cardNumberDigits = cardDetails.cardNumber.replace(/\s/g, '');
    if (!cardNumberDigits) {
      newErrors.cardNumber = "Card number is required";
      valid = false;
    } else if (cardNumberDigits.length < 16) {
      newErrors.cardNumber = "Card number should be 16 digits";
      valid = false;
    } else if (!/^\d+$/.test(cardNumberDigits)) {
      newErrors.cardNumber = "Card number should contain only digits";
      valid = false;
    }
    
    // Expiration date validation
    if (!cardDetails.expMonth) {
      newErrors.expMonth = "Required";
      valid = false;
    }
    
    if (!cardDetails.expYear) {
      newErrors.expYear = "Required";
      valid = false;
    }
    
    // CVV validation
    if (!cardDetails.cvv) {
      newErrors.cvv = "Required";
      valid = false;
    } else if (!/^\d{3}$/.test(cardDetails.cvv)) {
      newErrors.cvv = "CVV must be 3 digits";
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!bookingId) {
      toast.error("Booking ID not found.");
      return;
    }

    if (!token) {
      toast.error("Please login to continue");
      router.push("/dashboard/login");
      return;
    }

    setSubmitting(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      const res = await fetch(`${API_BASE_URL}/equipments/bookings/${bookingId}/pay/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          card_name: cardDetails.cardName,
          card_number: cardDetails.cardNumber.replace(/\s/g, ''),
          exp_month: cardDetails.expMonth,
          exp_year: cardDetails.expYear,
          cvv: cardDetails.cvv
        }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Clear the token and redirect to login
          clear();
          toast.error('Session expired. Please log in again.');
          router.push('/dashboard/login');
          return;
        }

        const errorData = await res.json();
        throw new Error(errorData.error || "Payment failed");
      }

      // Show success message
      toast.success('Payment successful!');
      
      // Redirect to success page or back to rentals
      setTimeout(() => {
        router.push("/dashboard/me/rentals?payment=success");
      }, 2000); // Wait 2 seconds for toast to show before redirecting
      
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-[#1b4965] mb-6 hover:underline"
        >
          <RiArrowLeftLine className="mr-1" /> Back to terms
        </button>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#1b4965] text-white p-6">
            <h1 className="text-2xl font-bold">Payment Details</h1>
            <p className="text-blue-100 mt-1">Complete your payment securely</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Payment Form */}
            <div className="col-span-2 p-6 border-r border-gray-200">
              <form onSubmit={handlePayment}>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 text-sm font-medium" htmlFor="cardName">
                      Cardholder Name
                    </label>
                    {errors.cardName && (
                      <span className="text-red-600 text-xs">{errors.cardName}</span>
                    )}
                  </div>
                  <input
                    id="cardName"
                    name="cardName"
                    type="text"
                    value={cardDetails.cardName}
                    onChange={handleInputChange}
                    placeholder="John Smith"
                    className={`w-full border ${errors.cardName ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1b4965] text-base`}
                  />
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 text-sm font-medium" htmlFor="cardNumber">
                      Card Number
                    </label>
                    {errors.cardNumber && (
                      <span className="text-red-600 text-xs">{errors.cardNumber}</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={handleInputChange}
                      placeholder="4111 1111 1111 1111"
                      className={`w-full border ${errors.cardNumber ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1b4965] text-base`}
                      maxLength={19}
                    />
                    <div className="absolute right-3 top-3 flex gap-2">
                      <RiVisaLine className="text-blue-800 text-2xl" />
                      <RiMastercardLine className="text-red-600 text-2xl" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-700 text-sm font-medium">
                        Expiration Date
                      </label>
                      {(errors.expMonth || errors.expYear) && (
                        <span className="text-red-600 text-xs">Required</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select
                        name="expMonth"
                        className={`border ${errors.expMonth ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#1b4965] text-base flex-1`}
                        value={cardDetails.expMonth}
                        onChange={handleInputChange}
                        aria-label="Expiration month"
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={String(month).padStart(2, '0')}>
                            {String(month).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <select
                        name="expYear"
                        className={`border ${errors.expYear ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#1b4965] text-base flex-1`}
                        value={cardDetails.expYear}
                        onChange={handleInputChange}
                        aria-label="Expiration year"
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-700 text-sm font-medium" htmlFor="cvv">
                        CVV
                      </label>
                      {errors.cvv && (
                        <span className="text-red-600 text-xs">{errors.cvv}</span>
                      )}
                    </div>
                    <input
                      id="cvv"
                      name="cvv"
                      type="password"
                      value={cardDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className={`w-full border ${errors.cvv ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1b4965] text-base`}
                      maxLength={3}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                  <RiLockLine className="text-green-600" />
                  <span>Your payment information is encrypted and secure</span>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-4 bg-[#1b4965] text-white font-semibold rounded-lg shadow hover:bg-[#0d3b59] transition-colors text-base flex items-center justify-center gap-2 disabled:bg-gray-400"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <RiLoader4Line className="animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      Complete Payment
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Order Summary */}
            <div className="bg-gray-50 p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              {booking && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={booking.equipment_image || '/assets/images/equipments/excavator.jpeg'}
                        alt={booking.equipment_name || 'Equipment'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{booking.equipment_name}</h4>
                      <p className="text-sm text-gray-500">
                        {booking.duration} day{booking.duration > 1 ? 's' : ''} rental
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCurrency(booking.total_cost)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Security Deposit</span>
                      <span>{formatCurrency(booking.total_cost * 0.2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-4">
                      <span>Total</span>
                      <span className="text-[#1b4965]">{formatCurrency(booking.total_cost)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                    <RiShieldCheckLine className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-800">
                      Your booking will be confirmed immediately after successful payment. You can manage all your rentals from your dashboard.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 p-4 flex items-center justify-center gap-6 text-gray-500 text-sm">
            <div className="flex items-center gap-1">
              <RiSecurePaymentLine />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1">
              <RiLockLine />
              <span>Encrypted Data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}