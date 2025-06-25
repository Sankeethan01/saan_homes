'use client';

import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { useAuthStore } from "@/app/stores/useAuthStore";

interface RentalHistoryItem {
  id: number;
  equipmentName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  totalCost: number;
}

export default function RentalHistoryPage() {
  const token = useAuthStore((s) => s.token);
  const [rentalHistory, setRentalHistory] = useState<any[]>([]);
  const [equipmentDetails, setEquipmentDetails] = useState<{ [id: string]: any }>({});

  useEffect(() => {
    if (!token) return;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    fetch(`${API_BASE_URL}/equipments/bookings/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRentalHistory(data);
        // Fetch equipment details for each unique equipment ID
        const uniqueIds = [...new Set(data.map((item: any) => String(item.equipment)))] as string[];
        uniqueIds.forEach((id) => {
          if (!equipmentDetails[id]) {
            fetch(`${API_BASE_URL}/equipments/equipment/${id}/`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => res.json())
              .then((details) => {
                setEquipmentDetails((prev) => ({ ...prev, [id]: details }));
              });
          }
        });
      });
  }, [token]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Rental History</h2>
      <div className="space-y-4">
        {rentalHistory.map((rental) => {
          const equipment = equipmentDetails[rental.equipment];
          let imageUrl: string | undefined = undefined;
          if (equipment && equipment.image) {
            if (equipment.image.startsWith('http')) {
              imageUrl = equipment.image;
            } else if (equipment.image.startsWith('/media/')) {
              // Use backend base URL for media images
              imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, '')}${equipment.image}`;
            } else {
              imageUrl = equipment.image;
            }
          }
          return (
            <motion.div
              key={rental.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{equipment ? equipment.name : rental.equipment_name}</h3>
                  {equipment && (
                    <div className="mb-2">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={equipment.name}
                          width={120}
                          className="mb-2 rounded"
                        />
                      )}
                      <p className="text-gray-700 mb-1"><b>Daily Rate:</b> ${equipment.daily_rate}</p>
                    </div>
                  )}
                  <p className="text-gray-600">
                    {rental.start_date} - {rental.end_date}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${rental.status === 'PAID' ? 'bg-green-100 text-green-600' :
                                      rental.status === 'APPROVED' ? 'bg-green-800 text-green-100' :
                                      rental.status === 'REJECTED' ? 'bg-red-800 text-red-100' :
                                      rental.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                      rental.status === 'PENDING' ? 'bg-blue-100 text-blue-600' :
                                          'bg-gray-100 text-gray-600'}`}
                >
                  {rental.status.charAt(0).toUpperCase() + rental.status.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Cost</span>
                  <span className="font-semibold">${rental.total_cost}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}