"use client";
import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaLeaf, FaMapMarkerAlt, FaEnvelope, FaPhone, FaPaperPlane, FaChevronRight } from "react-icons/fa";

export default function Footer() {
  return (
    <footer id="contact" className="bg-green-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-bold mb-4 heading-font">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-plantation mt-1" />
                <div>
                  <p className="font-semibold">Head Office</p>
                  <p className="text-gray-300">Serena Hotels, Islamabad, Pakistan</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaEnvelope className="text-plantation mt-1" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href="mailto:green@serenahotels.com" className="text-gray-300 hover:text-plantation transition">
                    green@serenahotels.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaPhone className="text-plantation mt-1" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <a href="tel:+92512876161" className="text-gray-300 hover:text-plantation transition">
                    +92 51 287 6161
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-bold mb-4 heading-font">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "#", label: "Home" },
                { href: "dashboard.html", label: "Dashboard" },
                { href: "#", label: "About Us" },
                { href: "#partners", label: "Our Partners" },
                { href: "#", label: "Sustainability Reports" },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-gray-300 hover:text-plantation transition flex items-center gap-2">
                    <FaChevronRight className="text-xs" /> {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-2xl font-bold mb-4 heading-font">Stay Updated</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for the latest sustainability news and project updates.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-plantation transition"
              />
              <button
                type="submit"
                className="w-full bg-plantation hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center"
              >
                <FaPaperPlane className="mr-2" /> Subscribe
              </button>
            </form>

            <div className="flex gap-4 mt-6">
              <a href="#" className="text-white hover:text-plantation transition text-xl"><FaFacebook /></a>
              <a href="#" className="text-white hover:text-plantation transition text-xl"><FaTwitter /></a>
              <a href="#" className="text-white hover:text-plantation transition text-xl"><FaInstagram /></a>
              <a href="#" className="text-white hover:text-plantation transition text-xl"><FaLinkedin /></a>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/20 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-300 text-sm text-center md:text-left">
              © 2025 Serena Green. All rights reserved. |
              <a href="#" className="hover:text-plantation transition ml-1">Privacy Policy</a> |
              <a href="#" className="hover:text-plantation transition ml-1">Terms of Service</a>
            </div>
            <div className="text-gray-300 text-sm flex items-center gap-2">
              <FaLeaf className="text-plantation" /> Building a Sustainable Future Together
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
