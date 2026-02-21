import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#2a2a2a] text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Trade<span className="text-yellow-500">CarePlus</span></h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              We provide professional home maintenance services with a focus on quality and customer satisfaction. One call solves all your house problems.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-yellow-500 hover:text-white p-2 rounded-full transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-yellow-500 hover:text-white p-2 rounded-full transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-yellow-500 hover:text-white p-2 rounded-full transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-gray-700 hover:bg-yellow-500 hover:text-white p-2 rounded-full transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 border-l-4 border-yellow-500 pl-4">Quick Links</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="/" className="hover:text-yellow-500 transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-yellow-500 transition-colors">About Us</Link></li>
              <li><Link href="/services" className="hover:text-yellow-500 transition-colors">Services</Link></li>
              <li><Link href="/projects" className="hover:text-yellow-500 transition-colors">Projects</Link></li>
              <li><Link href="/contact" className="hover:text-yellow-500 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-6 border-l-4 border-yellow-500 pl-4">Our Services</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="/services" className="hover:text-yellow-500 transition-colors">Plumbing</Link></li>
              <li><Link href="/services" className="hover:text-yellow-500 transition-colors">Electrical</Link></li>
              <li><Link href="/services" className="hover:text-yellow-500 transition-colors">Renovation</Link></li>
              <li><Link href="/services" className="hover:text-yellow-500 transition-colors">Flooring</Link></li>
              <li><Link href="/services" className="hover:text-yellow-500 transition-colors">Painting</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 border-l-4 border-yellow-500 pl-4">Contact Us</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin className="text-yellow-500 mt-1 shrink-0" size={20} />
                <span>123 Street Name, City, Country, Zip Code</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="text-yellow-500 shrink-0" size={20} />
                <a href="tel:0410886899" className="hover:text-yellow-500 transition-colors">0410 886 899</a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="text-yellow-500 shrink-0" size={20} />
                <a href="mailto:info@tradecareplus.com.au" className="hover:text-yellow-500 transition-colors">info@tradecareplus.com.au</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} TradeCarePlus. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
