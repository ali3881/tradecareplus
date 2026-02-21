"use client";

import { UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    plan: ""
  });
  
  useEffect(() => {
    if (planParam) {
      setFormData(prev => ({ ...prev, plan: planParam }));
    }
  }, [planParam]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
      // 1. Create User
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Signup failed");
      }

      setIsSuccess(true);
      
      // 2. Sign In
      const signInRes = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInRes?.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section id="signup" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Content & Form */}
          <div>
            <div className="mb-6">
              <UserPlus className="text-yellow-500 w-8 h-8 mb-4" />
              <h2 className="text-4xl font-bold text-black uppercase tracking-wide mb-2">SIGN UP</h2>
              <div className="relative inline-block">
                <span className="text-orange-500 font-medium text-lg tracking-wide relative z-10">Create Your Account</span>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-200 opacity-50"></div>
              </div>
            </div>
            
            <p className="text-gray-500 mb-8 leading-relaxed text-sm max-w-lg">
              Join TradeCarePlus today and get access to professional home maintenance services. Choose a plan that suits your needs and let us take care of your home.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name" 
                required
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
              />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address" 
                required
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
              />
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
              />
              
              <div className="relative">
                <select 
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 appearance-none cursor-pointer transition-colors text-gray-500"
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

              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password" 
                required
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
              />
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password" 
                required
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
              />

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`bg-yellow-500 text-black font-bold py-3 px-8 rounded text-sm hover:bg-yellow-400 transition-colors uppercase w-full sm:w-auto mt-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>
              
              {isSuccess && (
                <div className="mt-4 p-4 bg-green-50 text-green-700 rounded border border-green-200 animate-fade-in">
                  Account created successfully! Redirecting...
                </div>
              )}
            </form>
          </div>

          {/* Right Side: Image */}
          <div className="relative h-full min-h-[500px] hidden lg:block">
             <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop" 
                  alt="Team Meeting" 
                  className="max-h-[600px] w-auto object-contain mask-image-brush" 
                />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
