import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl text-center">
        <ShieldX className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access the admin panel.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          If you believe this is an error, please contact your administrator.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 transition"
          >
            Go to Home
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Try Different Account
          </Link>
        </div>
      </div>
    </div>
  );
}
