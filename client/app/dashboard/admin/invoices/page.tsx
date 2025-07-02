'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiFileTextLine,
  RiDownloadLine,
  RiEyeLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiUserLine,
  RiSearchLine,
  RiArrowDownLine,
} from 'react-icons/ri';

// Type definitions
interface Material {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Labor {
  description: string;
  hours: number;
  rate: number;
  total: number;
}

interface Equipment {
  name: string;
  days?: number;
  hours?: number;
  rate: number;
  total: number;
}

interface Expense {
  description: string;
  amount: number;
}

interface Invoice {
  id: string;
  projectName: string;
  projectId: string;
  stepName: string;
  stepNumber: number;
  supervisorName: string;
  supervisorId: string;
  submittedDate: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected';
  totalAmount: number;
  estimatedAmount: number;
  savings: number;
  materials: Material[];
  labor: Labor[];
  equipment: Equipment[];
  expenses: Expense[];
}

// Mock data for construction invoices
const mockInvoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    projectName: 'Sunrise Residential Complex',
    projectId: 'PRJ-001',
    stepName: 'Foundation & Concrete Work',
    stepNumber: 2,
    supervisorName: 'John Martinez',
    supervisorId: 'SUP-001',
    submittedDate: '2024-01-15',
    dueDate: '2024-01-30',
    status: 'pending',
    totalAmount: 45850.00,
    estimatedAmount: 48000.00,
    savings: 2150.00,
    materials: [
      { name: 'Portland Cement (50kg bags)', quantity: 120, unit: 'bags', unitPrice: 12.50, total: 1500.00 },
      { name: 'Steel Reinforcement Bars', quantity: 2500, unit: 'kg', unitPrice: 0.85, total: 2125.00 },
      { name: 'Ready Mix Concrete', quantity: 45, unit: 'm³', unitPrice: 120.00, total: 5400.00 },
      { name: 'Formwork Plywood', quantity: 85, unit: 'sheets', unitPrice: 25.00, total: 2125.00 },
    ],
    labor: [
      { description: 'Foundation Excavation', hours: 120, rate: 25.00, total: 3000.00 },
      { description: 'Concrete Pouring', hours: 80, rate: 30.00, total: 2400.00 },
      { description: 'Steel Fixing', hours: 160, rate: 28.00, total: 4480.00 },
    ],
    equipment: [
      { name: 'Excavator Rental', days: 5, rate: 450.00, total: 2250.00 },
      { name: 'Concrete Mixer', days: 8, rate: 120.00, total: 960.00 },
      { name: 'Crane Service', hours: 12, rate: 85.00, total: 1020.00 },
    ],
    expenses: [
      { description: 'Transportation', amount: 850.00 },
      { description: 'Permits & Inspections', amount: 300.00 },
      { description: 'Safety Equipment', amount: 450.00 },
    ],
  },
  {
    id: 'INV-2024-002',
    projectName: 'Metro Office Tower',
    projectId: 'PRJ-002',
    stepName: 'Electrical Installation - Floor 1-5',
    stepNumber: 8,
    supervisorName: 'Sarah Chen',
    supervisorId: 'SUP-002',
    submittedDate: '2024-01-18',
    dueDate: '2024-02-02',
    status: 'approved',
    totalAmount: 32400.00,
    estimatedAmount: 35000.00,
    savings: 2600.00,
    materials: [
      { name: 'Electrical Cables (Various)', quantity: 2500, unit: 'm', unitPrice: 3.50, total: 8750.00 },
      { name: 'Circuit Breakers', quantity: 45, unit: 'pcs', unitPrice: 85.00, total: 3825.00 },
      { name: 'LED Light Fixtures', quantity: 120, unit: 'pcs', unitPrice: 45.00, total: 5400.00 },
      { name: 'Electrical Panels', quantity: 8, unit: 'pcs', unitPrice: 350.00, total: 2800.00 },
    ],
    labor: [
      { description: 'Cable Installation', hours: 180, rate: 32.00, total: 5760.00 },
      { description: 'Panel Wiring', hours: 120, rate: 35.00, total: 4200.00 },
      { description: 'Testing & Commissioning', hours: 80, rate: 40.00, total: 3200.00 },
    ],
    equipment: [
      { name: 'Cable Pulling Equipment', days: 10, rate: 75.00, total: 750.00 },
      { name: 'Testing Equipment', days: 5, rate: 120.00, total: 600.00 },
    ],
    expenses: [
      { description: 'Electrical Permits', amount: 450.00 },
      { description: 'Inspection Fees', amount: 275.00 },
    ],
  },
  {
    id: 'INV-2024-003',
    projectName: 'Green Valley Housing',
    projectId: 'PRJ-003',
    stepName: 'Plumbing & Sanitation',
    stepNumber: 6,
    supervisorName: 'Mike Rodriguez',
    supervisorId: 'SUP-003',
    submittedDate: '2024-01-20',
    dueDate: '2024-02-05',
    status: 'rejected',
    totalAmount: 28750.00,
    estimatedAmount: 26500.00,
    savings: -2250.00,
    materials: [
      { name: 'PVC Pipes (Various Sizes)', quantity: 850, unit: 'm', unitPrice: 8.50, total: 7225.00 },
      { name: 'Water Fixtures', quantity: 24, unit: 'sets', unitPrice: 185.00, total: 4440.00 },
      { name: 'Drainage Fittings', quantity: 150, unit: 'pcs', unitPrice: 12.00, total: 1800.00 },
    ],
    labor: [
      { description: 'Pipe Installation', hours: 200, rate: 28.00, total: 5600.00 },
      { description: 'Fixture Installation', hours: 120, rate: 32.00, total: 3840.00 },
      { description: 'Pressure Testing', hours: 60, rate: 35.00, total: 2100.00 },
    ],
    equipment: [
      { name: 'Pipe Threading Machine', days: 8, rate: 95.00, total: 760.00 },
      { name: 'Pressure Testing Kit', days: 3, rate: 65.00, total: 195.00 },
    ],
    expenses: [
      { description: 'Plumbing Permits', amount: 380.00 },
      { description: 'Water Connection Fees', amount: 850.00 },
      { description: 'Emergency Repairs', amount: 1560.00 },
    ],
  },
];

const statusColors: Record<Invoice['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons: Record<Invoice['status'], typeof RiTimeLine> = {
  pending: RiTimeLine,
  approved: RiCheckLine,
  rejected: RiCloseLine,
};

// Currency formatting utility
const formatCurrency = (amount: number): string => {
  return `LKR ${amount.toLocaleString()}`;
};

const formatCurrencyFixed = (amount: number): string => {
  return `LKR ${amount.toFixed(2)}`;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Invoice['status']>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'project'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
      const matchesSearch = invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.supervisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: Date | number | string, bValue: Date | number | string;
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.submittedDate);
          bValue = new Date(b.submittedDate);
          break;
        case 'amount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'project':
          aValue = a.projectName;
          bValue = b.projectName;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleApproveInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'approved' as const } : inv
    ));
  };

  const handleRejectInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'rejected' as const } : inv
    ));
  };

  const calculateTotal = (items: (Material | Labor | Equipment | Expense)[]): number => {
    return items.reduce((sum, item) => sum + ('total' in item ? item.total : item.amount), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Invoices</h1>
          <p className="text-slate-600 mt-1">Manage supervisor-submitted invoices for project steps</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
            Export All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Invoices</p>
              <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <RiFileTextLine className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoices.filter(inv => inv.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <RiTimeLine className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Amount</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(invoices.reduce((sum, inv) => sum + inv.totalAmount, 0))}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <RiMoneyDollarCircleLine className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Savings</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(invoices.reduce((sum, inv) => sum + inv.savings, 0))}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <RiArrowDownLine className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by project, supervisor, or invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | Invoice['status'])}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as 'date' | 'amount' | 'project');
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Sort invoices"
          >
            <option value="date-desc">Latest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
            <option value="project-asc">Project A-Z</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-slate-900 w-48">Invoice</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900 w-64">Project & Step</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900 w-44">Supervisor</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900 w-52">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900 w-52">Savings</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900 w-32">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-slate-900 w-32">Date</th>
                <th className="text-right py-4 px-6 font-semibold text-slate-900 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.map((invoice) => {
                const StatusIcon = statusIcons[invoice.status];
                return (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-100 rounded-lg mr-3">
                          <RiFileTextLine className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{invoice.id}</p>
                          <p className="text-sm text-slate-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-slate-900">{invoice.projectName}</p>
                        <p className="text-sm text-slate-500">Step {invoice.stepNumber}: {invoice.stepName}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-3">
                          <RiUserLine className="w-6 h-5 text-slate-600" />
                        </div>
                        <p className="font-medium text-slate-900">{invoice.supervisorName}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
                        <p className="text-sm text-slate-500 w-25">Est: {formatCurrency(invoice.estimatedAmount)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full w-25 text-sm font-medium ${
                        invoice.savings >= 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.savings >= 0 ? '+' : ''}{formatCurrency(invoice.savings)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[invoice.status]}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-slate-900">{new Date(invoice.submittedDate).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <RiEyeLine className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <RiDownloadLine className="w-4 h-4" />
                        </button>
                        {invoice.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveInvoice(invoice.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <RiCheckLine className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectInvoice(invoice.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <RiCloseLine className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedInvoice(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedInvoice.id}</h2>
                  <p className="text-slate-600">{selectedInvoice.projectName} - {selectedInvoice.stepName}</p>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                  title="Close modal"
                >
                  <RiCloseLine className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Project Details</h3>
                  <p className="text-sm text-slate-600">Project: {selectedInvoice.projectName}</p>
                  <p className="text-sm text-slate-600">Step: {selectedInvoice.stepName}</p>
                  <p className="text-sm text-slate-600">Step Number: {selectedInvoice.stepNumber}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Supervisor</h3>
                  <p className="text-sm text-slate-600">Name: {selectedInvoice.supervisorName}</p>
                  <p className="text-sm text-slate-600">ID: {selectedInvoice.supervisorId}</p>
                  <p className="text-sm text-slate-600">Submitted: {new Date(selectedInvoice.submittedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Amount Summary</h3>
                  <p className="text-sm text-slate-600">Estimated: {formatCurrency(selectedInvoice.estimatedAmount)}</p>
                  <p className="text-sm text-slate-600">Actual: {formatCurrency(selectedInvoice.totalAmount)}</p>
                  <p className={`text-sm font-medium ${selectedInvoice.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Savings: {selectedInvoice.savings >= 0 ? '+' : ''}{formatCurrency(selectedInvoice.savings)}
                  </p>
                </div>
              </div>

              {/* Materials */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Materials</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">Item</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-900">Quantity</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-900">Unit Price</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedInvoice.materials.map((material, index) => (
                        <tr key={index}>
                          <td className="py-3 px-4 text-slate-900">{material.name}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{material.quantity} {material.unit}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{formatCurrencyFixed(material.unitPrice)}</td>
                          <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrencyFixed(material.total)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-medium">
                        <td colSpan={3} className="py-3 px-4 text-slate-900">Materials Subtotal</td>
                        <td className="py-3 px-4 text-right text-slate-900">{formatCurrencyFixed(calculateTotal(selectedInvoice.materials))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Labor */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Labor</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">Description</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-900">Hours</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-900">Rate</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedInvoice.labor.map((labor, index) => (
                        <tr key={index}>
                          <td className="py-3 px-4 text-slate-900">{labor.description}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{labor.hours} hrs</td>
                          <td className="py-3 px-4 text-right text-slate-600">{formatCurrencyFixed(labor.rate)}/hr</td>
                          <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrencyFixed(labor.total)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-medium">
                        <td colSpan={3} className="py-3 px-4 text-slate-900">Labor Subtotal</td>
                        <td className="py-3 px-4 text-right text-slate-900">{formatCurrencyFixed(calculateTotal(selectedInvoice.labor))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Equipment</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">Equipment</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-900">Duration</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-900">Rate</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedInvoice.equipment.map((equipment, index) => (
                        <tr key={index}>
                          <td className="py-3 px-4 text-slate-900">{equipment.name}</td>
                          <td className="py-3 px-4 text-right text-slate-600">
                            {equipment.days ? `${equipment.days} days` : `${equipment.hours} hrs`}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600">
                            {formatCurrencyFixed(equipment.rate)}/{equipment.days ? 'day' : 'hr'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrencyFixed(equipment.total)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-medium">
                        <td colSpan={3} className="py-3 px-4 text-slate-900">Equipment Subtotal</td>
                        <td className="py-3 px-4 text-right text-slate-900">{formatCurrencyFixed(calculateTotal(selectedInvoice.equipment))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expenses */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Additional Expenses</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-slate-200 rounded-lg">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-slate-900">Description</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-900">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedInvoice.expenses.map((expense, index) => (
                        <tr key={index}>
                          <td className="py-3 px-4 text-slate-900">{expense.description}</td>
                          <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrencyFixed(expense.amount)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-medium">
                        <td className="py-3 px-4 text-slate-900">Expenses Subtotal</td>
                        <td className="py-3 px-4 text-right text-slate-900">{formatCurrencyFixed(calculateTotal(selectedInvoice.expenses))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Materials Total</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrencyFixed(calculateTotal(selectedInvoice.materials))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Labor Total</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrencyFixed(calculateTotal(selectedInvoice.labor))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Equipment Total</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrencyFixed(calculateTotal(selectedInvoice.equipment))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Expenses Total</p>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrencyFixed(calculateTotal(selectedInvoice.expenses))}</p>
                  </div>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600">Grand Total</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrencyFixed(selectedInvoice.totalAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">vs Estimated</p>
                    <p className={`text-lg font-semibold ${selectedInvoice.savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedInvoice.savings >= 0 ? 'Saved' : 'Over'} {formatCurrencyFixed(Math.abs(selectedInvoice.savings))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedInvoice.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      handleRejectInvoice(selectedInvoice.id);
                      setSelectedInvoice(null);
                    }}
                    className="px-6 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Reject Invoice
                  </button>
                  <button
                    onClick={() => {
                      handleApproveInvoice(selectedInvoice.id);
                      setSelectedInvoice(null);
                    }}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Approve Invoice
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 