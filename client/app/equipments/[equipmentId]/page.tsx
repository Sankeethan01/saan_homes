"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Calendar from "react-calendar";
import {
  RiCalendarLine,
  RiCheckLine,
  RiArrowLeftLine,
  RiMailLine,
  RiPhoneLine,
  RiUserLine,
  RiTimeLine,
  RiMapPinLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import "react-calendar/dist/Calendar.css";
import ChatBotRentalsPortfolio from "@/app/components/Portfolio/Rentals/ChatBot";
import HomeButton from "@/app/components/ui/HomeButton";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Equipment {
  id: number;
  name: string;
  category: string;
  image: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  description: string;
  features: string[];
  availability: boolean;
}

// This would typically come from an API or database
const equipment: Equipment = {
  id: 1,
  name: "CAT 320 Excavator",
  category: "Excavators",
  image: "https://images.pexels.com/photos/95687/pexels-photo-95687.jpeg",
  dailyRate: 450,
  weeklyRate: 2800,
  monthlyRate: 9000,
  description:
    "Powerful 20-ton excavator perfect for large construction projects.",
  features: [
    "Operating Weight: 20 tons",
    "Dig Depth: 22 ft",
    "Engine Power: 162 hp",
    "Bucket Capacity: 1.5 cubic yards",
  ],
  availability: true,
};

export default function RentalEquipmentPage() {
  const [step, setStep] = useState(1); // 1: Details, 2: Booking Form, 3: Confirmation
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    duration: "",
    rentalPeriod: "daily",
    specialRequirements: "",
  });

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleProceedToBooking = () => {
    if (!selectedDate) {
      alert("Please select a date first");
      return;
    }
    setStep(2);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleConfirmBooking = () => {
    // Here you would typically make an API call to save the booking
    alert("Booking confirmed! We will contact you shortly.");
    // Reset the form and go back to step 1
    setStep(1);
    setSelectedDate(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      duration: "",
      rentalPeriod: "daily",
      specialRequirements: "",
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Buttons */}
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
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#1b4965] mb-4">
            Equipment Rental
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Professional construction equipment for your project needs
          </p>
        </motion.div>

        {/* Step 1: Equipment Details and Calendar */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Equipment Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="relative h-96">
                <Image
                  src={equipment.image}
                  alt={equipment.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-6 right-6">
                  <span
                    className={`px-6 py-3 rounded-full text-sm font-semibold shadow-lg ${
                      equipment.availability
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {equipment.availability ? "Available" : "Not Available"}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h2 className="text-2xl font-bold text-white">
                    {equipment.name}
                  </h2>
                  <p className="text-gray-200">{equipment.category}</p>
                </div>
              </div>
              
              <div className="p-8">
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {equipment.description}
                </p>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-[#1b4965] to-[#1b4965]/90 p-6 rounded-2xl text-white text-center shadow-lg">
                    <div className="text-3xl font-bold mb-2">${equipment.dailyRate}</div>
                    <div className="text-sm opacity-90">Daily Rate</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#1b4965]/80 to-[#1b4965]/70 p-6 rounded-2xl text-white text-center shadow-lg">
                    <div className="text-3xl font-bold mb-2">${equipment.weeklyRate}</div>
                    <div className="text-sm opacity-90">Weekly Rate</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#1b4965]/60 to-[#1b4965]/50 p-6 rounded-2xl text-white text-center shadow-lg">
                    <div className="text-3xl font-bold mb-2">${equipment.monthlyRate}</div>
                    <div className="text-sm opacity-90">Monthly Rate</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-[#1b4965] mb-6 flex items-center">
                    <RiShieldCheckLine className="mr-3 text-2xl" />
                    Features & Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {equipment.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center p-4 bg-gray-50 rounded-xl"
                      >
                        <RiCheckLine className="text-green-500 mr-3 text-xl" />
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Calendar and Booking Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#1b4965] mb-2">
                  Check Availability
                </h2>
                <p className="text-gray-600">Select your preferred rental date</p>
              </div>

              <div className="mb-8">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  minDate={new Date()}
                  className="w-full rounded-2xl border-2 border-gray-200 shadow-lg p-4"
                  tileClassName="text-sm p-3 rounded-lg hover:bg-[#1b4965] hover:text-white transition-all"
                  prevLabel={<span className="text-[#1b4965] text-xl">‹</span>}
                  nextLabel={<span className="text-[#1b4965] text-xl">›</span>}
                  navigationLabel={({ date }) => (
                    <span className="text-[#1b4965] font-bold text-lg">
                      {date.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                />
              </div>

              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-6 bg-gradient-to-r from-[#1b4965] to-[#1b4965]/90 rounded-2xl text-white"
                >
                  <div className="flex items-center justify-center">
                    <RiCalendarLine className="text-2xl mr-3" />
                    <p className="text-lg font-semibold">
                      Selected: {selectedDate.toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              )}

              <motion.button
                onClick={handleProceedToBooking}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#1b4965] to-[#1b4965]/90 text-white py-5 rounded-2xl font-semibold text-lg hover:from-[#1b4965]/90 hover:to-[#1b4965] transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!equipment.availability}
              >
                <RiCalendarLine className="text-2xl" />
                Proceed to Booking
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* Step 2: Booking Form */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-10 border border-gray-100"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#1b4965] mb-2">
                Booking Details
              </h2>
              <p className="text-gray-600">Please provide your information to complete the booking</p>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Full Name
                  </label>
                  <div className="relative">
                    <RiUserLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1b4965]" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all"
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <RiMailLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1b4965]" />
                    <input
                      placeholder="Enter your email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Phone Number
                  </label>
                  <div className="relative">
                    <RiPhoneLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1b4965]" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all"
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Rental Period
                  </label>
                  <select
                    value={formData.rentalPeriod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rentalPeriod: e.target.value,
                      })
                    }
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all"
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Duration
                  </label>
                  <div className="relative">
                    <RiTimeLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1b4965]" />
                    <input
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all"
                      placeholder={`Number of ${formData.rentalPeriod}`}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Special Requirements
                </label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialRequirements: e.target.value,
                    })
                  }
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b4965] focus:border-[#1b4965] transition-all"
                  rows={4}
                  placeholder="Enter any special requirements or additional notes"
                />
              </div>

              <div className="flex gap-6 pt-6">
                <motion.button
                  type="button"
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 rounded-xl border-2 border-[#1b4965] text-[#1b4965] font-semibold hover:bg-[#1b4965] hover:text-white transition-all duration-300"
                >
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#1b4965] to-[#1b4965]/90 text-white py-4 rounded-xl font-semibold hover:from-[#1b4965]/90 hover:to-[#1b4965] transition-all duration-300 shadow-lg"
                >
                  Continue to Review
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-10 border border-gray-100"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#1b4965] mb-2">
                Review & Confirm
              </h2>
              <p className="text-gray-600">Please review your booking details before confirming</p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="bg-gradient-to-r from-[#1b4965] to-[#1b4965]/90 p-6 rounded-2xl text-white">
                <h3 className="font-bold text-xl mb-4 flex items-center">
                  <RiShieldCheckLine className="mr-3" />
                  Equipment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><strong>Equipment:</strong> {equipment.name}</p>
                  <p><strong>Category:</strong> {equipment.category}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-xl mb-4 text-[#1b4965] flex items-center">
                  <RiCalendarLine className="mr-3" />
                  Rental Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <p><strong>Start Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                  <p><strong>Duration:</strong> {formData.duration} {formData.rentalPeriod}</p>
                  <p><strong>Rate:</strong> ${equipment[`${formData.rentalPeriod}Rate` as keyof Equipment]}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-xl mb-4 text-[#1b4965] flex items-center">
                  <RiUserLine className="mr-3" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                </div>
              </div>

              {formData.specialRequirements && (
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <h3 className="font-bold text-xl mb-4 text-[#1b4965]">
                    Special Requirements
                  </h3>
                  <p className="text-gray-700">{formData.specialRequirements}</p>
                </div>
              )}
            </div>

            <div className="flex gap-6">
              <motion.button
                onClick={() => setStep(2)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-4 rounded-xl border-2 border-[#1b4965] text-[#1b4965] font-semibold hover:bg-[#1b4965] hover:text-white transition-all duration-300"
              >
                Back to Edit
              </motion.button>
              <motion.button
                onClick={handleConfirmBooking}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-[#1b4965] to-[#1b4965]/90 text-white py-4 rounded-xl font-semibold hover:from-[#1b4965]/90 hover:to-[#1b4965] transition-all duration-300 shadow-lg"
              >
                Confirm Booking
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
