'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { FiMapPin, FiClock, FiCheck, FiX } from 'react-icons/fi';

export default function TurfPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [turfs, setTurfs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    fetch('/api/turf').then(r => r.json()).then(d => setTurfs(d.turfs || []));
  }, [user, loading, router]);

  const handleBook = async () => {
    if (!selected || !timeSlot) { toast.error('Select turf and time slot'); return; }
    setBookingLoading(true);
    const res = await fetch('/api/turf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ turfId: selected._id, turfName: selected.name, date, timeSlot }),
    });
    const data = await res.json();
    if (res.ok) { toast.success('Turf booked!'); setShowPanel(false); setSelected(null); }
    else toast.error(data.error || 'Booking failed');
    setBookingLoading(false);
  };

  const sportEmoji = { football: '⚽', cricket: '🏏', basketball: '🏀', tennis: '🎾' };
  const sportColor = { football: 'bg-emerald-500', cricket: 'bg-sky-500', basketball: 'bg-coral-500', tennis: 'bg-amber-500' };

  if (loading || !user) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <Toaster position="top-center" />
      <p className="text-gray-500 text-sm mb-6">Book sports grounds and turfs</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {turfs.length === 0 ? (
            <div className="card text-center py-16 text-gray-500 col-span-2">No turfs available yet.</div>
          ) : turfs.map(t => {
            const avail = t.slots?.filter(s => !s.isBooked).length || t.totalSlots;
            const pct = t.totalSlots > 0 ? (avail / t.totalSlots) * 100 : 0;
            const sc = sportColor[t.sport?.toLowerCase()] || 'bg-purple-500';
            return (
              <div key={t._id} onClick={() => { setSelected(t); setShowPanel(true); setTimeSlot(''); }}
                className={`card cursor-pointer transition-all ${selected?._id === t._id ? 'ring-2 ring-teal-500 shadow-cardHover' : ''}`}>
                <div className={`w-full h-28 rounded-xl mb-4 flex items-center justify-center text-4xl ${sc}`}>
                  {sportEmoji[t.sport?.toLowerCase()] || '🏟️'}
                </div>
                <h3 className="font-bold text-gray-900">{t.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{t.sport} • {t.location}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${avail > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {avail}/{t.totalSlots} slots
                  </span>
                  <span className="text-sm font-bold text-gray-900">Rs.{t.pricePerSlot}<span className="text-xs font-normal text-gray-400">/slot</span></span>
                </div>
                <div className="h-1.5 bg-cream-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${avail > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {showPanel && selected && (
          <div className="lg:col-span-1">
            <div className="cardStatic sticky top-24 border border-cream-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900">Book Slot</h3>
                <button onClick={() => { setShowPanel(false); setSelected(null); }} className="text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
              </div>
              <div className="mb-4 p-3 bg-cream-50 rounded-xl">
                <p className="font-semibold text-sm text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-500">{selected.sport} — Rs.{selected.pricePerSlot}/slot</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="label">Time Slot</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['6:00-7:00', '7:00-8:00', '8:00-9:00', '9:00-10:00', '10:00-11:00', '16:00-17:00', '17:00-18:00', '18:00-19:00'].map(s => (
                      <button key={s} onClick={() => setTimeSlot(s)}
                        className={`p-2.5 rounded-xl border text-xs text-left transition-all ${timeSlot === s ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-cream-200 hover:border-teal-300'}`}>
                        <p className="font-medium text-gray-900">{s}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleBook} disabled={bookingLoading || !timeSlot}
                  className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed">
                  {bookingLoading ? 'Booking...' : 'Book Slot'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
