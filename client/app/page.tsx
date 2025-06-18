'use client';

import { motion } from 'framer-motion';
import Navbar from './components/NavbarLanding';
import Link from 'next/link';
import Footer from './components/Footer';

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <main className="overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section id="home" className="min-h-screen relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-red-50">
          <div className="absolute inset-0 opacity-50" style={{
            backgroundImage: 'url("images/hero-bg.jpg ")',
            backgroundSize: '1260px 660px' 
          }} />
        </div>

        <div className="container mx-auto px-4 pt-20 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8 py-20"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-blue-600 to-red-700 flex items-center justify-center"
            >
              <span className="text-4xl text-white">SH</span>
            </motion.div>

            <motion.h1 
              className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-700"
            >
              SAAN HOMES
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-light"
            >
              Building Dreams, Creating Homes with Innovation and Excellence
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
              >
                View Projects
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24" style={{ background: 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%), radial-gradient(ellipse at 80% 60%, #ffe5ec 0%, #f8fafc 100%)' }}>
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              {...fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-700"
            >
              Our Services
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-gray-600 text-lg"
            >
              We provide comprehensive construction and real estate solutions tailored to your needs!!
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

      {/* Projects Section */}
      <section id="projects" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              {...fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-700"
            >
              Featured Projects
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-gray-600 text-lg"
            >
              Discover our portfolio of exceptional construction projects and architectural achievements
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Modern Villa',
                category: 'Residential',
                image: '/projects/modern-villa.jpg',
                description: 'Contemporary design with sustainable features',
                bgColor: 'bg-blue-50'
              },
              {
                title: 'Commercial Complex',
                category: 'Commercial',
                image: '/projects/commercial.jpg',
                description: 'State-of-the-art office spaces',
                bgColor: 'bg-red-50'
              },
              {
                title: 'Luxury Apartments',
                category: 'Multi-Family',
                image: '/projects/apartments.jpg',
                description: 'High-end residential complex',
                bgColor: 'bg-green-50'
              },
              {
                title: 'Shopping Mall',
                category: 'Retail',
                image: '/projects/mall.jpg',
                description: 'Modern shopping experience center',
                bgColor: 'bg-yellow-50'
              },
              {
                title: 'Smart Homes',
                category: 'Residential',
                image: '/projects/smart-homes.jpg',
                description: 'Technology-integrated living spaces',
                bgColor: 'bg-purple-50'
              },
              {
                title: 'Industrial Park',
                category: 'Industrial',
                image: '/projects/industrial.jpg',
                description: 'Large-scale industrial development',
                bgColor: 'bg-indigo-50'
              }
            ].map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-md border border-white/40`}
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-red-100/40 opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="h-full bg-gray-100 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <span className={`inline-block px-3 py-1 mb-4 text-sm font-medium text-blue-600 bg-white/80 backdrop-blur-sm rounded-full`}>
                    {project.category}
                  </span>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600">{project.description}</p>
                  <Link href="/projects">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                    >
                      Learn More →
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rentals Section */}
      <section id="rentals" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-4xl font-bold text-center mb-12"
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
                className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-white/40 hover:bg-white/90 transition-colors"
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20" style={{ background: 'radial-gradient(ellipse at 80% 20%, #e0e7ff 0%, #f8fafc 100%)' }}>
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-4xl font-bold text-center mb-12"
          >
            Client Testimonials
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'John Doe', role: 'Property Developer' },
              { name: 'Jane Smith', role: 'Architect' },
              { name: 'Mike Johnson', role: 'Project Manager' }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="p-6 rounded-3xl shadow-xl bg-white/80 backdrop-blur-md border border-white/40"
              >
                <p className="text-gray-600 mb-4">&quot;SAAN Homes exceeded our expectations with their professional service and attention to detail.&quot;</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            {...fadeInUp}
            className="text-4xl font-bold text-center mb-12"
          >
            Contact Us
          </motion.h2>
          <div className="max-w-2xl mx-auto">
            <motion.form 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-2xl border border-white/40 bg-white/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-2xl border border-white/40 bg-white/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-white/40 bg-white/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Send Message
              </motion.button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Footer */}
            <Footer />
    </main>
  );
}
