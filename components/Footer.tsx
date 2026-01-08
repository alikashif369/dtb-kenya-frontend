"use client";
import React from "react";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0b1210] text-gray-400 font-sans border-t border-white/5 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Socials */}
          <div className="space-y-4">
            <h2 className="text-xl font-serif text-white tracking-wide">SERENA<span className="text-serena-gold">.</span></h2>
            <p className="leading-relaxed max-w-xs text-xs">
              Pioneering sustainable tourism and environmental stewardship across the region.
            </p>
            <div className="flex gap-4 pt-2">
               {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
                  <a key={i} href="#" className="hover:text-serena-gold transition-colors">
                    <Icon size={16} />
                  </a>
               ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Company</h3>
             <ul className="space-y-2">
              {["Our Mission", "Initiatives", "Partners", "Careers"].map((link) => (
                <li key={link}><Link href="#" className="hover:text-serena-gold transition-colors">{link}</Link></li>
              ))}
             </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Contact</h3>
             <ul className="space-y-2">
              <li>Islamabad, Pakistan</li>
              <li>+92 51 287 6161</li>
              <li><a href="mailto:green@serenahotels.com" className="hover:text-serena-gold transition-colors">green@serenahotels.com</a></li>
             </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Newsletter</h3>
            <p className="text-xs mb-4">Latest updates on our green initiatives.</p>
            <div className="flex border-b border-white/20 pb-1 focus-within:border-serena-gold transition-colors">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-transparent w-full outline-none text-white placeholder:text-gray-600 pb-1 text-xs"
              />
              <button className="text-serena-gold hover:text-white transition-colors">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
           <p>© 2026 Serena Green. All Rights Reserved.</p>
           <div className="flex gap-6 mt-2 md:mt-0">
             <Link href="#" className="hover:text-gray-400">Privacy Policy</Link>
             <Link href="#" className="hover:text-gray-400">Terms of Use</Link>
           </div>
        </div>
      </div>
    </footer>
  );
}
