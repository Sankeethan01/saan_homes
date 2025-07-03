'use client';

import { motion } from 'framer-motion';
import { 
  RiLockLine, 
  RiMoneyDollarCircleLine, 
  RiFileTextLine, 
  RiTimeLine, 
  RiShieldCheckLine,
  RiCarLine,
  RiUserLine,
  RiAlertLine,
  RiCalendarCheckLine
} from 'react-icons/ri';

export default function ConditionsPage() {
  const conditions = [
    {
      title: "Secure Booking Process",
      description: "All equipment rentals require a verified account and secure login for booking.",
      icon: <RiLockLine className="text-3xl text-[#1b4965]" />
    },
    {
      title: "Security Deposit",
      description: "A refundable security deposit of 20% is required for all rentals, which will be returned after equipment inspection.",
      icon: <RiMoneyDollarCircleLine className="text-3xl text-[#1b4965]" />
    },
    {
      title: "Required Documentation",
      description: "Valid government-issued ID and proof of insurance must be presented at pickup.",
      icon: <RiFileTextLine className="text-3xl text-[#1b4965]" />
    },
    {
      title: "Rental Duration",
      description: "Minimum rental period is 24 hours. Late returns will incur additional charges at the daily rate.",
      icon: <RiTimeLine className="text-3xl text-[#1b4965]" />
    },
    {
      title: "Damage Policy",
      description: "Renter is responsible for any damage beyond normal wear and tear. Comprehensive insurance is recommended.",
      icon: <RiShieldCheckLine className="text-3xl text-[#1b4965]" />
    },
    {
      title: "Transportation",
      description: "Delivery and pickup services are available for an additional fee based on distance.",
      icon: <RiCarLine className="text-3xl text-[#1b4965]" />
    },
    {
      title: "Operator Requirements",
      description: "Equipment operators must be at least 18 years old with appropriate certification for specialized equipment.",
      icon: <RiUserLine className="text-3xl text-[#1b4965]" />
    },
    {
      title: "Cancellation Policy",
      description: "Free cancellation up to 48 hours before rental. Cancellations within 48 hours may incur a fee of 25% of the rental cost.",
      icon: <RiCalendarCheckLine className="text-3xl text-[#1b4965]" />
    },
    {
      title: "Safety Requirements",
      description: "All renters must comply with safety guidelines provided with the equipment. Failure to do so may result in termination of rental.",
      icon: <RiAlertLine className="text-3xl text-[#1b4965]" />
    }
  ];

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Rental Conditions</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <p className="text-gray-700 mb-4">
          Please review our rental conditions carefully before making a booking. By renting equipment from SAAN Homes, you agree to comply with all the terms and conditions listed below.
        </p>
        <p className="text-gray-700">
          If you have any questions about our rental conditions, please contact our customer service team for clarification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conditions.map((condition, index) => (
          <motion.div
            key={condition.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                {condition.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{condition.title}</h3>
                <p className="text-gray-600 text-sm">{condition.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#1b4965] text-white p-6 rounded-xl shadow-md mt-8">
        <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>All equipment is thoroughly inspected before and after each rental.</li>
          <li>Regular maintenance records are available upon request.</li>
          <li>Training on equipment operation is available for an additional fee.</li>
          <li>For long-term rentals (over 30 days), special rates and conditions may apply.</li>
          <li>Emergency support is available 24/7 for all active rentals.</li>
        </ul>
      </div>
    </div>
  );
}
