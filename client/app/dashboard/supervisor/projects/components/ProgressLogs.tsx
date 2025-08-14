"use client";

import { useState, useEffect } from "react";
import {
  RiFileTextLine,
  RiCameraLine,
  RiVideoLine,
  RiDownloadLine,
} from "react-icons/ri";
import { fetchWithAuth } from "@/app/utils/auth";
import SupervisorInvoiceModal from "./SupervisorInvoiceModal";

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
  step_id?: string;
}

interface Project {
  id: string;
  name: string;
  steps: ProjectStep[];
}

interface Invoice {
  id: string;
  step: string;
  amount: number;
  description: string;
  is_approved: boolean;
  date: string;
  status?: string;
}

export default function ProgressLogs({ project, onMediaEdited }: { project: Project & { media_files?: MediaFile[] }, onMediaEdited?: () => void }) {

  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceStepId, setInvoiceStepId] = useState<string | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [currentStep, setCurrentStep] = useState<ProjectStep | null>(null);
  const handleInvoiceClick = async (stepId: string) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
    let invoice = null;
    const step = project.steps.find((s) => s.id === stepId);
    if (!step) {
      return;
    }
    let res = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/?step=${stepId}`);
    if (res.ok) {
      const data = await res.json();
      invoice = Array.isArray(data) ? data[0] : data;
    }
    // If not found, create it by approving the step if not already completed
    if (!invoice) {
      if (step.status !== "COMPLETED") {
        await fetchWithAuth(`${apiBaseUrl}/projects/steps/${stepId}/approve/`, { method: "POST" });
      }
      // Fetch again
      res = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/?step=${stepId}`);
      if (res.ok) {
        const data = await res.json();
        invoice = Array.isArray(data) ? data[0] : data;
      }
    }
    setCurrentStep(step);
    setCurrentInvoice(invoice);
    setShowInvoiceModal(true);
  };

  // Fetch invoice when modal opens
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceStepId) return;

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        const res = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/?step=${invoiceStepId}`);
        if (res.ok) {
          const data = await res.json();
          // If list, get first invoice
          const invoice = Array.isArray(data) ? data[0] : data;
          if (invoice) {
            // The new SupervisorInvoiceModal handles its own state, so we don't need to set it here.
            // We just need to ensure the modal is open and the invoice data is passed.
            setShowInvoiceModal(true);
            setCurrentInvoice(invoice);
            setCurrentStep(project.steps.find((s) => s.id === invoiceStepId) || null);
          }
        }
      } catch {
      } finally {
      }
    };
    if (showInvoiceModal && invoiceStepId) fetchInvoice();
  }, [showInvoiceModal, invoiceStepId, project.steps]);

  // Sort steps by order
  const sortedSteps = [...project.steps].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold mb-6">Project Timeline</h2>
      <div className="relative border-l-4 border-[#1b4965]/30 ml-4">
        {sortedSteps.map((step) => {
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
                    onClick={() => handleInvoiceClick(step.id)}
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
                                title={`Download ${media.filename}`}
                                aria-label={`Download ${media.filename}`}
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
                                title={`Download ${media.filename}`}
                                aria-label={`Download ${media.filename}`}
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
        <SupervisorInvoiceModal
          open={showInvoiceModal}
          step={currentStep || { id: '', title: '' }}
          invoice={currentInvoice ? { ...currentInvoice, status: currentInvoice.is_approved ? 'approved' : 'pending' } : undefined}
          onClose={() => {
            setShowInvoiceModal(false);
            setInvoiceStepId(null);
            setCurrentInvoice(null);
            setCurrentStep(null);
          }}
          onSaved={onMediaEdited}
        />
      )}
    </div>
  );
} 