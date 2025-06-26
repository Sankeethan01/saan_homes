"use client";

import { useState } from "react";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";
import { SiMastercard } from "react-icons/si";
import { useRouter, useSearchParams } from "next/navigation";

export default function PayNowPage() {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) {
      alert("Booking ID not found.");
      return;
    }
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      console.log('Making payment request for booking:', bookingId);
      
      const res = await fetch(`${API_BASE_URL}/equipments/bookings/${bookingId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('token')}` : '',
        },
        body: JSON.stringify({ status: "PAID" }),
      });
      
      console.log('API Response status:', res.status);
      
      if (res.status === 401 || res.status === 403) {
        alert('Session expired. Please log in again.');
        router.push('/login');
        return;
      }
      
      if (res.ok) {
        alert('Payment successful!');
        router.push("/dashboard/me/rentals");
      } else {
        const data = await res.json();
        console.log('API Error:', data);
        alert(data.error || "Failed to update booking status.");
        // Still redirect even if API fails (for testing)
        router.push("/dashboard/me/rentals");
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert("Payment failed. Please try again.");
      // Still redirect even if there's an error (for testing)
      router.push("/dashboard/me/rentals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-2 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-center mt-8 mb-2">Payment Options</h2>
        <div className="text-center text-lg font-semibold mb-4">Total - INR 1500/month</div>
        <div className="flex items-center bg-green-100 border border-green-300 rounded-t-lg px-4 py-3 gap-3">
          <div className="flex-1">
            <div className="font-medium text-green-900 text-base">Credit & Debit cards</div>
            <div className="text-xs text-green-700">Transaction fee may apply</div>
          </div>
          <div className="flex gap-2">
            <FaCcVisa className="text-3xl text-blue-700 bg-white rounded" />
            <FaCcMastercard className="text-3xl text-red-600 bg-white rounded" />
            <SiMastercard className="text-3xl text-blue-900 bg-white rounded" />
          </div>
        </div>
        <form className="px-6 pt-6 pb-8" onSubmit={handlePayment}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1" htmlFor="cardName">
              Cardholder Name
            </label>
            <input
              id="cardName"
              type="text"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              placeholder="Rolwin reevan"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
              autoComplete="cc-name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1" htmlFor="cardNumber">
              Card Number
            </label>
            <input
              id="cardNumber"
              type="text"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              placeholder="4124    3246    3332    6578"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base tracking-widest"
              autoComplete="cc-number"
              maxLength={19}
            />
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-1">End Date</label>
              <div className="flex gap-2">
                <select
                  className="border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                  value={expMonth}
                  onChange={e => setExpMonth(e.target.value)}
                  aria-label="Expiration month"
                >
                  <option value="">mm</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={String(i+1).padStart(2, '0')}>
                      {String(i+1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  className="border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                  value={expYear}
                  onChange={e => setExpYear(e.target.value)}
                  aria-label="Expiration year"
                >
                  <option value="">yyyy</option>
                  {Array.from({length: 12}, (_, i) => 2024 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 text-sm mb-1" htmlFor="cvv">
                CVV
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="cvv"
                  type="password"
                  value={cvv}
                  onChange={e => setCvv(e.target.value)}
                  placeholder=""
                  className="w-20 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                  maxLength={3}
                  autoComplete="cc-csc"
                />
                <span className="text-xs text-gray-500">3 digits</span>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <button
              type="submit"
              className="w-full py-3 bg-[#f44356] text-white font-semibold rounded text-lg shadow hover:bg-[#e53945] transition-colors"
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay Now »"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
