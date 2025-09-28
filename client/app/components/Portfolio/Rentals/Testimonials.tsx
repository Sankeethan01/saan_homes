'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '../../../context/LanguageContext';


const TestimonialsRentalsPortfolio = () => {
  const { t } = useLanguage();
  return (
    <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12 text-[#1b4965]"
          >
            {t.rentalsPage.testimonials.title}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "John Smith",
                company: "Smith Construction Co.",
                testimonial: "The equipment quality and service support from SAAN HOMES has been exceptional. Their flexible rental terms helped us complete our project ahead of schedule.",
                image: "/assets/images/user.png"
              },
              {
                name: "Sarah Johnson",
                company: "Johnson Builders",
                testimonial: "We've been renting from SAAN HOMES for over 2 years now. Their equipment is always well-maintained and their team is incredibly responsive.",
                image: "/assets/images/user.png"
              },
              {
                name: "Mike Williams",
                company: "Williams & Associates",
                testimonial: "The online rental process is smooth and efficient. Their competitive rates and professional service keep us coming back for all our equipment needs.",
                image: "/assets/images/user.png"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.07 }}
                className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-[0_4px_10px_0_#1b4965]"
              >
                <div className="flex items-center mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">&quot;{testimonial.testimonial}&quot;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  );
}
export default TestimonialsRentalsPortfolio; 