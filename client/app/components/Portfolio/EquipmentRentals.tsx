import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

const EquipmentRentalsPortfolio = () => {
  return (
     <section id="rentals" className="py-10 bg-white" style={{ background: 'radial-gradient(ellipse at 80% 20%, #e0e7ff 0%, #f8fafc 100%)' }}>
        <div className="container mx-auto px-1">
          <motion.h2 
            {...fadeInUp}
            className="text-4xl md:text-5xl text-center font-bold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-red-600"
          >
            Equipment Rentals
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              'Excavators',
              'Bulldozers',
              'Cranes',
              'Loaders',
              'Trucks',
              'Concrete Mixers'
            ].map((equipment, index) => (
              <motion.div
                key={equipment}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-3xl shadow-xl bg-white/80 backdrop-blur-md border border-white/40 hover:bg-white/90 transition-colors"
              >
                <h3 className="text-xl font-semibold mb-2">{equipment}</h3>
                <p className="text-gray-600">Available for daily, weekly, or monthly rental.</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link href="/rentals">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <span>Rent Equipment</span>
                <motion.span
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </motion.span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
  );
};

export default EquipmentRentalsPortfolio; 