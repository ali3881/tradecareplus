"use client";

import { useState, useEffect } from "react";
import { Star, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import AddTechnicianModal from "./AddTechnicianModal";

export default function StaffList({ initialStaff }: { initialStaff: any[] }) {
  const [staff, setStaff] = useState(initialStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refreshList = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (e) {
      console.error("Failed to refresh staff list", e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
         {/* This button was previously in the parent page, moving logic here or keeping it separate? 
             Ideally the button should be part of this component if we want to control the modal state easily 
             OR we lift the state up. Since the requirement said "In /admin/staff page... Add state", 
             we can actually put the button here to simplify passing state. 
             However, the layout in page.tsx had the button in the header. 
             Let's use a portal or just re-implement the header part here if acceptable, 
             OR better: The page passes a "refresh" trigger? 
             
             Actually, let's keep the button in the page header but maybe turn the whole page into a client component?
             NO, we want server rendering for initial load.
             
             Let's just put the "Add Technician" button INSIDE this client component 
             and replace the static header in the page with a client-side header wrapper?
             
             Simpler: The user asked to make the button WORK. The button is currently in page.tsx (Server Component).
             We can't add onClick to a Server Component.
             So we should move the button INTO this StaffList component OR make a separate Client Component for the button.
             
             Let's integrate the Header + List into this Client Component for seamless state sharing.
         */}
      </div>

      {/* Floating Action Button for Add (or Header integration) */}
      {/* We will modify the parent page to remove the static button and use this component's internal button 
          OR pass control. 
          Let's assume we will replace the static button in page.tsx with a client component button.
      */}

      <AddTechnicianModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={() => {
            refreshList();
            // Optional: setIsModalOpen(false) handled in modal
        }} 
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-700 flex items-center">
                All Technicians
                {refreshing && <Loader2 className="ml-2 animate-spin text-gray-400" size={16} />}
            </h3>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-bold"
            >
                <UserPlus size={16} className="mr-2" />
                Add New
            </button>
        </div>

        <table className="w-full text-left">
          <thead className="bg-white border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Active Jobs</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((tech) => (
              <tr key={tech.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mr-3">
                      {tech.name ? tech.name.charAt(0).toUpperCase() : "T"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tech.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">Technician</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <p>{tech.email}</p>
                  {tech.phone && <p className="text-xs text-gray-500">{tech.phone}</p>}
                </td>
                <td className="px-6 py-4">
                  {tech.isActive ? (
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                  ) : (
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-500">
                        Inactive
                      </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-700">
                  {tech._count?.assignedJobs ?? 0}
                </td>
                <td className="px-6 py-4 flex items-center text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <span className="ml-1 text-gray-700 text-sm">4.8</span>
                </td>
                <td className="px-6 py-4">
                  <Link 
                    href={`/admin/users/${tech.id}`} 
                    className="text-gray-400 hover:text-orange-600 font-medium text-sm transition-colors"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No staff members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
