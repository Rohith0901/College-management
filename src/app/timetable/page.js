'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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
    { label: 'P1', time: '8:00\u20139:00' },
    { label: 'P2', time: '9:00\u201310:00' },
    { label: 'P3', time: '10:15\u201311:15' },
    { label: 'P4', time: '11:15\u201312:15' },
    { label: 'P5', time: '1:00\u20132:00' },
    { label: 'P6', time: '2:00\u20133:00' },
  ];
  const currentTimetable = timetables[0];

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
    </div>
  );

  const subjectColors = [
    'bg-accent-light text-accent',
    'bg-orange-50 text-orange-600',
    'bg-purple-50 text-purple-600',
    'bg-emerald-50 text-emerald-600',
    'bg-amber-50 text-amber-600',
    'bg-pink-50 text-pink-600',
  ];

  return (
    <div className="animate-apple-in">
      <p className="text-muted text-lg mb-8">View your weekly class schedule</p>

      <div className="flex flex-wrap gap-3 mb-8">
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
        <div className="card-flat text-center py-20 text-muted text-lg">No timetable available. Admin needs to add timetable data.</div>
      ) : (
        <div className="cardStatic overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-7 gap-px bg-divider rounded-apple-md overflow-hidden">
              <div className="bg-elevated p-4" />
              {periods.map((p, i) => (
                <div key={i} className="bg-elevated p-4 text-center">
                  <p className="text-xs font-semibold text-ink">{p.label}</p>
                  <p className="text-[10px] text-muted mt-0.5">{p.time}</p>
                </div>
              ))}
              {days.map(day => {
                const daySchedule = currentTimetable?.schedule?.find(s => s.day === day);
                return [
                  <div key={`${day}-label`} className="bg-elevated p-4 flex items-center">
                    <span className="text-xs font-semibold text-ink tracking-wide uppercase">{day.slice(0, 3)}</span>
                  </div>,
                  ...periods.map((_, periodIdx) => {
                    const period = daySchedule?.periods?.[periodIdx];
                    const colorIdx = (periodIdx + days.indexOf(day)) % subjectColors.length;
                    return (
                      <div key={`${day}-${periodIdx}`} className="bg-white p-2 min-h-[76px]">
                        {period ? (
                          <div className={`h-full rounded-apple-sm p-2.5 ${subjectColors[colorIdx]}`}>
                            <p className="text-[11px] font-semibold leading-tight">{period.subject}</p>
                            <p className="text-[10px] opacity-70 mt-0.5">{period.room}</p>
                            <p className="text-[10px] opacity-50 mt-0.5">{period.faculty}</p>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-divider text-lg">\u2014</div>
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
