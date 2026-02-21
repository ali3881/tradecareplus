import { Wrench, Lightbulb, Droplets, Paintbrush, Hammer, Home } from "lucide-react";

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
    icon: <Hammer size={48} className="text-yellow-500" />,
    title: "Flooring",
    description: "Quality flooring installation and repair. From hardwood to tile, we enhance your home's foundation."
  },
  {
    icon: <Paintbrush size={48} className="text-yellow-500" />,
    title: "Painting",
    description: "Interior and exterior painting services to refresh your home's look with vibrant colors."
  },
  {
    icon: <Home size={48} className="text-yellow-500" />,
    title: "Renovation",
    description: "Complete home renovation services to transform your living space into your dream home."
  },
  {
    icon: <Wrench size={48} className="text-yellow-500" />,
    title: "Lighting",
    description: "Custom lighting solutions to brighten up your home and create the perfect ambiance."
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
            We offer a wide range of professional home maintenance and renovation services. From minor repairs to major overhauls, we have the expertise to get the job done right.
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
