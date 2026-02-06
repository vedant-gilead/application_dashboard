import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, HelpCircle, User, Settings, LogOut, Clock } from 'lucide-react';
import logo from './../../assets/Gilead_Sciences-Logo.svg';

export default function Header({ onMenuToggle }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200/80 z-50 backdrop-blur-sm bg-white/95">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Logo and Brand */}
          <a href="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Company Logo" className="w-45" />
            {/* <span className="text-xl font-semibold text-gray-800 hidden sm:block tracking-tight">
              Program Dashboard
            </span> */}
          </a>
        </div>

        {/* Center Section */}
        <div className="hidden lg:flex flex-1 justify-center">
          <h1 className="text-4xl font-semibold text-gray-800 tracking-tight">
            Clinical Master Production Plan
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1.5">
          {/* Help Icon */}
          {/* <button
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 hidden sm:flex items-center justify-center group"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button> */}

          {/* Notifications Icon */}
          {/* <button
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 relative flex items-center justify-center group"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#c5203f] rounded-full ring-2 ring-white"></span>
          </button> */}

          {/* Profile Dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#c5203f] to-[#a01a34] rounded-lg flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block">
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  Abhishek
                </span>
                <div className="flex items-center gap-1 mt-1 border rounded-full px-2 py-0.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-500">{currentTime}</p>
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200/80 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">Abhishek</p>
                  <p className="text-xs text-gray-500 mt-0.5">abhishek.gupta@gilead.com</p>
                </div>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 mt-1 transition-colors rounded-lg mx-1.5"
                  style={{ width: 'calc(100% - 0.75rem)' }}
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-lg mx-1.5"
                  style={{ width: 'calc(100% - 0.75rem)' }}
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Settings</span>
                </button>
                <hr className="my-1.5 border-gray-100" />
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-3 py-2 text-left text-sm text-[#c5203f] hover:bg-red-50 flex items-center gap-2.5 transition-colors rounded-lg mx-1.5 mb-1"
                  style={{ width: 'calc(100% - 0.75rem)' }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
