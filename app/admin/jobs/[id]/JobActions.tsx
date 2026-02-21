"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Save, Loader2 } from "lucide-react";

export default function JobActions({ 
  id, 
  currentStatus, 
  currentAssignedTo, 
  staffList 
}: { 
  id: string; 
  currentStatus: string;
  currentAssignedTo?: string | null;
  staffList?: any[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [assignedTo, setAssignedTo] = useState(currentAssignedTo || "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status, 
          assignedToId: assignedTo || null 
        }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update job");
      }
    } catch (e) {
      alert("Error updating job");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/jobs");
        router.refresh();
      } else {
        alert("Failed to delete job");
      }
    } catch (e) {
      alert("Error deleting job");
    } finally {
      setDeleting(false);
    }
  };

  const hasChanges = status !== currentStatus || assignedTo !== (currentAssignedTo || "");

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Staff Assignment */}
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm bg-white cursor-pointer min-w-[150px]"
        >
          <option value="">Unassigned</option>
          {staffList?.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.name}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm bg-white cursor-pointer"
        >
          <option value="NEW">New</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="AWAITING_PARTS">Awaiting Parts</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        
        <button
          onClick={handleUpdate}
          disabled={loading || !hasChanges}
          className={`p-2 rounded-lg text-white transition-colors ${
            loading || !hasChanges ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
          title="Save Changes"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
        </button>
      </div>

      <div className="hidden sm:block h-8 w-px bg-gray-200 mx-2"></div>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100 whitespace-nowrap"
      >
        {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        <span className="text-sm font-medium">Delete Job</span>
      </button>
    </div>
  );
}
