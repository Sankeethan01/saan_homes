'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthStore } from "@/app/stores/useAuthStore";

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

export default function NotificationsPage() {
    const token = useAuthStore((s) => s.token);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        setError(null);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        fetch(`${API_BASE_URL}/notifications/rental-requests/`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch notifications");
                return res.json();
            })
            .then((data) => setNotifications(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>
            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading notifications...</div>
            ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
                <div className="space-y-4">
                    {notifications.length === 0 && (
                        <div className="text-center text-gray-500">No notifications found.</div>
                    )}
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-lg border"
                        >
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {notification.status === "approved"
                                        ? "Rental Request Approved"
                                        : notification.status === "pending"
                                        ? "Pending Approval"
                                        : "Rental Request"}
                                </h3>
                                <p className="text-gray-600 mt-1">
                                    {notification.status === "approved"
                                        ? `Your rental request for ${notification.booking?.equipment_name || "equipment"} has been approved. Please proceed with payment.`
                                        : notification.status === "pending"
                                        ? `Your rental request for ${notification.booking?.equipment_name || "equipment"} is awaiting admin approval.`
                                        : `Your rental request for ${notification.booking?.equipment_name || "equipment"} was rejected.`}
                                </p>
                                <span className="text-sm text-gray-500 mt-2 block">
                                    {notification.created
                                        ? new Date(notification.created).toLocaleDateString()
                                        : ""}
                                </span>
                            </div>
                            {notification.status === "approved" && notification.booking && (
                                <div className="mt-4 pt-4 border-t">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Start Date</p>
                                            <p className="font-medium">{notification.booking.start_date}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">End Date</p>
                                            <p className="font-medium">{notification.booking.end_date}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-600">Total Cost</span>
                                        <span className="font-semibold">${notification.booking.total_cost}</span>
                                    </div>
                                    <Link href={`/rentals/payment?id=${notification.booking.equipment_id || notification.booking.equipment}`}>
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
            )}
        </div>
    );
}
