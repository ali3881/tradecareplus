"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  Settings, 
  Shield, 
  LogOut, 
  LayoutDashboard, 
  ChevronDown,
  CreditCard
} from "lucide-react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (status === "loading") {
    return <div className="h-8 w-20 bg-gray-800 animate-pulse rounded"></div>;
  }

  if (!session?.user) {
    return (
      <Link 
        href="/login" 
        className="flex items-center space-x-2 text-yellow-500 hover:text-white transition-colors font-bold"
      >
        <User size={14} />
        <span>SIGN IN</span>
      </Link>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-yellow-500 hover:text-white transition-colors font-bold outline-none focus:ring-2 focus:ring-yellow-500 rounded px-2 py-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative">
            <div className="w-6 h-6 rounded-full bg-yellow-600 text-white flex items-center justify-center text-xs">
                {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></div>
        </div>
        <span className="max-w-[100px] truncate">{user.name || "User"}</span>
        <ChevronDown size={14} className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
            className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-2xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right"
            role="menu"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center space-x-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-lg font-bold">
                        {initials}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
                <Link 
                    href="/dashboard" 
                    className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                        <LayoutDashboard size={16} />
                    </div>
                    Dashboard
                </Link>
                {user.role === "ADMIN" && (
                  <Link 
                      href="/admin" 
                      className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                      role="menuitem"
                      onClick={() => setIsOpen(false)}
                  >
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center mr-3 group-hover:bg-red-100 transition-colors">
                          <Shield size={16} />
                      </div>
                      Admin Portal
                  </Link>
                )}
                <Link 
                    href="/manage-subscription" 
                    className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mr-3 group-hover:bg-emerald-100 transition-colors">
                        <CreditCard size={16} />
                    </div>
                    Manage Subscription
                </Link>
                <Link 
                    href="/account" 
                    className="flex items-center px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-3 group-hover:bg-purple-100 transition-colors">
                        <Settings size={16} />
                    </div>
                    Account Settings
                </Link>
                
            </div>

            <div className="border-t border-gray-100 my-1"></div>

            {/* Sign Out */}
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group text-left"
                role="menuitem"
            >
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center mr-3 group-hover:bg-red-100 transition-colors">
                    <LogOut size={16} />
                </div>
                Sign Out
            </button>

            {/* Footer / Online Indicator */}
            <div className="px-6 py-2 flex justify-end items-center">
                <div className="flex items-center space-x-1.5 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-medium text-green-700 uppercase tracking-wide">Online</span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
