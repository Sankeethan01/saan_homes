'use client';

import { useState, useEffect } from 'react';
import {
  RiArrowLeftLine,
  RiCalendarEventLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiToolsLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiAlertLine,
} from 'react-icons/ri';
import { FiDollarSign, FiCalendar, FiCheck, FiX } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/app/stores/useAuthStore';

interface Rental {
  id: string;
  equipment: string;
  equipmentImage: string;
  project: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  status: 'Pending' | 'Approved' | 'Booked' | 'Completed';
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalAmount: number;
  handedOver: boolean;
  payment: {
    paid: boolean;
    amount: number;
    method: string;
    dueDate: string;
  };
  createdAt: string;
  notes?: string;
  address?: string;
}

// Mock data - in real app this would come from API
const mockRentals: Rental[] = [
  {
    id: '1',
    equipment: 'Excavator CAT 320D',
    equipmentImage: '/assets/images/cmixer.jpg',
    project: 'High-Rise Apartment Complex',
    customer: 'John Smith',
    customerEmail: 'john.smith@example.com',
    customerPhone: '+1 (555) 123-4567',
    status: 'Pending',
    startDate: '2024-06-10',
    endDate: '2024-06-15',
    dailyRate: 500,
    totalAmount: 2500,
    handedOver: false,
    payment: { paid: false, amount: 2500, method: 'Bank Transfer', dueDate: '2024-06-09' },
    createdAt: '2024-06-05',
    notes: 'Customer needs equipment for foundation work. Urgent request.',
    address: '123 Construction Ave, Building City, BC 12345',
  },
  {
    id: '2',
    equipment: 'Concrete Mixer',
    equipmentImage: '/assets/images/cmixer.jpg',
    project: 'Commercial Office Building',
    customer: 'Sarah Johnson',
    customerEmail: 'sarah.j@company.com',
    customerPhone: '+1 (555) 987-6543',
    status: 'Approved',
    startDate: '2024-06-12',
    endDate: '2024-06-18',
    dailyRate: 150,
    totalAmount: 900,
    handedOver: false,
    payment: { paid: false, amount: 900, method: 'Cash', dueDate: '2024-06-11' },
    createdAt: '2024-06-06',
    notes: 'Regular customer with good payment history.',
    address: '456 Business Blvd, Commerce City, CC 67890',
  },
  {
    id: '3',
    equipment: 'Power Drill Set',
    equipmentImage: '/assets/images/cmixer.jpg',
    project: 'Residential Housing Development',
    customer: 'Mike Wilson',
    customerEmail: 'mike.w@builders.com',
    customerPhone: '+1 (555) 456-7890',
    status: 'Booked',
    startDate: '2024-06-20',
    endDate: '2024-06-22',
    dailyRate: 45,
    totalAmount: 90,
    handedOver: true,
    payment: { paid: true, amount: 90, method: 'Card', dueDate: '2024-06-19' },
    createdAt: '2024-06-15',
    notes: 'Equipment handed over on time. Customer satisfied.',
    address: '789 Residential St, Home Town, HT 11111',
  },
  {
    id: '4',
    equipment: 'Lawn Mower',
    equipmentImage: '/assets/images/cmixer.jpg',
    project: 'Landscaping Project',
    customer: 'Emma Davis',
    customerEmail: 'emma.davis@landscape.com',
    customerPhone: '+1 (555) 321-0987',
    status: 'Completed',
    startDate: '2024-05-01',
    endDate: '2024-05-05',
    dailyRate: 75,
    totalAmount: 375,
    handedOver: true,
    payment: { paid: true, amount: 375, method: 'Bank Transfer', dueDate: '2024-04-30' },
    createdAt: '2024-04-25',
    notes: 'Project completed successfully. Equipment returned in good condition.',
    address: '321 Garden Way, Green Valley, GV 22222',
  },
];

export default function RentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login');
      return;
    }

    // Find rental by ID - in real app this would be an API call
    const foundRental = mockRentals.find(r => r.id === params.rentalId);
    setRental(foundRental || null);
    setLoading(false);
  }, [params.rentalId, token, router]);

  const handleApproveRental = async () => {
    if (!rental) return;
    setActionLoading(true);
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setRental({ ...rental, status: 'Approved' });
      alert('Rental approved successfully!');
    } catch (error) {
      alert('Error approving rental. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRental = async () => {
    if (!rental) return;
    setActionLoading(true);
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      alert('Rental rejected successfully!');
      router.back();
    } catch (error) {
      alert('Error rejecting rental. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Booked':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="space-y-6 px-4 py-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <RiAlertLine className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Rental not found</h3>
          <p className="text-slate-500 mb-6">The rental you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-[#1b4965] text-white rounded-lg hover:from-blue-600 hover:to-[#1b4965] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Go back"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#1b4965] bg-clip-text text-transparent">
            Rental Details
          </h1>
          <p className="text-slate-600 mt-1">Manage rental request #{rental.id}</p>
        </div>
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(rental.status)}`}>
          {rental.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Equipment Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <RiToolsLine className="w-5 h-5 text-blue-600" />
              Equipment Information
            </h2>
            
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={rental.equipmentImage}
                  alt={rental.equipment}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{rental.equipment}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Daily Rate</p>
                    <p className="font-semibold text-slate-900">${rental.dailyRate}/day</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="font-semibold text-slate-900">${rental.totalAmount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <RiCalendarEventLine className="w-5 h-5 text-blue-600" />
              Rental Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Project</p>
                <p className="font-semibold text-slate-900">{rental.project}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Rental Period</p>
                <p className="font-semibold text-slate-900">{rental.startDate} to {rental.endDate}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Duration</p>
                <p className="font-semibold text-slate-900">
                  {Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {rental.status === 'Booked' ? 'Days Remaining' : 
                   rental.status === 'Completed' ? 'Completed' : 'Starts In'}
                </p>
                <p className="font-semibold text-slate-900">
                  {rental.status === 'Completed' 
                    ? 'Project finished' 
                    : `${calculateDaysRemaining(rental.status === 'Booked' ? rental.endDate : rental.startDate)} days`}
                </p>
              </div>
              
              {rental.address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500 mb-1">Project Address</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <RiMapPinLine className="w-4 h-4 text-slate-400" />
                    {rental.address}
                  </p>
                </div>
              )}
              
              {rental.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500 mb-1">Notes</p>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{rental.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <RiMoneyDollarCircleLine className="w-5 h-5 text-blue-600" />
              Payment Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Payment Status</p>
                <div className="flex items-center gap-2">
                  {rental.payment.paid ? (
                    <>
                      <FiCheck className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">Paid</span>
                    </>
                  ) : (
                    <>
                      <FiX className="w-4 h-4 text-red-600" />
                      <span className="font-semibold text-red-600">Not Paid</span>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Payment Method</p>
                <p className="font-semibold text-slate-900">{rental.payment.method}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Amount</p>
                <p className="font-semibold text-slate-900">${rental.payment.amount}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Due Date</p>
                <p className="font-semibold text-slate-900">{rental.payment.dueDate}</p>
              </div>
            </div>
          </div>

          {/* Equipment Calendar Placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <RiCalendarEventLine className="w-5 h-5 text-blue-600" />
              Equipment Calendar
            </h2>
            
            <div className="bg-slate-50 rounded-lg p-8 text-center">
              <RiCalendarEventLine className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Equipment calendar will be displayed here</p>
              <p className="text-sm text-slate-500 mt-2">
                Showing availability for {rental.equipment}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <RiUserLine className="w-5 h-5 text-blue-600" />
              Customer Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Name</p>
                <p className="font-semibold text-slate-900">{rental.customer}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Email</p>
                <a 
                  href={`mailto:${rental.customerEmail}`}
                  className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  <RiMailLine className="w-4 h-4" />
                  {rental.customerEmail}
                </a>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Phone</p>
                <a 
                  href={`tel:${rental.customerPhone}`}
                  className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  <RiPhoneLine className="w-4 h-4" />
                  {rental.customerPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Actions based on status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions</h2>
            
            {rental.status === 'Pending' && (
              <div className="space-y-3">
                <button
                  onClick={handleApproveRental}
                  disabled={actionLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RiCheckLine className="w-5 h-5" />
                  {actionLoading ? 'Approving...' : 'Approve Rental'}
                </button>
                <button
                  onClick={handleRejectRental}
                  disabled={actionLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RiCloseLine className="w-5 h-5" />
                  {actionLoading ? 'Rejecting...' : 'Reject Rental'}
                </button>
              </div>
            )}

            {rental.status === 'Approved' && (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Next Steps:</strong> Waiting for customer payment. 
                    Once payment is confirmed, status will change to "Booked".
                  </p>
                </div>
                {!rental.payment.paid && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                      <RiAlertLine className="w-4 h-4" />
                      Payment pending - Due: {rental.payment.dueDate}
                    </p>
                  </div>
                )}
              </div>
            )}

            {rental.status === 'Booked' && (
              <div className="space-y-3">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800">
                    <strong>Active Rental:</strong> Equipment is currently rented. 
                    Monitor return date and condition.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700">
                    <strong>Handed Over:</strong> {rental.handedOver ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">No</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {rental.status === 'Completed' && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Completed:</strong> Rental has been successfully completed. 
                    Equipment returned and payment processed.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <RiTimeLine className="w-5 h-5 text-blue-600" />
              Timeline
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiCalendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Request Created</p>
                  <p className="text-sm text-slate-500">{rental.createdAt}</p>
                </div>
              </div>
              
              {rental.status !== 'Pending' && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Request Approved</p>
                    <p className="text-sm text-slate-500">Status updated to approved</p>
                  </div>
                </div>
              )}
              
              {(rental.status === 'Booked' || rental.status === 'Completed') && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <FiDollarSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Payment Confirmed</p>
                    <p className="text-sm text-slate-500">Rental confirmed and booked</p>
                  </div>
                </div>
              )}
              
              {rental.status === 'Completed' && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Rental Completed</p>
                    <p className="text-sm text-slate-500">Equipment returned successfully</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 