'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

const faqs = [
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
  },
  {
    question: "Can I extend my rental period?",
    answer: "Yes, you can request an extension by contacting our support team before your rental period ends. Additional charges may apply based on the extension duration and equipment availability."
  }
];

const FAQRentalsPortfolio = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? faqs.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev === faqs.length - 1 ? 0 : prev + 1));
  };

  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 100 : -100,
      scale: 0.95,
      zIndex: 0,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      zIndex: 1,
      transition: { duration: 0.4, type: 'spring' },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -100 : 100,
      scale: 0.95,
      zIndex: 0,
      transition: { duration: 0.3 },
    }),
  };

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Left bottom decorative image */}
      <img
        src="/assets/images/bg04.png"
        alt="Left Decoration"
        className="absolute left-[-6rem] bottom-0 w-[36rem] md:w-[60rem] pointer-events-none select-none opacity-60"
        style={{ zIndex: 0 }}
      />
      {/* Right bottom decorative image */}
      <img
        src="/assets/images/bg04.png"
        alt="Right Decoration"
        className="absolute right-[-6rem] bottom-0 w-[36rem] md:w-[60rem] pointer-events-none select-none opacity-60"
        style={{ zIndex: 0 }}
      />
      <div className="container mx-auto px-32 md:px-64">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-12"
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="flex items-center justify-center gap-4 max-w-xl mx-auto">
          {/* Left Arrow */}
          <button
            aria-label="Previous question"
            onClick={handlePrev}
            className="p-2 rounded-full border shadow hover:bg-gray-100 transition"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          {/* FAQ Card with animation */}
          <div className="relative w-full max-w-lg min-h-[180px] flex items-center justify-center">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute w-full bg-gray-50 p-8 rounded-2xl shadow-xl border border-gray-200"
                style={{ minHeight: 180 }}
              >
                <h3 className="text-xl font-semibold mb-3">{faqs[current].question}</h3>
                <p className="text-gray-600">{faqs[current].answer}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          {/* Right Arrow */}
          <button
            aria-label="Next question"
            onClick={handleNext}
            className="p-2 rounded-full border shadow hover:bg-gray-100 transition"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
export default FAQRentalsPortfolio; 