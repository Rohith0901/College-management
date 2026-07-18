'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiBookOpen, FiArrowRight } from 'react-icons/fi';

const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Chemical', 'Biotechnology'];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', year: '', semester: '', studentId: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register({ ...form, year: parseInt(form.year) || undefined, semester: parseInt(form.semester) || undefined });
    if (result.success) {
      toast.success('Account created!');
      router.push('/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-cream-100">
      <Toaster position="top-center" />
      <div className="hidden lg:flex lg:w-1/2 bg-teal-800 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.3),transparent_60%)]" />
        <div className="relative text-center px-12">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <span className="text-white font-bold text-3xl">C</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">CollegeHub</h2>
          <p className="text-teal-200/70 text-lg">Join thousands of students managing their campus life</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-teal-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CollegeHub</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h1>
          <p className="text-gray-500 mb-8">Join your campus community</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-10" placeholder="John Doe" required />
                </div>
              </div>
              <div>
                <label className="label">Student ID</label>
                <input type="text" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="input-field" placeholder="CS2024001" />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-10" placeholder="you@college.edu" required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-10" placeholder="Min 6 characters" required minLength={6} />
              </div>
            </div>

            <div>
              <label className="label">Department</label>
              <div className="relative">
                <FiBookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field pl-10" required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Year</label>
                <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="select-field">
                  <option value="">Select Year</option>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Semester</label>
                <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="select-field">
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field pl-10" placeholder="+91 98765 43210" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading ? 'Creating Account...' : <>Create Account <FiArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-teal-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
