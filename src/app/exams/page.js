'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiBookOpen, FiClock, FiMapPin, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function ExamsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  useEffect(() => {
    let url = '/api/exams?';
    if (department) url += `department=${department}&`;
    if (year) url += `year=${year}&`;
    fetch(url).then(r => r.json()).then(d => setExams(d.exams || []));
  }, [department, year]);

  const now = new Date();
  const upcoming = exams.filter(e => new Date(e.date) >= now);
  const past = exams.filter(e => new Date(e.date) < now);
  const getDaysLeft = (date) => Math.ceil((new Date(date) - now) / (1000 * 60 * 60 * 24));

  if (loading || !user) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full" /></div>;

  const typeColors = { final: 'badge-red', midterm: 'badge-yellow', internal: 'badge-blue', practical: 'badge-purple' };

  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">View your exam timetable and countdowns</p>

      <div className="flex gap-3 mb-6">
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="select-field w-48">
          <option value="">All Departments</option>
          {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="select-field w-36">
          <option value="">All Years</option>
          {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>

      {upcoming.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Upcoming Exams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map(exam => {
              const daysLeft = getDaysLeft(exam.date);
              return (
                <div key={exam._id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <span className={typeColors[exam.type] || 'badge-gray'}>{exam.type}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${daysLeft <= 3 ? 'bg-red-100 text-red-700' : daysLeft <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {daysLeft}d left
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{exam.subject}</h3>
                  <p className="text-xs text-gray-500 mb-3">{exam.code}</p>
                  <div className="space-y-2">
                    {[
                      { icon: FiCalendar, text: new Date(exam.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) },
                      { icon: FiClock, text: exam.time },
                      { icon: FiMapPin, text: exam.room },
                    ].map(({ icon: I, text }, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <I size={12} className="text-gray-400 shrink-0" /> {text}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {exams.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">No exams scheduled yet.</div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Exams</h2>
          </div>
          <div className="space-y-2">
            {exams.map(exam => (
              <div key={exam._id} className="cardStatic border border-cream-200 hover:border-cream-300 cursor-pointer transition-all"
                onClick={() => setExpanded(expanded === exam._id ? null : exam._id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={typeColors[exam.type] || 'badge-gray'}>{exam.type}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{exam.subject}</p>
                      <p className="text-xs text-gray-500">{exam.code} • {exam.department} • Year {exam.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 hidden sm:block">{new Date(exam.date).toLocaleDateString()}</span>
                    {expanded === exam._id ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>
                {expanded === exam._id && (
                  <div className="mt-4 pt-4 border-t border-cream-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Date', value: new Date(exam.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                        { label: 'Time', value: exam.time },
                        { label: 'Room', value: exam.room },
                        { label: 'Duration', value: exam.duration },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-3 bg-cream-50 rounded-xl">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase">{label}</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
