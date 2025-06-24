'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCalendarEventLine,
  RiCheckLine,
  RiCloseLine,
  RiEyeLine,
} from 'react-icons/ri';

const mockRentals = [
  {
    id: '1',
    equipment: 'Excavator',
    equipmentImage: '/images/excavator.jpg',
    project: 'High-Rise Apartment Complex',
    status: 'Pending',
    startDate: '2024-06-10',
    endDate: '2024-06-15',
    handedOver: false,
    payment: { paid: false, amount: 2500, method: 'Bank Transfer' },
  },
  {
    id: '2',
    equipment: 'Concrete Mixer',
    equipmentImage: '/images/concrete-mixer.jpg',
    project: 'Commercial Office Building',
    status: 'Approved',
    startDate: '2024-06-12',
    endDate: '2024-06-18',
    handedOver: false,
    payment: { paid: false, amount: 900, method: 'Cash' },
  },
  {
    id: '3',
    equipment: 'Power Drill Set',
    equipmentImage: '/images/power-drill.jpg',
    project: 'Residential Housing Development',
    status: 'Booked',
    startDate: '2024-06-20',
    endDate: '2024-06-22',
    handedOver: false,
    payment: { paid: false, amount: 90, method: 'Card' },
  },
  {
    id: '4',
    equipment: 'Lawn Mower',
    equipmentImage: '/images/lawn-mower.jpg',
    project: 'Landscaping Project',
    status: 'Completed',
    startDate: '2024-05-01',
    endDate: '2024-05-05',
    handedOver: true,
    payment: { paid: true, amount: 375, method: 'Bank Transfer' },
  },
];

const statusTabs = ['All', 'Pending', 'Approved', 'Booked', 'Completed'];

type RentalStatus = 'Pending' | 'Approved' | 'Booked' | 'Completed';

export default function RentalsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [calendarRental, setCalendarRental] = useState<any | null>(null);

  const filteredRentals =
    activeTab === 'All'
      ? mockRentals
      : mockRentals.filter((r) => r.status === activeTab);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Rentals</h1>
      <div className="flex gap-2 mb-6">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-medium border-b-2 transition-colors duration-200 ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-4">Equipment</th>
              <th className="py-2 px-4">Project</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Start Date</th>
              <th className="py-2 px-4">End Date</th>
              <th className="py-2 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRentals.map((rental) => (
              <tr key={rental.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 flex items-center gap-2">
                  <img src={rental.equipmentImage} alt={rental.equipment} className="w-10 h-10 object-cover rounded" />
                  <span>{rental.equipment}</span>
                </td>
                <td className="py-2 px-4">{rental.project}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      rental.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : rental.status === 'Approved'
                        ? 'bg-blue-100 text-blue-800'
                        : rental.status === 'Booked'
                        ? 'bg-purple-100 text-purple-800'
                        : rental.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : ''
                    }`}
                  >
                    {rental.status}
                  </span>
                </td>
                <td className="py-2 px-4">{rental.startDate}</td>
                <td className="py-2 px-4">{rental.endDate}</td>
                <td className="py-2 px-4 text-right">
                  <button
                    onClick={() => setCalendarRental(rental)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="View Calendar"
                  >
                    <RiCalendarEventLine />
                  </button>
                  {rental.status === 'Completed' && (
                    <button
                      onClick={() => setCalendarRental({ ...rental, showDetails: true })}
                      className="p-2 text-green-600 hover:bg-green-50 rounded ml-2"
                      title="View Details"
                    >
                      <RiEyeLine />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredRentals.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No rental requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Calendar/Details Modal */}
      <AnimatePresence>
        {calendarRental && !calendarRental.showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Equipment Calendar</h2>
                <button
                  onClick={() => setCalendarRental(null)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <RiCloseLine />
                </button>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <img src={calendarRental.equipmentImage} alt={calendarRental.equipment} className="w-10 h-10 object-cover rounded" />
                <span className="font-semibold">{calendarRental.equipment}</span>
              </div>
              {/* Placeholder calendar */}
              <div className="bg-gray-100 rounded p-4 text-center text-gray-500">
                [Calendar for {calendarRental.equipment} goes here]
              </div>
            </motion.div>
          </motion.div>
        )}
        {calendarRental && calendarRental.showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Completed Rental Details</h2>
                <button
                  onClick={() => setCalendarRental(null)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <RiCloseLine />
                </button>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <img src={calendarRental.equipmentImage} alt={calendarRental.equipment} className="w-10 h-10 object-cover rounded" />
                <span className="font-semibold">{calendarRental.equipment}</span>
              </div>
              <div className="mb-2">
                <span className="font-medium">Project:</span> {calendarRental.project}
              </div>
              <div className="mb-2">
                <span className="font-medium">Rental Period:</span> {calendarRental.startDate} to {calendarRental.endDate}
              </div>
              <div className="mb-2">
                <span className="font-medium">Handed Over:</span> {calendarRental.handedOver ? (
                  <span className="text-green-600 font-semibold ml-1">Yes</span>
                ) : (
                  <span className="text-red-600 font-semibold ml-1">No</span>
                )}
              </div>
              <div className="mb-2">
                <span className="font-medium">Payment Status:</span> {calendarRental.payment.paid ? (
                  <span className="text-green-600 font-semibold ml-1">Paid</span>
                ) : (
                  <span className="text-red-600 font-semibold ml-1">Not Paid</span>
                )}
              </div>
              <div className="mb-2">
                <span className="font-medium">Payment Amount:</span> ${calendarRental.payment.amount}
              </div>
              <div className="mb-2">
                <span className="font-medium">Payment Method:</span> {calendarRental.payment.method}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 