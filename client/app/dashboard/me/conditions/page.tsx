'use client';

import { motion } from 'framer-motion';

export default function ConditionsPage() {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Rental Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    {
                        title: "Login Required",
                        description: "You must be logged in to book equipment.",
                        icon: "🔐"
                    },
                    {
                        title: "Security Deposit",
                        description: "A security deposit of 20% is required for all rentals.",
                        icon: "💰"
                    },
                    {
                        title: "Valid Documentation",
                        description: "Must provide valid ID and proof of insurance.",
                        icon: "📄"
                    },
                    {
                        title: "Minimum Rental Period",
                        description: "Minimum rental period is 24 hours.",
                        icon: "⏰"
                    },
                    {
                        title: "Damage Policy",
                        description: "Renter is responsible for any damage beyond normal wear.",
                        icon: "🛡️"
                    }
                ].map((condition, index) => (
                    <motion.div
                        key={condition.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-xl shadow-lg"
                    >
                        <div className="text-4xl mb-4">{condition.icon}</div>
                        <h3 className="text-xl font-semibold mb-2">{condition.title}</h3>
                        <p className="text-gray-600">{condition.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
