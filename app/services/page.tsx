import Link from "next/link";
import Services from "@/components/Services";
import { Wrench, Lightbulb, Droplets, Paintbrush, Hammer, Home } from "lucide-react";

export default function ServicesPage() {
  return (
    <main className="flex-grow">
      {/* Page Header */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-yellow-500">Services</span>
          </div>
        </div>
      </div>
      
      <Services />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="bg-yellow-100 p-4 rounded-full h-16 w-16 flex items-center justify-center flex-shrink-0">
                  <Wrench className="text-yellow-600" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Expert Technicians</h3>
                  <p className="text-gray-600">Our team consists of highly skilled and certified professionals who are experts in their respective fields.</p>
                </div>
              </div>
              <div className="flex gap-4">
                 <div className="bg-yellow-100 p-4 rounded-full h-16 w-16 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="text-yellow-600" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Modern Tools</h3>
                  <p className="text-gray-600">We use the latest tools and technology to ensure efficient and high-quality work for every project.</p>
                </div>
              </div>
              <div className="flex gap-4">
                 <div className="bg-yellow-100 p-4 rounded-full h-16 w-16 flex items-center justify-center flex-shrink-0">
                  <Droplets className="text-yellow-600" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Timely Service</h3>
                  <p className="text-gray-600">We value your time. Our team ensures that all projects are completed within the agreed timeframe.</p>
                </div>
              </div>
              <div className="flex gap-4">
                 <div className="bg-yellow-100 p-4 rounded-full h-16 w-16 flex items-center justify-center flex-shrink-0">
                  <Home className="text-yellow-600" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Customer Satisfaction</h3>
                  <p className="text-gray-600">Your satisfaction is our priority. We go above and beyond to exceed your expectations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
