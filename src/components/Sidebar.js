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
    <aside className="fixed left-0 top-0 h-full w-[72px] bg-white/70 backdrop-blur-apple border-r border-divider flex flex-col items-center py-5 z-50">
      <Link href="/dashboard" className="w-10 h-10 bg-ink rounded-apple-sm flex items-center justify-center mb-8 transition-transform hover:scale-105 duration-200">
        <span className="text-white font-bold text-lg">C</span>
      </Link>

      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`relative w-10 h-10 rounded-apple-sm flex items-center justify-center transition-all duration-200 ${
                active
                  ? 'bg-ink text-white'
                  : 'text-muted hover:text-ink hover:bg-elevated'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <>
            <div className="w-6 h-px bg-divider my-2" />
            <Link
              href="/admin"
              title="Admin"
              className={`w-10 h-10 rounded-apple-sm flex items-center justify-center transition-all duration-200 ${
                pathname === '/admin'
                  ? 'bg-ink text-white'
                  : 'text-muted hover:text-ink hover:bg-elevated'
              }`}
            >
              <FiSettings size={18} strokeWidth={1.5} />
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto">
        <Link
          href="/dashboard"
          title="AI Assistant"
          className="w-10 h-10 rounded-apple-sm flex items-center justify-center text-muted hover:text-ink hover:bg-elevated transition-all duration-200"
        >
          <FiMessageCircle size={18} strokeWidth={1.5} />
        </Link>
      </div>
    </aside>
  );
}
