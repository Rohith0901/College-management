'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FiCoffee, FiGrid, FiBookOpen, FiHome, FiAlertCircle, FiHeart, FiMapPin, FiCheck } from 'react-icons/fi';

function DonutChart({ value, total, color, size = 64 }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f5f0e8" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct)} className="transition-all duration-700" />
    </svg>
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({ cafeterias: [], parking: [], exams: [], rooms: [], complaints: [], doctors: [], turfs: [] });
  const [newItem, setNewItem] = useState({});

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
    fetchAllData();
  }, [user, loading, router]);

  const fetchAllData = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    const [caf, park, exam, room, comp, doc, turf] = await Promise.all([
      fetch('/api/cafeteria').then(r => r.json()),
      fetch('/api/parking').then(r => r.json()),
      fetch('/api/exams').then(r => r.json()),
      fetch('/api/rooms').then(r => r.json()),
      fetch('/api/complaints', { headers }).then(r => r.json()),
      fetch('/api/doctors').then(r => r.json()),
      fetch('/api/turf').then(r => r.json()),
    ]);
    setData({ cafeterias: caf.cafeterias || [], parking: park.parking || [], exams: exam.exams || [], rooms: room.rooms || [], complaints: comp.complaints || [], doctors: doc.doctors || [], turfs: turf.turfs || [] });
  };

  const addCafeteria = async () => {
    if (!newItem.name) return toast.error('Name required');
    const res = await fetch('/api/cafeteria', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newItem.name, location: newItem.location, totalSlots: parseInt(newItem.totalSlots) || 20, menu: [] }) });
    if (res.ok) { toast.success('Cafeteria added!'); fetchAllData(); setNewItem({}); }
  };

  const addParking = async () => {
    if (!newItem.location) return toast.error('Location required');
    const res = await fetch('/api/parking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: newItem.type || 'bike', location: newItem.location, totalSpots: parseInt(newItem.totalSpots) || 50, availableSpots: parseInt(newItem.totalSpots) || 50, pricePerHour: parseInt(newItem.pricePerHour) || 0 }) });
    if (res.ok) { toast.success('Parking added!'); fetchAllData(); setNewItem({}); }
  };

  const addExam = async () => {
    if (!newItem.subject) return toast.error('Subject required');
    const res = await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject: newItem.subject, code: newItem.code, date: newItem.date, time: newItem.time, room: newItem.room, department: newItem.department, year: parseInt(newItem.year) || 1, semester: parseInt(newItem.semester) || 1, type: newItem.examType || 'final', duration: newItem.duration || '2 hours' }) });
    if (res.ok) { toast.success('Exam added!'); fetchAllData(); setNewItem({}); }
  };

  const addDoctor = async () => {
    if (!newItem.docName) return toast.error('Doctor name required');
    const res = await fetch('/api/doctors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newItem.docName, specialization: newItem.specialization, available: true, room: newItem.room, contact: newItem.contact, schedule: [{ day: 'Monday', startTime: '9:00', endTime: '12:00' }, { day: 'Wednesday', startTime: '9:00', endTime: '12:00' }, { day: 'Friday', startTime: '9:00', endTime: '12:00' }] }) });
    if (res.ok) { toast.success('Doctor added!'); fetchAllData(); setNewItem({}); }
  };

  const addRoom = async () => {
    if (!newItem.roomName) return toast.error('Room name required');
    const res = await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newItem.roomName, building: newItem.building, capacity: parseInt(newItem.capacity) || 60, type: newItem.roomType || 'classroom', department: newItem.department }) });
    if (res.ok) { toast.success('Room added!'); fetchAllData(); setNewItem({}); }
  };

  const addTurf = async () => {
    if (!newItem.turfName) return toast.error('Turf name required');
    const res = await fetch('/api/turf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newItem.turfName, sport: newItem.sport, location: newItem.turfLocation, totalSlots: parseInt(newItem.totalSlots) || 8, pricePerSlot: parseInt(newItem.pricePerSlot) || 0, slots: [] }) });
    if (res.ok) { toast.success('Turf added!'); fetchAllData(); setNewItem({}); }
  };

  const updateComplaintStatus = async (id, status, response) => {
    await fetch('/api/complaints', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ id, status, adminResponse: response }) });
    toast.success('Status updated');
    fetchAllData();
  };

  if (loading || !user || user.role !== 'admin') return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-teal-800 border-t-transparent rounded-full" /></div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiHome },
    { id: 'cafeteria', label: 'Cafeteria', icon: FiCoffee },
    { id: 'parking', label: 'Parking', icon: FiGrid },
    { id: 'exams', label: 'Exams', icon: FiBookOpen },
    { id: 'rooms', label: 'Rooms', icon: FiHome },
    { id: 'complaints', label: 'Complaints', icon: FiAlertCircle },
    { id: 'doctors', label: 'Doctors', icon: FiHeart },
    { id: 'turf', label: 'Turf', icon: FiMapPin },
  ];

  const overviewStats = [
    { label: 'Cafeterias', value: data.cafeterias.length, total: 20, color: '#f97316' },
    { label: 'Parking', value: data.parking.length, total: 10, color: '#0ea5e9' },
    { label: 'Exams', value: data.exams.length, total: 20, color: '#ef4444' },
    { label: 'Rooms', value: data.rooms.length, total: 20, color: '#10b981' },
    { label: 'Complaints', value: data.complaints.length, total: 20, color: '#f59e0b' },
    { label: 'Doctors', value: data.doctors.length, total: 10, color: '#ec4899' },
    { label: 'Turfs', value: data.turfs.length, total: 10, color: '#8b5cf6' },
  ];

  return (
    <div>
      <Toaster position="top-center" />
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === id ? 'bg-teal-800 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-cream-100 border border-cream-200'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">System Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {overviewStats.map(s => (
              <div key={s.label} className="card text-center">
                <div className="flex justify-center mb-2">
                  <DonutChart value={s.value} total={s.total} color={s.color} />
                </div>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'cafeteria' && (
        <div className="cardStatic border border-cream-200">
          <h3 className="font-bold text-gray-900 mb-4">Add Cafeteria</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <input placeholder="Name" className="input-field" value={newItem.name || ''} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
            <input placeholder="Location" className="input-field" value={newItem.location || ''} onChange={e => setNewItem({ ...newItem, location: e.target.value })} />
            <input placeholder="Total Seats" type="number" className="input-field" value={newItem.totalSlots || ''} onChange={e => setNewItem({ ...newItem, totalSlots: e.target.value })} />
            <button onClick={addCafeteria} className="btn-primary">Add</button>
          </div>
          <div className="space-y-2">
            {data.cafeterias.map(c => (
              <div key={c._id} className="flex justify-between items-center p-3 bg-cream-50 rounded-xl">
                <span className="font-medium text-sm text-gray-900">{c.name} — {c.location}</span>
                <span className="text-xs text-gray-500">{c.totalSlots} seats</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'parking' && (
        <div className="cardStatic border border-cream-200">
          <h3 className="font-bold text-gray-900 mb-4">Add Parking Area</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <select className="select-field" value={newItem.type || 'bike'} onChange={e => setNewItem({ ...newItem, type: e.target.value })}>
              <option value="bike">Bike</option>
              <option value="car">Car</option>
            </select>
            <input placeholder="Location" className="input-field" value={newItem.location || ''} onChange={e => setNewItem({ ...newItem, location: e.target.value })} />
            <input placeholder="Total Spots" type="number" className="input-field" value={newItem.totalSpots || ''} onChange={e => setNewItem({ ...newItem, totalSpots: e.target.value })} />
            <input placeholder="Price/Hour" type="number" className="input-field" value={newItem.pricePerHour || ''} onChange={e => setNewItem({ ...newItem, pricePerHour: e.target.value })} />
            <button onClick={addParking} className="btn-primary">Add</button>
          </div>
          <div className="space-y-2">
            {data.parking.map(p => (
              <div key={p._id} className="flex justify-between items-center p-3 bg-cream-50 rounded-xl">
                <span className="font-medium text-sm text-gray-900 capitalize">{p.type} — {p.location}</span>
                <span className="text-xs text-gray-500">{p.availableSpots}/{p.totalSpots} spots</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'exams' && (
        <div className="cardStatic border border-cream-200">
          <h3 className="font-bold text-gray-900 mb-4">Add Exam</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <input placeholder="Subject" className="input-field" value={newItem.subject || ''} onChange={e => setNewItem({ ...newItem, subject: e.target.value })} />
            <input placeholder="Code" className="input-field" value={newItem.code || ''} onChange={e => setNewItem({ ...newItem, code: e.target.value })} />
            <input type="date" className="input-field" value={newItem.date || ''} onChange={e => setNewItem({ ...newItem, date: e.target.value })} />
            <input placeholder="Time" className="input-field" value={newItem.time || ''} onChange={e => setNewItem({ ...newItem, time: e.target.value })} />
            <input placeholder="Room" className="input-field" value={newItem.room || ''} onChange={e => setNewItem({ ...newItem, room: e.target.value })} />
            <input placeholder="Department" className="input-field" value={newItem.department || ''} onChange={e => setNewItem({ ...newItem, department: e.target.value })} />
            <select className="select-field" value={newItem.year || ''} onChange={e => setNewItem({ ...newItem, year: e.target.value })}>
              <option value="">Year</option>
              {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
            <select className="select-field" value={newItem.semester || ''} onChange={e => setNewItem({ ...newItem, semester: e.target.value })}>
              <option value="">Semester</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
            <select className="select-field" value={newItem.examType || 'final'} onChange={e => setNewItem({ ...newItem, examType: e.target.value })}>
              <option value="midterm">Midterm</option>
              <option value="final">Final</option>
              <option value="internal">Internal</option>
              <option value="practical">Practical</option>
            </select>
            <button onClick={addExam} className="btn-primary">Add</button>
          </div>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="cardStatic border border-cream-200">
          <h3 className="font-bold text-gray-900 mb-4">Add Room</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <input placeholder="Room Name" className="input-field" value={newItem.roomName || ''} onChange={e => setNewItem({ ...newItem, roomName: e.target.value })} />
            <input placeholder="Building" className="input-field" value={newItem.building || ''} onChange={e => setNewItem({ ...newItem, building: e.target.value })} />
            <input placeholder="Capacity" type="number" className="input-field" value={newItem.capacity || ''} onChange={e => setNewItem({ ...newItem, capacity: e.target.value })} />
            <select className="select-field" value={newItem.roomType || 'classroom'} onChange={e => setNewItem({ ...newItem, roomType: e.target.value })}>
              <option value="classroom">Classroom</option>
              <option value="lab">Lab</option>
              <option value="seminar">Seminar Hall</option>
              <option value="auditorium">Auditorium</option>
            </select>
            <button onClick={addRoom} className="btn-primary">Add</button>
          </div>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="space-y-3">
          {data.complaints.length === 0 ? <div className="card text-center py-16 text-gray-500">No complaints yet</div> : data.complaints.map(c => (
            <div key={c._id} className="cardStatic border border-cream-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={`badge ${c.status === 'pending' ? 'badge-yellow' : c.status === 'resolved' ? 'badge-green' : c.status === 'in-progress' ? 'badge-blue' : 'badge-red'}`}>{c.status}</span>
                  <span className="badge-gray">{c.type}</span>
                  <span className={`badge ${c.priority === 'urgent' ? 'badge-red' : c.priority === 'high' ? 'badge-coral' : 'badge-gray'}`}>{c.priority}</span>
                </div>
                <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{c.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{c.description}</p>
              <p className="text-xs text-gray-400 mb-3">By: {c.isAnonymous ? 'Anonymous' : c.userId?.name || 'Unknown'}</p>
              <div className="flex gap-2">
                <button onClick={() => updateComplaintStatus(c._id, 'in-progress', 'Being reviewed')} className="text-xs bg-sky-100 text-sky-700 px-3 py-1.5 rounded-lg hover:bg-sky-200 font-medium flex items-center gap-1">
                  <FiCheck size={12} /> In Progress
                </button>
                <button onClick={() => updateComplaintStatus(c._id, 'resolved', 'Issue resolved')} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200 font-medium flex items-center gap-1">
                  <FiCheck size={12} /> Resolve
                </button>
                <button onClick={() => updateComplaintStatus(c._id, 'rejected', 'Not valid')} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 font-medium">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="cardStatic border border-cream-200">
          <h3 className="font-bold text-gray-900 mb-4">Add Doctor</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <input placeholder="Doctor Name" className="input-field" value={newItem.docName || ''} onChange={e => setNewItem({ ...newItem, docName: e.target.value })} />
            <input placeholder="Specialization" className="input-field" value={newItem.specialization || ''} onChange={e => setNewItem({ ...newItem, specialization: e.target.value })} />
            <input placeholder="Room" className="input-field" value={newItem.room || ''} onChange={e => setNewItem({ ...newItem, room: e.target.value })} />
            <input placeholder="Contact" className="input-field" value={newItem.contact || ''} onChange={e => setNewItem({ ...newItem, contact: e.target.value })} />
            <button onClick={addDoctor} className="btn-primary">Add</button>
          </div>
          <div className="space-y-2">
            {data.doctors.map(d => (
              <div key={d._id} className="flex justify-between items-center p-3 bg-cream-50 rounded-xl">
                <span className="font-medium text-sm text-gray-900">Dr. {d.name} — {d.specialization}</span>
                <span className={`badge ${d.available ? 'badge-green' : 'badge-red'}`}>{d.available ? 'Available' : 'Unavailable'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'turf' && (
        <div className="cardStatic border border-cream-200">
          <h3 className="font-bold text-gray-900 mb-4">Add Turf</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <input placeholder="Turf Name" className="input-field" value={newItem.turfName || ''} onChange={e => setNewItem({ ...newItem, turfName: e.target.value })} />
            <input placeholder="Sport" className="input-field" value={newItem.sport || ''} onChange={e => setNewItem({ ...newItem, sport: e.target.value })} />
            <input placeholder="Location" className="input-field" value={newItem.turfLocation || ''} onChange={e => setNewItem({ ...newItem, turfLocation: e.target.value })} />
            <input placeholder="Total Slots" type="number" className="input-field" value={newItem.totalSlots || ''} onChange={e => setNewItem({ ...newItem, totalSlots: e.target.value })} />
            <button onClick={addTurf} className="btn-primary">Add</button>
          </div>
        </div>
      )}
    </div>
  );
}
