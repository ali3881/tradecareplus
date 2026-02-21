"use client";

import { Wrench } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Form submitted:", formData);
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({ name: "", email: "", service: "", phone: "" });
    
    // Reset success message after 3 seconds
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Content & Form */}
          <div>
            <div className="mb-6">
              <Wrench className="text-yellow-500 w-8 h-8 mb-4" />
              <h2 className="text-4xl font-bold text-black uppercase tracking-wide mb-2">CONTACT US</h2>
              <div className="relative inline-block">
                <span className="text-orange-500 font-medium text-lg tracking-wide relative z-10">For Appointment</span>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-200 opacity-50"></div>
              </div>
            </div>
            
            <p className="text-gray-500 mb-8 leading-relaxed text-sm max-w-lg">
              Have a home maintenance project or emergency? Fill out the form below, and our team will get back to you as soon as possible. We are here to help you with all your repair and renovation needs.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name" 
                required
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
              />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email" 
                required
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
              />
              <div className="relative">
                <select 
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-100 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 appearance-none cursor-pointer transition-colors text-gray-500"
                >
                  <option value="">Type Of Services</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Painting">Painting</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                required
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
              />

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`bg-yellow-500 text-black font-bold py-3 px-8 rounded text-sm hover:bg-yellow-400 transition-colors uppercase w-full sm:w-auto mt-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'SENDING...' : 'CONTACT US'}
              </button>
              
              {isSuccess && (
                <div className="mt-4 p-4 bg-green-50 text-green-700 rounded border border-green-200 animate-fade-in">
                  Thank you! Your booking request has been received. We will contact you shortly.
                </div>
              )}
            </form>
          </div>

          {/* Right Side: Image */}
          <div className="relative h-full min-h-[500px] hidden lg:block">
             <div className="absolute inset-0 flex items-center justify-center">
                {/* We use a simple image tag here. In a real project, we'd use next/image and a mask. */}
                <img 
                  src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop" 
                  alt="Construction Worker" 
                  className="max-h-[600px] w-auto object-contain mask-image-brush" 
                />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
