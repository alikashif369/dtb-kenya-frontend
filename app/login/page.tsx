// src/app/login/page.tsx

import AuthCard from '@/components/AuthCard'; // Update path if necessary
import React from 'react';

// You can optionally define metadata here for SEO
export const metadata = {
  title: 'Sign In | Serena Green',
  description: 'Access the Serena Green project dashboard and personalized features.',
};

/**
 * Login Page Component
 * Renders the AuthCard which handles both Sign In and Sign Up states.
 */
export default function LoginPage() {
  return (
    // The AuthCard already includes a flex container to center itself vertically and horizontally.
    <AuthCard />
  );
}