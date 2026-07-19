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
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-apple border-b border-divider">
      <div className="flex items-center justify-between h-16 px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-ink tracking-tight">{title}</h1>
          {children}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-elevated rounded-apple-sm px-3.5 py-2 w-56 transition-all focus-within:ring-2 focus-within:ring-accent/20 focus-within:bg-white">
            <FiSearch className="text-muted mr-2 shrink-0" size={15} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent text-sm outline-none w-full text-ink placeholder:text-muted/60"
            />
          </div>

          <button className="relative w-10 h-10 rounded-apple-sm flex items-center justify-center text-muted hover:text-ink hover:bg-elevated transition-all duration-200">
            <FiBell size={17} strokeWidth={1.5} />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-accent rounded-full" />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-elevated transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center border border-divider">
                <FiUser className="text-muted" size={14} strokeWidth={1.5} />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-ink leading-tight">{user?.name || 'Guest'}</p>
                <p className="text-[11px] text-muted leading-tight">{user?.role === 'admin' ? 'Administrator' : 'Student'}</p>
              </div>
              <FiChevronDown size={13} className={`text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-apple-md shadow-apple-elevated border border-divider py-1.5 z-50 animate-apple-in">
                <button
                  onClick={() => { router.push('/dashboard'); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-elevated flex items-center gap-2.5 transition-colors"
                >
                  <FiUser size={14} strokeWidth={1.5} /> Profile
                </button>
                <div className="mx-4 my-1.5 h-px bg-divider" />
                <button
                  onClick={() => { logout(); router.push('/login'); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                >
                  <FiLogOut size={14} strokeWidth={1.5} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
