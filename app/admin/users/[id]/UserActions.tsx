"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Save, Loader2, KeyRound, X } from "lucide-react";

export default function UserActions({ id, email, currentRole }: { id: string; email: string; currentRole: string }) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

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

  const handlePasswordUpdate = async () => {
    setPasswordError("");

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(`/api/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      if (res.ok) {
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordModal(false);
        alert("Password updated successfully.");
      } else {
        const data = await res.json().catch(() => null);
        setPasswordError(data?.error || "Failed to update password.");
      }
    } catch (e) {
      setPasswordError("Error updating password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center space-x-2 flex-wrap">
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

      <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

      <button
        onClick={() => {
          setShowPasswordModal(true);
          setPasswordError("");
        }}
        className="flex items-center space-x-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100"
      >
        <KeyRound size={18} />
        <span className="text-sm font-medium">Update Password</span>
      </button>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
      >
        {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        <span className="text-sm font-medium">Delete User</span>
      </button>
    </div>
    {showPasswordModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Update User Password</h3>
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setNewPassword("");
                setConfirmPassword("");
                setPasswordError("");
              }}
              className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
              <input
                type="text"
                value={email}
                readOnly
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {passwordError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {passwordError}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasswordUpdate}
                disabled={passwordLoading || !newPassword || !confirmPassword}
                className={`px-4 py-2 text-sm rounded-lg text-white ${
                  passwordLoading || !newPassword || !confirmPassword
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
