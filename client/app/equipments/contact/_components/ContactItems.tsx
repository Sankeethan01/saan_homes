'use client';

import { contactItems } from '@/app/constants/Equipments/ContactInformation';
import { motion } from 'framer-motion';

export default function ContactItems() {
  return (
    <section
      className="py-8"
      style={{
        background:
          'radial-gradient(ellipse at 50% 50%, #f3f8ff 60%, #f8fafc 100%)',
      }}
    >
      <div className="container mx-auto pt-4 px-4">        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {contactItems.map(({ icon: Icon, title, lines, delay }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: delay * 0.2, 
                duration: 0.6,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10, 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(27, 73, 101, 0.15)"
              }}
              className="flex flex-col items-center p-6 bg-white/80 backdrop-blur-md border border-[#1b4965]/40 rounded-xl cursor-pointer transition-all duration-300"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="mb-4"
              >
                <Icon className="text-4xl text-[#1b4965]" />
              </motion.div>
              <motion.h3 
                className="text-xl font-semibold mb-2 text-[#1b4965]"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {title}
              </motion.h3>
              {lines.map((line, j) => (
                <motion.p 
                  key={j} 
                  className="text-gray-600 text-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: delay * 0.2 + j * 0.1 }}
                  viewport={{ once: true }}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

