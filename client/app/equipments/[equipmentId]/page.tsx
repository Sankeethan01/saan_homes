"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Calendar from "react-calendar";
import {
  RiCalendarLine,
  RiCheckLine,
  RiArrowLeftLine,
  RiShieldCheckLine,
  RiToolsLine,
  RiStarFill,
  RiStarLine,
  RiGasStationLine,
  RiSpeedUpLine,
  RiRulerLine,
  RiSecurePaymentLine,
  RiInformationLine,
  RiErrorWarningLine,
  RiLoader4Line,
} from "react-icons/ri";
import "react-calendar/dist/Calendar.css";
import ChatBotRentalsPortfolio from "@/app/components/Portfolio/Rentals/ChatBot";
import { useAuthStore } from "@/app/stores/useAuthStore";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  category_name: string;
  image: string;
  additional_images: string[];
  availability_status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  is_available: boolean;
  is_featured: boolean;
  pricing: {
    daily_rate: number;
    weekly_rate: number | null;
    monthly_rate: number | null;
    security_deposit: number;
    late_return_fee: number;
    weekly_discount?: number;
    monthly_discount?: number;
  };
  specifications: {
    operating_weight?: string;
    engine_power?: string;
    blade_capacity?: string;
    fuel_capacity?: string;
    max_speed?: string;
    dimensions?: {
      length?: string;
      width?: string;
      height?: string;
    };
  };
  features: string[];
  rental_requirements: {
    minimum_rental_period: number;
    maximum_rental_period: number;
    advance_booking_days: number;
    operator_license_required: boolean;
    training_required: boolean;
    age_restriction: number;
    insurance_required: boolean;
    delivery_available: boolean;
    delivery_radius: number;
    delivery_fee: number;
  };
  condition_rating: number;
  current_location: string;
  pickup_location: string;
  maintenance_info?: {
    last_service_date: string;
    next_service_due: string;
    service_hours: number;
    condition_rating: number;
    condition_display: string;
  };
  asset_info?: {
    serial_number: string;
    asset_tag: string;
    purchase_date: string;
    depreciation_value: number;
    current_location: string;
    pickup_location: string;
  };
  analytics?: {
    total_rental_days: number;
    total_revenue: number;
    popularity_score: number;
  };
}

export default function RentalEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuthStore();
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rentalDuration, setRentalDuration] = useState(1);

  // Fetch equipment details
  useEffect(() => {
    const fetchEquipment = async () => {
      if (!params.equipmentId) return;
      
      try {
        setLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        
        const response = await fetch(`${apiBaseUrl}/equipments/equipment/${params.equipmentId}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch equipment: ${response.statusText}`);
        }

        const data = await response.json();
        setEquipment(data);
      } catch (err) {
        console.error('Error fetching equipment:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch equipment data');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [params.equipmentId]);

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      // Calculate end date based on duration
      const end = new Date(value);
      end.setDate(end.getDate() + rentalDuration - 1);
      setEndDate(end);
    }
  };

  const handleDurationChange = (duration: number) => {
    setRentalDuration(duration);
    if (selectedDate) {
      const end = new Date(selectedDate);
      end.setDate(end.getDate() + duration - 1);
      setEndDate(end);
    }
  };

  const handleBookNow = () => {
    if (!selectedDate) {
      alert("Please select a rental date first");
      return;
    }

    // Prepare booking parameters
    const bookingParams = new URLSearchParams({
      startDate: selectedDate.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0] || '',
      duration: rentalDuration.toString()
    });
    
    if (!token) {
      // Redirect to login with return URL including rental details and required role
      const returnUrl = `/equipments/${params.equipmentId}/rent?${bookingParams.toString()}`;
      router.push(`/dashboard/login?returnUrl=${encodeURIComponent(returnUrl)}&requiredRole=PUBLIC`);
      return;
    }

    // Navigate to booking page with rental details
    router.push(`/equipments/${params.equipmentId}/rent?${bookingParams.toString()}`);
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/assets/images/equipment.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    return `${apiBaseUrl}${imageUrl}`;
  };

  const calculateTotalCost = () => {
    if (!equipment || !rentalDuration) return 0;
    
    const { pricing } = equipment;
    
    // Calculate based on most cost-effective option
    if (rentalDuration >= 30 && pricing.monthly_rate) {
      const months = Math.floor(rentalDuration / 30);
      const remainingDays = rentalDuration % 30;
      return (months * pricing.monthly_rate) + (remainingDays * pricing.daily_rate);
    } else if (rentalDuration >= 7 && pricing.weekly_rate) {
      const weeks = Math.floor(rentalDuration / 7);
      const remainingDays = rentalDuration % 7;
      return (weeks * pricing.weekly_rate) + (remainingDays * pricing.daily_rate);
    } else {
      return rentalDuration * pricing.daily_rate;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < rating ? (
          <RiStarFill className="text-yellow-400" />
        ) : (
          <RiStarLine className="text-gray-300" />
        )}
      </span>
    ));
  };

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

  const allImages = [equipment.image, ...(equipment.additional_images || [])];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <div className="fixed top-8 left-8 z-50">
        <Link href="/equipments">
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
            {equipment.name}
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
              {equipment.category_name}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              equipment.availability_status === 'AVAILABLE'
                ? 'bg-green-100 text-green-800'
                : equipment.availability_status === 'RENTED'
                ? 'bg-red-100 text-red-800'
                : equipment.availability_status === 'MAINTENANCE'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {equipment.availability_status.replace('_', ' ')}
            </span>
            {equipment.is_featured && (
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                Featured
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            {renderStars(equipment.condition_rating)}
            <span className="text-gray-600 ml-2">
              ({equipment.condition_rating}/5 Condition Rating)
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          {/* Left Column - Images and Details */}
          <div className="xl:col-span-2 space-y-2">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Main Image */}
              <div className="relative h-96 md:h-[500px]">
                <Image
                  src={getImageUrl(allImages[selectedImage])}
                  alt={equipment.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/equipment.png';
                  }}
                />
                
                {/* Image Navigation */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex gap-2 bg-black/50 rounded-full p-2">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            selectedImage === index ? 'bg-white' : 'bg-white/50'
                          }`}
                          aria-label={`View image ${index + 1}`}
                          title={`View image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-3 overflow-x-auto">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                          selectedImage === index ? 'border-[#1b4965]' : 'border-gray-200'
                        }`}
                        aria-label={`View thumbnail ${index + 1}`}
                        title={`View thumbnail ${index + 1}`}
                      >
                        <Image
                          src={getImageUrl(image)}
                          alt={`${equipment.name} ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/assets/images/equipment.png';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-[#1b4965] mb-4 flex items-center">
                <RiInformationLine className="mr-3" />
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {equipment.description}
              </p>
            </motion.div>

            {/* Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-[#1b4965] mb-6 flex items-center">
                <RiToolsLine className="mr-3" />
                Technical Specifications
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {equipment.specifications.operating_weight && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <RiRulerLine className="text-[#1b4965] text-xl mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Operating Weight</p>
                      <p className="text-gray-600">{equipment.specifications.operating_weight}</p>
                    </div>
                  </div>
                )}
                
                {equipment.specifications.engine_power && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <RiGasStationLine className="text-[#1b4965] text-xl mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Engine Power</p>
                      <p className="text-gray-600">{equipment.specifications.engine_power}</p>
                    </div>
                  </div>
                )}
                
                {equipment.specifications.blade_capacity && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <RiToolsLine className="text-[#1b4965] text-xl mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Blade Capacity</p>
                      <p className="text-gray-600">{equipment.specifications.blade_capacity}</p>
                    </div>
                  </div>
                )}
                
                {equipment.specifications.fuel_capacity && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <RiGasStationLine className="text-[#1b4965] text-xl mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Fuel Capacity</p>
                      <p className="text-gray-600">{equipment.specifications.fuel_capacity}</p>
                    </div>
                  </div>
                )}
                
                {equipment.specifications.max_speed && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <RiSpeedUpLine className="text-[#1b4965] text-xl mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Maximum Speed</p>
                      <p className="text-gray-600">{equipment.specifications.max_speed}</p>
                    </div>
                  </div>
                )}
                
                {equipment.specifications.dimensions && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-xl md:col-span-2">
                    <RiRulerLine className="text-[#1b4965] text-xl mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">Dimensions</p>
                      <p className="text-gray-600">
                        L: {equipment.specifications.dimensions.length} × 
                        W: {equipment.specifications.dimensions.width} × 
                        H: {equipment.specifications.dimensions.height}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Features */}
            {equipment.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-xl p-8"
              >
                <h2 className="text-2xl font-bold text-[#1b4965] mb-6 flex items-center">
                  <RiShieldCheckLine className="mr-3" />
                  Features & Equipment
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipment.features.map((feature, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                      <RiCheckLine className="text-green-500 text-xl mr-3" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 sticky top-8"
            >
              <h2 className="text-2xl font-bold text-[#1b4965] mb-6 flex items-center">
                <RiSecurePaymentLine className="mr-3" />
                Rental Pricing
              </h2>
              
              {/* Pricing Options */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-[#1b4965] to-[#1b4965]/90 rounded-xl text-white">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Daily Rate</span>
                    <span className="text-2xl font-bold">LKR {equipment.pricing.daily_rate}</span>
                  </div>
                </div>
                
                {equipment.pricing.weekly_rate && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">Weekly Rate</span>
                      <div className="text-right">
                        <span className="text-xl font-bold text-gray-800">
                          LKR {equipment.pricing.weekly_rate}
                        </span>
                        {equipment.pricing.weekly_discount && (
                          <span className="block text-sm text-green-600 font-medium">
                            {equipment.pricing.weekly_discount}% off
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {equipment.pricing.monthly_rate && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">Monthly Rate</span>
                      <div className="text-right">
                        <span className="text-xl font-bold text-gray-800">
                          LKR {equipment.pricing.monthly_rate}
                        </span>
                        {equipment.pricing.monthly_discount && (
                          <span className="block text-sm text-green-600 font-medium">
                            {equipment.pricing.monthly_discount}% off
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Duration Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rental Duration (days)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDurationChange(Math.max(1, rentalDuration - 1))}
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                    disabled={rentalDuration <= equipment.rental_requirements.minimum_rental_period}
                    aria-label="Decrease rental duration"
                    title="Decrease rental duration"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={rentalDuration}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                    min={equipment.rental_requirements.minimum_rental_period}
                    max={equipment.rental_requirements.maximum_rental_period}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965]"
                    aria-label="Rental duration in days"
                    title="Rental duration in days"
                  />
                  <button
                    onClick={() => handleDurationChange(Math.min(equipment.rental_requirements.maximum_rental_period, rentalDuration + 1))}
                    className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                    disabled={rentalDuration >= equipment.rental_requirements.maximum_rental_period}
                    aria-label="Increase rental duration"
                    title="Increase rental duration"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Min: {equipment.rental_requirements.minimum_rental_period} days, 
                  Max: {equipment.rental_requirements.maximum_rental_period} days
                </p>
              </div>

              {/* Calendar */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Start Date
                </label>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  minDate={new Date()}
                  className="w-full rounded-xl border border-gray-200 shadow-sm"
                  tileClassName="text-sm p-2 rounded-lg hover:bg-[#1b4965] hover:text-white transition-all"
                />
              </div>

              {/* Selected Dates Display */}
              {selectedDate && endDate && (
                <div className="mb-6 p-4 bg-gradient-to-r from-[#1b4965] to-[#1b4965]/90 rounded-xl text-white">
                  <div className="flex items-center justify-center mb-2">
                    <RiCalendarLine className="text-xl mr-2" />
                    <span className="font-medium">Rental Period</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-90">From</p>
                    <p className="font-bold">{selectedDate.toLocaleDateString()}</p>
                    <p className="text-sm opacity-90 mt-2">To</p>
                    <p className="font-bold">{endDate.toLocaleDateString()}</p>
                    <p className="text-sm opacity-90 mt-2">
                      ({rentalDuration} day{rentalDuration > 1 ? 's' : ''})
                    </p>
                  </div>
                </div>
              )}

              {/* Total Cost */}
              {selectedDate && (
                <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">Total Cost</span>
                    <span className="text-2xl font-bold text-green-600">
                      LKR {calculateTotalCost().toFixed(2)}
                    </span>
                  </div>
                  {equipment.pricing.security_deposit > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      + LKR {equipment.pricing.security_deposit} security deposit
                    </p>
                  )}
                </div>
              )}

              {/* Book Now Button */}
              <motion.button
                onClick={handleBookNow}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!equipment.is_available || !selectedDate}
                className="w-full bg-gradient-to-r from-[#1b4965] to-[#1b4965]/90 text-white py-4 rounded-xl font-semibold text-lg hover:from-[#1b4965]/90 hover:to-[#1b4965] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <RiCalendarLine className="text-xl" />
                {!token ? 'Login to Book' : 'Book Now'}
              </motion.button>

              {!equipment.is_available && (
                <p className="text-center text-red-600 text-sm mt-3">
                  This equipment is currently not available for rental
                </p>
              )}
              
              {!selectedDate && (
                <p className="text-center text-amber-600 text-sm mt-3">
                  Please select a start date to continue
                </p>
              )}

              {/* Rental Requirements */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <RiShieldCheckLine className="mr-2" />
                  Rental Requirements
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Minimum Age</span>
                    <span className="font-medium">{equipment.rental_requirements.age_restriction}+</span>
                  </div>
                  
                  {equipment.rental_requirements.operator_license_required && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Operator License</span>
                      <span className="font-medium text-orange-600">Required</span>
                    </div>
                  )}
                  
                  {equipment.rental_requirements.training_required && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Training</span>
                      <span className="font-medium text-orange-600">Required</span>
                    </div>
                  )}
                  
                  {equipment.rental_requirements.insurance_required && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Insurance</span>
                      <span className="font-medium text-blue-600">Required</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Advance Booking</span>
                    <span className="font-medium">{equipment.rental_requirements.advance_booking_days} days</span>
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
