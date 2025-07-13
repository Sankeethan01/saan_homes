"use client";

import { motion } from "framer-motion";
import {  RiUser3Line } from "react-icons/ri";
import Image from "next/image";

const teamMembers = [
    {
      name: "Mr. Raseetharan Vanojithan",
      position: "CEO & Founder",
      image: "/assets/images/vano.jpg",
      description: "10+ years in construction industry"
    },
    {
      name: "Mrs. Lixsana Vanojithan",
      position: "Co-founder & Site Engineer",
      image: "/assets/images/lix.jpg",
      description: "Expert in large-scale projects"
    },
    {
      name: "Miss.Deluxshana Amalathas",
      position: "Editor",
      image: "/assets/images/dina.jpg",
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
                className="bg-white rounded-xl p-6 text-center shadow-lg relative"
              >
                <motion.div 
                  className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center relative z-10 overflow-hidden"
                  whileHover={{ 
                    scale: 2.5,
                    zIndex: 50,
                    position: "relative"
                  }}
                  transition={{ 
                    duration: 0.4, 
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full bg-gray-300 rounded-full flex items-center justify-center"><svg class="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg></div>';
                      }
                    }}
                  />
                </motion.div>
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