"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/app/utils/auth";
import { 
  RiArrowGoBackLine, 
  RiDeleteBin6Line, 
  RiRefreshLine,
  RiNotification4Line,
  RiFileList3Line,
  RiImageLine,
  RiSearchLine,
  RiCloseLine
} from "react-icons/ri";

interface DeletedAlert {
  id: string;
  project_name: string;
  text: string;
  type: string;
  status: string;
  created: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

interface DeletedBill {
  id: string;
  step: string; // UUID
  uploaded_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
  pdf?: string;
}

interface DeletedMedia {
  id: string;
  project: string; // UUID
  title: string;
  description: string;
  filename: string;
  media_type: string;
  uploaded_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
  url?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";
const ENDPOINTS = {
  alerts: {
    list: `${API_BASE}/notifications/project-alerts/?only_deleted=true&ordering=-deleted_at`,
    restore: (id: string) => `${API_BASE}/notifications/project-alerts/${id}/restore/`,
    purge: (id: string) => `${API_BASE}/notifications/project-alerts/${id}/purge/`,
  },
  bills: {
    list: `${API_BASE}/projects/bills/?only_deleted=true&ordering=-deleted_at`,
    restore: (id: string) => `${API_BASE}/projects/bills/${id}/restore/`,
    purge: (id: string) => `${API_BASE}/projects/bills/${id}/purge/`,
  },
  media: {
    list: `${API_BASE}/projects/project-media/?only_deleted=true&ordering=-deleted_at`,
    restore: (id: string) => `${API_BASE}/projects/project-media/${id}/restore/`,
    purge: (id: string) => `${API_BASE}/projects/project-media/${id}/purge/`,
  },
};

type TabKey = "notifications" | "bills" | "media";

const SkeletonLoader = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="w-3/4">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ type }: { type: string }) => (
  <div className="text-center py-12">
    <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
      {type === 'notifications' && <RiNotification4Line className="text-gray-400 text-2xl" />}
      {type === 'bills' && <RiFileList3Line className="text-gray-400 text-2xl" />}
      {type === 'media' && <RiImageLine className="text-gray-400 text-2xl" />}
    </div>
    <h3 className="text-lg font-medium text-gray-900">No {type} in recycle bin</h3>
    <p className="mt-1 text-sm text-gray-500">Deleted {type} will appear here</p>
  </div>
);

export default function RecycleBinPage() {
  const [tab, setTab] = useState<TabKey>("notifications");
  const [alerts, setAlerts] = useState<DeletedAlert[]>([]);
  const [bills, setBills] = useState<DeletedBill[]>([]);
  const [media, setMedia] = useState<DeletedMedia[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");

  const load = async (which: TabKey = tab) => {
    setLoading(true);
    setError("");
    try {
      if (which === "notifications") {
        const res = await fetchWithAuth(ENDPOINTS.alerts.list);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setAlerts(Array.isArray(data) ? data : []);
      } else if (which === "bills") {
        const res = await fetchWithAuth(ENDPOINTS.bills.list);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setBills(Array.isArray(data) ? data : []);
      } else if (which === "media") {
        const res = await fetchWithAuth(ENDPOINTS.media.list);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setMedia(Array.isArray(data) ? data : []);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load recycle bin");
      if (which === "notifications") setAlerts([]);
      if (which === "bills") setBills([]);
      if (which === "media") setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load("notifications"); }, []);

  const restore = async (which: TabKey, id: string) => {
    const snapshot = { alerts, bills, media };
    // optimistic remove
    if (which === "notifications") setAlerts(prev => prev.filter(x => x.id !== id));
    if (which === "bills") setBills(prev => prev.filter(x => x.id !== id));
    if (which === "media") setMedia(prev => prev.filter(x => x.id !== id));
    try {
      const url = which === "notifications" ? ENDPOINTS.alerts.restore(id) : which === "bills" ? ENDPOINTS.bills.restore(id) : ENDPOINTS.media.restore(id);
      const res = await fetchWithAuth(url, { method: 'POST' });
      if (!res.ok) throw new Error();
      // notify others to reload
      window.dispatchEvent(new Event('notifications:reload'));
    } catch {
      // revert
      setAlerts(snapshot.alerts);
      setBills(snapshot.bills);
      setMedia(snapshot.media);
    }
  };

  const purge = async (which: TabKey, id: string) => {
    const snapshot = { alerts, bills, media };
    // optimistic remove
    if (which === "notifications") setAlerts(prev => prev.filter(x => x.id !== id));
    if (which === "bills") setBills(prev => prev.filter(x => x.id !== id));
    if (which === "media") setMedia(prev => prev.filter(x => x.id !== id));
    try {
      const url = which === "notifications" ? ENDPOINTS.alerts.purge(id) : which === "bills" ? ENDPOINTS.bills.purge(id) : ENDPOINTS.media.purge(id);
      const res = await fetchWithAuth(url, { method: 'DELETE' });
      if (!res.ok) throw new Error();
    } catch {
      // revert
      setAlerts(snapshot.alerts);
      setBills(snapshot.bills);
      setMedia(snapshot.media);
    }
  };

  const filterItems = (items: any[], type: string) => {
    if (!searchQuery) return items;
    
    return items.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      if (type === 'notifications') {
        return (
          item.text.toLowerCase().includes(searchLower) ||
          item.project_name.toLowerCase().includes(searchLower) ||
          item.type.toLowerCase().includes(searchLower)
        );
      } else if (type === 'bills') {
        return item.id.toLowerCase().includes(searchLower);
      } else if (type === 'media') {
        return (
          (item.title || '').toLowerCase().includes(searchLower) ||
          (item.filename || '').toLowerCase().includes(searchLower) ||
          (item.description || '').toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  };

  const renderTable = () => {
    const filteredAlerts = filterItems(alerts, 'notifications');
    const filteredBills = filterItems(bills, 'bills');
    const filteredMedia = filterItems(media, 'media');

    if (tab === "notifications") {
      return (
        <div className="space-y-3">
          {loading ? (
            <SkeletonLoader />
          ) : filteredAlerts.length === 0 ? (
            <EmptyState type="notifications" />
          ) : (
            <div className="grid gap-3">
              {filteredAlerts.map((it) => (
                <div key={it.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{it.text}</h3>
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">{it.project_name}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{it.type}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{it.status}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Deleted {it.deleted_at ? new Date(it.deleted_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => restore("notifications", it.id)} 
                        className="p-2 rounded-full text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                        title="Restore"
                      >
                        <RiArrowGoBackLine size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this notification?')) {
                            purge("notifications", it.id);
                          }
                        }}
                        className="p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        title="Delete Forever"
                      >
                        <RiDeleteBin6Line size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (tab === "bills") {
      return (
        <div className="space-y-3">
          {loading ? (
            <SkeletonLoader />
          ) : filteredBills.length === 0 ? (
            <EmptyState type="bills" />
          ) : (
            <div className="grid gap-3">
              {filteredBills.map((it) => (
                <div key={it.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{it.pdf ? <a className="text-blue-600 underline" href={it.pdf} target="_blank">PDF</a> : it.id}</h3>
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">Uploaded at:</span>
                        <span className="mx-2">{new Date(it.uploaded_at).toLocaleString()}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Deleted {it.deleted_at ? new Date(it.deleted_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => restore("bills", it.id)} 
                        className="p-2 rounded-full text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                        title="Restore"
                      >
                        <RiArrowGoBackLine size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to permanently delete this bill?')) {
                            purge("bills", it.id);
                          }
                        }}
                        className="p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        title="Delete Forever"
                      >
                        <RiDeleteBin6Line size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {loading ? (
          <SkeletonLoader />
        ) : filteredMedia.length === 0 ? (
          <EmptyState type="media" />
        ) : (
          <div className="grid gap-3">
            {filteredMedia.map((it) => (
              <div key={it.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{it.title || it.filename}</h3>
                    <div className="mt-1 text-sm text-gray-500">
                      <span className="font-medium">{it.media_type}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{it.description}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Deleted {it.deleted_at ? new Date(it.deleted_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => restore("media", it.id)} 
                      className="p-2 rounded-full text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                      title="Restore"
                    >
                      <RiArrowGoBackLine size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to permanently delete this media?')) {
                          purge("media", it.id);
                        }
                      }}
                      className="p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      title="Delete Forever"
                    >
                      <RiDeleteBin6Line size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const changeTab = (next: TabKey) => {
    setTab(next);
    load(next);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recycle Bin</h1>
          <p className="text-sm text-gray-500">Restore or permanently delete items</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <RiCloseLine />
              </button>
            )}
          </div>
          <button 
            onClick={() => load(tab)} 
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
            title="Refresh"
          >
            <RiRefreshLine size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 flex items-start">
          <RiCloseLine className="flex-shrink-0 mt-0.5 mr-2 text-red-600" />
          <div>{error}</div>
        </div>
      )}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            {["notifications", "bills", "media"].map((item) => (
              <button
                key={item}
                onClick={() => changeTab(item as TabKey)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  tab === item
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {item === 'notifications' ? alerts.length : item === 'bills' ? bills.length : media.length}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {renderTable()}
    </div>
  );
}
