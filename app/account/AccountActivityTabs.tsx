"use client";

import { useState } from "react";
import Link from "next/link";

type BookingRow = {
  id: string;
  status: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  item: {
    name: string;
    category: string;
  };
};

type EnquiryRow = {
  id: string;
  status: string;
  createdAt: string;
  item: {
    name: string;
    category: string;
  };
};

function statusBadge(status: string) {
  if (status === "PAID" || status === "ACTIVE") return "bg-green-100 text-green-700";
  if (status === "PENDING_PAYMENT" || status === "PENDING" || status === "NEW") return "bg-yellow-100 text-yellow-800";
  if (status === "FAILED" || status === "CANCELED") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

export default function AccountActivityTabs({
  bookings,
  enquiries,
}: {
  bookings: BookingRow[];
  enquiries: EnquiryRow[];
}) {
  const [activeTab, setActiveTab] = useState<"bookings" | "enquiries">("bookings");

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-5">
        <h2 className="text-lg font-semibold text-gray-900">My Activity</h2>
        <p className="mt-1 text-sm text-gray-500">Switch between your hire bookings and sale enquiries.</p>
      </div>

      <div className="border-b border-gray-100 px-6 pt-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "bookings" ? "bg-yellow-400 text-black" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Hire Bookings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("enquiries")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "enquiries" ? "bg-yellow-400 text-black" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Sales Enquiries
          </button>
        </div>
      </div>

      {activeTab === "bookings" ? (
        bookings.length === 0 ? (
          <div className="px-6 py-8 text-sm text-gray-500">No hire bookings yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{booking.item.name}</p>
                  <p className="text-sm text-gray-500">
                    {booking.item.category} · {new Date(booking.startDate).toLocaleDateString("en-AU")} to {new Date(booking.endDate).toLocaleDateString("en-AU")}
                  </p>
                  <p className="text-sm text-gray-500">Booking Ref: BK-{booking.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge(booking.status)}`}>
                    {booking.status}
                  </span>
                  <Link href={`/account/bookings/${booking.id}`} className="text-sm font-semibold text-yellow-700 hover:text-yellow-800">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : enquiries.length === 0 ? (
        <div className="px-6 py-8 text-sm text-gray-500">No sales enquiries yet.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {enquiries.map((enquiry) => (
            <div key={enquiry.id} className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{enquiry.item.name}</p>
                <p className="text-sm text-gray-500">{enquiry.item.category} · Sent {new Date(enquiry.createdAt).toLocaleDateString("en-AU")}</p>
                <p className="text-sm text-gray-500">Enquiry Ref: EN-{enquiry.id.slice(-6).toUpperCase()}</p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge(enquiry.status)}`}>
                  {enquiry.status}
                </span>
                <Link href={`/account/enquiries/${enquiry.id}`} className="text-sm font-semibold text-yellow-700 hover:text-yellow-800">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
