'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiHeart, FiPhone, FiClock, FiMapPin } from 'react-icons/fi';

export default function HospitalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    fetch('/api/doctors').then(r => r.json()).then(d => setDoctors(d.doctors || []));
  }, [user, loading, router]);

  if (loading || !user) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">Check doctor availability and schedules</p>

      <div className="cardStatic mb-6 bg-red-50 border border-red-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <FiPhone className="text-red-600" size={18} />
          </div>
          <div>
            <p className="font-bold text-red-800 text-sm">Emergency Contact</p>
            <p className="text-red-600 text-sm">+91-9876543210 (College Hospital)</p>
          </div>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">No doctors information available yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map(d => (
            <div key={d._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-2xl">
                    👨‍⚕️
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Dr. {d.name}</h3>
                    <p className="text-xs text-gray-500">{d.specialization}</p>
                  </div>
                </div>
                <span className={`badge ${d.available ? 'badge-green' : 'badge-red'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${d.available ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {d.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div className="border border-cream-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-cream-50 border-b border-cream-200">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Schedule</p>
                </div>
                {d.schedule?.map((s, i) => (
                  <div key={i} className={`flex justify-between items-center px-4 py-2.5 text-sm ${i < d.schedule.length - 1 ? 'border-b border-cream-200' : ''}`}>
                    <span className="text-gray-600">{s.day}</span>
                    <span className="font-medium text-gray-900">{s.startTime} - {s.endTime}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                {d.room && <span className="flex items-center gap-1"><FiMapPin size={12} /> Room {d.room}</span>}
                {d.contact && <span className="flex items-center gap-1"><FiPhone size={12} /> {d.contact}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cardStatic mt-8 border border-cream-200">
        <div className="flex items-center gap-2 mb-3">
          <FiClock className="text-teal-600" size={16} />
          <h3 className="font-bold text-gray-900 text-sm">Hospital Hours</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-cream-50 rounded-xl">
            <p className="text-xs text-gray-500">Monday - Saturday</p>
            <p className="text-sm font-bold text-gray-900">8:00 AM - 6:00 PM</p>
          </div>
          <div className="p-3 bg-cream-50 rounded-xl">
            <p className="text-xs text-gray-500">Sunday</p>
            <p className="text-sm font-bold text-gray-900">Emergency Only</p>
          </div>
        </div>
      </div>
    </div>
  );
}
