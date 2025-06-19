'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';


const CallActionsRentalsPortfolio = () => {

  return (
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
  );
}
export default CallActionsRentalsPortfolio; 