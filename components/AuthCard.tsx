// src/components/AuthCard.tsx

"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FaUser, FaLock, FaEnvelope, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default function AuthCard() {
  const [isLogin, setIsLogin] = useState(true);

  // Function to handle form submission (replace with actual backend logic)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(isLogin ? "Attempting Login..." : "Attempting Signup...");
  };

  const title = isLogin ? "Welcome Back" : "Join Serena Green";
  const buttonText = isLogin ? "Sign In" : "Create Account";

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Auth Card Container */}
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-xl shadow-2xl space-y-8 border-t-8 border-green-900">
        
        {/* Logo and Title */}
        <div className="text-center">
          <Image
            src="/serena-logo.png" // Ensure this path is correct
            alt="Serena Green Logo"
            width={60}
            height={60}
            className="mx-auto mb-4"
          />
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Access your dashboard." : "Start your sustainable journey."}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* Signup Fields (Conditional) */}
          {!isLogin && (
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-green-900" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md sm:text-sm"
                  placeholder="Full Name"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-green-900" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-green-900" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-md sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-900 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-900 transition duration-150 ease-in-out shadow-lg"
            >
              {isLogin ? <FaSignInAlt className="w-5 h-5 mr-2" /> : <FaUserPlus className="w-5 h-5 mr-2" />}
              {buttonText}
            </button>
          </div>
        </form>

        {/* Toggle Link */}
        <div className="text-center">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}
            className="text-sm font-medium text-green-900 hover:text-green-900 transition"
          >
            {isLogin 
              ? "Need an account? Sign Up" 
              : "Already have an account? Sign In"
            }
          </a>
        </div>
      </div>
    </section>
  );
}