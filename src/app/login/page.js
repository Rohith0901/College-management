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
    <div className="min-h-screen flex bg-surface">
      <Toaster position="top-center" />

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px'}} />
        <div className="relative text-center px-16 max-w-lg">
          <div className="w-16 h-16 bg-white/10 rounded-apple-md flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/10">
            <span className="text-white font-bold text-3xl tracking-tight">C</span>
          </div>
          <h2 className="text-5xl font-bold text-white mb-4 tracking-tight leading-tight">CollegeHub</h2>
          <p className="text-white/40 text-lg leading-relaxed">Your all-in-one campus management platform</p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md animate-apple-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-ink rounded-apple-sm flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-ink tracking-tight">CollegeHub</span>
          </div>

          <h1 className="text-4xl font-bold text-ink mb-2 tracking-tight">Welcome back.</h1>
          <p className="text-muted text-lg mb-10">Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50" size={16} strokeWidth={1.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="you@college.edu"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50" size={16} strokeWidth={1.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2 disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : <>Sign In <FiArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-muted">
            Don&apos;t have an account? <Link href="/register" className="text-accent font-medium hover:underline">Create one</Link>
          </p>

          <div className="mt-8 p-5 bg-elevated rounded-apple-md">
            <p className="font-semibold text-ink text-sm mb-2.5">Demo Credentials</p>
            <div className="space-y-1.5 text-sm">
              <p className="text-muted"><span className="font-medium text-ink">Admin:</span> admin@college.edu / admin123</p>
              <p className="text-muted"><span className="font-medium text-ink">Student:</span> student@college.edu / student123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
