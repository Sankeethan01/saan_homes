"use client";

import { useState, useEffect } from "react";
import {
  RiFileTextLine,
  RiCameraLine,
  RiVideoLine,
  RiUploadLine,
  RiCloseLine,
  RiAddLine,
  RiPlayLine,
  RiDownloadLine,
} from "react-icons/ri";
import { fetchWithAuth } from "@/app/utils/auth";

interface ProjectStep {
  id: string;
  title: string;
  description: string;
  order: number;
  is_approved: boolean;
  actual_completed: string | null;
  expected_budget: number;
  progress: number;
  status: string;
  logs: ProgressLog[];
  invoice?: {
    id: string;
    is_approved: boolean;
    amount: number;
    description: string;
  };
}

interface ProgressLog {
  id: string;
  stepId: string;
  title: string;
  description: string;
  media: MediaFile[];
  timestamp: string;
  type: 'TEXT' | 'PHOTO' | 'VIDEO';
}

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video' | 'pdf';
  filename: string;
}

interface Project {
  id: string;
  name: string;
  steps: ProjectStep[];
}

interface MediaUploadData {
  step: string;
  title: string;
  description: string;
  files: File[];
}

export default function ProgressLogs({ project, onMediaEdited }: { project: Project & { media_files?: any[] }, onMediaEdited?: () => void }) {
  // Remove: Add Progress Log button, upload modal, and handleSubmit logic
  // Only display logs/media for each step that have media attached

  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceStepId, setInvoiceStepId] = useState<string | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    amount: '',
    description: '',
    files: [] as File[],
    invoiceId: '',
    isApproved: false,
    status: '',
  });
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Fetch invoice when modal opens
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceStepId) return;
      setLoadingInvoice(true);
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        const res = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/?step=${invoiceStepId}`);
        if (res.ok) {
          const data = await res.json();
          // If list, get first invoice
          const invoice = Array.isArray(data) ? data[0] : data;
          if (invoice) {
            setInvoiceForm((prev) => ({
              ...prev,
              amount: invoice.data?.amount?.toString() || '',
              description: invoice.data?.description || '',
              invoiceId: invoice.id,
              isApproved: invoice.is_approved,
              status: invoice.is_approved ? 'APPROVED' : 'SUBMITTED',
              files: [],
            }));
          }
        }
      } catch (e) {
        // fallback: do nothing
      } finally {
        setLoadingInvoice(false);
      }
    };
    if (showInvoiceModal && invoiceStepId) fetchInvoice();
  }, [showInvoiceModal, invoiceStepId]);

  // Sort steps by order
  const sortedSteps = [...project.steps].sort((a, b) => a.order - b.order);

  // Move handleInvoiceSubmit above the return statement so it is defined for the invoice modal
  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.invoiceId || !invoiceStepId) return;
    setLoadingInvoice(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
      // Update invoice
      await fetchWithAuth(`${apiBaseUrl}/projects/invoices/${invoiceForm.invoiceId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            amount: invoiceForm.amount,
            description: invoiceForm.description,
          },
        }),
      });
      // Upload bills
      for (const file of invoiceForm.files) {
        const formData = new FormData();
        formData.append('step', invoiceStepId);
        formData.append('pdf', file);
        await fetchWithAuth(`${apiBaseUrl}/projects/bills/`, {
          method: 'POST',
          body: formData,
        });
      }
      setShowInvoiceModal(false);
      setInvoiceStepId(null);
      setInvoiceForm({ amount: '', description: '', files: [], invoiceId: '', isApproved: false, status: '', });
      alert('Invoice submitted for admin review!');
    } catch (err) {
      alert('Failed to submit invoice.');
    } finally {
      setLoadingInvoice(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold mb-6">Project Timeline</h2>
      <div className="relative border-l-4 border-[#1b4965]/30 ml-4">
        {sortedSteps.map((step, idx) => {
          const isCurrent = step.status === 'IN_PROGRESS';
          const isCompleted = step.status === 'COMPLETED';
          console.log('All media_files:', project.media_files);
          console.log('Current step.id:', step.id);
          console.log(
            'Filtered media for this step:',
            project.media_files?.filter(m => String(m.step_id) === String(step.id))
          );
          // Show ProjectMedia for this step
          const stepMedia = (project.media_files || []).filter(
            m => m.step_id && String(m.step_id) === String(step.id)
          );
          console.log('Step:', step.id, 'stepMedia:', stepMedia);
          return (
            <div key={step.id} className="mb-12 relative">
              {/* Timeline marker */}
              <span className={`absolute -left-6 top-2 w-5 h-5 rounded-full border-4 ${
                isCurrent
                  ? 'border-yellow-400 bg-yellow-100 animate-pulse'
                  : isCompleted
                  ? 'border-green-500 bg-green-100'
                  : 'border-gray-300 bg-white'
              }`}></span>
              <div className={`ml-4 p-6 rounded-xl border transition-all duration-200 ${
                isCurrent
                  ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                  : isCompleted
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 text-lg">{step.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    isCompleted
                      ? 'bg-green-100 text-green-800'
                      : isCurrent
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {step.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Progress: {step.progress}%</span>
                  <span>Budget: ${step.expected_budget?.toLocaleString() || '0'}</span>
                </div>
                {/* Invoice Button for COMPLETED steps */}
                {isCompleted && (
                  <button
                    onClick={() => {
                      setInvoiceStepId(step.id);
                      setShowInvoiceModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors mb-4 ml-2"
                  >
                    <RiFileTextLine className="w-4 h-4" />
                    Invoice
                  </button>
                )}
                {/* Show invoice status if exists */}
                {step.invoice && (
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${step.invoice.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {step.invoice.is_approved ? 'Invoice Approved' : 'Invoice Submitted'}
                  </span>
                )}
                {/* Logs Timeline */}
                <div className="space-y-4">
                  {/* Show ProjectMedia for this step */}
                  {stepMedia.length > 0 && (
                    <div className="space-y-3">
                      <h6 className="font-semibold text-indigo-700 flex items-center gap-2">
                        <RiCameraLine className="text-blue-500" />
                        Uploaded Media ({stepMedia.length})
                      </h6>
                      <div className="flex gap-3 flex-wrap">
                        {stepMedia.map((media) => (
                          <div key={media.id} className="group/media relative overflow-hidden w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center hover:from-blue-100 hover:to-purple-100 transition-all duration-300 shadow-md hover:shadow-lg">
                            {media.type === 'image' && (
                              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                                <RiCameraLine className="text-white text-xl" />
                              </div>
                            )}
                            {media.type === 'video' && (
                              <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                                <RiVideoLine className="text-white text-xl" />
                              </div>
                            )}
                            {media.type === 'pdf' && (
                              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                                <RiFileTextLine className="text-white text-xl" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-all duration-300 rounded-xl"></div>
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity duration-300"
                            >
                              <RiDownloadLine className="text-white text-xl" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {step.logs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <RiFileTextLine className="text-4xl mx-auto mb-2 text-gray-300" />
                      <p>No media uploaded for this step yet</p>
                      <p className="text-sm">Upload media using the Project Media section</p>
                    </div>
                  ) : (
                    step.logs
                      .filter(log => log.media && log.media.length > 0)
                      .slice()
                      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                      .map((log) => (
                        <div key={log.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-gray-800">{log.title}</h5>
                            <span className="text-sm text-gray-500">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{log.description}</p>
                          {log.media.length > 0 && (
                            <div className="space-y-3">
                              <h6 className="font-semibold text-gray-700 flex items-center gap-2">
                                <RiCameraLine className="text-blue-500" />
                                Attached Media ({log.media.length})
                              </h6>
                              <div className="flex gap-3 flex-wrap">
                                {log.media.map((media) => (
                                  <div key={media.id} className="group/media relative overflow-hidden w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center hover:from-blue-100 hover:to-purple-100 transition-all duration-300 shadow-md hover:shadow-lg">
                                    {media.type === 'image' && (
                                      <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                                        <RiCameraLine className="text-white text-xl" />
                                      </div>
                                    )}
                                    {media.type === 'video' && (
                                      <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                                        <RiVideoLine className="text-white text-xl" />
                                      </div>
                                    )}
                                    {media.type === 'pdf' && (
                                      <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                                        <RiFileTextLine className="text-white text-xl" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-all duration-300 rounded-xl"></div>
                                    <a
                                      href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${media.url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity duration-300"
                                    >
                                      <RiDownloadLine className="text-white text-xl" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <StepInvoiceModal
          open={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false);
            setInvoiceStepId(null);
            setInvoiceForm({ amount: '', description: '', files: [], invoiceId: '', isApproved: false, status: '', });
          }}
          form={invoiceForm}
          setForm={setInvoiceForm}
          onSubmit={handleInvoiceSubmit}
          loading={loadingInvoice}
        />
      )}
    </div>
  );
} 

function StepInvoiceModal({ open, onClose, form, setForm, onSubmit, loading }: {
  open: boolean;
  onClose: () => void;
  form: { amount: string; description: string; files: File[]; invoiceId?: string; isApproved?: boolean; status?: string };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Step Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>
        {form.status && (
          <div className={`mb-2 px-3 py-1 rounded text-xs font-semibold ${form.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{form.status}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((prev: any) => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
              placeholder="Enter invoice amount"
              required
              disabled={!!form.isApproved || loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev: any) => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700"
              rows={3}
              placeholder="Describe the bill or invoice details"
              required
              disabled={!!form.isApproved || loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Bill (PDF/Image) *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <RiUploadLine className="text-4xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Drag and drop files here or click to browse</p>
              <p className="text-sm text-gray-500 mb-4">Supports: PDF, Images</p>
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    setForm((prev: any) => ({ ...prev, files: [...prev.files, ...files] }));
                  }
                }}
                className="hidden"
                id="invoice-upload"
                required={form.files.length === 0}
                disabled={!!form.isApproved || loading}
              />
              <label
                htmlFor="invoice-upload"
                className={`inline-block bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-800 ${form.isApproved || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ pointerEvents: form.isApproved || loading ? 'none' : 'auto' }}
              >
                Choose Files
              </label>
            </div>
            {/* Selected Files */}
            {form.files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-gray-700">Selected Files:</h4>
                {form.files.map((file: File, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    {!form.isApproved && !loading && (
                      <button
                        type="button"
                        onClick={() => setForm((prev: any) => ({ ...prev, files: prev.files.filter((_: File, i: number) => i !== index) }))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <RiCloseLine />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!!form.isApproved || loading}
            >
              {loading ? 'Submitting...' : 'Submit Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 