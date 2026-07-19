'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { FiClock, FiX } from 'react-icons/fi';

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

  const sportEmoji = { football: '\u26BD', cricket: '\uD83C\uDFCF', basketball: '\uD83C\uDFC0', tennis: '\uD83C\uDFBE' };
  const sportBg = { football: 'bg-emerald-500', cricket: 'bg-sky-500', basketball: 'bg-orange-500', tennis: 'bg-amber-500' };

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-apple-in">
      <Toaster position="top-center" />
      <p className="text-muted text-lg mb-8">Book sports grounds and turfs</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {turfs.length === 0 ? (
            <div className="card-flat text-center py-20 text-muted col-span-2">No turfs available yet.</div>
          ) : turfs.map(t => {
            const avail = t.slots?.filter(s => !s.isBooked).length || t.totalSlots;
            const pct = t.totalSlots > 0 ? (avail / t.totalSlots) * 100 : 0;
            const sc = sportBg[t.sport?.toLowerCase()] || 'bg-purple-500';
            return (
              <div key={t._id} onClick={() => { setSelected(t); setShowPanel(true); setTimeSlot(''); }}
                className={`card cursor-pointer ${selected?._id === t._id ? 'ring-2 ring-accent shadow-apple-hover' : ''}`}>
                <div className={`w-full h-28 rounded-apple-md mb-5 flex items-center justify-center text-4xl ${sc}`}>
                  {sportEmoji[t.sport?.toLowerCase()] || '\uD83C\uDFDF\uFE0F'}
                </div>
                <h3 className="font-semibold text-ink text-lg mb-0.5">{t.name}</h3>
                <p className="text-sm text-muted mb-4">{t.sport} \u2022 {t.location}</p>
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-sm font-semibold ${avail > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {avail}/{t.totalSlots} slots
                  </span>
                  <span className="text-lg font-bold text-ink">Rs.{t.pricePerSlot}<span className="text-xs font-normal text-muted ml-0.5">/slot</span></span>
                </div>
                <div className="h-1 bg-elevated rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${avail > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {showPanel && selected && (
          <div className="lg:col-span-1">
            <div className="cardStatic sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-ink tracking-tight">Book Slot</h3>
                <button onClick={() => { setShowPanel(false); setSelected(null); }}
                  className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-muted hover:text-ink hover:bg-divider transition-all">
                  <FiX size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="mb-5 p-4 bg-elevated rounded-apple-md">
                <p className="font-semibold text-ink">{selected.name}</p>
                <p className="text-sm text-muted">{selected.sport} \u2014 Rs.{selected.pricePerSlot}/slot</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="label">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="input-field" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="label">Time Slot</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['6:00-7:00', '7:00-8:00', '8:00-9:00', '9:00-10:00', '10:00-11:00', '16:00-17:00', '17:00-18:00', '18:00-19:00'].map(s => (
                      <button key={s} onClick={() => setTimeSlot(s)}
                        className={`p-3 rounded-apple-sm text-xs text-left transition-all duration-200 ${
                          timeSlot === s
                            ? 'bg-ink text-white'
                            : 'bg-elevated text-ink hover:bg-divider'
                        }`}>
                        <div className="flex items-center gap-1.5">
                          <FiClock size={12} strokeWidth={1.5} />
                          <p className="font-medium">{s}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleBook} disabled={bookingLoading || !timeSlot}
                  className="btn-primary w-full py-3.5 disabled:opacity-30 disabled:cursor-not-allowed">
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
