"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Video, PlusCircle, Eye, Trash2, Loader2, MessageCircle, Wrench } from "lucide-react";
import ServiceRequestForm from "@/components/ServiceRequestForm";
import JobDetailsModal from "@/components/JobDetailsModal";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { hasDashboardAccess } from "@/lib/access";
import AdminPanel from "@/components/AdminPanel";

export default function DashboardClient({ user }: { user: any }) {
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sub = user.subscription;
  const isActive = hasDashboardAccess(user, sub);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/service-requests");
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  }, []);

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setJobs((prev) => prev.filter((job) => job.id !== id));
      } else {
        const err = await res.json();
        alert(`Failed to delete: ${err.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete job. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchJobs();
    }
  }, [isActive, fetchJobs]);

  useEffect(() => {
    if (showJobForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showJobForm]);

  if (!isActive) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-yellow-500 p-4 text-center">
            <h2 className="text-xl font-bold text-black">Choose Your Plan</h2>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-6">
              You need an active subscription to access dashboard features, log jobs, and use support channels.
            </p>
            <Link
              href="/packages"
              className="block w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              VIEW PACKAGES
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full bg-gray-50">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 text-white p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-200 mt-2">Welcome back, {user.name || user.email}</p>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              {sub && (
                <>
                  <span className="text-xs sm:text-sm bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                    Plan: <span className="font-bold">{sub.plan}</span>
                  </span>
                  <span className="text-xs font-bold uppercase bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    {sub.status}
                  </span>
                </>
              )}
              {user.role === "ADMIN" && (
                <span className="text-xs font-bold uppercase bg-purple-100 text-purple-800 px-3 py-1 rounded-full">ADMIN</span>
              )}
            </div>
          </div>
        </section>

        {user.role === "ADMIN" && <AdminPanel />}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setShowJobForm(true)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-yellow-400 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center mb-4">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1 text-gray-900">Log a Job</h3>
            <p className="text-sm text-gray-500">Request service or maintenance.</p>
          </button>

          <a
            href="https://wa.me/61410886899?text=Hi,%20I%20would%20like%20to%20request%20a%20video%20assessment."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-400 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1 text-gray-900">Video Assessment</h3>
            <p className="text-sm text-gray-500">Start a quick video call assessment.</p>
          </a>

          <a
            href="https://wa.me/61410886899?text=Hi,%20I%20need%20help%20with%20a%20service%20request."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-400 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1 text-gray-900">Chat on WhatsApp</h3>
            <p className="text-sm text-gray-500">Get instant support on WhatsApp.</p>
          </a>
        </section>

        <section className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Your Coverage Snapshot</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Included Visits Remaining</p>
              <p className="text-3xl font-bold text-gray-900">{user.entitlement?.includedVisitsRemaining || 0}</p>
            </div>
            <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">CCTV / Jet Blast Due</p>
              <p className="text-lg font-semibold text-gray-900">
                {user.entitlement?.cctvDueAt ? new Date(user.entitlement.cctvDueAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Hot Water Inspection Due</p>
              <p className="text-lg font-semibold text-gray-900">
                {user.entitlement?.hotWaterInspectionDueAt ? new Date(user.entitlement.hotWaterInspectionDueAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">My Jobs</h3>
            <button onClick={fetchJobs} className="text-sm font-medium text-yellow-700 hover:text-yellow-800">
              Refresh
            </button>
          </div>
          {jobs.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <Wrench className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              No jobs logged yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <li key={job.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-yellow-700 truncate">{job.type.replace(/_/g, " ")}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          job.status === "NEW"
                            ? "bg-green-100 text-green-800"
                            : job.status === "COMPLETED"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {job.status}
                      </span>
                      <p className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <a
                          href={buildWhatsAppUrl({
                            name: user.name || user.email,
                            email: user.email,
                            jobId: job.id,
                            serviceType: job.type,
                            description: job.description,
                            location: job.locationText,
                            urgency: job.urgency,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-green-500 transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="h-5 w-5" />
                        </a>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingId === job.id}
                          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Delete Job"
                        >
                          {deletingId === job.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}

        {showJobForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
                onClick={() => setShowJobForm(false)}
              ></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <ServiceRequestForm onClose={() => setShowJobForm(false)} onSuccess={fetchJobs} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
