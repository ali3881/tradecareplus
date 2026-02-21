"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Save, Loader2, UserPlus, XCircle } from "lucide-react";

export default function UserActions({ id, currentRole }: { id: string; currentRole: string }) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update role");
      }
    } catch (e) {
      alert("Error updating role");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/users");
        router.refresh();
      } else {
        alert("Failed to delete user");
      }
    } catch (e) {
      alert("Error deleting user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm bg-white cursor-pointer"
        >
          <option value="USER">User</option>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          onClick={handleUpdate}
          disabled={loading || role === currentRole}
          className={`p-2 rounded-lg text-white transition-colors ${
            loading || role === currentRole ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
          title="Update Role"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
        </button>
      </div>

      <div className="h-8 w-px bg-gray-200 mx-2"></div>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
      >
        {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        <span className="text-sm font-medium">Delete User</span>
      </button>
    </div>
  );
}
