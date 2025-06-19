'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiHome5Line, RiSearchLine, RiFilter3Line, RiCalendarLine, RiTimeLine, RiMessage2Line, RiUser3Line, RiHomeSmileLine, RiPaletteLine, RiLeafLine, RiToolsLine } from 'react-icons/ri';



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

const EquipmentGridRentalsPortfolio = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Equipment');

  const filteredEquipment = equipmentList.filter(item =>
    (selectedCategory === 'All Equipment' || item.category === selectedCategory) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
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
  );
}

export default EquipmentGridRentalsPortfolio;