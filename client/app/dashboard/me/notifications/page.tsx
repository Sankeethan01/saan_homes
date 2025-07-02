'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthStore } from "@/app/stores/useAuthStore";
import { FaCheck, FaTrash } from 'react-icons/fa';

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
                    {notifications.map((notification) => {
                        const isPending = notification.status === "pending";
                        const isApproved = notification.status === "approved";
                        const isRejected = notification.status === "rejected";

                        const cardBg = isPending ? "bg-blue-50" : "bg-white";

                        const badgeClass = isPending
                            ? "bg-yellow-100 text-yellow-800"
                            : isApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800";

                        const statusLabel = isPending
                            ? "pending"
                            : isApproved
                            ? "approved"
                            : "rejected";

                        const equipmentName = notification.booking?.equipment_name || "Equipment";

                        const initials = equipmentName
                            .split(" ")
                            .slice(0, 2)
                            .map((w: string) => w.charAt(0).toUpperCase())
                            .join("");

                        return (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-6 rounded-lg border shadow-sm ${cardBg}`}
                            >
                                {/* Top Row */}
                                <div className="flex justify-between items-start gap-4">
                                    {/* Avatar & Message */}
                                    <div className="flex gap-4">
                                        <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                                            {initials}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">
                                                {isApproved
                                                    ? "Rental Request Approved"
                                                    : isPending
                                                    ? "Pending Approval"
                                                    : "Rental Request"}
                                            </h3>
                                            <p className="text-gray-600">
                                                {isApproved
                                                    ? `Your rental request for ${equipmentName} has been approved. Please proceed with payment.`
                                                    : isPending
                                                    ? `Your rental request for ${equipmentName} is awaiting admin approval.`
                                                    : `Your rental request for ${equipmentName} was rejected.`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="text-right whitespace-nowrap">
                                        <span className="text-sm text-gray-500 block">
                                            {notification.created ? new Date(notification.created).toLocaleDateString() : ""}
                                        </span>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${badgeClass}`}>{statusLabel}</span>
                                    </div>
                                </div>

                                {/* Approved Details + CTA */}
                                {isApproved && notification.booking && (
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
                                            <span className="font-semibold">LKR {notification.booking.total_cost}</span>
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

                                {/* Actions Row */}
                                <div className="mt-4 flex items-center gap-6">
                                    {isPending && (
                                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                            <FaCheck className="w-4 h-4" /> Mark as Read
                                        </button>
                                    )}
                                    <button className="ml-auto flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
                                        <FaTrash className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
