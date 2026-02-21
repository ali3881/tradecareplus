import Link from "next/link";
import Contact from "@/components/Contact";

export default function ContactPage() {
  return (
    <main className="flex-grow">
      {/* Page Header */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-yellow-500">Contact</span>
          </div>
        </div>
      </div>
      
      <Contact />
    </main>
  );
}
