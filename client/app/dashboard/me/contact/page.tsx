'use client';

import { motion } from 'framer-motion';
import { RiMapPin2Line, RiPhoneLine, RiMailLine } from 'react-icons/ri';

export default function ContactPage() {
    return (
        <div className="p-8">
            <h2 className="text-2xl text-[#1b4965] font-bold mb-6">Contact Us</h2>
            <div className="max-w-4xl mx-auto">
                {/* Contact Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 p-8 rounded-xl text-center"
                    >
                        <div className="flex justify-center mb-4">
                            <RiPhoneLine className="text-4xl text-[#1b4965]" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Phone</h3>
                        <p className="text-gray-600">+1 (123) 456-7890</p>
                        <p className="text-gray-600">Mon-Fri: 8am - 6pm</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-50 p-8 rounded-xl text-center"
                    >
                        <div className="flex justify-center mb-4">
                            <RiMailLine className="text-4xl text-[#1b4965]" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Email</h3>
                        <p className="text-gray-600">rentals@saanhomes.com</p>
                        <p className="text-gray-600">24/7 Support Available</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-50 p-8 rounded-xl text-center"
                    >
                        <div className="flex justify-center mb-4">
                            <RiMapPin2Line className="text-4xl text-[#1b4965]" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Location</h3>
                        <p className="text-gray-600">123 Construction Ave,</p>
                        <p className="text-gray-600">City, State 12345</p>
                    </motion.div>
                </div>

                {/* Rental Inquiry Form */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-center mb-8">Rental Inquiry Form</h2>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    placeholder="Enter your email address"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    required
                                    placeholder="Enter your phone number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    placeholder="Enter your company name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label htmlFor="equipmentType" className="block text-sm font-medium text-gray-700 mb-1">Equipment Type *</label>
                                <select
                                    id="equipmentType"
                                    name="equipmentType"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                                    title="Select Equipment Type"
                                >
                                    <option value="">Select Equipment Type</option>
                                    <option value="Excavators">Excavators</option>
                                    <option value="Bulldozers">Bulldozers</option>
                                    <option value="Cranes">Cranes</option>
                                    <option value="Loaders">Loaders</option>
                                    <option value="Trucks">Trucks</option>
                                    <option value="Concrete Equipment">Concrete Equipment</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="rentalDuration" className="block text-sm font-medium text-gray-700 mb-1">Rental Duration *</label>
                                <select
                                    id="rentalDuration"
                                    name="rentalDuration"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                                    title="Select Rental Duration"
                                >
                                    <option value="">Select Duration</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Custom">Custom Duration</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    required
                                    placeholder="Select start date"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b4965] focus:border-transparent"
                                    placeholder="Please provide any additional details about your rental needs..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-[#1b4965] text-white rounded-lg font-semibold hover:transition-transform duration-300 group-hover:translate-x-1"
                            >
                                Submit Inquiry
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 