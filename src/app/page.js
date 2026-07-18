'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiBook, FiTruck, FiCalendar, FiMapPin, FiMessageSquare, FiHeart, FiUsers, FiClock, FiArrowRight, FiMessageCircle, FiMenu, FiX } from 'react-icons/fi';
import ChatBot from '@/components/ChatBot';
import { useAuth } from '@/context/AuthContext';

const features = [
  { icon: FiBook, title: 'Cafeteria Booking', desc: 'Book tables and order food in advance', href: '/cafeteria', color: 'bg-coral-500' },
  { icon: FiTruck, title: 'Parking Allocation', desc: 'Reserve bike & car parking spots', href: '/parking', color: 'bg-sky-500' },
  { icon: FiCalendar, title: 'Exam Schedules', desc: 'View exam timetables and countdowns', href: '/exams', color: 'bg-red-500' },
  { icon: FiClock, title: 'Timetable', desc: 'Access your weekly class schedule', href: '/timetable', color: 'bg-emerald-500' },
  { icon: FiMapPin, title: 'Turf Booking', desc: 'Book sports turf and grounds', href: '/turf', color: 'bg-purple-500' },
  { icon: FiMessageSquare, title: 'Complaints', desc: 'Raise issues anonymously', href: '/complaints', color: 'bg-amber-500' },
  { icon: FiHeart, title: 'College Hospital', desc: 'Check doctor availability', href: '/hospital', color: 'bg-pink-500' },
  { icon: FiUsers, title: 'Room Allocation', desc: 'View room assignments & attendance', href: '/dashboard', color: 'bg-indigo-500' },
];

export default function Home() {
  const { user } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-cream-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-teal-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-lg font-bold text-gray-900">CollegeHub</span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="btn-primary flex items-center gap-2">
                Dashboard <FiArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-secondary">Login</Link>
                <Link href="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-gray-600">
            {mobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-cream-200 px-4 py-3 space-y-2">
            {user ? (
              <Link href="/dashboard" className="block py-2 text-gray-700 font-medium">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="block py-2 text-gray-700 font-medium">Login</Link>
                <Link href="/register" className="block py-2 text-teal-800 font-medium">Get Started</Link>
              </>
            )}
          </div>
        )}
      </nav>

      <section className="pt-16">
        <div className="relative overflow-hidden bg-teal-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.3),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.15),transparent_50%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 text-teal-100 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <FiMessageCircle size={14} />
              AI-Powered Campus Management
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Your Campus,<br />
              <span className="text-teal-300">Simplified.</span>
            </h1>
            <p className="text-lg md:text-xl text-teal-200/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Book cafeterias, reserve parking, check exams, and manage everything in one place.
            </p>
            <div className="flex justify-center gap-4">
              <Link href={user ? '/dashboard' : '/register'} className="bg-white text-teal-800 px-8 py-3.5 rounded-xl font-bold hover:bg-cream-50 transition-all shadow-lg shadow-black/10 text-sm">
                {user ? 'Go to Dashboard' : 'Start Free'}
              </Link>
              <Link href="/login" className="border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/10 transition-all text-sm">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Everything You Need</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">One platform to manage all aspects of campus life</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <Link key={f.title} href={user ? f.href : '/login'} className="card group cursor-pointer">
              <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-${f.color}/20`}>
                <f.icon className="text-white" size={22} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">AI-Powered Assistant</h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto text-lg">
            Ask our AI chatbot anything — check slots, schedules, availability, and more.
          </p>
          <div className="bg-cream-50 rounded-2xl p-8 max-w-lg mx-auto border border-cream-200">
            <div className="space-y-3 text-left">
              <p className="text-sm text-gray-500 font-medium">Try asking:</p>
              {['Any cafeteria slots left for tomorrow?', 'When is my next exam?', 'Is Dr. Smith available today?'].map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-teal-700 font-medium text-sm">
                  <FiMessageCircle size={14} className="text-teal-500 shrink-0" />
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-teal-900 text-teal-300/60 py-8 text-center text-sm">
        <p>CollegeHub — College Management System &copy; 2026</p>
      </footer>

      <ChatBot />
    </div>
  );
}
