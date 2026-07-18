'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiBell, FiLogOut, FiUser, FiSearch, FiChevronDown } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

export default function Header({ title, children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-cream-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {children}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-cream-50 rounded-xl px-3 py-2 border border-cream-200 w-56">
            <FiSearch className="text-gray-400 mr-2" size={16} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <button className="relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-cream-100 transition-colors">
            <FiBell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-coral-500 rounded-full" />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-cream-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <FiUser className="text-teal-700" size={16} />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name || 'Guest'}</p>
                <p className="text-[11px] text-gray-500 leading-tight">{user?.role === 'admin' ? 'Administrator' : 'Student'}</p>
              </div>
              <FiChevronDown size={14} className="text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-drawer border border-cream-200 py-1 z-50">
                <button
                  onClick={() => { router.push('/dashboard'); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50 flex items-center gap-2"
                >
                  <FiUser size={14} /> Profile
                </button>
                <hr className="my-1 border-cream-200" />
                <button
                  onClick={() => { logout(); router.push('/login'); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <FiLogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
