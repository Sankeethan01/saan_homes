"use client";

import { motion } from "framer-motion";
import {  RiUser3Line } from "react-icons/ri";



const teamMembers = [
    {
      name: "Ahmed Hassan",
      position: "CEO & Founder",
      image: "/assets/images/team1.jpg",
      description: "25+ years in construction industry"
    },
    {
      name: "Sarah Al-Mansouri",
      position: "Operations Manager",
      image: "/assets/images/team2.jpg",
      description: "Expert in large-scale projects"
    },
    {
      name: "Mohammed Khalil",
      position: "Equipment Manager",
      image: "/assets/images/team3.jpg",
      description: "Specialized in equipment operations"
    }
  ];


const TeamAboutUsPortfolio = () => {


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
            <h2 className="text-4xl font-bold text-[#1b4965] mb-4">Meet Our Leadership</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The experienced professionals behind our success
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-white rounded-xl p-6 text-center shadow-lg"
              >
                <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <RiUser3Line className="text-4xl text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-[#1b4965] mb-2">{member.name}</h3>
                <p className="text-gray-600 font-medium mb-2">{member.position}</p>
                <p className="text-gray-500 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  );
}

export default  TeamAboutUsPortfolio;