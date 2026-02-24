"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
      type="button"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </button>
  );
}
