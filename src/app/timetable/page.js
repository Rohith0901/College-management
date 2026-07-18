'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiClock } from 'react-icons/fi';

export default function TimetablePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timetables, setTimetables] = useState([]);
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);

  useEffect(() => {
    let url = '/api/timetable?';
    if (department) url += `department=${department}&`;
    if (year) url += `year=${year}&`;
    if (semester) url += `semester=${semester}&`;
    fetch(url).then(r => r.json()).then(d => setTimetables(d.timetables || []));
  }, [department, year, semester]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [
    { label: 'P1', time: '8:00-9:00' },
    { label: 'P2', time: '9:00-10:00' },
    { label: 'P3', time: '10:15-11:15' },
    { label: 'P4', time: '11:15-12:15' },
    { label: 'P5', time: '1:00-2:00' },
    { label: 'P6', time: '2:00-3:00' },
  ];
  const currentTimetable = timetables[0];

  if (loading || !user) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full" /></div>;

  const subjectColors = ['bg-teal-50 text-teal-800 border-teal-200', 'bg-coral-50 text-coral-700 border-coral-200', 'bg-purple-50 text-purple-800 border-purple-200', 'bg-sky-50 text-sky-800 border-sky-200', 'bg-amber-50 text-amber-800 border-amber-200', 'bg-pink-50 text-pink-800 border-pink-200'];

  return (
    <div>
      <p className="text-gray-500 text-sm mb-6">View your weekly class schedule</p>

      <div className="flex gap-3 mb-6">
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="select-field w-48">
          <option value="">All Departments</option>
          {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="select-field w-36">
          <option value="">All Years</option>
          {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
        </select>
        <select value={semester} onChange={(e) => setSemester(e.target.value)} className="select-field w-36">
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </select>
      </div>

      {!currentTimetable ? (
        <div className="card text-center py-16 text-gray-500">No timetable available. Admin needs to add timetable data.</div>
      ) : (
        <div className="cardStatic border border-cream-200 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 gap-px bg-cream-200 rounded-xl overflow-hidden">
              <div className="bg-cream-50 p-3" />
              {periods.map((p, i) => (
                <div key={i} className="bg-cream-50 p-3 text-center">
                  <p className="text-xs font-bold text-gray-700">{p.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{p.time}</p>
                </div>
              ))}
              {days.map(day => {
                const daySchedule = currentTimetable?.schedule?.find(s => s.day === day);
                return [
                  <div key={`${day}-label`} className="bg-cream-50 p-3 flex items-center">
                    <span className="text-xs font-bold text-gray-700">{day.slice(0, 3)}</span>
                  </div>,
                  ...periods.map((_, periodIdx) => {
                    const period = daySchedule?.periods?.[periodIdx];
                    const colorIdx = (periodIdx + days.indexOf(day)) % subjectColors.length;
                    return (
                      <div key={`${day}-${periodIdx}`} className="bg-white p-2 min-h-[70px]">
                        {period ? (
                          <div className={`h-full rounded-lg p-2 border ${subjectColors[colorIdx]}`}>
                            <p className="text-[11px] font-bold leading-tight">{period.subject}</p>
                            <p className="text-[10px] opacity-70 mt-0.5">{period.room}</p>
                            <p className="text-[10px] opacity-50 mt-0.5">{period.faculty}</p>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-200">—</div>
                        )}
                      </div>
                    );
                  })
                ];
              }).flat()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
