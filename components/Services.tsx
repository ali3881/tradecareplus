import { Wrench, Lightbulb, Droplets, Building2, AirVent, Hammer, Home, Clock3 } from "lucide-react";

const services = [
  {
    icon: <Droplets size={48} className="text-yellow-500" />,
    title: "Plumbing",
    description: "Expert plumbing services for leaks, installations, and repairs. We ensure your water flows smoothly."
  },
  {
    icon: <Lightbulb size={48} className="text-yellow-500" />,
    title: "Electrical",
    description: "Safe and reliable electrical work including wiring, lighting installation, and troubleshooting."
  },
  {
    icon: <AirVent size={48} className="text-yellow-500" />,
    title: "Aircon & HVAC",
    description: "Installation, servicing, and repair for air conditioning and HVAC systems for homes and facilities."
  },
  {
    icon: <Building2 size={48} className="text-yellow-500" />,
    title: "Building",
    description: "General building and trade facilities support, from structural fixes to ongoing site work."
  },
  {
    icon: <Home size={48} className="text-yellow-500" />,
    title: "Renovations",
    description: "Complete home renovation services to transform your living space into your dream home."
  },
  {
    icon: <Wrench size={48} className="text-yellow-500" />,
    title: "Property Maintenance",
    description: "Scheduled and reactive maintenance for residential and commercial properties."
  },
  {
    icon: <Hammer size={48} className="text-yellow-500" />,
    title: "All Trade Facilities",
    description: "Multi-trade coordination under one team to manage complete end-to-end trade requirements."
  },
  {
    icon: <Clock3 size={48} className="text-yellow-500" />,
    title: "24/7 Emergency Service",
    description: "Round-the-clock rapid response for urgent plumbing, electrical, HVAC, and maintenance callouts."
  }
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-yellow-500 font-bold uppercase tracking-wider text-sm mb-2 block">
            Our Services
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Have Done</h2>
          <div className="w-20 h-1 bg-yellow-500 mx-auto rounded"></div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            We cover building, plumbing, aircon/HVAC, electrical, property maintenance, and renovations with 24/7 availability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-b-4 border-transparent hover:border-yellow-500 group"
            >
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-500 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
