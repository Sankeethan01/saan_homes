'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiHome5Line, RiSearchLine, RiFilter3Line, RiCalendarLine, RiTimeLine, RiMessage2Line, RiUser3Line, RiHomeSmileLine, RiPaletteLine, RiLeafLine, RiToolsLine } from 'react-icons/ri';
import ChatBot from '../components/ChatBot';
import Footer from '../components/Footer';
import HomeIcon from '../components/Home_Icon';


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

const equipmentCategories = [
  'All Equipment',
  'Excavators',
  'Bulldozers',
  'Cranes',
  'Loaders',
  'Trucks',
  'Concrete Equipment'
] as const;

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
  {
    id: 3,
    name: 'Liebherr LTM 1100 Crane',
    category: 'Cranes',
    image: '/rentals/crane-1.jpg',
    dailyRate: 1200,
    weeklyRate: 7000,
    monthlyRate: 25000,
    description: 'Mobile crane with excellent maneuverability and lifting capacity.',
    features: [
      'Max Lift Capacity: 100 tons',
      'Max Boom Length: 180 ft',
      'All-Terrain Capability',
      'Computer-Aided Control'
    ],
    availability: true
  },
  {
    id: 4,
    name: 'Volvo L120H Wheel Loader',
    category: 'Loaders',
    image: '/rentals/loader-1.jpg',
    dailyRate: 550,
    weeklyRate: 3200,
    monthlyRate: 11000,
    description: 'Versatile wheel loader perfect for material handling and loading operations.',
    features: [
      'Operating Weight: 28 tons',
      'Bucket Capacity: 3.5 cubic yards',
      'Engine Power: 276 hp',
      'Advanced Hydraulics'
    ],
    availability: true
  },
  {
    id: 5,
    name: 'Mack Granite Dump Truck',
    category: 'Trucks',
    image: '/rentals/truck-1.jpg',
    dailyRate: 400,
    weeklyRate: 2400,
    monthlyRate: 8500,
    description: 'Heavy-duty dump truck ideal for construction material transport.',
    features: [
      'Payload Capacity: 40 tons',
      'Engine Power: 455 hp',
      'All-Wheel Drive',
      'Heated Dump Body'
    ],
    availability: false
  },
  {
    id: 6,
    name: 'Putzmeister BSF 38-5 Concrete Pump',
    category: 'Concrete Equipment',
    image: '/rentals/concrete-pump-1.jpg',
    dailyRate: 800,
    weeklyRate: 4800,
    monthlyRate: 16000,
    description: 'High-performance concrete pump truck for efficient concrete placement.',
    features: [
      'Vertical Reach: 126 ft',
      'Max Output: 160 cubic yards/hr',
      'Radio Remote Control',
      '5-Section Boom'
    ],
    availability: true
  },
  {
    id: 7,
    name: 'JCB 3CX Backhoe Loader',
    category: 'Loaders',
    image: '/rentals/backhoe-1.jpg',
    dailyRate: 350,
    weeklyRate: 2000,
    monthlyRate: 7000,
    description: 'Versatile backhoe loader combining loading and excavating capabilities.',
    features: [
      'Dig Depth: 14.6 ft',
      'Loader Capacity: 1.4 cubic yards',
      'Engine Power: 109 hp',
      'Extended Dipper Option'
    ],
    availability: true
  },
  {
    id: 8,
    name: 'Bobcat S650 Skid Steer',
    category: 'Loaders',
    image: '/rentals/skidsteer-1.jpg',
    dailyRate: 250,
    weeklyRate: 1400,
    monthlyRate: 4800,
    description: 'Compact and maneuverable skid steer loader for various applications.',
    features: [
      'Rated Capacity: 2,690 lbs',
      'Height to Hinge Pin: 10.5 ft',
      'Engine Power: 74 hp',
      'High-Flow Hydraulics'
    ],
    availability: true
  }
];

export default function RentalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Equipment');

  const filteredEquipment = equipmentList.filter(item =>
    (selectedCategory === 'All Equipment' || item.category === selectedCategory) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">

        {/* ChatBot */}
        <ChatBot />

        {/* Home Icon */}
        <HomeIcon />
      </div>

      

      {/* Hero Section */}
      <section className="relative h-[120vh] bg-gradient-to-br from-blue-600 to-red-700">
        <div className="absolute inset-0 bg-black/30" />
        <div className="container mx-auto px-4 h-full flex items-center relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="max-w-3xl z-10"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 100 }}
                className="h-1 bg-white mb-8"
              />
              <h1 className="text-6xl font-light mb-8 text-white leading-tight">
                Professional{' '}
                <span className="relative inline-block">
                  equipment
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-3 bg-white/20 -z-10"
                  />
                </span>{' '}
                <span className="relative inline-block">
                  rentals
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-3 bg-white/20 -z-10"
                  />
                </span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed mb-12">
                Professional-grade construction equipment for your projects. Quality machinery, flexible terms, and expert support.
              </p>
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiToolsLine className="text-2xl text-white" />
                  </div>
                  <span className="text-white/90">Quality Equipment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiCalendarLine className="text-2xl text-white" />
                  </div>
                  <span className="text-white/90">Flexible Terms</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <RiMessage2Line className="text-2xl text-white" />
                  </div>
                  <span className="text-white/90">Expert Support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'radial-gradient(ellipse at 20% 80%, #e0f7fa 0%, #f8fafc 100%)' }}
        />
      </section>

      {/* Filter and Search Section */}
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
                  <div className="space-y-2">
                    {equipment.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Rental Conditions
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Login Required",
                description: "If you want to book equipment, you must login first to proceed with the rental process.",
                icon: "🔐"
              },
              {
                title: "Security Deposit",
                description: "A security deposit of 20% of the rental value is required for all equipment rentals.",
                icon: "💰"
              },
              {
                title: "Valid Documentation",
                description: "Must provide valid ID and proof of insurance before renting any equipment.",
                icon: "📄"
              },
              {
                title: "Minimum Rental Period",
                description: "Minimum rental period is 24 hours, starting from the time of pickup.",
                icon: "⏰"
              },
              {
                title: "Damage Policy",
                description: "Renter is responsible for any damage beyond normal wear and tear.",
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
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                question: "How do I rent equipment?",
                answer: "To rent equipment, first browse our available items, select your desired equipment, and click 'Rent Now'. You'll need to be logged in to complete the rental process. We'll guide you through scheduling, payment, and pickup arrangements."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, bank transfers, and corporate purchase orders for approved business accounts. The security deposit must be paid before equipment pickup."
              },
              {
                question: "Do you provide delivery services?",
                answer: "Yes, we offer delivery and pickup services for an additional fee. The cost depends on your location and the size of the equipment. Contact us for a detailed quote."
              },
              {
                question: "What happens if equipment breaks down?",
                answer: "We provide 24/7 support for equipment issues. In case of a breakdown, contact our emergency support line immediately. We'll either repair the equipment on-site or provide a replacement as soon as possible."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-xl"
              >
                <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12"
          >
            What Our Clients Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "John Smith",
                company: "Smith Construction Co.",
                testimonial: "The equipment quality and service support from SAAN HOMES has been exceptional. Their flexible rental terms helped us complete our project ahead of schedule.",
                image: "/testimonials/person1.jpg"
              },
              {
                name: "Sarah Johnson",
                company: "Johnson Builders",
                testimonial: "We've been renting from SAAN HOMES for over 2 years now. Their equipment is always well-maintained and their team is incredibly responsive.",
                image: "/testimonials/person2.jpg"
              },
              {
                name: "Mike Williams",
                company: "Williams & Associates",
                testimonial: "The online rental process is smooth and efficient. Their competitive rates and professional service keep us coming back for all our equipment needs.",
                image: "/testimonials/person3.jpg"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.testimonial}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-red-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Ready to Start Your Project?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl mb-8 text-white/90"
            >
              Browse our equipment catalog and find the perfect machinery for your needs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row gap-4 justify-center"
            >
              <Link href="/login">
                <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Login to Rent
                </button>
              </Link>
              <Link href="/rentals/rental_contact">
                <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Contact Us
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
