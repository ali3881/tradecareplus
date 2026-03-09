"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const [isSiteLoading, setIsSiteLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const hasLoaded = window.sessionStorage.getItem("site-loader-shown");
    if (hasLoaded) {
      setIsSiteLoading(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsExiting(true);
      window.setTimeout(() => {
        setIsSiteLoading(false);
      }, 320);
      window.sessionStorage.setItem("site-loader-shown", "1");
    }, 1300);

    return () => window.clearTimeout(timer);
  }, []);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {isSiteLoading ? (
        <div
          className={`fixed inset-0 z-[1000] bg-yellow-400 flex items-center justify-center transition-opacity duration-300 ${
            isExiting ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="h-24 w-24 rounded-full border-[4px] border-black/20 border-t-black animate-spin" />
            <p className="mt-8 font-alt text-sm uppercase tracking-[2px] text-black">Please wait</p>
          </div>
        </div>
      ) : null}
      <Header />
      {children}
      <Footer />
    </>
  );
}
