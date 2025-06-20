'use client';

import { motion } from 'framer-motion';

interface RentalHistoryItem {
  id: number;
  equipmentName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  totalCost: number;
}

const rentalHistory: RentalHistoryItem[] = [
  {
    id: 1,
    equipmentName: 'CAT 320 Excavator',
    startDate: '2024-02-15',
    endDate: '2024-02-20',
    status: 'completed',
    totalCost: 2250
  },
  {
    id: 2,
    equipmentName: 'Komatsu D61 Bulldozer',
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    status: 'active',
    totalCost: 8400
  }
];

export default function RentalHistoryPage() {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Rental History</h2>
            <div className="space-y-4">
                {rentalHistory.map((rental) => (
                    <motion.div
                        key={rental.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white rounded-lg shadow-md"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-lg">{rental.equipmentName}</h3>
                                <p className="text-gray-600">
                                    {rental.startDate} - {rental.endDate}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${rental.status === 'active' ? 'bg-green-100 text-green-600' :
                                    rental.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                                        'bg-red-100 text-red-600'}`}
                            >
                                {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                            </span>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Cost</span>
                                <span className="font-semibold">${rental.totalCost}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
