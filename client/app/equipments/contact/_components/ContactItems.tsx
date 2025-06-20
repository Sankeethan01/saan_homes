'use client';

import { contactItems } from '@/app/constants/Equipments/ContactInformation';
import { motion } from 'framer-motion';

export default function ContactItems() {
  return (
    <section
      className="py-12"
      style={{
        background:
          'radial-gradient(ellipse at 50% 50%, #f3f8ff 60%, #f8fafc 100%)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {contactItems.map(({ icon: Icon, title, lines, delay }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay }}
              viewport={{ once: true }}
              className="flex flex-col items-center p-6 bg-white/80 backdrop-blur-md border border-white/40 rounded-xl"
            >
              <Icon className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              {lines.map((line, j) => (
                <p key={j} className="text-gray-600 text-center">
                  {line}
                </p>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

