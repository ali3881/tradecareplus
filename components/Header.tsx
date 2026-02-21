"use client";

import Link from "next/link";
import { Phone, Search, Menu, X, MapPin, Globe, Wrench, Flame, Clock, Mail, HardHat, User } from "lucide-react";
import { useState, useEffect } from "react";

import UserMenu from "./UserMenu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false); // Removed local state logic as UserMenu handles it

  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="bg-black text-white py-3 px-4 hidden lg:block border-b border-gray-800">
        <div className="container mx-auto flex justify-end items-center text-xs font-bold tracking-wider">

          <div className="flex items-center space-x-8">
            <UserMenu />
            
            <Link href="/contact" className="flex items-center space-x-2 cursor-pointer hover:text-yellow-500 transition-colors">
              <Globe size={14} />
              <span>BOOK ONLINE</span>
            </Link>
            <Link href="/contact" className="flex items-center space-x-2 cursor-pointer hover:text-yellow-500 transition-colors">
              <Wrench size={14} />
              <span>GET AN ESTIMATE</span>
            </Link>
            <div className="flex items-center space-x-2 text-yellow-500">
              <Flame size={14} />
              <span>EMERGENCY SERVICE - 0410 886 899</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header (Logo & Info) */}
      <div className="bg-white py-6 px-4">
        <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Trade Care Plus" className="h-20 w-auto object-contain" />
          </Link>

          {/* Info Widgets */}
          <div className="hidden lg:flex items-center space-x-12">
            {/* Opening Hours */}
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-500 p-3 rounded-sm text-black">
                <Clock size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black uppercase tracking-wider">OPENING HOURS</span>
                <span className="text-sm text-gray-500">Mon - Fri : 9 AM - 8 PM</span>
              </div>
            </div>

            {/* Call Us */}
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-500 p-3 rounded-sm text-black">
                <Phone size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black uppercase tracking-wider">CALL US</span>
                <a href="tel:0410886899" className="text-sm text-gray-500 hover:text-yellow-600 transition-colors">0410 886 899</a>
              </div>
            </div>

            {/* Mail Us */}
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-500 p-3 rounded-sm text-black">
                <Mail size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-black uppercase tracking-wider">MAIL US</span>
                <a href="mailto:info@tradecareplus.com.au" className="text-sm text-gray-500 hover:text-yellow-600 transition-colors">info@tradecareplus.com.au</a>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-gray-700 absolute right-4 top-8"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-yellow-500 px-4 hidden lg:block">
        <div className="container mx-auto flex justify-between items-center h-16">
          <nav className="flex items-center h-full text-[#2a2a2a] font-bold text-sm tracking-wide">
            <Link href="/" className="hover:text-white transition-colors h-full flex items-center px-4">Home</Link>
            <span className="text-black/20 text-xs">/</span>
            <Link href="/about" className="hover:text-white transition-colors h-full flex items-center px-4">About</Link>
            <span className="text-black/20 text-xs">/</span>
            <Link href="/services" className="hover:text-white transition-colors h-full flex items-center px-4">Services</Link>
            <span className="text-black/20 text-xs">/</span>
            <Link href="/projects" className="hover:text-white transition-colors h-full flex items-center px-4">Projects</Link>
            <span className="text-black/20 text-xs">/</span>
            <Link href="/packages" className="hover:text-white transition-colors h-full flex items-center px-4">Packages</Link>
            <span className="text-black/20 text-xs">/</span>
            <Link href="/contact" className="hover:text-white transition-colors h-full flex items-center px-4">Contact</Link>
          </nav>

          {/* Search Bar */}
          <div className="bg-white flex items-center px-4 py-2 w-64">
            <input 
              type="text" 
              placeholder="ENTER KEYWORD" 
              className="bg-transparent border-none outline-none text-xs w-full text-gray-600 placeholder-gray-500 font-semibold"
            />
            <Search size={16} className="text-gray-400 cursor-pointer hover:text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-lg absolute w-full z-50">
          <nav className="flex flex-col space-y-4 font-medium text-gray-700">
            <Link href="/" className="hover:text-yellow-500" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="/about" className="hover:text-yellow-500" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link href="/services" className="hover:text-yellow-500" onClick={() => setIsMenuOpen(false)}>Services</Link>
            <Link href="/projects" className="hover:text-yellow-500" onClick={() => setIsMenuOpen(false)}>Projects</Link>
            <Link href="/packages" className="hover:text-yellow-500" onClick={() => setIsMenuOpen(false)}>Packages</Link>
            <Link href="/contact" className="hover:text-yellow-500" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <a href="tel:0410886899" className="flex items-center space-x-3 hover:text-yellow-600 transition-colors">
                <Phone className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-gray-600">0410 886 899</span>
              </a>
              <a href="mailto:info@tradecareplus.com.au" className="flex items-center space-x-3 hover:text-yellow-600 transition-colors">
                <Mail className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-gray-600">info@tradecareplus.com.au</span>
              </a>
              <a href="tel:0410886899" className="flex items-center space-x-3 hover:text-red-600 transition-colors">
                <Flame className="w-5 h-5 text-red-500" />
                <span className="text-sm font-bold text-gray-800">Emergency: 0410 886 899</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
