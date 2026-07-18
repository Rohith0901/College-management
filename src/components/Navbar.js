'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CollegeHub</span>
            </Link>
          </div>

          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium">Dashboard</Link>
              <Link href="/cafeteria" className="text-gray-600 hover:text-primary-600 font-medium">Cafeteria</Link>
              <Link href="/parking" className="text-gray-600 hover:text-primary-600 font-medium">Parking</Link>
              <Link href="/exams" className="text-gray-600 hover:text-primary-600 font-medium">Exams</Link>
              <Link href="/turf" className="text-gray-600 hover:text-primary-600 font-medium">Turf</Link>
              <Link href="/hospital" className="text-gray-600 hover:text-primary-600 font-medium">Hospital</Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-red-600 hover:text-red-700 font-medium">Admin</Link>
              )}
            </div>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <FiUser className="text-gray-500" />
                  <span className="text-sm text-gray-700 hidden sm:block">{user.name}</span>
                </div>
                <button onClick={logout} className="text-gray-500 hover:text-red-600">
                  <FiLogOut />
                </button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link href="/login" className="btn-secondary text-sm">Login</Link>
                <Link href="/register" className="btn-primary text-sm">Register</Link>
              </div>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-600">
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && user && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/dashboard" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Dashboard</Link>
            <Link href="/cafeteria" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cafeteria</Link>
            <Link href="/parking" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Parking</Link>
            <Link href="/exams" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Exams</Link>
            <Link href="/timetable" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Timetable</Link>
            <Link href="/turf" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Turf</Link>
            <Link href="/complaints" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Complaints</Link>
            <Link href="/hospital" className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hospital</Link>
            {user.role === 'admin' && (
              <Link href="/admin" className="block px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">Admin Panel</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
