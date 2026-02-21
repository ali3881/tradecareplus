import Link from "next/link";
import About from "@/components/About";
import Stats from "@/components/Stats";

export default function AboutPage() {
  return (
    <main className="flex-grow">
      {/* Page Header */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-yellow-500">About</span>
          </div>
        </div>
      </div>
      
      <About />
      <Stats />
      
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              At TradeCarePlus, our mission is to provide reliable, high-quality, and affordable home maintenance services to our community. We believe that every home deserves expert care, and we strive to be the one-stop solution for all your construction and maintenance needs.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
