import Image from "next/image";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image Side */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative h-[400px] md:h-[500px] w-full rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop" 
                alt="Professional Worker" 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-yellow-500 text-white p-8 rounded-lg hidden md:block">
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-sm font-medium uppercase tracking-wider">Years of<br/>Experience</div>
            </div>
          </div>

          {/* Content Side */}
          <div className="w-full lg:w-1/2">
            <span className="text-yellow-500 font-bold uppercase tracking-wider text-sm mb-2 block">
              About Company
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              We Are Professional & Reliable Home Services
            </h2>
            <div className="w-20 h-1 bg-yellow-500 mb-8 rounded"></div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              We provide top-notch home maintenance services to ensure your home is safe, comfortable, and beautiful. Our team of experts is dedicated to delivering quality workmanship and exceptional customer service.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-yellow-500 flex-shrink-0" size={20} />
                <span className="text-gray-700 font-medium">Professional & Experienced Team</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-yellow-500 flex-shrink-0" size={20} />
                <span className="text-gray-700 font-medium">Quality Workmanship Guaranteed</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="text-yellow-500 flex-shrink-0" size={20} />
                <span className="text-gray-700 font-medium">Affordable & Transparent Pricing</span>
              </div>
            </div>

            <Link href="/services" className="bg-gray-900 hover:bg-yellow-500 text-white hover:text-black px-8 py-4 rounded font-bold transition-all transform hover:scale-105 inline-block">
              LEARN MORE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
