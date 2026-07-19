'use client';
import Link from 'next/link';
import { useState } from 'react';
import { FiBook, FiTruck, FiCalendar, FiMapPin, FiMessageSquare, FiHeart, FiUsers, FiClock, FiArrowRight, FiMessageCircle, FiMenu, FiX } from 'react-icons/fi';
import ChatBot from '@/components/ChatBot';
import { useAuth } from '@/context/AuthContext';

const features = [
  { icon: FiBook, title: 'Cafeteria Booking', desc: 'Book tables and order food in advance', href: '/cafeteria' },
  { icon: FiTruck, title: 'Parking Allocation', desc: 'Reserve bike & car parking spots', href: '/parking' },
  { icon: FiCalendar, title: 'Exam Schedules', desc: 'View exam timetables and countdowns', href: '/exams' },
  { icon: FiClock, title: 'Timetable', desc: 'Access your weekly class schedule', href: '/timetable' },
  { icon: FiMapPin, title: 'Turf Booking', desc: 'Book sports turf and grounds', href: '/turf' },
  { icon: FiMessageSquare, title: 'Complaints', desc: 'Raise issues anonymously', href: '/complaints' },
  { icon: FiHeart, title: 'College Hospital', desc: 'Check doctor availability', href: '/hospital' },
  { icon: FiUsers, title: 'Room Allocation', desc: 'View room assignments & attendance', href: '/dashboard' },
];

export default function Home() {
  const { user } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/70 backdrop-blur-apple border-b border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-ink rounded-apple-sm flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-lg font-bold text-ink tracking-tight">CollegeHub</span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="btn-primary flex items-center gap-2">
                Dashboard <FiArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">Login</Link>
                <Link href="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-ink">
            {mobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-divider px-4 py-4 space-y-2">
            {user ? (
              <Link href="/dashboard" className="block py-2.5 text-ink font-medium">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="block py-2.5 text-ink font-medium">Login</Link>
                <Link href="/register" className="block py-2.5 text-accent font-medium">Get Started</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <section className="pt-16">
        <div className="relative bg-ink overflow-hidden">
          <div className="absolute inset-0 opacity-[0.025]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px'}} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 text-white/50 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-white/10 backdrop-blur-sm">
              <FiMessageCircle size={14} strokeWidth={1.5} />
              AI-Powered Campus Management
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
              Your Campus,<br />
              <span className="text-white/40">Simplified.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/35 mb-12 max-w-2xl mx-auto leading-relaxed">
              Book cafeterias, reserve parking, check exams, and manage everything in one place.
            </p>
            <div className="flex justify-center gap-4">
              <Link href={user ? '/dashboard' : '/register'}
                className="bg-white text-ink px-8 py-3.5 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 text-sm active:scale-[0.97]">
                {user ? 'Go to Dashboard' : 'Start Free'}
              </Link>
              <Link href="/login"
                className="border border-white/20 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/5 transition-all duration-300 text-sm">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-ink mb-4 tracking-tight">Everything You Need</h2>
          <p className="text-muted text-lg max-w-xl mx-auto">One platform to manage all aspects of campus life</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <Link key={f.title} href={user ? f.href : '/login'} className="card group">
              <div className="w-12 h-12 bg-elevated rounded-apple-md flex items-center justify-center mb-5 group-hover:bg-ink group-hover:text-white transition-all duration-300">
                <f.icon className="text-muted group-hover:text-white transition-colors" size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-ink mb-1.5">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-elevated border-y border-divider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-ink mb-4 tracking-tight">AI-Powered Assistant</h2>
          <p className="text-muted mb-12 max-w-xl mx-auto text-lg">
            Ask our AI chatbot anything \u2014 check slots, schedules, availability, and more.
          </p>
          <div className="bg-white rounded-apple-lg p-8 max-w-lg mx-auto shadow-apple">
            <div className="space-y-3.5 text-left">
              <p className="text-sm text-muted font-medium">Try asking:</p>
              {['Any cafeteria slots left for tomorrow?', 'When is my next exam?', 'Is Dr. Smith available today?'].map((q, i) => (
                <div key={i} className="flex items-center gap-2.5 text-ink font-medium text-sm">
                  <FiMessageCircle size={14} className="text-accent shrink-0" strokeWidth={1.5} />
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-ink text-white/20 py-10 text-center text-sm">
        <p>CollegeHub \u2014 College Management System &copy; 2026</p>
      </footer>

      <ChatBot />
    </div>
  );
}
