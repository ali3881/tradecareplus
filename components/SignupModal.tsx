"use client";

import { UserPlus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
}

export default function SignupModal({ isOpen, onClose, initialPlan }: SignupModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    plan: ""
  });
  
  useEffect(() => {
    if (initialPlan) {
      setFormData(prev => ({ ...prev, plan: initialPlan }));
    }
  }, [initialPlan, isOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!signupRes.ok) {
        const msg = await signupRes.text();
        throw new Error(msg || "Signup failed");
      }

      const loginRes = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (!loginRes?.ok) {
        throw new Error("Account created but sign-in failed. Please log in and subscribe.");
      }

      const checkoutRes = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: formData.plan }),
      });

      if (!checkoutRes.ok) {
        const msg = await checkoutRes.text();
        throw new Error(msg || "Failed to start Stripe checkout");
      }

      const checkoutData = await checkoutRes.json();
      if (!checkoutData?.url) {
        throw new Error("Stripe checkout URL not returned");
      }

      window.location.href = checkoutData.url;
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-scale-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-black bg-white/80 rounded-full p-1"
        >
          <X size={24} />
        </button>

        {/* Left Side: Image (Hidden on mobile) */}
        <div className="hidden md:block w-2/5 relative bg-gray-900">
             <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop" 
                  alt="Team Meeting" 
                  className="w-full h-full object-cover opacity-80" 
                />
                <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay"></div>
             </div>
             <div className="absolute bottom-0 left-0 p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Join TradeCarePlus</h3>
                <p className="text-gray-200 text-sm">Get professional home maintenance services at your fingertips.</p>
             </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-3/5 p-8 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <UserPlus className="text-yellow-500 w-6 h-6" />
                <h2 className="text-2xl font-bold text-black uppercase tracking-wide">SIGN UP</h2>
              </div>
              <p className="text-gray-500 text-sm">
                Create your account to start your subscription.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name" 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
                  />
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
                  />
              </div>
              
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address" 
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
              />
              
              <div className="relative">
                <select 
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 appearance-none cursor-pointer transition-colors text-gray-500"
                >
                  <option value="">Select a Plan</option>
                  <option value="BASIC">BASIC - $25/month</option>
                  <option value="STANDARD">STANDARD - $59/month</option>
                  <option value="PREMIUM">PREMIUM - $89/month</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password" 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
                  />
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password" 
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
                  />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`bg-yellow-500 text-black font-bold py-3 px-8 rounded text-sm hover:bg-yellow-400 transition-colors uppercase w-full mt-4 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>
              
              {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
            </form>
        </div>
      </div>
    </div>
  );
}
