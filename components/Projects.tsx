import { ArrowRight } from "lucide-react";
import Link from "next/link";

const projects = [
  {
    title: "Modern Kitchen Renovation",
    category: "Renovation",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Modern%20luxury%20kitchen%20renovation%20with%20white%20cabinets%20and%20marble%20island%2C%20photorealistic%2C%204k&image_size=landscape_4_3"
  },
  {
    title: "Bathroom Plumbing Fix",
    category: "Plumbing",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional%20plumber%20fixing%20a%20bathroom%20sink%20pipe%20with%20tools%2C%20bright%20lighting%2C%20photorealistic&image_size=landscape_4_3"
  },
  {
    title: "Electrical Wiring Upgrade",
    category: "Electrical",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Electrician%20working%20on%20a%20modern%20circuit%20breaker%20panel%2C%20safety%20gear%2C%20photorealistic&image_size=landscape_4_3"
  },
  {
    title: "Hardwood Flooring Installation",
    category: "Flooring",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Installing%20new%20oak%20hardwood%20flooring%20in%20a%20living%20room%2C%20construction%2C%20photorealistic&image_size=landscape_4_3"
  },
  {
    title: "Interior Wall Painting",
    category: "Painting",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional%20painter%20painting%20a%20living%20room%20wall%20with%20a%20roller%2C%20blue%20color%2C%20photorealistic&image_size=landscape_4_3"
  },
  {
    title: "Outdoor Lighting Setup",
    category: "Lighting",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Beautiful%20outdoor%20landscape%20lighting%20in%20a%20garden%20at%20twilight%2C%20warm%20glow%2C%20photorealistic&image_size=landscape_4_3"
  }
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-yellow-500 font-bold uppercase tracking-wider text-sm mb-2 block">
            Our Work
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Projects</h2>
          <div className="w-20 h-1 bg-yellow-500 mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Link href="/projects" key={index} className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer block">
              <div className="aspect-w-4 aspect-h-3 h-64 w-full">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-yellow-500 font-medium mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                  {project.category}
                </span>
                <h3 className="text-white text-xl font-bold mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-200">
                  {project.title}
                </h3>
                <div className="flex items-center text-white text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-300">
                  View Project <ArrowRight size={16} className="ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/projects" className="bg-transparent border-2 border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 px-8 py-3 rounded font-bold transition-all inline-block">
            VIEW ALL PROJECTS
          </Link>
        </div>
      </div>
    </section>
  );
}
