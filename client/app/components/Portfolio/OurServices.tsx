import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

const OurServicesPortfolio = () => {
  return (
     <section id="services" className="py-17" style={{ background: 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%), radial-gradient(ellipse at 80% 60%, #ffe5ec 0%, #f8fafc 100%)' }}>
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              {...fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-red-600"
            >
              Our Services
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-gray-600 text-lg"
            >
              Seamless Services from Groundbreaking to Completion!!!
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Construction',
                icon: '🏗️',
                description: 'Expert construction services with attention to detail and quality craftsmanship.',
                features: ['Custom Homes', 'Renovations', 'Commercial Buildings']
              },
              { 
                title: 'Equipment Rental',
                icon: '🚜',
                description: 'Wide range of construction equipment available for your project needs.',
                features: ['Modern Fleet', '24/7 Support', 'Flexible Terms']
              },
              { 
                title: 'Project Management',
                icon: '📋',
                description: 'Professional project management to ensure timely and efficient completion.',
                features: ['Planning', 'Execution', 'Monitoring']
              }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/40 bg-white/80 backdrop-blur-md"
              >
                <div className="text-5xl mb-6">{service.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.2) + (i * 0.1) }}
                      className="flex items-center text-gray-700"
                    >
                      <span className="w-5 h-5 mr-2 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">✓</span>
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link href="/services">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <span>View More</span>
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

export default OurServicesPortfolio; 