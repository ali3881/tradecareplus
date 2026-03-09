"use client";

import Link from "next/link";
import { Check, X, ShieldCheck } from "lucide-react";
import Pricing from "@/components/Pricing";

export default function PackagesPage() {
  return (
    <main className="flex-grow ">
      <div className="bg-gray-900 text-white py-16 pt-20">
        <div className="font-alt max-w-[1290px] mx-auto px-6 flex justify-between items-center">
          <h1 className="text-4xl font-semibold ">Package</h1>
          <div className="flex items-center text-md">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-yellow-500">Packages</span>
          </div>
        </div>
      </div>

      <Pricing mode="packages" showHeader={false} />



      <section className="py-16 md:py-20 bg-white border-t border-gray-100">
        <div className="max-w-[1290px] mx-auto px-6">
          <div className="mx-auto mb-14 max-w-[760px] text-center">
            <div className="relative mx-auto inline-block border border-[#e7c76a] px-10 pt-8 pb-6">
              <div className="absolute -top-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center bg-white">
                <ShieldCheck className="h-5 w-5 text-yellow-400" strokeWidth={2.2} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-alt font-extrabold uppercase leading-none tracking-tight text-black">
                Exactly What’s Included
              </h2>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white w-max px-3">
                <span className="text-xs font-alt font-bold uppercase tracking-[2px] text-red-600">
                  Clear + Safe
                </span>
              </div>
            </div>
            <p className="mx-auto mt-10 max-w-xl text-sm leading-6 text-[#7a7a7a]">
              A transparent breakdown of what your plan covers and what is quoted separately, so there are no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-5xl mx-auto">
            <div className="rounded-md border border-green-200 bg-green-50 p-6 md:p-8 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
              <h3 className="font-alt text-xl md:text-2xl font-bold text-green-800 mb-6 flex items-center">
                <Check className="bg-green-500 text-white rounded-full p-1 mr-3" size={26} />
                INCLUDED
              </h3>
              <ul className="space-y-4">
                {[
                  "Leaking taps & toilets",
                  "Minor blockages (sink, basin, shower)",
                  "CCTV inspection (Premium)",
                  "Hot water system inspections",
                  "General plumbing maintenance",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm md:text-base text-green-900">
                    <Check className="text-green-600 mr-3 mt-0.5 flex-shrink-0" size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-red-200 bg-red-50 p-6 md:p-8 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
              <h3 className="font-alt text-xl md:text-2xl font-bold text-red-800 mb-6 flex items-center">
                <X className="bg-red-500 text-white rounded-full p-1 mr-3" size={26} />
                NOT INCLUDED (Quoted Separately)
              </h3>
              <ul className="space-y-4">
                {[
                  "Major drain replacements",
                  "Sewer relining",
                  "New builds / renovations",
                  "After‑hours emergency labour (discounted only)",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm md:text-base text-red-900">
                    <X className="text-red-600 mr-3 mt-0.5 flex-shrink-0" size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
