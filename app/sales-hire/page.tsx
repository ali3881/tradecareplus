import Link from "next/link";
import { Truck, Bath, Shield } from "lucide-react";

const items = [
  {
    icon: <Truck className="text-yellow-500" size={36} />,
    title: "Excavators",
    description: "Excavator sales and hire for short-term and long-term projects.",
  },
  {
    icon: <Bath className="text-yellow-500" size={36} />,
    title: "Temporary Toilets",
    description: "Clean and serviced temporary toilet units for sites and events.",
  },
  {
    icon: <Shield className="text-yellow-500" size={36} />,
    title: "Temporary Fencing",
    description: "Secure temporary fencing hire and supply for construction and safety.",
  },
];

export default function SalesHirePage() {
  return (
    <main className="flex-grow">
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Sales and Hire</h1>
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-yellow-500">Sales and Hire</span>
          </div>
        </div>
      </div>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Equipment and Site Facilities</h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              We provide reliable sales and hire options for machinery and temporary site facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((item) => (
              <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-7 shadow-sm">
                <div className="mb-5">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
