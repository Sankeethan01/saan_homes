"use client";

import { useState } from "react";
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
  progress: number; // Supervisor can adjust this
  status: string;
  logs: ProgressLog[];
  invoice?: {
    id: string;
    is_approved: boolean;
    amount: number;
    description: string;
    data?: {
      status: string;
      submitted_at?: string;
      invoice_number?: string;
    };
  };
}

interface ProgressLog {
  id: string;
  stepId: string;
  title: string;
  description: string;
  media: MediaFile[];
  timestamp: string;
  type: "TEXT" | "PHOTO" | "VIDEO";
}

interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video" | "pdf";
  filename: string;
}

interface Project {
  id: string;
  name: string;
  steps: ProjectStep[];
  media_files?: any[];
}

export default function ProgressLogs({
  project,
  onMediaEdited,
}: {
  project: Project;
  onMediaEdited?: () => void;
}) {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<any>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  // 🔹 Update progress (slider, 10% increments)
  const handleProgressChange = async (stepId: string, value: number) => {
    // Snap to nearest 10%
    const snappedValue = Math.round(value / 10) * 10;
    setUpdatingProgress(stepId);

    try {
      const res = await fetchWithAuth(`${apiBaseUrl}/projects/steps/${stepId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: snappedValue }),
      });

      if (res.ok) {
        const updatedSteps = project.steps.map((s) =>
          s.id === stepId ? { ...s, progress: snappedValue } : s
        );
        project.steps = updatedSteps;
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
    } finally {
      setUpdatingProgress(null);
    }
  };

  // 🔹 Supervisor marks step as completed (sets 100%)
  const handleMarkCompleted = async (stepId: string) => {
    setUpdatingStep(stepId);
    try {
      const res = await fetchWithAuth(
        `${apiBaseUrl}/projects/steps/${stepId}/approve/`,
        { method: "POST" }
      );

      if (res.ok) {
        const updatedSteps = project.steps.map((s) =>
          s.id === stepId ? { ...s, status: "COMPLETED", progress: 100 } : s
        );
        project.steps = updatedSteps;
      }
    } catch (err) {
      console.error("Failed to mark step completed:", err);
    } finally {
      setUpdatingStep(null);
    }
  };

  // 🔹 Fetch invoice
  const handleInvoiceClick = async (stepId: string) => {
    setLoadingInvoice(true);
    let step = project.steps.find((s) => s.id === stepId);
    if (!step) {
      setLoadingInvoice(false);
      return;
    }

    let res = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/?step=${stepId}`);
    let invoice = null;
    if (res.ok) {
      const data = await res.json();
      invoice = Array.isArray(data) ? data[0] : data;
    }

    if (!invoice && step.status !== "COMPLETED") {
      await fetchWithAuth(`${apiBaseUrl}/projects/steps/${stepId}/approve/`, {
        method: "POST",
      });
      res = await fetchWithAuth(`${apiBaseUrl}/projects/invoices/?step=${stepId}`);
      if (res.ok) {
        const data = await res.json();
        invoice = Array.isArray(data) ? data[0] : data;
      }
    }

    setCurrentStep(step);
    setCurrentInvoice(invoice);
    setShowInvoiceModal(true);
    setLoadingInvoice(false);
  };

  const sortedSteps = [...project.steps].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold mb-6">Project Timeline</h2>
      <div className="relative border-l-4 border-[#1b4965]/30 ml-4">
        {sortedSteps.map((step) => {
          const isCurrent = step.status === "IN_PROGRESS";
          const isCompleted = step.status === "COMPLETED";
          const stepMedia = (project.media_files || []).filter(
            (m) => m.step_id && String(m.step_id) === String(step.id)
          );

          return (
            <div key={step.id} className="mb-12 relative">
              {/* Timeline marker */}
              <span
                className={`absolute -left-6 top-2 w-5 h-5 rounded-full border-4 ${
                  isCurrent
                    ? "border-yellow-400 bg-yellow-100 animate-pulse"
                    : isCompleted
                    ? "border-green-500 bg-green-100"
                    : "border-gray-300 bg-white"
                }`}
              ></span>

              <div
                className={`ml-4 p-6 rounded-xl border transition-all duration-200 ${
                  isCurrent
                    ? "border-yellow-400 bg-yellow-50 shadow-lg"
                    : isCompleted
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 text-lg">{step.title}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      isCompleted
                        ? "bg-green-100 text-green-800"
                        : isCurrent
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {step.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{step.description}</p>

                {/* 🔹 Progress bar & slider */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{step.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={10} // Snap every 10%
                    value={step.progress}
                    disabled={isCompleted || updatingProgress === step.id}
                    onChange={(e) =>
                      handleProgressChange(step.id, parseInt(e.target.value))
                    }
                    className="w-full h-6 accent-blue-600 cursor-pointer rounded-lg"
                  />
                  <div className="w-full bg-gray-300 rounded-full h-6 mt-2">
                    <div
                      className="bg-blue-600 h-6 rounded-full transition-all duration-300"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Budget: ${step.expected_budget?.toLocaleString() || "0"}</span>
                </div>

                {/* Supervisor Mark Completed */}
                {!isCompleted && (
                  <button
                    onClick={() => handleMarkCompleted(step.id)}
                    disabled={updatingStep === step.id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4 ml-2 disabled:opacity-50"
                  >
                    {updatingStep === step.id ? "Updating..." : "Mark as Completed"}
                  </button>
                )}

                {/* Invoice Button */}
                {isCompleted && (
                  <button
                    onClick={() => handleInvoiceClick(step.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors mb-4 ml-2"
                  >
                    <RiFileTextLine className="w-4 h-4" />
                    Invoice
                  </button>
                )}

                {step.invoice && (
                  <div className="ml-2 space-y-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        step.invoice.is_approved
                          ? "bg-green-100 text-green-800"
                          : step.invoice.data?.status === 'SUBMITTED'
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {step.invoice.is_approved 
                        ? "Invoice Approved" 
                        : step.invoice.data?.status === 'SUBMITTED'
                        ? "Invoice Submitted to Admin"
                        : "Invoice Draft"
                      }
                    </span>
                    {step.invoice.data?.status === 'SUBMITTED' && step.invoice.data?.submitted_at && (
                      <div className="text-xs text-gray-600">
                        Submitted: {step.invoice.data.submitted_at}
                      </div>
                    )}
                  </div>
                )}

                {/* Step Media */}
                {stepMedia.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h6 className="font-semibold text-indigo-700 flex items-center gap-2">
                      <RiCameraLine className="text-blue-500" />
                      Uploaded Media ({stepMedia.length})
                    </h6>
                    <div className="flex gap-3 flex-wrap">
                      {stepMedia.map((media) => (
                        <div
                          key={media.id}
                          className="group/media relative overflow-hidden w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center hover:from-blue-100 hover:to-purple-100 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          {media.type === "image" && (
                            <RiCameraLine className="text-blue-600 text-xl" />
                          )}
                          {media.type === "video" && (
                            <RiVideoLine className="text-red-600 text-xl" />
                          )}
                          {media.type === "pdf" && (
                            <RiFileTextLine className="text-orange-600 text-xl" />
                          )}
                          <a
                            href={`${apiBaseUrl}${media.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 bg-black/20"
                          >
                            <RiDownloadLine className="text-white text-xl" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <SupervisorInvoiceModal
          open={showInvoiceModal}
          step={currentStep}
          invoice={currentInvoice}
          onClose={() => {
            setShowInvoiceModal(false);
            setCurrentInvoice(null);
            setCurrentStep(null);
          }}
          onSaved={onMediaEdited}
        />
      )}
    </div>
  );
}
