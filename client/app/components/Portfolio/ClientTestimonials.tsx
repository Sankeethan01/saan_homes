import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { FaQuoteRight } from 'react-icons/fa';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Tharmathayalan Sankeethan',
    location: 'Jaffna, Sri Lanka',
    avatar: '/assets/images/user.png',
    feedback:
      'SAAN Homes exceeded our expectations with their professionalism, timely delivery, and attention to detail. Their team made the entire construction process smooth and stress-free. Highly recommended for quality and reliability!'
  },
  {
    name: 'Deluxshana Amalathas',
    location: 'Anuradapura, Sri Lanka',
    avatar: '/assets/images/user.png',
    feedback:
      'Working with SAAN Homes was a fantastic experience. Their team was professional, responsive, and committed to delivering high-quality results on time. From planning to completion, every step was handled with care and expertise. We are extremely satisfied with the outcome and highly recommend SAAN Homes for any construction project.QuickMatch made finding a reliable service provider so easy! The booking process was seamless, and the service quality exceeded my expectations. Highly recommend this app for hassle-free service bookings.'
  },
  {
    name: 'Akila Ravithas',
    location: 'Colombu, Sri Lanka',
    avatar: '/assets/images/user.png',
    feedback:
      'SAAN Homes exceeded our expectations with their professionalism, timely delivery, and attention to detail. Their team made the entire construction process smooth and stress-free. Highly recommended for quality and reliability!'
  },
  {
    name: 'Santhirasekaran Thanujan',
    location: 'Kandy, Sri Lanka',
    avatar: '/assets/images/user.png',
    feedback:
      'Working with SAAN Homes was a fantastic experience. Their team was professional, responsive, and committed to delivering high-quality results on time. From planning to completion, every step was handled with care and expertise. We are extremely satisfied with the outcome and highly recommend SAAN Homes for any construction project.QuickMatch made finding a reliable service provider so easy! The booking process was seamless, and the service quality exceeded my expectations. Highly recommend this app for hassle-free service bookings.'
  },
  {
    name: 'John Smith',
    location: 'Galle, Sri Lanka',
    avatar: '/assets/images/user.png',
    feedback:
      'SAAN Homes exceeded our expectations with their professionalism, timely delivery, and attention to detail. Their team made the entire construction process smooth and stress-free. Highly recommended for quality and reliability!'
  },
  {
    name: 'Dilani Jayasinghe',
    location: 'Matara, Sri Lanka',
    avatar: '/assets/images/user.png',
    feedback:
      'Working with SAAN Homes was a fantastic experience. Their team was professional, responsive, and committed to delivering high-quality results on time. From planning to completion, every step was handled with care and expertise. We are extremely satisfied with the outcome and highly recommend SAAN Homes for any construction project.QuickMatch made finding a reliable service provider so easy! The booking process was seamless, and the service quality exceeded my expectations. Highly recommend this app for hassle-free service bookings.'
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 40 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

const ClientTestimonialsPortfolio = () => {
  const [selected, setSelected] = useState(0);

  return (
    <section id="testimonials" className="py-8 md:py-2" style={{ background: 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%)' }}>
      {/* Heading/Tagline Section */}
      <motion.div className="text-center max-w-3xl mx-auto mb-6 md:mb-2 px-4">
        <motion.h2 
          {...fadeInUp}
          className="text-2xl md:text-3xl font-bold mb-2 bg-clip-text text-transparent bg-[#1b4965]"
        >
          Client Testimonials
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-gray-600 text-xl md:text-2xl"
        >
          Our satisfied customers !!!
        </motion.p>
      </motion.div>
      <div className="max-w-3xl mx-auto flex flex-col items-center px-4">
        
        {/* Quote Icon - Responsive sizing */}
        <div className="text-center text-[#1b4965] mb-8 md:mb-20">
          <FaQuoteRight className="w-8 h-8 md:w-9 md:h-9" />
        </div>
        
        {/* Testimonial Content - Mobile optimized */}
        <div className="flex flex-col items-center justify-center min-h-[200px] md:h-36 lg:h-40 w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={selected}
              {...fadeInUp}
              className="text-gray-600 text-base md:text-lg lg:text-xl mb-6 md:mb-10 text-justify flex items-center justify-center w-full px-2 md:px-0"
            >
              {testimonials[selected].feedback.split(' ').slice(0, 50).join(' ')}
              {testimonials[selected].feedback.split(' ').length > 50 ? '...' : ''}
            </motion.p>
          </AnimatePresence>
          
          {/* Client Info - Mobile optimized */}
          <div className="text-center">
            <motion.div
              key={testimonials[selected].name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-[#1b4965] text-base md:text-lg"
            >
              {testimonials[selected].name}
            </motion.div>
            <div className="text-gray-400 text-xs md:text-sm mt-1">{testimonials[selected].location}</div>
          </div>
        </div>
        
        {/* Avatars row - Mobile responsive */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mt-6 md:mt-8 overflow-x-auto w-full px-4 md:px-0">
          {testimonials.map((t, idx) => (
            <button
              key={t.name}
              onMouseEnter={() => setSelected(idx)}
              onFocus={() => setSelected(idx)}
              className={`rounded-full border-2 transition-all duration-300 focus:outline-none w-8 h-8 md:w-[72px] md:h-[72px] flex-shrink-0 ${selected === idx ? 'border-[#1b4965] shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
              tabIndex={0}
              aria-label={`Show testimonial from ${t.name}`}
            >
              <Image
                src={t.avatar}
                alt={t.name}
                width={72}
                height={72}
                className="w-full h-full rounded-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientTestimonialsPortfolio;