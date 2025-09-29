"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchWithAuth } from "@/app/utils/auth";
import { RiFileTextLine, RiRefreshLine } from "react-icons/ri";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/projects/invoices/');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      const data = await response.json();
      setInvoices(data.results || data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#e3f0ff] to-[#cbeafe] rounded-xl">
                <RiFileTextLine className="text-[#1b4965] text-xl" />
                        </div>
                        <div>
                <h1 className="text-2xl font-bold text-[#1b4965]">Invoice Management</h1>
                <p className="text-gray-600">Review and approve invoices from supervisors</p>
        </div>
      </div>

                <button
              onClick={fetchInvoices}
              className="flex items-center gap-2 bg-[#1b4965] text-white px-4 py-2 rounded-lg hover:bg-[#003049] transition-colors"
                >
              <RiRefreshLine className="text-lg" />
              Refresh
                </button>
            </div>

          {loading ? (
            <div className="p-8 text-center">
              <RiRefreshLine className="text-4xl text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading invoices...</p>
                </div>
          ) : (
            <div className="p-8 text-center">
              <RiFileTextLine className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Management</h3>
              <p className="text-gray-600">
                {invoices.length > 0 
                  ? `Found ${invoices.length} invoices`
                  : "No invoices found"}
                  </p>
                </div>
          )}
        </motion.div>
                </div>
    </div>
  );
} 