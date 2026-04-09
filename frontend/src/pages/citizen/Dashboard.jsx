import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Home, Calendar, MapPin, Award, BarChart3, MessageCircle, AlertTriangle, Recycle, User, Truck, Camera, Send, X, Upload, Star, Trophy, Leaf } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import useAuthStore from '../../store/authStore'
import { Sidebar, Topbar, StatCard, Badge, Card, Btn } from '../../components/Layout'
import * as api from '../../utils/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' })

const sidebarLinks = [
  { to: '/citizen', icon: <Home size={18} />, label: 'Dashboard' },
  { to: '/citizen/schedule', icon: <Calendar size={18} />, label: 'Schedule Pickup' },
  { to: '/citizen/pickups', icon: <Truck size={18} />, label: 'My Pickups' },
  { to: '/citizen/classify', icon: <Recycle size={18} />, label: 'Waste Classifier' },
  { to: '/citizen/report', icon: <AlertTriangle size={18} />, label: 'Report Issue' },
  { to: '/citizen/map', icon: <MapPin size={18} />, label: 'Nearby Map' },
  { to: '/citizen/leaderboard', icon: <Trophy size={18} />, label: 'Leaderboard' },
  { to: '/citizen/chatbot', icon: <MessageCircle size={18} />, label: 'EcoAssist AI' },
  { to: '/citizen/profile', icon: <User size={18} />, label: 'Profile' },
]

const layout = { display: 'flex', minHeight: '100vh', background: '#f9fafb' }
const main = { marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }
const content = { flex: 1, padding: '24px', overflowY: 'auto' }

// ============ HOME ============
function CitizenHome({ token, user }) {
  const [pickups, setPickups] = useState([])
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 })

  useEffect(() => {
    api.getPickups(token).then(r => {
      const p = r.data || []
      setPickups(p.slice(0, 3))
      setStats({ total: p.length, completed: p.filter(x => x.status === 'collected').length, pending: p.filter(x => x.status === 'pending').length })
    }).catch(() => {})
  }, [token])

  const level = user?.ecoPoints >= 1000 ? 'Eco Legend' : user?.ecoPoints >= 600 ? 'Eco Warrior' : user?.ecoPoints >= 300 ? 'Eco Champion' : user?.ecoPoints >= 100 ? 'Eco Explorer' : 'Eco Beginner'
  const nextLevel = user?.ecoPoints >= 1000 ? 1000 : user?.ecoPoints >= 600 ? 1000 : user?.ecoPoints >= 300 ? 600 : user?.ecoPoints >= 100 ? 300 : 100
  const pct = Math.min(100, Math.round(((user?.ecoPoints || 0) / nextLevel) * 100))

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #14532d, #16a34a)', borderRadius: 16, padding: '28px 28px', marginBottom: 24, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ opacity: 0.8, fontSize: 14 }}>Welcome back,</p>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{user?.fullName} 👋</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>🏆 {level}</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>⚡ Streak: {user?.loginStreak || 0} days</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 40, fontWeight: 800 }}>{user?.ecoPoints || 0}</div>
            <div style={{ opacity: 0.8, fontSize: 14 }}>Eco Points</div>
            <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 10, height: 8, width: 140 }}>
              <div style={{ background: '#bbf7d0', height: '100%', borderRadius: 10, width: `${pct}%` }} />
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 3 }}>{pct}% to {level === 'Eco Legend' ? 'Max' : 'next level'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={<Calendar size={20} />} label="Total Pickups" value={stats.total} color="#3b82f6" bg="#dbeafe" />
        <StatCard icon={<Truck size={20} />} label="Completed" value={stats.completed} color="#16a34a" bg="#dcfce7" />
        <StatCard icon={<AlertTriangle size={20} />} label="Pending" value={stats.pending} color="#f97316" bg="#fed7aa" />
        <StatCard icon={<Star size={20} />} label="Eco Points" value={user?.ecoPoints || 0} color="#eab308" bg="#fef9c3" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <Link to="/citizen/schedule" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: '#f0fdf4', borderRadius: 12, border: '1.5px dashed #86efac', textDecoration: 'none', transition: 'all 0.2s' }}>
          <Calendar size={28} color="#16a34a" />
          <div><div style={{ fontWeight: 700, color: '#14532d' }}>Schedule Pickup</div><div style={{ fontSize: 12, color: '#6b7280' }}>+5 eco points</div></div>
        </Link>
        <Link to="/citizen/classify" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: '#eff6ff', borderRadius: 12, border: '1.5px dashed #93c5fd', textDecoration: 'none' }}>
          <Recycle size={28} color="#3b82f6" />
          <div><div style={{ fontWeight: 700, color: '#1e40af' }}>Classify Waste</div><div style={{ fontSize: 12, color: '#6b7280' }}>+5 eco points</div></div>
        </Link>
        <Link to="/citizen/report" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: '#fff7ed', borderRadius: 12, border: '1.5px dashed #fdba74', textDecoration: 'none' }}>
          <AlertTriangle size={28} color="#f97316" />
          <div><div style={{ fontWeight: 700, color: '#9a3412' }}>Report Issue</div><div style={{ fontSize: 12, color: '#6b7280' }}>+10 eco points</div></div>
        </Link>
        <Link to="/citizen/chatbot" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: '#fdf4ff', borderRadius: 12, border: '1.5px dashed #d8b4fe', textDecoration: 'none' }}>
          <MessageCircle size={28} color="#a855f7" />
          <div><div style={{ fontWeight: 700, color: '#7c3aed' }}>Ask EcoAssist</div><div style={{ fontSize: 12, color: '#6b7280' }}>AI chatbot</div></div>
        </Link>
      </div>

      <Card>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: 15 }}>Recent Pickups</div>
        {pickups.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>No pickups yet. <Link to="/citizen/schedule" style={{ color: '#16a34a' }}>Schedule one!</Link></div>
        ) : pickups.map(p => (
          <div key={p._id} style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.wasteTypes?.join(', ')}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(p.scheduledDate).toLocaleDateString()} · {p.timeSlot}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{p.address?.substring(0, 45)}...</div>
            </div>
            <Badge status={p.status} />
          </div>
        ))}
      </Card>
    </div>
  )
}

// ============ SCHEDULE PICKUP ============
function SchedulePickup({ token }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ wasteTypes: [], scheduledDate: '', timeSlot: '', address: '', specialInstructions: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const wasteOptions = ['Organic', 'Recyclable', 'E-Waste', 'Hazardous', 'Bulky', 'Paper', 'Metal', 'Plastic']
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 14)

  const toggleWaste = (w) => setForm(p => ({ ...p, wasteTypes: p.wasteTypes.includes(w) ? p.wasteTypes.filter(x => x !== w) : [...p.wasteTypes, w] }))

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.schedulePickup(token, { ...form, wasteTypes: form.wasteTypes.map(w => w.toLowerCase()) })
      setResult(data)
    } catch (e) { setError(e.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  if (result) return (
    <Card style={{ padding: 40, maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#14532d', marginBottom: 8 }}>Pickup Scheduled!</h2>
      <p style={{ color: '#6b7280', marginBottom: 20 }}>+5 Eco Points earned</p>
      <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>QR Code</div>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#14532d', letterSpacing: 1 }}>{result.qrCode}</div>
      </div>
      <Btn onClick={() => { setResult(null); setStep(1); setForm({ wasteTypes: [], scheduledDate: '', timeSlot: '', address: '', specialInstructions: '' }) }}>Schedule Another</Btn>
    </Card>
  )

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#16a34a' : '#e5e7eb', transition: 'background 0.3s' }} />
        ))}
      </div>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: 13 }}>{error}</div>}

      <Card style={{ padding: 28 }}>
        {step === 1 && (
          <>
            <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Select Waste Types</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {wasteOptions.map(w => (
                <button key={w} onClick={() => toggleWaste(w)} style={{ padding: '8px 18px', borderRadius: 20, border: `2px solid ${form.wasteTypes.includes(w) ? '#16a34a' : '#e5e7eb'}`, background: form.wasteTypes.includes(w) ? '#f0fdf4' : '#fff', color: form.wasteTypes.includes(w) ? '#16a34a' : '#374151', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>{w}</button>
              ))}
            </div>
            <Btn onClick={() => form.wasteTypes.length ? setStep(2) : setError('Select at least one waste type')}>Next →</Btn>
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Pick Date & Time</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Scheduled Date</label>
              <input type="date" min={tomorrow.toISOString().split('T')[0]} max={maxDate.toISOString().split('T')[0]} value={form.scheduledDate} onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))} style={{ display: 'block', width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', marginTop: 4, fontSize: 14, fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Time Slot</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {['morning', 'afternoon', 'evening'].map(t => (
                  <button key={t} onClick={() => setForm(p => ({ ...p, timeSlot: t }))} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `2px solid ${form.timeSlot === t ? '#16a34a' : '#e5e7eb'}`, background: form.timeSlot === t ? '#f0fdf4' : '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: form.timeSlot === t ? '#16a34a' : '#374151', textTransform: 'capitalize' }}>{t === 'morning' ? '🌅' : t === 'afternoon' ? '☀️' : '🌙'} {t}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn outline onClick={() => setStep(1)}>← Back</Btn>
              <Btn onClick={() => form.scheduledDate && form.timeSlot ? setStep(3) : setError('Select date and time slot')}>Next →</Btn>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Pickup Address</h3>
            <textarea placeholder="Enter your full pickup address..." value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', minHeight: 90, resize: 'vertical', marginBottom: 14 }} />
            <textarea placeholder="Special instructions (optional)" value={form.specialInstructions} onChange={e => setForm(p => ({ ...p, specialInstructions: e.target.value }))} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', minHeight: 60, resize: 'vertical', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn outline onClick={() => setStep(2)}>← Back</Btn>
              <Btn onClick={() => form.address.length >= 10 ? setStep(4) : setError('Enter a valid address (10+ chars)')}>Next →</Btn>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Confirm Pickup</h3>
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '16px', marginBottom: 20, fontSize: 14 }}>
              <div style={{ marginBottom: 8 }}><strong>Waste Types:</strong> {form.wasteTypes.join(', ')}</div>
              <div style={{ marginBottom: 8 }}><strong>Date:</strong> {form.scheduledDate}</div>
              <div style={{ marginBottom: 8 }}><strong>Time:</strong> {form.timeSlot}</div>
              <div><strong>Address:</strong> {form.address}</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn outline onClick={() => setStep(3)}>← Back</Btn>
              <Btn onClick={submit} disabled={loading}>{loading ? 'Scheduling...' : '✅ Confirm Pickup'}</Btn>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

// ============ MY PICKUPS ============
function MyPickups({ token }) {
  const [pickups, setPickups] = useState([])
  const [tracking, setTracking] = useState(null)
  const [trackData, setTrackData] = useState(null)

  useEffect(() => {
    api.getPickups(token).then(r => setPickups(r.data || [])).catch(() => {})
  }, [token])

  const startTracking = async (pickup) => {
    setTracking(pickup)
    const { data } = await api.trackPickup(token, pickup._id)
    setTrackData(data)
    const interval = setInterval(async () => {
      const { data: d } = await api.trackPickup(token, pickup._id)
      setTrackData(d)
      if (d.status === 'completed') clearInterval(interval)
    }, 15000)
  }

  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>My Pickups</h2>
      {tracking && trackData && (
        <Card style={{ marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}>🚛 Live Tracking</div>
            <button onClick={() => { setTracking(null); setTrackData(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
          </div>
          {trackData.status === 'completed' ? (
            <div style={{ padding: 24, textAlign: 'center' }}>✅ Pickup completed!</div>
          ) : trackData.collector ? (
            <>
              <div style={{ height: 300 }}>
                <MapContainer center={[trackData.collector.lat, trackData.collector.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[trackData.collector.lat, trackData.collector.lng]}><Popup>🚛 {trackData.collector.name}<br/>{trackData.collector.vehicleNumber}</Popup></Marker>
                  {trackData.pickupAddress && <Marker position={[trackData.pickupAddress.lat, trackData.pickupAddress.lng]}><Popup>🏠 Your Location</Popup></Marker>}
                </MapContainer>
              </div>
              <div style={{ padding: '14px 20px', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div><div style={{ fontSize: 12, color: '#9ca3af' }}>Collector</div><div style={{ fontWeight: 700 }}>{trackData.collector.name}</div></div>
                <div><div style={{ fontSize: 12, color: '#9ca3af' }}>ETA</div><div style={{ fontWeight: 700, color: '#16a34a' }}>{trackData.eta} min</div></div>
                <div><div style={{ fontSize: 12, color: '#9ca3af' }}>Phone</div><div style={{ fontWeight: 700 }}>{trackData.collector.phone}</div></div>
              </div>
            </>
          ) : <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Tracking data unavailable</div>}
        </Card>
      )}
      {pickups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>No pickups scheduled. <Link to="/citizen/schedule" style={{ color: '#16a34a' }}>Schedule one!</Link></div>
      ) : pickups.map(p => (
        <Card key={p._id} style={{ marginBottom: 12 }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ fontWeight: 700 }}>{p.wasteTypes?.join(', ')}</div>
                <Badge status={p.status} />
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>📅 {new Date(p.scheduledDate).toLocaleDateString()} · {p.timeSlot}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>📍 {p.address?.substring(0, 50)}</div>
              {p.collectorId && <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>🚛 {p.collectorId.fullName} · {p.collectorId.vehicleNumber}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['confirmed', 'en-route'].includes(p.status) && (
                <Btn small onClick={() => startTracking(p)} color="#3b82f6">Track Live</Btn>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ============ WASTE CLASSIFIER ============
function WasteClassifier({ token }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)

  const handleFile = (f) => {
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { alert('Max 5MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }

const classify = async () => {
  if (!file) return;

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:5000/api/predict", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(errText);
      throw new Error("Server error");
    }

    const data = await res.json();

    setResult({
      category: data.prediction.toLowerCase(),
      confidence: (data.confidence * 100).toFixed(2),
      allPredictions: data.all_predictions,
      disposalInstructions: getDisposalInstructions(data.prediction),
      pointsEarned: 5
    });

  } catch (err) {
    console.error(err);
    alert("Prediction failed");
  } finally {
    setLoading(false);
  }
};
const getDisposalInstructions = (type) => {
  const map = {
    "Organic": "Compost or dispose in green bin.",
    "Recyclable": "Clean and place in recycling bin.",
    "Hazardous": "Dispose at hazardous waste facility.",
    "Non-Recyclable": "Dispose in general waste bin."
  };

  return map[type] || "Dispose properly.";
};

  const catColors = { organic: '#16a34a', recyclable: '#3b82f6', 'e-waste': '#f97316', hazardous: '#ef4444', bulky: '#a855f7' }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 800, marginBottom: 6 }}>AI Waste Classifier</h2>
      <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>Upload a photo to classify waste and earn +5 Eco Points</p>

      <div onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)}
        style={{ border: `2px dashed ${dragging ? '#16a34a' : '#e5e7eb'}`, borderRadius: 12, padding: '32px', textAlign: 'center', background: dragging ? '#f0fdf4' : '#f9fafb', cursor: 'pointer', marginBottom: 20, transition: 'all 0.2s' }}
        onClick={() => document.getElementById('waste-upload').click()}>
        <input id="waste-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        {preview ? (
          <img src={preview} alt="preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
        ) : (
          <>
            <Upload size={40} color="#9ca3af" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600, color: '#374151' }}>Drop image here or click to upload</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>JPEG, PNG, WEBP · Max 5MB</div>
          </>
        )}
      </div>

      {file && !result && <Btn onClick={classify} disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 15 }}>{loading ? '🔍 Classifying...' : '🔍 Classify Waste (+5 pts)'}</Btn>}

      {result && (
  <Card style={{ padding: 24 }}>
    <div style={{ textAlign: 'center', marginBottom: 16 }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>
        {result.category === 'organic' ? '🌿' :
         result.category === 'recyclable' ? '♻️' :
         result.category === 'e-waste' ? '💻' :
         result.category === 'hazardous' ? '⚠️' : '📦'}
      </div>

      <div style={{
        fontSize: 24,
        fontWeight: 800,
        color: catColors[result.category] || '#374151',
        textTransform: 'capitalize'
      }}>
        {result.category}
      </div>

      <div style={{ fontSize: 14, color: '#9ca3af' }}>
        Confidence: {result.confidence}%
      </div>
    </div>

    {/* ✅ ADD THIS HERE */}
    {result.allPredictions && (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          All Predictions:
        </div>

        {Object.entries(result.allPredictions).map(([type, value]) => (
          <div key={type} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{type}</span>
              <span>{(value * 100).toFixed(1)}%</span>
            </div>

            <div style={{
              height: 6,
              background: "#e5e7eb",
              borderRadius: 4
            }}>
              <div style={{
                width: `${value * 100}%`,
                height: "100%",
                background: "#16a34a"
              }} />
            </div>
          </div>
        ))}
      </div>
    )}

    {/* existing instructions */}
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
        Disposal Instructions
      </div>
      <div style={{ fontSize: 14 }}>{result.disposalInstructions}</div>
    </div>

    <div style={{
      background: '#f0fdf4',
      borderRadius: 8,
      padding: '10px 14px',
      fontWeight: 700
    }}>
      ✅ +{result.pointsEarned} Eco Points Earned!
    </div>
  </Card>
)}

    </div>
  )
}

// ============ REPORT ISSUE ============
function ReportIssue({ token }) {
  const [form, setForm] = useState({ title: '', description: '', location: '', category: 'general' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [issues, setIssues] = useState([])

  useEffect(() => { api.getIssues(token).then(r => setIssues(r.data || [])).catch(() => {}) }, [token])

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.reportIssue(token, form)
      setSuccess(true)
      const r = await api.getIssues(token); setIssues(r.data || [])
      setForm({ title: '', description: '', location: '', category: 'general' })
      setTimeout(() => setSuccess(false), 3000)
    } finally { setLoading(false) }
  }

  const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', marginTop: 4 }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Report an Issue</h2>
        <p style={{ color: '#6b7280', marginBottom: 20, fontSize: 14 }}>Earn +10 Eco Points for reporting</p>
        {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#16a34a', fontWeight: 600 }}>✅ Issue reported! +10 Eco Points earned</div>}
        <Card style={{ padding: 24 }}>
          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Issue Title</label>
              <input style={inp} placeholder="E.g. Overflowing dustbin at bus stop" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Category</label>
              <select style={inp} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {['general', 'overflow', 'illegal-dumping', 'broken-bin', 'missed-pickup', 'other'].map(c => <option key={c} value={c}>{c.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Location</label>
              <input style={inp} placeholder="E.g. Near Kothrud Bus Depot, Pune" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Description</label>
              <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="Describe the issue in detail..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
            </div>
            <Btn style={{ width: '100%', padding: '12px' }} disabled={loading}>{loading ? 'Submitting...' : 'Report Issue (+10 pts)'}</Btn>
          </form>
        </Card>
      </div>
      <div>
        <h2 style={{ fontWeight: 800, marginBottom: 20 }}>My Reports</h2>
        {issues.length === 0 ? <div style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No reports yet</div> :
          issues.map(i => (
            <Card key={i._id} style={{ marginBottom: 12, padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{i.title}</div>
                <Badge status={i.status} />
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>📍 {i.location}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{new Date(i.createdAt).toLocaleDateString()}</div>
            </Card>
          ))}
      </div>
    </div>
  )
}

// ============ NEARBY MAP ============
function NearbyMap({ token }) {
  const [industries, setIndustries] = useState([])
  const [grounds, setGrounds] = useState([])
  const [layer, setLayer] = useState('industries')

  useEffect(() => {
    api.getNearbyIndustries(token).then(r => setIndustries(r.data || [])).catch(() => {})
    api.getDumpingGrounds(token).then(r => setGrounds(r.data || [])).catch(() => {})
  }, [token])

  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Nearby Map</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[['industries', '🏭 Industries'], ['grounds', '🗑️ Dumping Grounds']].map(([v, l]) => (
          <button key={v} onClick={() => setLayer(v)} style={{ padding: '8px 18px', borderRadius: 8, border: `2px solid ${layer === v ? '#16a34a' : '#e5e7eb'}`, background: layer === v ? '#f0fdf4' : '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: layer === v ? '#16a34a' : '#374151' }}>{l}</button>
        ))}
      </div>
      <div style={{ height: 480, borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <MapContainer center={[18.5204, 73.8567]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
          {layer === 'industries' && industries.filter(i => i.lat && i.lng).map(i => (
            <Marker key={i._id} position={[i.lat, i.lng]}>
              <Popup>
                <strong>{i.companyName}</strong><br />
                {i.industryType}<br />
                📍 {i.address}<br />
                ♻️ Accepts: {i.acceptsWasteTypes?.join(', ')}<br />
                📞 {i.phone}
              </Popup>
            </Marker>
          ))}
          {layer === 'grounds' && grounds.map(g => (
            <Marker key={g._id} position={[g.lat, g.lng]}>
              <Popup>
                <strong>{g.name}</strong><br />
                📍 {g.address}<br />
                🗑️ Capacity: {g.usedCapacityTons}/{g.totalCapacityTons} tons<br />
                ⏰ {g.operatingHours}<br />
                📞 {g.contactPhone}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

// ============ LEADERBOARD ============
function Leaderboard({ token, user }) {
  const [data, setData] = useState({ leaderboard: [], myRank: null, myPoints: 0 })
  const [filter, setFilter] = useState('all')

  useEffect(() => { api.getLeaderboard(token, filter).then(r => setData(r.data)).catch(() => {}) }, [token, filter])

  const medals = ['🥇', '🥈', '🥉']
  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Eco Points Leaderboard</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'month', 'week'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 18px', borderRadius: 8, border: `2px solid ${filter === f ? '#16a34a' : '#e5e7eb'}`, background: filter === f ? '#f0fdf4' : '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', textTransform: 'capitalize', color: filter === f ? '#16a34a' : '#374151' }}>{f === 'all' ? 'All Time' : filter === 'month' ? 'This Month' : 'This Week'}{f}</button>
        ))}
      </div>
      <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 700 }}>Your Rank: #{data.myRank}</div>
        <div style={{ fontWeight: 700, color: '#16a34a' }}>⚡ {data.myPoints} pts</div>
      </div>
      <Card>
        {data.leaderboard.map((u, i) => (
          <div key={u._id} style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 14, background: u._id === user?._id ? '#f0fdf4' : '#fff' }}>
            <div style={{ width: 32, textAlign: 'center', fontWeight: 800, fontSize: i < 3 ? 22 : 15, color: '#374151' }}>{i < 3 ? medals[i] : `#${i + 1}`}</div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#16a34a', flexShrink: 0 }}>{u.fullName?.[0]}</div>
            <div style={{ flex: 1, fontWeight: 600, color: u._id === user?._id ? '#16a34a' : '#111827' }}>{u.fullName}{u._id === user?._id ? ' (You)' : ''}</div>
            <div style={{ fontWeight: 800, color: '#f97316' }}>{u.ecoPoints} pts</div>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ============ AI CHATBOT ============
function Chatbot({ token, user }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: `Hi ${user?.fullName?.split(' ')[0]}! 👋 I'm EcoAssist, your AI waste management guide. Ask me anything about waste disposal, your pickups, or eco tips!` }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef()

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (msg) => {
    const text = msg || input.trim()
    if (!text) return
    setInput('')
    const history = messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.content }))
    setMessages(p => [...p, { role: 'user', content: text }])
    setLoading(true)
    try {
      const { data } = await api.sendChatMessage(token, text, history)
      setMessages(p => [...p, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Sorry, I\'m having trouble connecting. Please try again.' }])
    } finally { setLoading(false) }
  }

  const quickQ = ['How do I earn eco points?', 'What are my upcoming pickups?', 'How to dispose e-waste?', 'Recycling tips?']

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 800, marginBottom: 6 }}>EcoAssist AI</h2>
      <p style={{ color: '#6b7280', marginBottom: 20, fontSize: 14 }}>Powered by Claude AI · Knows your profile & pickups</p>
      <Card style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 14, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'assistant' && <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0 }}><Leaf size={16} color="#16a34a" /></div>}
              <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: m.role === 'user' ? '#16a34a' : '#f3f4f6', color: m.role === 'user' ? '#fff' : '#111827', fontSize: 14, lineHeight: 1.6 }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Leaf size={16} color="#16a34a" /></div>
              <div style={{ padding: '10px 14px', background: '#f3f4f6', borderRadius: '12px 12px 12px 2px', display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#9ca3af', animation: `bounce 0.6s ${i * 0.15}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div style={{ padding: '8px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {quickQ.map(q => <button key={q} onClick={() => send(q)} style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#374151' }}>{q}</button>)}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} placeholder="Ask about waste management..." style={{ flex: 1, padding: '10px 14px', borderRadius: 24, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{ width: 40, height: 40, borderRadius: '50%', background: '#16a34a', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Send size={16} color="#fff" />
          </button>
        </div>
      </Card>
      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }`}</style>
    </div>
  )
}

// ============ PROFILE ============
function CitizenProfile({ token }) {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '', address: user?.address || '' })
  const [saved, setSaved] = useState(false)

  const save = async () => {
    const { data } = await api.updateCitizenProfile(token, form)
    updateUser(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', marginTop: 4 }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>My Profile</h2>
      <Card style={{ padding: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28, color: '#16a34a', margin: '0 auto' }}>{user?.fullName?.[0]}</div>
          <div style={{ marginTop: 8, fontWeight: 700, fontSize: 16 }}>{user?.fullName}</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>{user?.email}</div>
          <div style={{ marginTop: 6, display: 'inline-flex', gap: 8 }}>
            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>⚡ {user?.ecoPoints} pts</span>
          </div>
        </div>
        {saved && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', marginBottom: 14, color: '#16a34a', fontWeight: 600, fontSize: 13 }}>✅ Profile updated!</div>}
        {['fullName', 'phone', 'address'].map(k => (
          <div key={k} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</label>
            <input style={inp} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
          </div>
        ))}
        <Btn style={{ width: '100%', padding: '12px' }} onClick={save}>Save Changes</Btn>
      </Card>
    </div>
  )
}

// ============ MAIN DASHBOARD ============
export default function CitizenDashboard() {
  const { token, user } = useAuthStore()
  return (
    <div style={layout}>
      <Sidebar links={sidebarLinks} role="citizen" />
      <div style={main} className="main-content">
        <Topbar title="Citizen Dashboard" subtitle={`Welcome, ${user?.fullName}`} token={token} />
        <div style={content}>
          <Routes>
            <Route index element={<CitizenHome token={token} user={user} />} />
            <Route path="schedule" element={<SchedulePickup token={token} />} />
            <Route path="pickups" element={<MyPickups token={token} />} />
            <Route path="classify" element={<WasteClassifier token={token} />} />
            <Route path="report" element={<ReportIssue token={token} />} />
            <Route path="map" element={<NearbyMap token={token} />} />
            <Route path="leaderboard" element={<Leaderboard token={token} user={user} />} />
            <Route path="chatbot" element={<Chatbot token={token} user={user} />} />
            <Route path="profile" element={<CitizenProfile token={token} />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
