import { Link, useLocation } from 'react-router';
import * as Icons from 'lucide-react';
import menuConfig from '../../data/menuConfig.json';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const getIcon = (iconName) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#f6f7f9] border-r border-gray-200/80 z-40
          transform transition-transform duration-300 ease-out
          lg:translate-x-0 shadow-sm
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="h-full overflow-y-auto py-6 px-3">
          <ul className="space-y-1.5">
            {menuConfig.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? 'bg-white text-gray-900 shadow-sm font-medium'
                          : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-[#c5203f] rounded-r-full" />
                    )}
                    
                    <span
                      className={`
                        transition-colors duration-200
                        ${isActive ? 'text-[#c5203f]' : 'text-gray-400'}
                      `}
                    >
                      {getIcon(item.icon)}
                    </span>
                    <span className="text-[15px]">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* Sidebar footer with subtle branding */}
          <div className="absolute bottom-6 left-3 right-3">
            <div className="px-3.5 py-3 bg-white/50 rounded-xl border border-gray-200/50">
              <p className="text-xs text-gray-500">
                Dashboard v1.0
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                © Gilead Confidential
              </p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
