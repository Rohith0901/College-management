'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiCoffee, FiBookOpen, FiClock, FiMapPin, FiAlertCircle, FiHeart, FiGrid } from 'react-icons/fi';

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
      <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Exams Scheduled', value: stats.exams, max: 20, accent: '#0071E3' },
    { label: 'My Complaints', value: stats.complaints, max: 10, accent: '#FF9500' },
    { label: 'Cafeterias', value: stats.cafeteria, max: 10, accent: '#34C759' },
    { label: 'Parking Zones', value: stats.parking, max: 10, accent: '#5856D6' },
  ];

  const modules = [
    { icon: FiCoffee, title: 'Cafeteria', desc: 'Book tables & order food', href: '/cafeteria', stat: stats.cafeteria },
    { icon: FiGrid, title: 'Parking', desc: 'Reserve parking spots', href: '/parking', stat: stats.parking },
    { icon: FiBookOpen, title: 'Exams', desc: 'View exam schedules', href: '/exams', stat: stats.exams },
    { icon: FiClock, title: 'Timetable', desc: 'Class schedule', href: '/timetable' },
    { icon: FiMapPin, title: 'Turf', desc: 'Book sports turf', href: '/turf' },
    { icon: FiAlertCircle, title: 'Complaints', desc: 'Raise issues', href: '/complaints', stat: stats.complaints },
    { icon: FiHeart, title: 'Hospital', desc: 'Doctor availability', href: '/hospital' },
    { icon: FiGrid, title: 'Rooms', desc: 'Room allocation', href: '/dashboard' },
  ];

  return (
    <div className="animate-apple-in">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-ink tracking-tight mb-1">Welcome back, {user.name}</h1>
        <p className="text-muted text-lg">{user.department}{user.year ? ` \u2014 Year ${user.year}` : ''}</p>
      </div>

      {/* Stat Cards — Apple headline stat treatment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map((s) => (
          <div key={s.label} className="card-flat group">
            <p className="text-sm font-medium text-muted mb-3">{s.label}</p>
            <p className="text-5xl font-bold text-ink tracking-tight leading-none mb-4">{s.value}</p>
            <div className="w-full h-1 bg-divider rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min((s.value / s.max) * 100, 100)}%`, backgroundColor: s.accent }}
              />
            </div>
            <p className="text-xs text-muted mt-2">{s.value} of {s.max}</p>
          </div>
        ))}
      </div>

      {/* Quick Access Grid */}
      <h2 className="text-sm font-medium text-muted mb-5 tracking-wide">Quick Access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map(m => (
          <Link key={m.title} href={m.href} className="card group">
            <div className="flex items-center gap-3.5 mb-0">
              <div className="w-10 h-10 rounded-apple-sm bg-elevated flex items-center justify-center group-hover:bg-ink group-hover:text-white transition-all duration-300">
                <m.icon className="text-muted group-hover:text-white transition-colors" size={18} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-ink text-sm">{m.title}</h3>
                <p className="text-muted text-xs">{m.desc}</p>
              </div>
            </div>
            {m.stat !== undefined && (
              <div className="mt-4 pt-4 border-t border-divider">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-muted">Available</span>
                  <span className="text-xs font-semibold text-ink">{m.stat}</span>
                </div>
                <div className="h-1 bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${Math.min((m.stat / 10) * 100, 100)}%` }} />
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
