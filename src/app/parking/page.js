'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { FiGrid, FiMapPin, FiClock, FiTruck, FiCheck, FiX } from 'react-icons/fi';

export default function ParkingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [parking, setParking] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    fetchParking();
    fetchMyBookings();
  }, [user, loading, router]);

  const fetchParking = () => {
    fetch('/api/parking').then(r => r.json()).then(d => setParking(d.parking || []));
  };

  const fetchMyBookings = () => {
    fetch('/api/cafeteria/book', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json()).then(d => {
        const parkingBookings = (d.bookings || []).filter(b => b.type === 'parking' && b.status === 'confirmed');
        setMyBookings(parkingBookings);
      });
  };

  const handleReserve = async () => {
    if (!selected || !timeSlot || !vehicleNumber) { toast.error('Fill all fields'); return; }
    const existingSlot = myBookings.find(b =>
      b.resourceId === selected._id && b.date?.split('T')[0] === date && b.timeSlot === timeSlot
    );
    if (existingSlot) { toast.error('You already have a booking for this slot'); return; }

    setBookingLoading(true);
    const res = await fetch('/api/parking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ parkingId: selected._id, vehicleNumber, date, timeSlot }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Parking spot reserved!');
      fetchParking();
      fetchMyBookings();
      setShowPanel(false);
      setSelected(null);
    } else toast.error(data.error || 'Failed to reserve');
    setBookingLoading(false);
  };

  const handleRelease = async (bookingId) => {
    const res = await fetch('/api/parking', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ bookingId }),
    });
    if (res.ok) {
      toast.success('Spot released');
      fetchParking();
      fetchMyBookings();
    } else {
      const d = await res.json();
      toast.error(d.error || 'Failed to release');
    }
  };

  const handleSelectParking = (p) => {
    setSelected(p);
    setShowPanel(true);
    setTimeSlot('');
    setVehicleNumber('');
  };

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full" />
    </div>
  );

  const slots = ['8:00-12:00', '12:00-16:00', '16:00-20:00', 'Full Day'];

  return (
    <div>
      <Toaster position="top-center" />
      <div className="mb-6">
        <p className="text-gray-500 text-sm">Reserve your bike or car parking spot</p>
      </div>

      {myBookings.length > 0 && (
        <div className="cardStatic mb-6 border border-emerald-200 bg-emerald-50/50">
          <div className="flex items-center gap-2 mb-3">
            <FiCheck className="text-emerald-600" size={16} />
            <h3 className="text-sm font-bold text-emerald-800">Active Reservations</h3>
          </div>
          <div className="space-y-2">
            {myBookings.map(b => (
              <div key={b._id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-cream-200">
                <div className="flex items-center gap-3">
                  <FiTruck className="text-sky-500" size={16} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{b.resourceName}</p>
                    <p className="text-xs text-gray-500">{new Date(b.date).toLocaleDateString()} • {b.timeSlot}</p>
                    <p className="text-xs text-gray-400">Vehicle: {b.details?.vehicleNumber}</p>
                  </div>
                </div>
                <button onClick={() => handleRelease(b._id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium flex items-center gap-1">
                  <FiX size={12} /> Release
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <FiGrid className="text-sky-500" size={18} />
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Parking Zones</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {parking.length === 0 ? (
            <div className="card text-center py-16 text-gray-500 col-span-2">No parking areas configured.</div>
          ) : parking.map(p => {
            const pct = p.totalSpots > 0 ? (p.availableSpots / p.totalSpots) * 100 : 0;
            const color = p.type === 'bike' ? 'sky' : 'purple';
            return (
              <div key={p._id} onClick={() => handleSelectParking(p)}
                className={`card cursor-pointer transition-all ${selected?._id === p._id ? `ring-2 ring-${color}-500 shadow-cardHover` : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.type === 'bike' ? 'bg-sky-100' : 'bg-purple-100'}`}>
                      <FiTruck className={p.type === 'bike' ? 'text-sky-600' : 'text-purple-600'} size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{p.location}</p>
                      <p className="text-xs text-gray-500 capitalize">{p.type} Parking</p>
                    </div>
                  </div>
                  {selected?._id === p._id && <span className="badge-teal">Selected</span>}
                </div>

                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Available Spots</p>
                    <p className={`text-2xl font-bold ${p.availableSpots > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {p.availableSpots}<span className="text-sm font-normal text-gray-400">/{p.totalSpots}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Price</p>
                    <p className="font-bold text-gray-900">Rs.{p.pricePerHour}<span className="text-xs font-normal text-gray-400">/hr</span></p>
                  </div>
                </div>

                <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500'
                  }`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-gray-400">{p.availableSpots} open</span>
                  <span className="text-[10px] text-gray-400">{p.totalSpots - p.availableSpots} taken</span>
                </div>
              </div>
            );
          })}
        </div>

        {showPanel && selected && (
          <div className="lg:col-span-1">
            <div className="cardStatic sticky top-24 border border-cream-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900">Reserve Spot</h3>
                <button onClick={() => { setShowPanel(false); setSelected(null); }} className="text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
              </div>
              <div className="mb-4 p-3 bg-cream-50 rounded-xl">
                <p className="font-semibold text-sm text-gray-900">{selected.location}</p>
                <p className="text-xs text-gray-500 capitalize">{selected.type} — Rs.{selected.pricePerHour}/hr</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Vehicle Number</label>
                  <input type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} className="input-field" placeholder="TN 01 AB 1234" />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="label">Time Slot</label>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map(s => (
                      <button key={s} onClick={() => setTimeSlot(s)}
                        className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                          timeSlot === s ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-cream-200 hover:border-teal-300'
                        }`}>
                        <p className="font-medium text-gray-900">{s}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleReserve} disabled={bookingLoading || !timeSlot || !vehicleNumber}
                  className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed">
                  {bookingLoading ? 'Reserving...' : 'Reserve Spot'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
