'use client';

import { motion } from 'framer-motion';


const ConditionsRentalsPortfolio = () => {

  return (
    <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {/* Heading: above 3rd grid item, in line with 1st row on large screens */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 10 }}
              className="text-3xl font-bold mb-0 mt-8 lg:mt-12 lg:col-start-3 lg:row-start-1 lg:text-center"
            >
              Rental Conditions
            </motion.h2>
            <div className="lg:col-start-3 lg:row-start-1 text-center mt-26 mb-4">
              <span className="text-lg text-gray-500 font-medium"> "Know the terms before you rent" </span>
            </div>
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
            ].map((condition, index) => {
              let gridClass = '';
              if (index === 0) gridClass = 'lg:row-start-1 lg:col-start-1';
              if (index === 1) gridClass = 'lg:row-start-1 lg:col-start-2';
              if (index === 2) gridClass = 'lg:row-start-2 lg:col-start-1';
              if (index === 3) gridClass = 'lg:row-start-2 lg:col-start-2';
              if (index === 4) gridClass = 'lg:row-start-2 lg:col-start-3';
              let colorClass = '';
              if (["Security Deposit", "Valid Documentation", "Damage Policy"].includes(condition.title)) {
                colorClass = 'bg-[rgba(27,73,101,0.2)] ' ;
              } else {
                colorClass = 'bg-white';
              }
              return (
                <motion.div
                  key={condition.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.07 }}
                  className={`p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-[0_4px_10px_0_#1b4965] ${colorClass} ${gridClass}`}
                >
                  <div className="text-4xl mb-4">{condition.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{condition.title}</h3>
                  <p className="text-gray-600">{condition.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
  );
}
export default ConditionsRentalsPortfolio; 