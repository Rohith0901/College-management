'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { FiCoffee, FiClock, FiUsers, FiCheck, FiX, FiShoppingBag } from 'react-icons/fi';

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
      <div className="animate-spin w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div>
      <Toaster position="top-center" />
      <div className="mb-6">
        <p className="text-gray-500 text-sm">Book your table and order food in advance</p>
      </div>

      {myBookings.filter(b => b.status === 'confirmed').length > 0 && (
        <div className="cardStatic mb-6 border border-emerald-200 bg-emerald-50/50">
          <div className="flex items-center gap-2 mb-3">
            <FiCheck className="text-emerald-600" size={16} />
            <h3 className="text-sm font-bold text-emerald-800">Active Bookings</h3>
          </div>
          <div className="space-y-2">
            {myBookings.filter(b => b.status === 'confirmed').slice(0, 3).map(b => (
              <div key={b._id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-cream-200">
                <div className="flex items-center gap-3">
                  <FiCoffee className="text-coral-500" size={16} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.resourceName}</p>
                    <p className="text-xs text-gray-500">{new Date(b.date).toLocaleDateString()} • {b.timeSlot}</p>
                  </div>
                </div>
                <span className="badge-green">Confirmed</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <FiCoffee className="text-coral-500" size={18} />
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Available Cafeterias</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cafeterias.length === 0 ? (
            <div className="card text-center py-16 text-gray-500">No cafeterias available yet.</div>
          ) : cafeterias.map(c => {
            const totalMenuItems = c.menu?.filter(m => m.available).length || 0;
            return (
              <div key={c._id} onClick={() => handleSelectCafeteria(c)}
                className={`card cursor-pointer transition-all ${selected?._id === c._id ? 'ring-2 ring-teal-500 shadow-cardHover' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{c.name}</h3>
                    <p className="text-sm text-gray-500">{c.location}</p>
                  </div>
                  <span className="badge-teal">{c.totalSlots} seats</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><FiClock size={12} /> {c.operatingHours}</span>
                  {totalMenuItems > 0 && <span className="flex items-center gap-1"><FiShoppingBag size={12} /> {totalMenuItems} items</span>}
                </div>
                {c.menu?.length > 0 && (
                  <div className="pt-3 border-t border-cream-200">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Popular Items</p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.menu.filter(m => m.available).slice(0, 6).map((m, i) => (
                        <span key={i} className="text-xs bg-cream-100 text-gray-600 px-2.5 py-1 rounded-lg">
                          {m.item} <span className="text-coral-600 font-medium">Rs.{m.price}</span>
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
            <div className="cardStatic sticky top-24 border border-cream-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900">Book Table</h3>
                <button onClick={() => { setShowBookingPanel(false); setSelected(null); }} className="text-gray-400 hover:text-gray-600">
                  <FiX size={18} />
                </button>
              </div>
              <div className="mb-4 p-3 bg-cream-50 rounded-xl">
                <p className="font-semibold text-sm text-gray-900">{selected.name}</p>
                <p className="text-xs text-gray-500">{selected.location}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" min={new Date().toISOString().split('T')[0]} />
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
                          className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                            timeSlot === slot ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' :
                            full ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' :
                            'border-cream-200 hover:border-teal-300 bg-white'
                          }`}>
                          <p className="font-medium text-gray-900">{slot}</p>
                          <p className={`mt-0.5 ${full ? 'text-red-500' : low ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {full ? 'Full' : `${info.available} left`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="label">Seats</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSeats(Math.max(1, seats - 1))} className="w-9 h-9 rounded-lg bg-cream-100 flex items-center justify-center font-bold text-gray-600 hover:bg-cream-200">-</button>
                    <span className="text-lg font-bold text-gray-900 w-8 text-center">{seats}</span>
                    <button onClick={() => setSeats(Math.min(10, seats + 1))} className="w-9 h-9 rounded-lg bg-cream-100 flex items-center justify-center font-bold text-gray-600 hover:bg-cream-200">+</button>
                  </div>
                </div>

                {selected.menu?.filter(m => m.available).length > 0 && (
                  <div>
                    <label className="label">Order Food</label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selected.menu.filter(m => m.available).map((m, i) => (
                        <button key={i} onClick={() => toggleOrderItem(m.item)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-sm transition-all ${
                            orderItems.includes(m.item) ? 'border-teal-500 bg-teal-50' : 'border-cream-200 hover:border-gray-300'
                          }`}>
                          <span className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${orderItems.includes(m.item) ? 'border-teal-500 bg-teal-500' : 'border-gray-300'}`}>
                              {orderItems.includes(m.item) && <FiCheck size={10} className="text-white" />}
                            </div>
                            <span className="text-gray-700">{m.item}</span>
                          </span>
                          <span className="text-coral-600 font-medium">Rs.{m.price}</span>
                        </button>
                      ))}
                    </div>
                    {orderItems.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">{orderItems.length} item(s) selected</p>
                    )}
                  </div>
                )}

                <button onClick={handleBook} disabled={bookingLoading || !timeSlot}
                  className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed">
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
