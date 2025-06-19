'use client';

import { motion } from 'framer-motion';
import { RiHome5Line, RiPhoneLine, RiMailLine, RiMapPin2Line } from 'react-icons/ri';

const ContactInfoContactUsRentalsPortfolio = () =>  {

  return (
    <section className="py-12" style={{ background: 'radial-gradient(ellipse at 50% 50%, #f3f8ff 60%, #f8fafc 100%)' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center p-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl"
            >
              <RiPhoneLine className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p className="text-gray-600 text-center">+1 (123) 456-7890</p>
              <p className="text-gray-600 text-center">Mon-Fri: 8am - 6pm</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center p-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl"
            >
              <RiMailLine className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-gray-600 text-center">rentals@saanhomes.com</p>
              <p className="text-gray-600 text-center">24/7 Support Available</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center p-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl"
            >
              <RiMapPin2Line className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Location</h3>
              <p className="text-gray-600 text-center">123 Construction Ave,</p>
              <p className="text-gray-600 text-center">City, State 12345</p>
            </motion.div>
          </div>
        </div>
      </section>
  );
}

export default ContactInfoContactUsRentalsPortfolio;