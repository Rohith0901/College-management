'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiCoffee, FiTruck, FiBookOpen, FiClock, FiMapPin, FiAlertCircle, FiHeart, FiGrid, FiCalendar, FiTrendingUp } from 'react-icons/fi';

function DonutChart({ value, total, color, size = 80 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? value / total : 0;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f5f0e8" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct)}
        className="transition-all duration-700" />
    </svg>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ bookings: 0, complaints: 0, exams: 0, cafeteria: 0, parking: 0 });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const h = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      Promise.all([
        fetch('/api/exams').then(r => r.json()),
        fetch('/api/complaints', { headers: h }).then(r => r.json()),
        fetch('/api/cafeteria').then(r => r.json()),
        fetch('/api/parking').then(r => r.json()),
      ]).then(([exams, complaints, caf, park]) => {
        setStats({
          exams: exams.exams?.length || 0,
          complaints: complaints.complaints?.length || 0,
          cafeteria: caf.cafeterias?.length || 0,
          parking: park.parking?.length || 0,
          bookings: 0,
        });
      });
    }
  }, [user]);

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full" />
    </div>
  );

  const modules = [
    { icon: FiCoffee, title: 'Cafeteria', desc: 'Book tables & order food', href: '/cafeteria', color: 'bg-coral-500', stat: stats.cafeteria },
    { icon: FiGrid, title: 'Parking', desc: 'Reserve parking spots', href: '/parking', color: 'bg-sky-500', stat: stats.parking },
    { icon: FiBookOpen, title: 'Exams', desc: 'View exam schedules', href: '/exams', color: 'bg-red-500', stat: stats.exams },
    { icon: FiClock, title: 'Timetable', desc: 'Class schedule', href: '/timetable', color: 'bg-emerald-500' },
    { icon: FiMapPin, title: 'Turf', desc: 'Book sports turf', href: '/turf', color: 'bg-purple-500' },
    { icon: FiAlertCircle, title: 'Complaints', desc: 'Raise issues', href: '/complaints', color: 'bg-amber-500', stat: stats.complaints },
    { icon: FiHeart, title: 'Hospital', desc: 'Doctor availability', href: '/hospital', color: 'bg-pink-500' },
    { icon: FiGrid, title: 'Rooms', desc: 'Room allocation', href: '/dashboard', color: 'bg-indigo-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
        <p className="text-gray-500 text-sm mt-1">{user.department}{user.year ? ` — Year ${user.year}` : ''}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Exams Scheduled', value: stats.exams, total: 20, color: '#ef4444' },
          { label: 'My Complaints', value: stats.complaints, total: 10, color: '#f59e0b' },
          { label: 'Cafeterias', value: stats.cafeteria, total: 10, color: '#f97316' },
          { label: 'Parking Zones', value: stats.parking, total: 10, color: '#0ea5e9' },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className="relative shrink-0">
              <DonutChart value={s.value} total={s.total} color={s.color} />
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900">{s.value}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{s.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.value} of {s.total}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map(m => (
          <Link key={m.title} href={m.href} className="card group">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${m.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <m.icon className="text-white" size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{m.title}</h3>
                <p className="text-gray-500 text-xs">{m.desc}</p>
              </div>
            </div>
            {m.stat !== undefined && (
              <div className="mt-3 pt-3 border-t border-cream-200">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-500">Available</span>
                  <span className="text-xs font-bold text-gray-900">{m.stat}</span>
                </div>
                <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${Math.min((m.stat / 10) * 100, 100)}%` }} />
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
