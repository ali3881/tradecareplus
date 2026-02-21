"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { useState } from "react";
import SignupModal from "@/components/SignupModal";

export default function PackagesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const handleSubscribe = (planName: string) => {
    setSelectedPlan(planName);
    setIsModalOpen(true);
  };

  const packages = [
    {
      name: "BASIC",
      price: "$25",
      period: "/month",
      description: "Digital protection plan",
      features: [
        "Unlimited plumbing questions (chat + photos)",
        "DIY guidance & safety checks",
        "Annual plumbing health checklist",
        "25% off all jobs",
        "Priority booking",
        "Monthly Property Care Visits",
        "Fair use: Advice only, no physical work included"
      ],
      color: "bg-green-500"
    },
    {
      name: "STANDARD",
      price: "$59",
      period: "/month",
      description: "Maintenance plan",
      features: [
        "Everything in Basic",
        "10 included minor maintenance visits / year",
        "Leaking taps & toilets",
        "Minor blocked drains on call 24/7",
        "No call‑out fee",
        "15% off additional work"
      ],
      popular: true,
      color: "bg-blue-500"
    },
    {
      name: "PREMIUM",
      price: "$89",
      period: "/month",
      description: "Total peace‑of‑mind",
      features: [
        "Everything in Standard",
        "Every 3 months CCTV drain inspection and Jet blast",
        "Hot water system inspection",
        "Emergency priority response",
        "20% off hot water replacements",
        "25% off all property care",
        "Fixed pricing on common jobs"
      ],
      color: "bg-purple-500"
    }
  ];

  return (
    <main className="flex-grow">
      {/* Page Header */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Subscription Plans</h1>
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-yellow-500">Packages</span>
          </div>
        </div>
      </div>
      
      {/* Plans Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          
          {/* Highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 text-sm font-semibold uppercase tracking-wide text-gray-600">
            <span className="bg-white px-4 py-2 rounded shadow-sm border border-gray-100 flex items-center gap-2">
              <Check className="text-green-500" size={16} /> Chat + video calls
            </span>
            <span className="bg-white px-4 py-2 rounded shadow-sm border border-gray-100 flex items-center gap-2">
              <Check className="text-green-500" size={16} /> 24/7 emergency coverage (Premium)
            </span>
            <span className="bg-white px-4 py-2 rounded shadow-sm border border-gray-100 flex items-center gap-2">
              <Check className="text-green-500" size={16} /> In-app payments only
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div key={index} className={`bg-white rounded-lg shadow-lg overflow-hidden border-t-4 ${pkg.popular ? 'border-yellow-500 transform scale-105 z-10 shadow-xl' : 'border-gray-200'}`}>
                {pkg.popular && (
                  <div className="bg-yellow-500 text-black text-center py-1 font-bold text-sm uppercase">
                    Most Popular
                  </div>
                )}
                <div className="p-8 flex flex-col h-full">
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-6 h-12">{pkg.description}</p>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                    <span className="text-gray-500 ml-1">{pkg.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="text-green-500 mr-2 flex-shrink-0 mt-1" size={16} />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => handleSubscribe(pkg.name)}
                    className={`w-full py-3 rounded font-bold transition-colors text-center block ${pkg.popular ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                  >
                    SUBSCRIBE NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Included / Not Included Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Exactly What’s Included (Clear + Safe)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Included */}
            <div className="bg-green-50 p-8 rounded-lg border border-green-100">
              <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center">
                <Check className="bg-green-500 text-white rounded-full p-1 mr-3" size={24} />
                INCLUDED
              </h3>
              <ul className="space-y-4">
                {[
                  "Leaking taps & toilets",
                  "Minor blockages (sink, basin, shower)",
                  "CCTV inspection (Premium)",
                  "Hot water system inspections",
                  "General plumbing maintenance"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-green-900">
                    <Check className="text-green-600 mr-3 mt-1 flex-shrink-0" size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Included */}
            <div className="bg-red-50 p-8 rounded-lg border border-red-100">
              <h3 className="text-xl font-bold text-red-800 mb-6 flex items-center">
                <X className="bg-red-500 text-white rounded-full p-1 mr-3" size={24} />
                NOT INCLUDED (Quoted Separately)
              </h3>
              <ul className="space-y-4">
                {[
                  "Major drain replacements",
                  "Sewer relining",
                  "New builds / renovations",
                  "After‑hours emergency labour (discounted only)"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start text-red-900">
                    <X className="text-red-600 mr-3 mt-1 flex-shrink-0" size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Modal */}
      <SignupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialPlan={selectedPlan}
      />
    </main>
  );
}
