import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { FaQuoteRight } from 'react-icons/fa';

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
    name: 'Deluxshana Sankeethan',
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
    <section className="py-2" style={{ background: 'radial-gradient(ellipse at 20% 40%, #f3f8ff 60%, #f8fafc 100%)' }}>
      {/* Heading/Tagline Section */}
      <motion.div className="text-center max-w-3xl mx-auto mb-2">
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
        
        <div className="text-center text-[8rem] text-[#1b4965] mb-20"><FaQuoteRight size={35} /></div>
        <div className="flex flex-col items-center justify-center h-36 md:h-40 min-h-[144px] max-h-[160px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={selected}
              {...fadeInUp}
              className="text-gray-600 text-lg md:text-xl mb-10 text-justify flex items-center h-full"
              style={{ minHeight: 70, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {testimonials[selected].feedback.split(' ').slice(0, 50).join(' ')}
              {testimonials[selected].feedback.split(' ').length > 50 ? '...' : ''}
            </motion.p>
          </AnimatePresence>
          <motion.div
            key={testimonials[selected].name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-semibold text-[#1b4965] text-lg mt-5"
          >
            {testimonials[selected].name}
          </motion.div>
          <div className="text-gray-400 text-sm mb-2">{testimonials[selected].location}</div>
        </div>
        {/* Avatars row */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {testimonials.map((t, idx) => (
            <button
              key={t.name}
              onMouseEnter={() => setSelected(idx)}
              onFocus={() => setSelected(idx)}
              className={`rounded-full border-2 transition-all duration-300 focus:outline-none ${selected === idx ? 'border-[#1b4965] shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
              style={{ width: 72, height: 72 }}
              tabIndex={0}
              aria-label={`Show testimonial from ${t.name}`}
            >
              <img
                src={t.avatar}
                alt={t.name}
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