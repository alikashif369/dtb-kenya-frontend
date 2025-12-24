// src/components/Navbar.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
// Import Lucide icons for reliable menu button
import { LogIn, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect for glass + drop-shadow
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`
    fixed top-0 left-0 w-full z-50 transition-all duration-300
    ${scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200"
          : "bg-green-900/30 backdrop-blur-sm border-b border-green-800/20" // DARK GREEN like footer
        }
      `}
    >

      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <Image
            src="/serena-logo.png"
            alt="Serena Green"
            width={140}
            height={140}
            className="object-contain drop-shadow-md"
          />
          <span
            className={`
              text-xl font-semibold tracking-tight transition-all
              ${scrolled
                ? "text-gray-700 hover:text-green-700"
                : "text-white/90 hover:text-white drop-shadow-sm"
              }
            
            `}
          >
            Serena Green
          </span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { href: "/", label: "Home" },
            { href: "#stats", label: "Stats" },
            { href: "#recent", label: "Activities" },
            { href: "#partners", label: "Partners" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`
                text-sm font-medium transition-all duration-200 
                ${scrolled
                  ? "text-gray-700 hover:text-green-700"
                  : "text-white/90 hover:text-white" // Menu links are white/light in transparent state
                }
              `}
            >
              {item.label}
            </a>
          ))}
       
          {/* Dashboard Button */}
          <a
            href="/dashboard"
            className="
    px-5 py-2 rounded-full text-sm font-semibold shadow-md transition-all
    bg-green-900 text-white hover:bg-green-800
  "
          >
            Dashboard
          </a>
             <a
            href="/login" // لاگ ان پیج کا لنک
            className=" flex items-center gap-2 
    px-5 py-2 rounded-full text-sm font-semibold shadow-md transition-all
    bg-green-900 text-white hover:bg-green-800"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </a>
          
        </div>

        {/* Mobile Menu Button (FIXED ICON) */}
        <button
          onClick={() => setOpen(!open)}
          className={`
            md:hidden text-2xl transition p-1 rounded
            ${scrolled ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/10"}
          `}
        >
          {/* Using Lucide icons instead of unstyled i tag */}
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drop-down */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg shadow-xl border-t border-gray-200 animate-fade-down">
          <ul className="flex flex-col px-6 py-4 gap-4 text-gray-800 font-medium">

            <a href="/" onClick={() => setOpen(false)}>Home</a>
            <a href="#stats" onClick={() => setOpen(false)}>Stats</a>
            <a href="#recent" onClick={() => setOpen(false)}>Activities</a>
            <a href="#partners" onClick={() => setOpen(false)}>Partners</a>

            <a
              href="/login"
              className="bg-gray-200 text-gray-800 text-center py-2 rounded-lg shadow hover:bg-gray-300 transition flex items-center justify-center gap-2"
              onClick={() => setOpen(false)}
            >
              <LogIn className="w-4 h-4" /> Sign In
            </a>
            <a
              href="/dashboard"
              className="bg-green-700 text-white text-center py-2 rounded-lg shadow hover:bg-green-800 transition"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </a>

          </ul>
        </div>
      )}
    </header>
  );
}