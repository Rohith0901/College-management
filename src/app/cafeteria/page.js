'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { FiCoffee, FiClock, FiCheck, FiX, FiShoppingBag } from 'react-icons/fi';

export default function CafeteriaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [cafeterias, setCafeterias] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('');
  const [seats, setSeats] = useState(1);
  const [orderItems, setOrderItems] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [showBookingPanel, setShowBookingPanel] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    fetch('/api/cafeteria').then(r => r.json()).then(d => setCafeterias(d.cafeterias || []));
    fetchMyBookings();
  }, [user, loading, router]);

  const fetchMyBookings = () => {
    fetch('/api/cafeteria/book', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json()).then(d => setMyBookings(d.bookings || []));
  };

  useEffect(() => {
    if (selected && date) {
      fetch(`/api/cafeteria/availability?cafeteriaId=${selected._id}&date=${date}`)
        .then(r => r.json()).then(d => setAvailability(d.availability || []));
    }
  }, [selected, date]);

  const handleSelectCafeteria = (c) => {
    setSelected(c);
    setShowBookingPanel(true);
    setTimeSlot('');
    setOrderItems([]);
    setSeats(1);
  };

  const handleBook = async () => {
    if (!selected || !timeSlot) { toast.error('Select a time slot'); return; }
    setBookingLoading(true);
    const res = await fetch('/api/cafeteria/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ cafeteriaId: selected._id, cafeteriaName: selected.name, date, timeSlot, seats, orderItems }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Booking confirmed!');
      setShowBookingPanel(false);
      setSelected(null);
      fetchMyBookings();
    } else toast.error(data.error || 'Booking failed');
    setBookingLoading(false);
  };

  const toggleOrderItem = (item) => {
    setOrderItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const getSlotInfo = (slot) => {
    const info = availability.find(a => a.timeSlot === slot);
    return info || { booked: 0, available: 20 };
  };

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-apple-in">
      <Toaster position="top-center" />
      <div className="mb-8">
        <p className="text-muted text-lg">Book your table and order food in advance</p>
      </div>

      {myBookings.filter(b => b.status === 'confirmed').length > 0 && (
        <div className="cardStatic mb-6 border border-emerald-200/60 bg-emerald-50/30">
          <div className="flex items-center gap-2 mb-4">
            <FiCheck className="text-emerald-600" size={16} strokeWidth={2} />
            <h3 className="text-sm font-semibold text-emerald-800">Active Bookings</h3>
          </div>
          <div className="space-y-2.5">
            {myBookings.filter(b => b.status === 'confirmed').slice(0, 3).map(b => (
              <div key={b._id} className="flex items-center justify-between bg-white rounded-apple-sm px-4 py-3 border border-divider">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                    <FiCoffee className="text-orange-500" size={14} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{b.resourceName}</p>
                    <p className="text-xs text-muted">{new Date(b.date).toLocaleDateString()} \u2022 {b.timeSlot}</p>
                  </div>
                </div>
                <span className="badge-green">Confirmed</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-medium text-muted mb-5 tracking-wide">Available Cafeterias</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cafeterias.length === 0 ? (
            <div className="card-flat text-center py-20 text-muted">No cafeterias available yet.</div>
          ) : cafeterias.map(c => {
            const totalMenuItems = c.menu?.filter(m => m.available).length || 0;
            return (
              <div key={c._id} onClick={() => handleSelectCafeteria(c)}
                className={`card cursor-pointer ${selected?._id === c._id ? 'ring-2 ring-accent shadow-apple-hover' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-ink text-lg">{c.name}</h3>
                    <p className="text-sm text-muted">{c.location}</p>
                  </div>
                  <span className="badge-accent">{c.totalSlots} seats</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted mb-4">
                  <span className="flex items-center gap-1"><FiClock size={12} strokeWidth={1.5} /> {c.operatingHours}</span>
                  {totalMenuItems > 0 && <span className="flex items-center gap-1"><FiShoppingBag size={12} strokeWidth={1.5} /> {totalMenuItems} items</span>}
                </div>
                {c.menu?.length > 0 && (
                  <div className="pt-4 border-t border-divider">
                    <p className="text-xs font-medium text-muted mb-2.5">Popular Items</p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.menu.filter(m => m.available).slice(0, 6).map((m, i) => (
                        <span key={i} className="text-xs bg-elevated text-ink px-3 py-1.5 rounded-full font-medium">
                          {m.item} <span className="text-accent ml-0.5">Rs.{m.price}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showBookingPanel && selected && (
          <div className="lg:col-span-1">
            <div className="cardStatic sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-ink tracking-tight">Book Table</h3>
                <button onClick={() => { setShowBookingPanel(false); setSelected(null); }}
                  className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-muted hover:text-ink hover:bg-divider transition-all">
                  <FiX size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="mb-5 p-4 bg-elevated rounded-apple-md">
                <p className="font-semibold text-ink">{selected.name}</p>
                <p className="text-sm text-muted">{selected.location}</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="label">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                    className="input-field" min={new Date().toISOString().split('T')[0]} />
                </div>

                <div>
                  <label className="label">Time Slot</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '1:00-2:00', '2:00-3:00', '3:00-4:00', '4:00-5:00', '5:00-6:00'].map(slot => {
                      const info = getSlotInfo(slot);
                      const full = info.available <= 0;
                      const low = info.available > 0 && info.available <= 5;
                      return (
                        <button key={slot} disabled={full}
                          onClick={() => setTimeSlot(slot)}
                          className={`p-3 rounded-apple-sm text-left transition-all duration-200 text-xs ${
                            timeSlot === slot ? 'bg-ink text-white' :
                            full ? 'bg-elevated text-muted opacity-40 cursor-not-allowed' :
                            'bg-elevated text-ink hover:bg-divider'
                          }`}>
                          <p className="font-medium">{slot}</p>
                          <p className={`mt-0.5 ${full ? 'text-red-400' : low ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {full ? 'Full' : `${info.available} left`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="label">Seats</label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSeats(Math.max(1, seats - 1))}
                      className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center font-medium text-ink hover:bg-divider transition-all text-lg">-</button>
                    <span className="text-2xl font-bold text-ink w-8 text-center">{seats}</span>
                    <button onClick={() => setSeats(Math.min(10, seats + 1))}
                      className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center font-medium text-ink hover:bg-divider transition-all text-lg">+</button>
                  </div>
                </div>

                {selected.menu?.filter(m => m.available).length > 0 && (
                  <div>
                    <label className="label">Order Food</label>
                    <div className="space-y-2 max-h-44 overflow-y-auto">
                      {selected.menu.filter(m => m.available).map((m, i) => (
                        <button key={i} onClick={() => toggleOrderItem(m.item)}
                          className={`w-full flex items-center justify-between p-3 rounded-apple-sm text-sm transition-all duration-200 ${
                            orderItems.includes(m.item) ? 'bg-ink text-white' : 'bg-elevated text-ink hover:bg-divider'
                          }`}>
                          <span className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                              orderItems.includes(m.item) ? 'border-white bg-white' : 'border-muted/30'
                            }`}>
                              {orderItems.includes(m.item) && <FiCheck size={10} className="text-ink" strokeWidth={3} />}
                            </div>
                            <span className="font-medium">{m.item}</span>
                          </span>
                          <span className={`font-medium ${orderItems.includes(m.item) ? 'text-white/70' : 'text-accent'}`}>Rs.{m.price}</span>
                        </button>
                      ))}
                    </div>
                    {orderItems.length > 0 && (
                      <p className="text-xs text-muted mt-2">{orderItems.length} item(s) selected</p>
                    )}
                  </div>
                )}

                <button onClick={handleBook} disabled={bookingLoading || !timeSlot}
                  className="btn-primary w-full py-3.5 disabled:opacity-30 disabled:cursor-not-allowed">
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
