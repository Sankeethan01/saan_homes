"use client";

import { motion } from "framer-motion";

import { RiUser3Line, RiBuilding2Line, RiToolsLine, RiAwardLine } from "react-icons/ri";


const values = [
    {
      icon: RiBuilding2Line,
      title: "Quality Construction",
      description: "We deliver exceptional quality in every project, using the finest materials and skilled craftsmanship."
    },
    {
      icon: RiToolsLine,
      title: "Equipment Excellence",
      description: "Premium construction equipment rentals with maintenance and support for all your project needs."
    },
    {
      icon: RiUser3Line,
      title: "Customer Focus",
      description: "Your satisfaction is our priority. We work closely with clients to bring their vision to life."
    },
    {
      icon: RiAwardLine,
      title: "Proven Track Record",
      description: "25+ years of successful projects and equipment rentals with industry recognition."
    }
  ];

const ValuesAboutUsPortfolio = () => {


  return (
    <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1b4965] mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide our work and define our company culture
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-gray-50 p-6 rounded-xl shadow-lg text-center"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-[#1b4965] rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <value.icon className="text-white text-2xl" />
                </motion.div>
                <h3 className="text-xl font-semibold text-[#1b4965] mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  );
}

export default  ValuesAboutUsPortfolio;