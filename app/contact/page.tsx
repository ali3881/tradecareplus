import Link from "next/link";
import Contact from "@/components/Contact";

export default function ContactPage() {
  return (
    <main className="flex-grow">
      <div className="bg-gray-900 text-white py-16 pt-20">
        <div className="font-alt max-w-[1290px] mx-auto px-6 flex justify-between items-center">
          <h1 className="text-4xl font-semibold ">Contact Us</h1>
          <div className="flex items-center text-md">
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
