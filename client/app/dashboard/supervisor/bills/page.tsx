"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchWithAuth } from "@/app/utils/auth";
import {
  RiUploadLine,
  RiDeleteBin6Line,
  RiCloseLine,
  RiFileTextLine,
  RiCheckLine,
  RiDownloadLine,
  RiEdit2Line,
} from "react-icons/ri";

interface Invoice {
  id: string;
  data?: {
    amount: number;
    description: string;
  };
  is_approved: boolean;
}

interface StepBill {
  id: string;
  amount: number;
  description: string;
  stepId: string;
  stepName?: string;
  projectId: string;
  projectName?: string;
  invoice_file: string | undefined;
  file_size?: number;
  uploaded_by_name?: string;
  uploaded_at?: string;
  is_submitted_to_admin?: boolean;
  stepInvoice?: Invoice | null;
}

interface Project {
  id: string;
  name: string;
}

interface Step {
  id: string;
  title: string;
}

export default function BillsPage() {
  const [projectId, setProjectId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [stepBills, setStepBills] = useState<StepBill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [projectSteps, setProjectSteps] = useState<Record<string, Step[]>>({});
  const [steps, setSteps] = useState<Record<string, Step[]>>({});
  const [showForm, setShowForm] = useState<boolean>(false);
  const [form, setForm] = useState<{ step: string; files: File[] }>({
    step: "",
    files: [],
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");
  const [refresh, setRefresh] = useState<number>(0);
  const [backgroundRefresh, setBackgroundRefresh] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/supervisor_projects/`
      );
      const data = await response.json();
      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const fetchProjectSteps = useCallback(async (projectId: string) => {
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/steps/`
      );
      const data = await res.json();
      setProjectSteps((prev) => ({ ...prev, [projectId]: data }));
    } catch (error) {
      console.error("Failed to fetch steps:", error);
    }
  }, []);

  useEffect(() => {
    if (projectId && !projectSteps[projectId]) {
      fetchProjectSteps(projectId);
    }
  }, [projectId, projectSteps, fetchProjectSteps]);

  const fetchBills = useCallback(async () => {
    if (!backgroundRefresh) setLoading(true);
    try {
      const allBills: StepBill[] = [];

      const targetProjects = projectId
        ? projects.filter((p) => p.id === projectId)
        : projects;

      for (const project of targetProjects) {
        const projectRes = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${project.id}/`
        );
        if (!projectRes.ok) continue;

        const projectData = await projectRes.json();
        const stepsData: Step[] = projectData.steps || [];

        // Map step IDs to their invoice
        const stepInvoiceMap: Record<string, Invoice | null> = {};
        stepsData.forEach((step: Step & { invoice?: Invoice }) => {
          if (step.invoice) {
            stepInvoiceMap[step.id] = step.invoice;
          }
        });

        setSteps((prev) => ({
          ...prev,
          [project.id]: stepsData,
        }));

        for (const step of stepsData) {
          const billsRes = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/?step=${step.id}`
          );
          if (!billsRes.ok) continue;

          interface BillResponse {
            id: string;
            step: string;
            ocr_data?: { total: number };
            pdf?: string;
            file_size?: number;
            uploaded_by_name?: string;
            uploaded_at?: string;
            is_submitted_to_admin?: boolean;
            project_name?: string;
          }
          
          const billsData: BillResponse[] = await billsRes.json();

          allBills.push(
            ...billsData
              .filter((b) => b.step === step.id)
              .map((b) => ({
                id: b.id,
                amount: b.ocr_data?.total || 0,
                description: b.pdf?.split("/").pop() || "No description",
                invoice_file: b.pdf,
                stepId: step.id,
                stepName: step.title,
                projectId: project.id,
                projectName: projectData.name,
                file_size: b.file_size,
                uploaded_by_name: b.uploaded_by_name,
                uploaded_at: b.uploaded_at,
                is_submitted_to_admin: b.is_submitted_to_admin,
                stepInvoice: stepInvoiceMap[step.id] || null,
              }))
          );
        }
      }

      const uniqueBills = Array.from(
        new Map(allBills.map((bill) => [bill.id, bill])).values()
      );
      setStepBills(uniqueBills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setStepBills([]);
    } finally {
      setLoading(false);
      setBackgroundRefresh(false);
    }
  }, [projectId, projects, backgroundRefresh]);

  useEffect(() => {
    if (projects.length > 0) {
      fetchBills();
    }
  }, [projects, refresh, fetchBills]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setForm((f) => ({ ...f, files: [...f.files, ...files] }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !form.step || form.files.length === 0) {
      alert("Please select a step and upload at least one PDF.");
      return;
    }
    setSaving(true);
    try {
      for (const file of form.files) {
        const fd = new FormData();
        fd.append("step", form.step);
        fd.append("project", projectId); // ✅ Include projectId
        fd.append("pdf", file);
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/`,
          {
            method: "POST",
            body: fd,
          }
        );
        if (!res.ok) throw new Error("Upload failed");
        // Optimistically add the new bill card
        const currentProject = projects.find((p) => p.id === projectId);
        const currentStep = steps[projectId]?.find((s) => s.id === form.step);  // <-- fixed here
        setStepBills((prev) => [
          {
            id: `temp-${Date.now()}-${Math.random()}`,
            amount: 0,
            description: file.name,
            invoice_file: "", // Can't know URL until backend returns
            stepId: form.step,
            stepName: currentStep?.title || "Unknown Step",
            projectId: projectId,
            projectName: currentProject?.name || "Unknown Project",
            file_size: file.size,
            uploaded_by_name: "You",
            uploaded_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
      setShowForm(false);
      setForm({ step: "", files: [] });
      setToast("Bill uploaded successfully!");
      setBackgroundRefresh(true);
      setRefresh((r) => r + 1);
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setSaving(false);
    }
  };
  

  const handleCancel = () => {
    setShowForm(false);
    setForm({ step: "", files: [] });
  };

  const filteredBills = stepBills.filter((bill) => {
    const matchesProject = projectId ? bill.projectId === projectId : true;
    const matchesSearch = bill.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesProject && matchesSearch;
  });

  const totalBills = filteredBills.length;
  const paidBills = filteredBills.filter(
    (b) => b.amount > 0 && b.amount % 2 === 0
  ).length;
  const unpaidBills = totalBills - paidBills;


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b4965] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <h2 className="text-2xl font-semibold mb-6">Project Bills</h2>

      {/* Filter/Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="p-2 border rounded-md w-full md:w-64"
          title="Filter by project"
          aria-label="Filter by project"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search bills..."
          className="p-2 border rounded-md flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add Bill Button (only show if a project is selected) */}
      {projectId && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <RiFileTextLine className="mr-2" />
            Add Bill
          </button>
        </div>
      )}

      {/* Project Name Card */}
      {projectId && (
        <div className="bg-blue-50 p-4 rounded-xl mb-6 flex items-center gap-3">
          <span className="text-2xl text-blue-600 font-bold">
            {projects.find((p) => p.id === projectId)?.name}
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-xl flex items-center gap-4">
          <RiFileTextLine className="text-3xl text-blue-600" />
          <div>
            <div className="text-xl font-bold">{totalBills}</div>
            <div className="text-blue-600">Total Bills</div>
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-xl flex items-center gap-4">
          <RiCheckLine className="text-3xl text-green-600" />
          <div>
            <div className="text-xl font-bold">{paidBills}</div>
            <div className="text-green-600">Paid</div>
          </div>
        </div>
        <div className="bg-red-50 p-6 rounded-xl flex items-center gap-4">
          <RiCloseLine className="text-3xl text-red-600" />
          <div>
            <div className="text-xl font-bold">{unpaidBills}</div>
            <div className="text-red-600">Unpaid</div>
          </div>
        </div>
      </div>

      {/* Bills Grid/List */}
      {filteredBills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <RiFileTextLine className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bills found</h3>
          <p className="text-gray-500 text-center max-w-md">
            No bills match your current search criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.map((bill) => {
            const fileSizeMB = bill.file_size ? (bill.file_size / (1024 * 1024)).toFixed(2) : "-";
            const uploadedDate = bill.uploaded_at ? new Date(bill.uploaded_at).toLocaleDateString() : "-";
            return (
              <div
                key={bill.id}
                className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-gray-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-500 text-2xl">
                    <RiFileTextLine />
                  </span>
                  <span className="font-semibold text-gray-700">BILL</span>
                  <div className="ml-auto flex gap-3">
                    {bill.invoice_file && (
                      <a href={bill.invoice_file} download className="text-blue-600 hover:text-blue-800" title="Download">
                        <RiDownloadLine />
                      </a>
                    )}
                    {bill.invoice_file && (
                      <a href={bill.invoice_file} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800" title="View">
                        <RiFileTextLine />
                      </a>
                    )}
                    {/* Edit Icon */}
                    <button
                      className="text-yellow-600 hover:text-yellow-800 ml-2"
                      title="Edit Bill"
                      onClick={() => {
                        alert(`Edit bill: ${bill.id}`);
                      }}
                    >
                      <RiEdit2Line />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 ml-2"
                      title="Delete Bill"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this bill?')) {
                          const originalBills = [...stepBills];
                          const newBills = stepBills.filter(b => b.id !== bill.id);
                          setStepBills(newBills);

                          try {
                            const res = await fetchWithAuth(
                              `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/${bill.id}/`,
                              { method: 'DELETE' }
                            );
                            if (!res.ok) throw new Error('Delete failed');
                            setToast('Bill deleted successfully!');
                            setTimeout(() => setToast(''), 3000);
                          } catch {
                            setStepBills(originalBills);
                            alert('Delete failed.');
                          }
                        }
                      }}
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </div>
                </div>
                <div className="font-bold text-lg break-all">{bill.description}</div>
                {!projectId && (
                  <div className="text-indigo-700 font-medium">
                    Project: {bill.projectName || "Unknown Project"}
                  </div>
                )}
                <div className="text-blue-700">
                  Step: {bill.stepName || "Unknown Step"}
                </div>
                <div className="text-gray-600 text-sm">File: {bill.description}</div>
                <div className="text-gray-600 text-sm">Size: {fileSizeMB} MB</div>
                <div className="text-gray-600 text-sm">Uploaded by: {bill.uploaded_by_name || "Unknown"}</div>
                <div className="text-gray-600 text-sm">Date: {uploadedDate}</div>
                {!bill.is_submitted_to_admin && (
                  <button
                    className="inline-block mt-2 px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
                    onClick={async () => {
                      try {
                        const res = await fetchWithAuth(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/${bill.id}/submit_to_admin/`,
                          { method: "POST" }
                        );
                        if (!res.ok) throw new Error("Failed to submit bill to admin");
                        setStepBills((prev) =>
                          prev.map((b) =>
                            b.id === bill.id ? { ...b, is_submitted_to_admin: true } : b
                          )
                        );
                        setToast("Bill submitted to admin!");
                        setTimeout(() => setToast(""), 3000);
                      } catch {
                        alert("Failed to submit bill to admin.");
                      }
                    }}
                  >
                    Submit to Admin
                  </button>
                )}
                {bill.is_submitted_to_admin && (
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                    Submitted to Admin
                  </span>
                )}
                {bill.stepInvoice && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <div className="font-semibold">Invoice</div>
                    <div>Amount: {bill.stepInvoice.data?.amount ?? "N/A"}</div>
                    <div>Description: {bill.stepInvoice.data?.description ?? "N/A"}</div>
                    <div>
                      Status:{" "}
                      {bill.stepInvoice.is_approved ? (
                        <span className="text-green-600 font-semibold">Approved</span>
                      ) : (
                        <span className="text-yellow-600 font-semibold">Pending Approval</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Add New Bill</h2>
              <button
                onClick={handleCancel}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
                title="Close form"
                aria-label="Close form"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-8 space-y-6">
              <div>
                <label
                  htmlFor="step-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Select Step
                </label>
                <select
                  id="step-select"
                  value={form.step}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, step: e.target.value }));
                  }}
                  required
                  className="w-full px-4 py-2 border rounded-md"
                  title="Select project step"
                  aria-label="Select project step"
                >
                  <option value="">-- Choose a step --</option>
                  {projectId && projectSteps[projectId]
                    ? projectSteps[projectId].map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))
                    : null}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Bill (PDF)
                </label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <RiUploadLine className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          accept="application/pdf"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                </div>
                {form.files.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {form.files.map((f) => f.name).join(", ")}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
                  disabled={saving}
                >
                  <RiUploadLine className="mr-2" />
                  {saving ? "Uploading..." : "Upload Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed top-20 right-20 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}