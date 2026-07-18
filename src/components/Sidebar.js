'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FiHome, FiCoffee, FiGrid, FiBookOpen, FiClock,
  FiMapPin, FiAlertCircle, FiHeart, FiSettings, FiMessageCircle
} from 'react-icons/fi';

const navItems = [
  { href: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { href: '/cafeteria', icon: FiCoffee, label: 'Cafeteria' },
  { href: '/parking', icon: FiGrid, label: 'Parking' },
  { href: '/exams', icon: FiBookOpen, label: 'Exams' },
  { href: '/timetable', icon: FiClock, label: 'Timetable' },
  { href: '/turf', icon: FiMapPin, label: 'Turf' },
  { href: '/complaints', icon: FiAlertCircle, label: 'Complaints' },
  { href: '/hospital', icon: FiHeart, label: 'Hospital' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-[76px] bg-sidebar flex flex-col items-center py-5 z-50">
      <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center mb-8">
        <span className="text-white font-bold text-lg">C</span>
      </div>

      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                active
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                  : 'text-teal-300/60 hover:text-white hover:bg-sidebarHover'
              }`}
            >
              <Icon size={20} />
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <>
            <div className="w-8 h-px bg-teal-800 my-2" />
            <Link
              href="/admin"
              title="Admin"
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                pathname === '/admin'
                  ? 'bg-coral-500 text-white shadow-lg shadow-coral-500/30'
                  : 'text-teal-300/60 hover:text-white hover:bg-sidebarHover'
              }`}
            >
              <FiSettings size={20} />
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto">
        <Link
          href="/dashboard"
          title="AI Assistant"
          className="w-11 h-11 rounded-xl flex items-center justify-center text-teal-300/60 hover:text-white hover:bg-sidebarHover transition-all duration-200"
        >
          <FiMessageCircle size={20} />
        </Link>
      </div>
    </aside>
  );
}
