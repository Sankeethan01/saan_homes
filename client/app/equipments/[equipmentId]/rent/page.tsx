"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  RiCalendarLine,
  RiCheckLine,
  RiArrowLeftLine,
  RiUserLine,
  RiPhoneLine,
  RiFileTextLine,
  RiShieldCheckLine,
  RiMapPinLine,
  RiTruckLine,
  RiAlertLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiIdCardLine,
} from "react-icons/ri";
import { useAuthStore } from "@/app/stores/useAuthStore";
import { fetchWithAuth } from "@/app/utils/auth";
import ChatBotRentalsPortfolio from "@/app/components/Portfolio/Rentals/ChatBot";

interface Equipment {
  id: string;
  name: string;
  description: string;
  category_name: string;
  image: string;
  pricing: {
    daily_rate: number;
    weekly_rate: number | null;
    monthly_rate: number | null;
    security_deposit: number;
    late_return_fee: number;
  };
  rental_requirements: {
    minimum_rental_period: number;
    maximum_rental_period: number;
    operator_license_required: boolean;
    training_required: boolean;
    age_restriction: number;
    insurance_required: boolean;
    delivery_available: boolean;
    delivery_radius: number;
    delivery_fee: number;
  };
  current_location: string;
  pickup_location: string;
}

interface BookingData {
  startDate: string;
  endDate: string;
  duration: number;
  notes: string;
  deliveryRequired: boolean;
  deliveryAddress: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  operatorLicense: string;
  insuranceProvider: string;
  projectDetails: string;
}

interface ExistingBooking {
  id: string;
  start_date: string;
  end_date: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED';
}

export default function RentEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [existingBookings, setExistingBookings] = useState<ExistingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    duration: parseInt(searchParams.get('duration') || '1'),
    notes: '',
    deliveryRequired: false,
    deliveryAddress: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
    operatorLicense: '',
    insuranceProvider: '',
    projectDetails: '',
  });

  // Check authentication on mount
  useEffect(() => {
    if (!token) {
      router.push(`/dashboard/login?returnUrl=/equipments/${params.equipmentId}/rent`);
      return;
    }
  }, [token, router, params.equipmentId]);

  // Fetch equipment details and existing bookings
  useEffect(() => {
    const fetchData = async () => {
      if (!params.equipmentId) return;
      
      try {
        setLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        
        // Fetch equipment details
        const equipmentResponse = await fetch(`${apiBaseUrl}/equipments/equipment/${params.equipmentId}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!equipmentResponse.ok) {
          throw new Error(`Failed to fetch equipment: ${equipmentResponse.statusText}`);
        }

        const equipmentData = await equipmentResponse.json();
        setEquipment(equipmentData);

        // Fetch existing bookings for this equipment to check availability
        try {
          const bookingsResponse = await fetch(`${apiBaseUrl}/equipments/equipment/${params.equipmentId}/bookings/`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            setExistingBookings(bookingsData);
          }
        } catch (bookingError) {
          console.warn('Could not fetch existing bookings:', bookingError);
          // Continue without booking data - availability check will be disabled
        }

      } catch (err) {
        console.error('Error fetching equipment:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch equipment data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.equipmentId]);

  // Check if a date range conflicts with existing bookings
  const isDateRangeAvailable = (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return !existingBookings.some(booking => {
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      
      // Check if ranges overlap
      return start <= bookingEnd && end >= bookingStart;
    });
  };

  const calculateTotalCost = () => {
    if (!equipment || !bookingData.duration) return 0;
    
    const { pricing } = equipment;
    let baseCost = 0;
    
    // Calculate based on most cost-effective option
    if (bookingData.duration >= 30 && pricing.monthly_rate) {
      const months = Math.floor(bookingData.duration / 30);
      const remainingDays = bookingData.duration % 30;
      baseCost = (months * pricing.monthly_rate) + (remainingDays * pricing.daily_rate);
    } else if (bookingData.duration >= 7 && pricing.weekly_rate) {
      const weeks = Math.floor(bookingData.duration / 7);
      const remainingDays = bookingData.duration % 7;
      baseCost = (weeks * pricing.weekly_rate) + (remainingDays * pricing.daily_rate);
    } else {
      baseCost = bookingData.duration * pricing.daily_rate;
    }

    // Add delivery fee if required
    if (bookingData.deliveryRequired && equipment.rental_requirements.delivery_available) {
      baseCost += equipment.rental_requirements.delivery_fee;
    }

    return baseCost;
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/assets/images/equipment.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    return `${apiBaseUrl}${imageUrl}`;
  };

  const handleSubmitBooking = async () => {
    if (!equipment || !token) return;

    // Validate required fields based on current step
    if (currentStep === 3) {
      // Validate emergency contact
      if (!bookingData.emergencyContact.name || !bookingData.emergencyContact.phone || !bookingData.emergencyContact.relationship) {
        setError('Please fill in all emergency contact fields');
        return;
      }

      // Validate operator license if required
      if (equipment.rental_requirements.operator_license_required && !bookingData.operatorLicense) {
        setError('Operator license is required for this equipment');
        return;
      }

      // Validate insurance if required
      if (equipment.rental_requirements.insurance_required && !bookingData.insuranceProvider) {
        setError('Insurance information is required for this equipment');
        return;
      }

      // Validate delivery address if delivery is required
      if (bookingData.deliveryRequired && !bookingData.deliveryAddress) {
        setError('Please provide a delivery address');
        return;
      }
    }

    // Check availability before submitting
    if (!isDateRangeAvailable(bookingData.startDate, bookingData.endDate)) {
      setError('Selected dates are not available. Please choose different dates.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      
      const bookingPayload = {
        equipment: params.equipmentId,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        notes: `${bookingData.notes}\n\nProject Details: ${bookingData.projectDetails}\n\nDelivery Required: ${bookingData.deliveryRequired ? 'Yes' : 'No'}${bookingData.deliveryRequired ? `\nDelivery Address: ${bookingData.deliveryAddress}` : ''}\n\nEmergency Contact: ${bookingData.emergencyContact.name} (${bookingData.emergencyContact.relationship}) - ${bookingData.emergencyContact.phone}${bookingData.operatorLicense ? `\nOperator License: ${bookingData.operatorLicense}` : ''}${bookingData.insuranceProvider ? `\nInsurance Provider: ${bookingData.insuranceProvider}` : ''}`,
      };

      // Use the fetchWithAuth utility to handle authentication properly
      const response = await fetchWithAuth(`${apiBaseUrl}/equipments/bookings/`, {
        method: 'POST',
        body: JSON.stringify(bookingPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to create booking');
      }

      const booking = await response.json();
      
      // Redirect to dashboard with success message
      router.push(`/dashboard/me/rentals?booking=${booking.id}&success=true`);
      
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Rental Details",
      icon: RiCalendarLine,
      description: "Confirm your rental period and requirements"
    },
    {
      title: "Project Information",
      icon: RiFileTextLine,
      description: "Tell us about your project needs"
    },
    {
      title: "Delivery & Pickup",
      icon: RiTruckLine,
      description: "Choose delivery options and location"
    },
    {
      title: "Safety & Compliance",
      icon: RiShieldCheckLine,
      description: "Provide required documentation and contacts"
    },
    {
      title: "Review & Confirm",
      icon: RiCheckLine,
      description: "Review all details before submitting"
    }
  ];

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RiLoader4Line className="text-6xl text-[#1b4965] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1b4965] mb-2">Redirecting to Login</h2>
          <p className="text-gray-600">Please wait while we redirect you to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RiLoader4Line className="text-6xl text-[#1b4965] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1b4965] mb-2">Loading Equipment Details</h2>
          <p className="text-gray-600">Please wait while we fetch the information...</p>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <RiErrorWarningLine className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Equipment Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The equipment you are looking for does not exist.'}</p>
          <Link href="/equipments">
            <button className="bg-[#1b4965] text-white px-6 py-3 rounded-lg hover:bg-[#0d3b59] transition-colors">
              Back to Equipment List
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <div className="fixed top-8 left-8 z-50">
        <Link href={`/equipments/${params.equipmentId}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl border-2 border-[#1b4965]/10"
          >
            <RiArrowLeftLine className="text-[#1b4965] text-2xl" />
          </motion.button>
        </Link>
      </div>

      {/* ChatBot */}
      <ChatBotRentalsPortfolio />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#1b4965] mb-4">
            Complete Your Booking
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Just a few more details and you&apos;ll be ready to rent {equipment.name}
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4 overflow-x-auto pb-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    index <= currentStep 
                      ? 'bg-[#1b4965] border-[#1b4965] text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <step.icon className="text-xl" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 rounded transition-all ${
                      index < currentStep ? 'bg-[#1b4965]' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#1b4965] mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step Content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              {/* Step 0: Rental Details */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-r from-[#1b4965] to-[#1b4965]/90 rounded-2xl text-white">
                      <div className="flex items-center mb-4">
                        <RiCalendarLine className="text-2xl mr-3" />
                        <h3 className="text-xl font-bold">Start Date</h3>
                      </div>
                      <p className="text-2xl font-bold">
                        {new Date(bookingData.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-r from-[#1b4965]/80 to-[#1b4965]/70 rounded-2xl text-white">
                      <div className="flex items-center mb-4">
                        <RiCalendarLine className="text-2xl mr-3" />
                        <h3 className="text-xl font-bold">End Date</h3>
                      </div>
                      <p className="text-2xl font-bold">
                        {new Date(bookingData.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                    <div className="flex items-center mb-4">
                      <RiTimeLine className="text-blue-600 text-2xl mr-3" />
                      <h3 className="text-xl font-bold text-blue-800">Rental Duration</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                      {bookingData.duration} day{bookingData.duration > 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Availability Status */}
                  {bookingData.startDate && bookingData.endDate && (
                    <div className={`p-6 rounded-2xl border ${
                      isDateRangeAvailable(bookingData.startDate, bookingData.endDate)
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center mb-4">
                        {isDateRangeAvailable(bookingData.startDate, bookingData.endDate) ? (
                          <>
                            <RiCheckLine className="text-green-600 text-2xl mr-3" />
                            <h3 className="text-xl font-bold text-green-800">Dates Available ✅</h3>
                          </>
                        ) : (
                          <>
                            <RiAlertLine className="text-red-600 text-2xl mr-3" />
                            <h3 className="text-xl font-bold text-red-800">Dates Not Available ❌</h3>
                          </>
                        )}
                      </div>
                      <p className={`text-sm ${
                        isDateRangeAvailable(bookingData.startDate, bookingData.endDate)
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}>
                        {isDateRangeAvailable(bookingData.startDate, bookingData.endDate)
                          ? 'Selected dates are available for booking'
                          : 'Selected dates conflict with existing bookings. Please choose different dates.'
                        }
                      </p>
                    </div>
                  )}

                  <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
                    <div className="flex items-center mb-4">
                      <RiMoneyDollarCircleLine className="text-green-600 text-2xl mr-3" />
                      <h3 className="text-xl font-bold text-green-800">Estimated Total</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      ${calculateTotalCost().toFixed(2)}
                    </p>
                    {equipment.pricing.security_deposit > 0 && (
                      <p className="text-sm text-green-700 mt-2">
                        + ${equipment.pricing.security_deposit} security deposit (refundable)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 1: Project Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <label className="block text-lg font-bold text-gray-800 mb-4">
                      What&apos;s this equipment for? 🏗️
                    </label>
                    <textarea
                      value={bookingData.projectDetails}
                      onChange={(e) => setBookingData({...bookingData, projectDetails: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all resize-none"
                      rows={4}
                      placeholder="Tell us about your project - construction, landscaping, demolition, etc. This helps us ensure you have the right equipment for the job."
                    />
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <label className="block text-lg font-bold text-gray-800 mb-4">
                      Any special requirements or notes? 📝
                    </label>
                    <textarea
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all resize-none"
                      rows={3}
                      placeholder="Any specific requirements, access restrictions, or special instructions for this rental?"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Delivery & Pickup */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {equipment.rental_requirements.delivery_available ? (
                    <>
                      <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                        <h3 className="text-xl font-bold text-blue-800 mb-4">Delivery Options 🚛</h3>
                        <div className="space-y-4">
                          <label className="flex items-center p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-all">
                            <input
                              type="radio"
                              name="delivery"
                              checked={!bookingData.deliveryRequired}
                              onChange={() => setBookingData({...bookingData, deliveryRequired: false, deliveryAddress: ''})}
                              className="mr-4 text-[#1b4965] focus:ring-[#1b4965]"
                            />
                            <div>
                              <p className="font-bold text-gray-800">Self Pickup</p>
                              <p className="text-gray-600">Pick up from: {equipment.pickup_location}</p>
                              <p className="text-green-600 font-medium">Free</p>
                            </div>
                          </label>
                          
                          <label className="flex items-center p-4 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-all">
                            <input
                              type="radio"
                              name="delivery"
                              checked={bookingData.deliveryRequired}
                              onChange={() => setBookingData({...bookingData, deliveryRequired: true})}
                              className="mr-4 text-[#1b4965] focus:ring-[#1b4965]"
                            />
                            <div>
                              <p className="font-bold text-gray-800">Delivery Service</p>
                              <p className="text-gray-600">Within {equipment.rental_requirements.delivery_radius}km radius</p>
                              <p className="text-blue-600 font-medium">
                                {equipment.rental_requirements.delivery_fee > 0 
                                  ? `$${equipment.rental_requirements.delivery_fee}` 
                                  : 'Free'
                                }
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {bookingData.deliveryRequired && (
                        <div className="p-6 bg-gray-50 rounded-2xl">
                          <label className="block text-lg font-bold text-gray-800 mb-4">
                            Delivery Address 📍
                          </label>
                          <textarea
                            value={bookingData.deliveryAddress}
                            onChange={(e) => setBookingData({...bookingData, deliveryAddress: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all resize-none"
                            rows={3}
                            placeholder="Enter the complete delivery address including any specific instructions for finding the location"
                            required={bookingData.deliveryRequired}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 bg-gray-50 rounded-2xl">
                      <div className="flex items-center mb-4">
                        <RiMapPinLine className="text-gray-600 text-2xl mr-3" />
                        <h3 className="text-xl font-bold text-gray-800">Pickup Location</h3>
                      </div>
                      <p className="text-gray-700 text-lg">
                        Equipment must be picked up from: <strong>{equipment.pickup_location}</strong>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Delivery is not available for this equipment.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Safety & Compliance */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="p-6 bg-red-50 rounded-2xl border border-red-200">
                    <h3 className="text-xl font-bold text-red-800 mb-4">Emergency Contact 🚨</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Name
                        </label>
                        <div className="relative">
                          <RiUserLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={bookingData.emergencyContact.name}
                            onChange={(e) => setBookingData({
                              ...bookingData, 
                              emergencyContact: {...bookingData.emergencyContact, name: e.target.value}
                            })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all"
                            placeholder="Full name"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <RiPhoneLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            value={bookingData.emergencyContact.phone}
                            onChange={(e) => setBookingData({
                              ...bookingData, 
                              emergencyContact: {...bookingData.emergencyContact, phone: e.target.value}
                            })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all"
                            placeholder="Phone number"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relationship
                        </label>
                        <input
                          type="text"
                          value={bookingData.emergencyContact.relationship}
                          onChange={(e) => setBookingData({
                            ...bookingData, 
                            emergencyContact: {...bookingData.emergencyContact, relationship: e.target.value}
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all"
                          placeholder="e.g., Spouse, Parent, Colleague"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {equipment.rental_requirements.operator_license_required && (
                    <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-200">
                      <h3 className="text-xl font-bold text-yellow-800 mb-4">Operator License Required 📄</h3>
                      <div className="relative">
                        <RiIdCardLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={bookingData.operatorLicense}
                          onChange={(e) => setBookingData({...bookingData, operatorLicense: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all"
                          placeholder="Operator license number"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {equipment.rental_requirements.insurance_required && (
                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                      <h3 className="text-xl font-bold text-blue-800 mb-4">Insurance Information 🛡️</h3>
                      <input
                        type="text"
                        value={bookingData.insuranceProvider}
                        onChange={(e) => setBookingData({...bookingData, insuranceProvider: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all"
                        placeholder="Insurance provider name and policy number"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review & Confirm */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-[#1b4965] to-[#1b4965]/90 rounded-2xl text-white">
                    <h3 className="text-2xl font-bold mb-4">Booking Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm opacity-90">Equipment</p>
                        <p className="font-bold text-lg">{equipment.name}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Category</p>
                        <p className="font-bold">{equipment.category_name}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Rental Period</p>
                        <p className="font-bold">
                          {new Date(bookingData.startDate).toLocaleDateString()} - {new Date(bookingData.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Duration</p>
                        <p className="font-bold">{bookingData.duration} days</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-2xl">
                      <h4 className="font-bold text-gray-800 mb-3">Delivery</h4>
                      <p className="text-gray-700">
                        {bookingData.deliveryRequired ? `Delivery to: ${bookingData.deliveryAddress}` : `Pickup from: ${equipment.pickup_location}`}
                      </p>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-2xl">
                      <h4 className="font-bold text-gray-800 mb-3">Emergency Contact</h4>
                      <p className="text-gray-700">
                        {bookingData.emergencyContact.name} ({bookingData.emergencyContact.relationship})
                        <br />
                        {bookingData.emergencyContact.phone}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-green-800">Total Cost</span>
                      <span className="text-3xl font-bold text-green-600">
                        ${calculateTotalCost().toFixed(2)}
                      </span>
                    </div>
                    {equipment.pricing.security_deposit > 0 && (
                      <p className="text-sm text-green-700 mt-2">
                        + ${equipment.pricing.security_deposit} security deposit (refundable)
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center">
                        <RiAlertLine className="text-red-500 text-xl mr-3" />
                        <p className="text-red-700">{error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-200">
                <motion.button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={currentStep === 0}
                  className="px-6 py-3 border-2 border-[#1b4965] text-[#1b4965] rounded-xl font-semibold hover:bg-[#1b4965] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </motion.button>

                {currentStep < steps.length - 1 ? (
                  <motion.button
                    onClick={() => {
                      // Validate current step before proceeding
                      if (currentStep === 0) {
                        // Check if dates are available
                        if (!isDateRangeAvailable(bookingData.startDate, bookingData.endDate)) {
                          setError('Selected dates are not available. Please choose different dates.');
                          return;
                        }
                      }
                      setError(null);
                      setCurrentStep(currentStep + 1);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={
                      currentStep === 0 && 
                      (!bookingData.startDate || !bookingData.endDate || !isDateRangeAvailable(bookingData.startDate, bookingData.endDate))
                    }
                    className="px-6 py-3 bg-gradient-to-r from-[#1b4965] to-[#1b4965]/90 text-white rounded-xl font-semibold hover:from-[#1b4965]/90 hover:to-[#1b4965] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleSubmitBooking}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting || !isDateRangeAvailable(bookingData.startDate, bookingData.endDate)}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold hover:from-green-500 hover:to-green-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <RiLoader4Line className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <RiCheckLine />
                        Confirm Booking
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Equipment Summary */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-6 sticky top-8"
            >
              <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                <Image
                  src={getImageUrl(equipment.image)}
                  alt={equipment.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/equipment.png';
                  }}
                />
              </div>
              
              <h3 className="text-xl font-bold text-[#1b4965] mb-2">{equipment.name}</h3>
              <p className="text-gray-600 mb-4">{equipment.category_name}</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Rate</span>
                  <span className="font-bold">${equipment.pricing.daily_rate}</span>
                </div>
                
                {equipment.pricing.weekly_rate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekly Rate</span>
                    <span className="font-bold">${equipment.pricing.weekly_rate}</span>
                  </div>
                )}
                
                {equipment.pricing.monthly_rate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Rate</span>
                    <span className="font-bold">${equipment.pricing.monthly_rate}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Deposit</span>
                    <span className="font-bold">${equipment.pricing.security_deposit}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
