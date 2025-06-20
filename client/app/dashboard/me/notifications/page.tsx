'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Notification {
    id: number;
    title: string;
    message: string;
    date: string;
    isRead: boolean;
}

interface AdminNotification extends Notification {
    type: 'admin';
    status: 'pending' | 'approved' | 'rejected';
    equipmentId: number;
    rentalDetails: {
        startDate: string;
        endDate: string;
        totalCost: number;
    };
}

interface GeneralNotification extends Notification {
    type: 'general';
}

const notifications: (AdminNotification | GeneralNotification)[] = [
    {
        id: 1,
        type: 'admin',
        title: 'Rental Request Approved',
        message: 'Your rental request for CAT 320 Excavator has been approved. Please proceed with payment.',
        date: '2024-03-20',
        isRead: false,
        status: 'approved',
        equipmentId: 1,
        rentalDetails: {
            startDate: '2024-04-01',
            endDate: '2024-04-07',
            totalCost: 2800
        }
    },
    {
        id: 2,
        type: 'admin',
        title: 'Pending Approval',
        message: 'Your rental request for Komatsu D61 Bulldozer is awaiting admin approval.',
        date: '2024-03-19',
        isRead: false,
        status: 'pending',
        equipmentId: 2,
        rentalDetails: {
            startDate: '2024-04-10',
            endDate: '2024-04-17',
            totalCost: 3500
        }
    },
    {
        id: 3,
        type: 'general',
        title: 'Return Reminder',
        message: 'Reminder: Your equipment rental ends tomorrow.',
        date: '2024-03-18',
        isRead: true
    }
];


export default function NotificationsPage() {
    const adminNotifications = notifications.filter(n => n.type === 'admin') as AdminNotification[];
    const generalNotifications = notifications.filter(n => n.type === 'general') as GeneralNotification[];

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>

            {/* Admin Confirmations */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Admin Confirmations</h3>
                <div className="space-y-4">
                    {adminNotifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-lg border ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{notification.title}</h3>
                                    <p className="text-gray-600 mt-1">{notification.message}</p>
                                    <span className="text-sm text-gray-500 mt-2 block">{notification.date}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${notification.status === 'approved' ? 'bg-green-100 text-green-600' :
                                    notification.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                        'bg-yellow-100 text-yellow-600'
                                    }`}>
                                    {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                                </span>
                            </div>
                            {notification.status === 'approved' && (
                                <div className="mt-4 pt-4 border-t">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Start Date</p>
                                            <p className="font-medium">{notification.rentalDetails.startDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">End Date</p>
                                            <p className="font-medium">{notification.rentalDetails.endDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-600">Total Cost</span>
                                        <span className="font-semibold">${notification.rentalDetails.totalCost}</span>
                                    </div>
                                    <Link href={`/rentals/payment?id=${notification.equipmentId}`}>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full bg-gradient-to-r from-blue-600 to-red-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-red-800 transition-all duration-300"
                                        >
                                            Proceed to Payment
                                        </motion.button>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* General Notifications */}
            <div>
                <h3 className="text-xl font-semibold mb-4">Other Notifications</h3>
                <div className="space-y-4">
                    {generalNotifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-lg border ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">{notification.title}</h3>
                                    <p className="text-gray-600 mt-2">{notification.message}</p>
                                </div>
                                <span className="text-sm text-gray-500">{notification.date}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
