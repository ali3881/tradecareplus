"use client";

import { useState } from "react";
import { Loader2, X, Eye, EyeOff, Copy } from "lucide-react";

interface AddTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddTechnicianModal({ isOpen, onClose, onCreated }: AddTechnicianModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tempPassword: "",
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successData, setSuccessData] = useState<{ email: string, password?: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Auto-generate password if empty
    const finalPassword = formData.tempPassword || Math.random().toString(36).slice(-8) + "Aa1!";
    
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tempPassword: finalPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create technician");
      }

      setSuccessData({ email: data.email, password: finalPassword });
      onCreated(); // Refresh parent list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", email: "", phone: "", tempPassword: "", isActive: true });
    setSuccessData(null);
    setError("");
    onClose();
  };

  if (successData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-green-600">Technician Created!</h3>
            <button onClick={handleClose}><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">The account has been created successfully.</p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Email</span>
                <p className="font-mono text-sm">{successData.email}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">Temporary Password</span>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-bold">{successData.password}</p>
                  <button 
                    onClick={() => navigator.clipboard.writeText(successData.password || "")}
                    className="text-blue-600 text-xs hover:underline flex items-center"
                  >
                    <Copy size={12} className="mr-1" /> Copy
                  </button>
                </div>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 font-bold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-xl font-bold text-gray-800">Add Technician</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temporary Password <span className="text-gray-400 font-normal">(Optional - auto-generated if empty)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none pr-10"
                value={formData.tempPassword}
                onChange={e => setFormData({...formData, tempPassword: e.target.value})}
                placeholder="Auto-generate"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              checked={formData.isActive}
              onChange={e => setFormData({...formData, isActive: e.target.checked})}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active Account
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
