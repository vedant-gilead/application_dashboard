import { Link } from 'react-router-dom';

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white p-16 rounded-lg shadow-2xl text-center max-w-xl">
        <div className="mb-8">
          <div className="text-6xl text-[#306e9a]">🚧</div>
        </div>
        <h1 className="text-5xl font-semibold text-gray-800 mb-4">Coming Soon</h1>
        <p className="text-lg text-gray-600 mb-8">
          We're putting the finishing touches on this page. It'll be worth the wait!
        </p>
        <Link
          to="/"
          className="bg-[#306e9a] text-white px-8 py-4 rounded-full shadow-lg hover:bg-[#245371] transition-transform transform hover:scale-105"
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
}
