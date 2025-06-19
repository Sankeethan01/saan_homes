'use client';

import { motion } from 'framer-motion';


const ConditionsRentalsPortfolio = () => {

  return (
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
  );
}
export default ConditionsRentalsPortfolio; 