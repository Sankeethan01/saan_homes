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
    <main className="min-h-screen bg-gray-50">
      {/* Navigation Buttons */}
      <div className="fixed top-8 left-8 z-50">
        <Link href="/equipments">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <RiArrowLeftLine className="text-gray-700 text-2xl" />
          </motion.button>
        </Link>
      </div>

      {/* ChatBot */}
      <ChatBotRentalsPortfolio />

      {/* Home Icon */}
      <HomeButton />

      <div className="container mx-auto px-4 py-12">
        {/* Step 1: Equipment Details and Calendar */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Equipment Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="relative h-96">
                <Image
                  src={equipment.image}
                  alt={equipment.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      equipment.availability
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {equipment.availability ? "Available" : "Not Available"}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {equipment.name}
                </h1>
                <p className="text-gray-600 mb-6">{equipment.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Daily Rate</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ${equipment.dailyRate}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Weekly Rate</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ${equipment.weeklyRate}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Monthly Rate</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ${equipment.monthlyRate}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Features & Specifications
                  </h2>
                  {equipment.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-600"
                    >
                      <RiCheckLine className="text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Calendar and Booking Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Check Availability
              </h2>

              <div className="mb-8">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  minDate={new Date()}
                  className="w-full rounded-lg border-none shadow-md"
                  tileClassName="text-sm p-2"
                  prevLabel={<span className="text-gray-600">‹</span>}
                  nextLabel={<span className="text-gray-600">›</span>}
                  navigationLabel={({ date }) => (
                    <span className="text-gray-800 font-semibold">
                      {date.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                />
              </div>

              {selectedDate && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    Selected Date: {selectedDate.toLocaleDateString()}
                  </p>
                </div>
              )}

              <motion.button
                onClick={handleProceedToBooking}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-red-700 text-white py-4 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                disabled={!equipment.availability}
              >
                <RiCalendarLine className="text-xl" />
                Book Now
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* Step 2: Booking Form */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Booking Details
            </h2>

            <form onSubmit={handleSubmitBooking} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <RiUserLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <RiMailLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      placeholder="Enter your Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <RiPhoneLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="Enter your Phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="rentalPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                      Rental Period
                    </label>
                    <select
                      id="rentalPeriod"
                      name="rentalPeriod"
                      aria-label="Rental Period"
                      value={formData.rentalPeriod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rentalPeriod: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Number of ${formData.rentalPeriod}`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Enter any special requirements"
                    title="Special Requirements"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  type="button"
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-lg border-2 border-gray-200 font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-red-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300"
                >
                  Next
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
            className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Confirm Booking
            </h2>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Equipment Details
                </h3>
                <p className="text-gray-600">{equipment.name}</p>
                <p className="text-gray-600">Category: {equipment.category}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Rental Details
                </h3>
                <p className="text-gray-600">
                  Start Date: {selectedDate?.toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  Duration: {formData.duration} {formData.rentalPeriod}
                </p>
                <p className="text-gray-600">
                  Rate: $
                  {equipment[`${formData.rentalPeriod}Rate` as keyof Equipment]}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Contact Information
                </h3>
                <p className="text-gray-600">Name: {formData.name}</p>
                <p className="text-gray-600">Email: {formData.email}</p>
                <p className="text-gray-600">Phone: {formData.phone}</p>
              </div>

              {formData.specialRequirements && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Special Requirements
                  </h3>
                  <p className="text-gray-600">
                    {formData.specialRequirements}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <motion.button
                onClick={() => setStep(2)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-lg border-2 border-gray-200 font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </motion.button>
              <motion.button
                onClick={handleConfirmBooking}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-red-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300"
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
