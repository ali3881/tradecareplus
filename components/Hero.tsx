import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full h-[600px] bg-gray-900 text-white overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2831&auto=format&fit=crop')"
        }}
      />
      
      {/* Overlay Content */}
      <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-4">
        <div className="max-w-3xl space-y-6 animate-fade-in-up">
          <span className="bg-yellow-500 text-black font-bold px-4 py-1 rounded-sm uppercase tracking-wider text-sm inline-block mb-2">
            We Take Care of Your Home!
          </span>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            One Call Can Solve All Your House Problems
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
            Professional home maintenance services at your doorstep. From plumbing to electrical, we handle it all with expertise and care.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href="/services" 
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              OUR SERVICES <ArrowRight size={20} />
            </Link>
            <Link 
              href="/contact" 
              className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 rounded font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              CONTACT US
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
