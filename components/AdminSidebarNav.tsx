"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Briefcase,
  CalendarRange,
  CreditCard,
  FolderOpen,
  HardHat,
  LayoutDashboard,
  MessageSquareMore,
  Package,
  Receipt,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

type AdminSidebarNavProps = {
  isAdmin: boolean;
};

function linkClasses(isActive: boolean) {
  return `flex items-center rounded-lg px-4 py-3 font-medium transition-colors ${
    isActive
      ? "bg-yellow-100 text-yellow-700"
      : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-600"
  }`;
}

function isRouteActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebarNav({ isAdmin }: AdminSidebarNavProps) {
  const pathname = usePathname() || "";

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
      {isAdmin && (
        <>
          <div className="px-4 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-gray-400">Overview</div>
          <Link href="/admin" className={linkClasses(isRouteActive(pathname, "/admin"))}>
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Link>

          <div className="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-wider text-gray-400">People</div>
          <Link href="/admin/users" className={linkClasses(isRouteActive(pathname, "/admin/users"))}>
            <Users className="mr-3 h-5 w-5" />
            Users
          </Link>
          <Link href="/admin/staff" className={linkClasses(isRouteActive(pathname, "/admin/staff"))}>
            <HardHat className="mr-3 h-5 w-5" />
            Staff
          </Link>

          <div className="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-wider text-gray-400">Service Operations</div>
          <Link href="/admin/jobs" className={linkClasses(isRouteActive(pathname, "/admin/jobs"))}>
            <Briefcase className="mr-3 h-5 w-5" />
            Jobs
          </Link>
          <Link href="/admin/projects" className={linkClasses(isRouteActive(pathname, "/admin/projects"))}>
            <FolderOpen className="mr-3 h-5 w-5" />
            Projects
          </Link>
          <Link href="/admin/services" className={linkClasses(isRouteActive(pathname, "/admin/services"))}>
            <Wrench className="mr-3 h-5 w-5" />
            Services
          </Link>

          <div className="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-wider text-gray-400">Sales & Hire</div>
          <Link href="/admin/sales-hire" className={linkClasses(isRouteActive(pathname, "/admin/sales-hire"))}>
            <Package className="mr-3 h-5 w-5" />
            Sales & Hire
          </Link>
          <Link href="/admin/bookings" className={linkClasses(isRouteActive(pathname, "/admin/bookings"))}>
            <CalendarRange className="mr-3 h-5 w-5" />
            Bookings
          </Link>
          <Link href="/admin/enquiries" className={linkClasses(isRouteActive(pathname, "/admin/enquiries"))}>
            <MessageSquareMore className="mr-3 h-5 w-5" />
            Enquiries
          </Link>

          <div className="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-wider text-gray-400">Billing & Payments</div>
          <Link href="/admin/subscriptions" className={linkClasses(isRouteActive(pathname, "/admin/subscriptions"))}>
            <CreditCard className="mr-3 h-5 w-5" />
            Subscriptions
          </Link>
          <Link href="/admin/transactions" className={linkClasses(isRouteActive(pathname, "/admin/transactions"))}>
            <Receipt className="mr-3 h-5 w-5" />
            Transactions
          </Link>
          <Link href="/admin/packages" className={linkClasses(isRouteActive(pathname, "/admin/packages"))}>
            <Package className="mr-3 h-5 w-5" />
            Packages
          </Link>

          <div className="px-4 pb-2 pt-4 text-xs font-bold uppercase tracking-wider text-gray-400">Insights & System</div>
          <Link href="/admin/reports" className={linkClasses(isRouteActive(pathname, "/admin/reports"))}>
            <BarChart2 className="mr-3 h-5 w-5" />
            Reports
          </Link>
          <Link href="/admin/settings" className={linkClasses(isRouteActive(pathname, "/admin/settings"))}>
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Link>
        </>
      )}
    </nav>
  );
}
