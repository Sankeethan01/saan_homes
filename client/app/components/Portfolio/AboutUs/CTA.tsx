"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const CTAAboutUsPortfolio = () => {
    const router = useRouter();

  return (
    <section className="py-20 bg-gradient-to-r from-[#1b4965] to-[#2d5a7a] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Whether you need construction services or equipment rentals, our team is ready to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/equipments")}
                className="bg-white text-[#1b4965] px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Get Equipment Quote
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/projects")}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-[#1b4965] transition-colors"
              >
                View Our Projects
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
  );
}

export default CTAAboutUsPortfolio;