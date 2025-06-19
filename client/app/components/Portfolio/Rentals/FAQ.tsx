'use client';

import { motion } from 'framer-motion';


const FAQRentalsPortfolio = () => {

  return (
    <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                question: "How do I rent equipment?",
                answer: "To rent equipment, first browse our available items, select your desired equipment, and click 'Rent Now'. You'll need to be logged in to complete the rental process. We'll guide you through scheduling, payment, and pickup arrangements."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, bank transfers, and corporate purchase orders for approved business accounts. The security deposit must be paid before equipment pickup."
              },
              {
                question: "Do you provide delivery services?",
                answer: "Yes, we offer delivery and pickup services for an additional fee. The cost depends on your location and the size of the equipment. Contact us for a detailed quote."
              },
              {
                question: "What happens if equipment breaks down?",
                answer: "We provide 24/7 support for equipment issues. In case of a breakdown, contact our emergency support line immediately. We'll either repair the equipment on-site or provide a replacement as soon as possible."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-xl"
              >
                <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  );
}
export default FAQRentalsPortfolio; 