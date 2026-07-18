'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      router.push('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
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
          <p className="text-teal-200/70 text-lg">Your all-in-one campus management platform</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-teal-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CollegeHub</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-gray-500 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@college.edu" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" placeholder="Enter password" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? 'Signing in...' : <>Sign In <FiArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Don&apos;t have an account? <Link href="/register" className="text-teal-700 font-semibold hover:underline">Create one</Link>
          </p>

          <div className="mt-8 p-4 bg-cream-50 rounded-xl border border-cream-200 text-sm">
            <p className="font-semibold text-gray-700 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-gray-500">
              <p><span className="font-medium text-gray-700">Admin:</span> admin@college.edu / admin123</p>
              <p><span className="font-medium text-gray-700">Student:</span> student@college.edu / student123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
