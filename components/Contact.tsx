"use client";

import { Contact2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Contact() {
  const [services, setServices] = useState<{ id: string; title: string }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadServices() {
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        const data = await res.json();
        if (!ignore && Array.isArray(data)) {
          setServices(data);
        }
      } catch (error) {
        console.error("Failed to load services", error);
      }
    }

    loadServices();

    return () => {
      ignore = true;
    };
  }, []);

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
      <div className="max-w-[1290px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start lg:items-center">
          {/* Left Side: Content & Form */}
          <div className="w-full">
            <div className="mb-10 text-left">
              <div className="relative inline-block border border-[#e7c76a] px-10 pt-8 pb-6">
                <div className="absolute -top-6 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center bg-white">
                  <Contact2 className="h-5 w-5 text-yellow-400" strokeWidth={2.2} />
                </div>

                <h2 className="text-4xl font-alt font-extrabold uppercase leading-none tracking-tight text-black">
                  CONTACT US
                </h2>

                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white w-max px-3">
                  <span className="text-xs font-alt font-bold uppercase tracking-[2px] text-red-500">
                    For Appointment
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-500 mb-8 leading-relaxed text-sm max-w-lg">
              Have a home maintenance project or emergency? Fill out the form below, and our team will get back to you as soon as possible. We are here to help you with all your repair and renovation needs.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name" 
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
              />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email" 
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
              />
              <div className="relative">
                <select 
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 appearance-none cursor-pointer transition-colors text-gray-500"
                >
                  <option value="">Type Of Services</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.title}>
                      {service.title}
                    </option>
                  ))}
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
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-sm text-gray-700 outline-none focus:border-yellow-500 transition-colors"
              />

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`bg-yellow-400 text-black font-alt font-semibold py-3 px-8 rounded text-sm hover:bg-yellow-400 transition-colors uppercase w-full sm:w-auto mt-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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
          <div className="hidden lg:flex h-full min-h-[520px] w-full items-center justify-center">
             <div
                className="h-full w-full flex items-center justify-center"
                style={{
                  WebkitMaskImage:
                    "url(https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/mask-image2.png)",
                    WebkitMaskSize: "contain",
                    WebkitMaskPosition: "center center",
                    WebkitMaskRepeat: "no-repeat",
                }}
              >
                <img 
                  src="https://wdtelethemes.wpengine.com/homefix-elementor/wp-content/uploads/sites/5/2023/11/book-online.jpg" 
                  alt="Construction Worker" 
                  className="h-full w-full object-cover" 
                />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
