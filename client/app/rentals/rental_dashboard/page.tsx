'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiHome5Line, RiSearchLine, RiFilter3Line, RiCalendarLine, RiTimeLine, RiMessage2Line, RiNotification3Line, RiHistoryLine, RiUser3Line, RiTruckLine, RiFileList2Line, RiMapPin2Line, RiPhoneLine, RiMailLine, RiCustomerService2Line } from 'react-icons/ri';
import ChatBot from '@/app/components/ChatBot';
import HomeIcon from '@/app/components/Home_Icon';


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

const equipmentList: Equipment[] = [
  {
    id: 1,
    name: 'CAT 320 Excavator',
    category: 'Excavators',
    image: '/rentals/excavator-1.jpg',
    dailyRate: 450,
    weeklyRate: 2800,
    monthlyRate: 9000,
    description: 'Powerful 20-ton excavator perfect for large construction projects.',
    features: [
      'Operating Weight: 20 tons',
      'Dig Depth: 22 ft',
      'Engine Power: 162 hp',
      'Bucket Capacity: 1.5 cubic yards'
    ],
    availability: true
  },
  {
    id: 2,
    name: 'Komatsu D61 Bulldozer',
    category: 'Bulldozers',
    image: '/rentals/bulldozer-1.jpg',
    dailyRate: 600,
    weeklyRate: 3500,
    monthlyRate: 12000,
    description: 'Versatile bulldozer suitable for various earthmoving applications.',
    features: [
      'Operating Weight: 18 tons',
      'Blade Capacity: 4.5 cubic yards',
      'Engine Power: 168 hp',
      'GPS Ready'
    ],
    availability: true
  },
  // Add more equipment as needed
];

const equipmentCategories = [
  'All Equipment',
  'Excavators',
  'Bulldozers',
  'Cranes',
  'Loaders',
  'Trucks',
  'Concrete Equipment'
] as const;

interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

interface AdminNotification extends Notification {
  type: 'admin';
  status: 'pending' | 'approved' | 'rejected';
  equipmentId: number;
  rentalDetails: {
    startDate: string;
    endDate: string;
    totalCost: number;
  };
}

interface GeneralNotification extends Notification {
  type: 'general';
}

const notifications: (AdminNotification | GeneralNotification)[] = [
  {
    id: 1,
    type: 'admin',
    title: 'Rental Request Approved',
    message: 'Your rental request for CAT 320 Excavator has been approved. Please proceed with payment.',
    date: '2024-03-20',
    isRead: false,
    status: 'approved',
    equipmentId: 1,
    rentalDetails: {
      startDate: '2024-04-01',
      endDate: '2024-04-07',
      totalCost: 2800
    }
  },
  {
    id: 2,
    type: 'admin',
    title: 'Pending Approval',
    message: 'Your rental request for Komatsu D61 Bulldozer is awaiting admin approval.',
    date: '2024-03-19',
    isRead: false,
    status: 'pending',
    equipmentId: 2,
    rentalDetails: {
      startDate: '2024-04-10',
      endDate: '2024-04-17',
      totalCost: 3500
    }
  },
  {
    id: 3,
    type: 'general',
    title: 'Return Reminder',
    message: 'Reminder: Your equipment rental ends tomorrow.',
    date: '2024-03-18',
    isRead: true
  }
];

interface RentalHistory {
  id: number;
  equipmentName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  totalCost: number;
}

const rentalHistory: RentalHistory[] = [
  {
    id: 1,
    equipmentName: 'CAT 320 Excavator',
    startDate: '2024-02-15',
    endDate: '2024-02-20',
    status: 'completed',
    totalCost: 2250
  },
  {
    id: 2,
    equipmentName: 'Komatsu D61 Bulldozer',
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    status: 'active',
    totalCost: 8400
  }
];

export default function RentalDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Equipment');
  const [activeTab, setActiveTab] = useState('equipment');

  const filteredEquipment = equipmentList.filter(item =>
    (selectedCategory === 'All Equipment' || item.category === selectedCategory) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sidebarItems = [
    { id: 'equipment', label: 'Equipment', icon: RiTruckLine },
    { id: 'notifications', label: 'Notifications', icon: RiNotification3Line },
    { id: 'history', label: 'Rental History', icon: RiHistoryLine },
    { id: 'conditions', label: 'Rental Conditions', icon: RiFileList2Line },
    { id: 'feedback', label: 'Feedback', icon: RiMessage2Line },
    { id: 'contact', label: 'Contact Us', icon: RiCustomerService2Line },
    { id: 'profile', label: 'Update Profile', icon: RiUser3Line },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        const adminNotifications = notifications.filter(n => n.type === 'admin');
        const generalNotifications = notifications.filter(n => n.type === 'general');
        
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>
            
            {/* Admin Confirmations */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Admin Confirmations</h3>
              <div className="space-y-4">
                {adminNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-lg border ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{notification.title}</h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <span className="text-sm text-gray-500 mt-2 block">{notification.date}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        notification.status === 'approved' ? 'bg-green-100 text-green-600' :
                        notification.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                      </span>
                    </div>
                    {notification.status === 'approved' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Start Date</p>
                            <p className="font-medium">{notification.rentalDetails.startDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">End Date</p>
                            <p className="font-medium">{notification.rentalDetails.endDate}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-600">Total Cost</span>
                          <span className="font-semibold">${notification.rentalDetails.totalCost}</span>
                        </div>
                        <Link href={`/rentals/payment?id=${notification.equipmentId}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-blue-600 to-red-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300"
                          >
                            Proceed to Payment
                          </motion.button>
                        </Link>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* General Notifications */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Other Notifications</h3>
              <div className="space-y-4">
                {generalNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{notification.title}</h3>
                        <p className="text-gray-600 mt-2">{notification.message}</p>
                      </div>
                      <span className="text-sm text-gray-500">{notification.date}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'conditions':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Rental Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Login Required",
                  description: "You must be logged in to book equipment.",
                  icon: "🔐"
                },
                {
                  title: "Security Deposit",
                  description: "A security deposit of 20% is required for all rentals.",
                  icon: "💰"
                },
                {
                  title: "Valid Documentation",
                  description: "Must provide valid ID and proof of insurance.",
                  icon: "📄"
                },
                {
                  title: "Minimum Rental Period",
                  description: "Minimum rental period is 24 hours.",
                  icon: "⏰"
                },
                {
                  title: "Damage Policy",
                  description: "Renter is responsible for any damage beyond normal wear.",
                  icon: "🛡️"
                }
              ].map((condition, index) => (
                <motion.div
                  key={condition.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg"
                >
                  <div className="text-4xl mb-4">{condition.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{condition.title}</h3>
                  <p className="text-gray-600">{condition.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Feedback</h2>
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex space-x-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        className="text-2xl text-yellow-400 hover:text-yellow-500"
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your experience with us..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-red-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300"
                >
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
            <div className="max-w-4xl mx-auto">
              {/* Contact Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 p-8 rounded-xl text-center"
                >
                  <div className="flex justify-center mb-4">
                    <RiPhoneLine className="text-4xl text-blue-600" />
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
                    <RiMailLine className="text-4xl text-blue-600" />
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
                    <RiMapPin2Line className="text-4xl text-blue-600" />
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="equipmentType" className="block text-sm font-medium text-gray-700 mb-1">Equipment Type *</label>
                      <select
                        id="equipmentType"
                        name="equipmentType"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Duration</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Custom">Custom Duration</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Preferred Start Date *</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Please provide any additional details about your rental needs..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-red-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-red-800 transition-all duration-300"
                    >
                      Submit Inquiry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Rental History</h2>
            <div className="space-y-4">
              {rentalHistory.map((rental) => (
                <motion.div
                  key={rental.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-white rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{rental.equipmentName}</h3>
                      <p className="text-gray-600">
                        {rental.startDate} - {rental.endDate}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${rental.status === 'active' ? 'bg-green-100 text-green-600' :
                        rental.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                        'bg-red-100 text-red-600'}`}
                    >
                      {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Cost</span>
                      <span className="font-semibold">${rental.totalCost}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">My Profile</h2>
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                <div>
                  <h3 className="text-xl font-semibold">John Doe</h3>
                  <p className="text-gray-600">john.doe@example.com</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" value="John Doe" className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" value="+1 (123) 456-7890" className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value="john.doe@example.com" className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input type="text" value="123 Construction Ave, City, State 12345" className="mt-1 w-full px-4 py-2 rounded-lg border" readOnly />
                </div>
              </div>
              <div className="mt-6">
                <button className="w-full bg-gradient-to-r from-blue-600 to-red-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        );

      default: // Equipment tab
        return (
          <>
            {/* Search and Filter Section */}
            <section className="py-8 bg-white shadow-md sticky top-0 z-40">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  {/* Category Filter Dropdown */}
                  <div className="relative w-full md:w-64">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                    >
                      {equipmentCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <RiFilter3Line className="text-gray-400 text-xl" />
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full md:w-96">
                    <RiSearchLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                      type="text"
                      placeholder="Search equipment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Equipment Grid */}
            <section className="py-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredEquipment.map((equipment) => (
                    <motion.div
                      key={equipment.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -10 }}
                      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative h-64">
                        <Image
                          src={equipment.image}
                          alt={equipment.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            equipment.availability
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {equipment.availability ? 'Available' : 'Rented'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{equipment.name}</h3>
                        <p className="text-gray-600 mb-4">{equipment.description}</p>
                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Daily Rate:</span>
                            <span className="font-semibold">${equipment.dailyRate}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Weekly Rate:</span>
                            <span className="font-semibold">${equipment.weeklyRate}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Monthly Rate:</span>
                            <span className="font-semibold">${equipment.monthlyRate}</span>
                          </div>
                        </div>
                        <div className="space-y-2 mb-6">
                          {equipment.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                              {feature}
                            </div>
                          ))}
                        </div>
                        <Link href={`/rentals/rental_equipment?id=${equipment.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-blue-600 to-red-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center gap-2"
                            disabled={!equipment.availability}
                          >
                            <RiCalendarLine className="text-xl" />
                            Rent Now
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="w-64 bg-white shadow-xl h-screen sticky top-0"
      >
        <div className="p-6">
          <Link href="/">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-700">
              SAAN HOMES
            </h1>
          </Link>
        </div>

        <nav className="mt-6">
          {sidebarItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ x: 5 }}
              className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors
                ${activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <item.icon className="text-xl" />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>

      

      {/* ChatBot */}
        <ChatBot />

      {/* Home Icon */}
          <HomeIcon />
      

      
    </main>
  );
}
