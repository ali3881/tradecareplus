"use client";

import Link from "next/link";
import { Phone, Search, X, MapPin, Globe, Wrench, Flame, Clock, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },

  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/packages", label: "Package" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={className}>
      <img src="/logo.png" alt="Trade Care Plus" className="h-14 md:h-16 lg:h-20 w-auto object-contain" />
    </Link>
  );
}

function MenuTrigger({ isOpen, onClick, showText = true }: { isOpen: boolean; onClick: () => void; showText?: boolean }) {
  return (
    <button
      type="button"
      aria-label="Open Menu"
      onClick={onClick}
      className="inline-flex items-center gap-3 text-black tracking-wide"
    >
      <span className="relative w-5 h-3.5 block">
        <span className={`absolute left-0 h-[2px] w-5 bg-black transition-all duration-300 ${isOpen ? "top-0 -translate-x-1" : "top-0"}`} />
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] w-5 bg-black transition-all duration-300" />
        <span className={`absolute left-0 h-[2px] w-5 bg-black transition-all duration-300 ${isOpen ? "bottom-0 -translate-x-1" : "bottom-0"}`} />
      </span>
      {/* {showText ? <span>Menu</span> : null} */}
    </button>
  );
}

function SearchBox({ compact = false }: { compact?: boolean }) {
  return (
    ""
    // <div className={`bg-white flex items-center px-4 ${compact ? "py-2.5" : "py-3"} w-[220px]`}>
    //   <input
    //     type="text"
    //     placeholder="ENTER KEYWORD"
    //     className="bg-transparent border-none outline-none text-xs w-full text-gray-700 placeholder-gray-700"
    //   />
    //   <Search size={compact ? 16 : 17} className="text-gray-700 cursor-pointer hover:text-red-600" />
    // </div>
  );
}

function DesktopNav({
  showUserMenu = false,
  pathname,
}: {
  showUserMenu?: boolean;
  pathname: string;
}) {
  const isActivePath = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex justify-between items-center bg-yellow-400">
      <nav className="flex items-center h-full font-semibold text-gray-800">
        {NAV_ITEMS.map((item, index) => {
          const hasSeparator = index !== NAV_ITEMS.length - 1;
          const isActive = isActivePath(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`py-6 px-6 leading-[1.8] capitalize tracking-[1px] transition-colors h-full flex items-center pr-7 relative ${
                isActive ? "text-red-600" : "hover:text-red-600"
              } ${
                hasSeparator
                  ? "before:content-[''] before:absolute before:right-0 before:top-0 before:bottom-[1px] before:w-[8px] before:h-[1px] before:bg-white before:my-auto before:z-[1] before:rotate-[-35deg] after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:h-[8px] after:w-[8px] after:rounded-full after:bg-black after:my-auto after:opacity-80 after:transition-all after:duration-300 after:ease-linear"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mr-4 flex items-center gap-4">
        {showUserMenu ? <UserMenu variant="light" /> : null}
        <SearchBox />
      </div>
    </div>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const pathname = usePathname();

  const isActivePath = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    const onScroll = () => setShowStickyNav(window.scrollY > 140);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="w-full relative z-[120]">
      <div className="hidden md:block py-3 bg-[#111111] text-white text-sm uppercase">
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-center lg:justify-between">
          <Link href="/contact" className="hidden lg:flex items-center gap-3 text-yellow-400 hover:text-white transition-colors">
            <MapPin className="text-white" size={14} />
            <span>Our Branches</span>
          </Link>
          <div className="flex items-center gap-[40px]">
            <Link href="/contact" className="flex items-center gap-3 text-yellow-400 hover:text-white transition-colors">
              <Globe className="text-white" size={14} />
              <span>Book Online</span>
            </Link>
            <Link href="/contact" className="flex items-center gap-3 text-yellow-400 hover:text-white transition-colors">
              <Wrench className="text-white" size={14} />
              <span>Get An Estimate</span>
            </Link>
            <a href="tel:0410886899" className="flex items-center gap-3 text-yellow-400 hover:text-white transition-colors">
              <Flame className="text-white" size={14} />
              <span>Emergency Service - 0410 886 899</span>
            </a>
          </div>
          
        </div>
      </div>

      <div className="max-w-[1290px] mx-auto hidden md:block">
        <div className="px-6 py-7 flex items-center justify-between gap-6">
          <Logo className="hidden lg:flex items-center gap-3 group" />
          <div className="hidden md:flex items-center justify-between w-full lg:w-auto lg:space-x-10">
            <div className="flex items-center space-x-3 min-w-[220px]">
              <div className="bg-yellow-400 p-2 rounded-sm text-black shrink-0">
                <Clock className="size-7" />
              </div>
              <div className="flex flex-col font-alt">
                <span className="text-sm font-semibold tracking-[0.6px] text-black uppercase mb-1">OPENING HOURS</span>
                <span className="text-sm text-gray-500">Mon - Fri : 9 AM - 8 PM</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 min-w-[220px]">
              <div className="bg-yellow-400 p-3 rounded-sm text-black shrink-0">
                <Phone size={20} />
              </div>
              <div className="flex flex-col font-alt">
                <span className="text-sm font-semibold tracking-[0.6px] text-black uppercase mb-1">CALL US</span>
                <a href="tel:0410886899" className="text-sm text-gray-500 hover:text-red-600 transition-colors">0410 886 899</a>
              </div>
            </div>
            <div className="flex items-center space-x-3 min-w-[220px]">
              <div className="bg-yellow-400 p-3 rounded-sm text-black shrink-0">
                <Mail size={20} />
              </div>
              <div className="flex flex-col font-alt">
                <span className="text-sm font-semibold tracking-[0.6px] text-black uppercase mb-1">MAIL US</span>
                <a href="mailto:info@tradecareplus.com.au" className="text-sm text-gray-500 hover:text-red-600 transition-colors">info@tradecareplus.com.au</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1290px] mx-auto lg:px-6 hidden md:block bg-transparent -mb-7 relative z-20">
        <div className="bg-yellow-400 px-4 lg:px-0">
          <div className="flex lg:hidden items-center justify-between py-4 gap-6">
            <Logo className="flex items-center shrink-0" />
            <div className="flex items-center gap-6 ml-auto">
              <UserMenu variant="light" />
              <MenuTrigger isOpen={isMenuOpen} onClick={() => setIsMenuOpen(true)} />
              <SearchBox />
            </div>
          </div>
          <div className="hidden lg:block">
            <DesktopNav showUserMenu pathname={pathname} />
          </div>
        </div>
      </div>

      <div className="md:hidden bg-yellow-400 px-4 py-3 flex items-center justify-between">
        <Logo className="flex items-center" />
        <div className="flex items-center gap-3">
          <UserMenu variant="light" />
          <MenuTrigger isOpen={isMenuOpen} onClick={() => setIsMenuOpen(true)} showText={false} />
        </div>
      </div>

      <div
        className={`fixed top-0 left-0 w-full bg-yellow-400 z-[200] transition-all duration-400 ${
          showStickyNav ? "opacity-100 translate-y-0 shadow-md" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="max-w-[1290px] mx-auto px-4 md:px-6">
          <div className="hidden lg:block">
            <DesktopNav showUserMenu pathname={pathname} />
          </div>
          <div className="lg:hidden py-3 flex items-center justify-between gap-4">
            <Logo className="flex items-center shrink-0" />
            <div className="flex items-center gap-4 ml-auto">
              <UserMenu variant="light" />
              <MenuTrigger isOpen={isMenuOpen} onClick={() => setIsMenuOpen(true)} />
              <div className="hidden md:flex">
                <SearchBox compact />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[999] lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
        <aside
          className={`absolute right-0 top-0 h-[100dvh] w-[260px] bg-black text-white shadow-2xl transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            type="button"
            aria-label="Close Menu"
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
          <nav className="pt-12 flex flex-col">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 border-b border-white/15 transition-colors ${
                  isActivePath(item.href) ? "bg-yellow-400 text-red-600" : "hover:bg-yellow-400 hover:text-red-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </header>
  );
}
