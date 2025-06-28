"use client";

import { motion } from "framer-motion";
import {  RiCheckLine } from "react-icons/ri";


const services = [
    {
      title: "Construction Services",
      items: ["Residential Construction", "Commercial Buildings", "Infrastructure Projects", "Renovation & Remodeling"]
    },
    {
      title: "Equipment Rentals",
      items: ["Excavators & Bulldozers", "Cranes & Loaders", "Concrete Equipment", "Trucks & Transport"]
    },
    {
      title: "Project Management",
      items: ["Site Planning", "Quality Control", "Safety Management", "Timeline Coordination"]
    }
  ];

const ServiceAboutUsPortfolio = () => {


  return (
    <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1b4965] mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive construction and equipment rental solutions for all your project needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <h3 className="text-2xl font-semibold text-[#1b4965] mb-6">{service.title}</h3>
                <ul className="space-y-3">
                  {service.items.map((item, itemIndex) => (
                    <motion.li
                      key={itemIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.2 + itemIndex * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-3"
                    >
                      <RiCheckLine className="text-green-500 text-xl flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  );
}

export default  ServiceAboutUsPortfolio;