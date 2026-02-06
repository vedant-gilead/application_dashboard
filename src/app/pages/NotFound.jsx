import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#f8e8ec] to-[#f3d4db] rounded-2xl mb-6">
            <span className="text-4xl font-bold text-[#c5203f]">404</span>
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">Page not found</h1>
        <p className="text-base text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. Please check the URL or return to the dashboard.
        </p>
        <div className="flex items-center gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#c5203f] text-white rounded-xl hover:bg-[#a01a34] transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-300 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
