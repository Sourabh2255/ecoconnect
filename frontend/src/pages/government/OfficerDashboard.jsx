import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Home, List, Users, Map, AlertTriangle, BarChart3, FileText, Building2, Truck } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import useAuthStore from '../../store/authStore'
import { Sidebar, Topbar, StatCard, Badge, Card, Btn } from '../../components/Layout'
import * as api from '../../utils/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' })

const sidebarLinks = [
  { to: '/officer', icon: <Home size={18} />, label: 'Dashboard' },
  { to: '/officer/requests', icon: <List size={18} />, label: 'Pickup Requests' },
  { to: '/officer/fleet', icon: <Map size={18} />, label: 'Fleet Map' },
  { to: '/officer/complaints', icon: <AlertTriangle size={18} />, label: 'Complaints' },
  { to: '/officer/industry', icon: <Building2 size={18} />, label: 'Industry Requests' },
  { to: '/officer/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
  { to: '/officer/esg', icon: <FileText size={18} />, label: 'ESG Reports' },
]

const layout = { display: 'flex', minHeight: '100vh', background: '#f9fafb' }
const main = { marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }
const content = { flex: 1, padding: '24px', overflowY: 'auto' }

function OfficerHome({ token, user }) {
  const [dash, setDash] = useState({ pendingRequests: 0, freeCollectors: 0, completedToday: 0, openComplaints: 0 })
  useEffect(() => { api.getOfficerDashboard(token).then(r => setDash(r.data)).catch(() => {}) }, [token])
  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: 16, padding: '28px', marginBottom: 24, color: '#fff' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Government Officer Dashboard</h2>
        <p style={{ opacity: 0.8 }}>Zone: {user?.zone} · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon={<List size={20} />} label="Pending Requests" value={dash.pendingRequests} color="#f97316" bg="#fed7aa" />
        <StatCard icon={<Users size={20} />} label="Free Collectors" value={dash.freeCollectors} color="#16a34a" bg="#dcfce7" />
        <StatCard icon={<Truck size={20} />} label="Completed Today" value={dash.completedToday} color="#3b82f6" bg="#dbeafe" />
        <StatCard icon={<AlertTriangle size={20} />} label="Open Complaints" value={dash.openComplaints} color="#ef4444" bg="#fef2f2" />
      </div>
    </div>
  )
}

function RequestsTab({ token }) {
  const [requests, setRequests] = useState([])
  const [collectors, setCollectors] = useState([])
  const [assigning, setAssigning] = useState(null)
  const [selectedCollector, setSelectedCollector] = useState('')

  useEffect(() => {
    api.getOfficerRequests(token).then(r => setRequests(r.data || [])).catch(() => {})
    api.getFreeCollectors(token).then(r => setCollectors(r.data || [])).catch(() => {})
  }, [token])

  const doAssign = async (requestId) => {
    if (!selectedCollector) return
    await api.assignCollector(token, requestId, selectedCollector)
    const r = await api.getOfficerRequests(token); setRequests(r.data || [])
    setAssigning(null); setSelectedCollector('')
  }

  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>Pickup Requests</h2>
      {requests.map(r => (
        <Card key={r._id} style={{ marginBottom: 12 }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontWeight: 700 }}>{r.citizenId?.fullName}</div>
                <Badge status={r.status} />
                {r.status === 'pending' && <span style={{ background: '#fef9c3', color: '#854d0e', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>⏳ NEEDS ASSIGNMENT</span>}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>📅 {new Date(r.scheduledDate).toLocaleDateString()} · {r.timeSlot}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>♻️ {r.wasteTypes?.join(', ')}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>📍 {r.address}</div>
              {r.collectorId && <div style={{ fontSize: 12, color: '#16a34a', marginTop: 3 }}>🚛 Assigned: {r.collectorId.fullName}</div>}
            </div>
            {r.status === 'pending' && (
              <Btn small color="#3b82f6" onClick={() => setAssigning(r._id)}>Assign Collector</Btn>
            )}
          </div>
          {assigning === r._id && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={selectedCollector} onChange={e => setSelectedCollector(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit' }}>
                <option value="">Select collector...</option>
                {collectors.map(c => <option key={c._id} value={c._id}>{c.fullName} — {c.vehicleNumber} ({c.completedToday} done today)</option>)}
              </select>
              <Btn small onClick={() => doAssign(r._id)}>Confirm</Btn>
              <Btn small outline color="#6b7280" onClick={() => setAssigning(null)}>Cancel</Btn>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function FleetMap({ token, user }) {
  const [fleet, setFleet] = useState([])

  useEffect(() => {
    const load = () => api.getFleetData(token, user?.zone).then(r => setFleet(r.data || [])).catch(() => {})
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [token, user])

  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Fleet Map — {user?.zone}</h2>
      <p style={{ color: '#6b7280', marginBottom: 16, fontSize: 13 }}>Live positions · Auto-refreshes every 15 seconds</p>
      <div style={{ height: 500, borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <MapContainer center={[18.5204, 73.8567]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {fleet.map(c => (
            <Marker key={c._id} position={[c.lat, c.lng]}>
              <Popup>
                <strong>🚛 {c.name}</strong><br />
                Vehicle: {c.vehicleNumber}<br />
                Status: {c.isOnDuty ? '🟢 On Duty' : '🔴 Off Duty'}<br />
                📞 {c.phone}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        {fleet.map(c => (
          <div key={c._id} style={{ background: '#fff', border: `1px solid ${c.isOnDuty ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
            <div style={{ fontWeight: 700 }}>{c.name}</div>
            <div style={{ color: '#9ca3af' }}>{c.vehicleNumber}</div>
            <div style={{ color: c.isOnDuty ? '#16a34a' : '#9ca3af', fontWeight: 600 }}>{c.isOnDuty ? '🟢 On Duty' : '🔴 Off'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Complaints({ token }) {
  const [complaints, setComplaints] = useState([])
  const [collectors, setCollectors] = useState([])
  const [resolving, setResolving] = useState(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    api.getComplaints(token).then(r => setComplaints(r.data || [])).catch(() => {})
    api.getFreeCollectors(token).then(r => setCollectors(r.data || [])).catch(() => {})
  }, [token])

  const resolve = async (id) => {
    await api.resolveComplaint(token, id, notes)
    const r = await api.getComplaints(token); setComplaints(r.data || [])
    setResolving(null); setNotes('')
  }

  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>Complaints & Issues</h2>
      {complaints.map(c => (
        <Card key={c._id} style={{ marginBottom: 12 }}>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{c.title}</div>
                  <Badge status={c.status} />
                  {c.isEscalated && <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>🚨 ESCALATED</span>}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>📍 {c.location} · By: {c.reportedBy?.fullName}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{c.description?.substring(0, 100)}...</div>
              </div>
            </div>
            {c.status !== 'resolved' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Btn small color="#f97316" onClick={() => setResolving(c._id)}>Resolve</Btn>
              </div>
            )}
            {resolving === c._id && (
              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input placeholder="Resolution notes..." value={notes} onChange={e => setNotes(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit' }} />
                <Btn small onClick={() => resolve(c._id)}>Confirm</Btn>
                <Btn small outline color="#6b7280" onClick={() => setResolving(null)}>Cancel</Btn>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

function IndustryRequests({ token }) {
  const [requests, setRequests] = useState([])
  const [collectors, setCollectors] = useState([])
  const [assigning, setAssigning] = useState(null)
  const [sel, setSel] = useState('')

  useEffect(() => {
    api.getIndustryRequests(token).then(r => setRequests(r.data || [])).catch(() => {})
    api.getFreeCollectors(token).then(r => setCollectors(r.data || [])).catch(() => {})
  }, [token])

  const doAssign = async (id) => {
    if (!sel) return
    await api.assignIndustryRequest(token, id, sel)
    const r = await api.getIndustryRequests(token); setRequests(r.data || [])
    setAssigning(null); setSel('')
  }

  const hazardColors = { low: '#16a34a', medium: '#f97316', high: '#ef4444', critical: '#7c3aed' }

  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>Industry Waste Requests</h2>
      {requests.map(r => (
        <Card key={r._id} style={{ marginBottom: 12 }}>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700 }}>{r.industryId?.companyName}</div>
                  <Badge status={r.status} />
                  <span style={{ background: hazardColors[r.hazardLevel] + '20', color: hazardColors[r.hazardLevel], fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{r.hazardLevel?.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>🗑️ {r.wasteCategory} · {r.subType} · {r.volumeKg} kg</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>📍 {r.pickupAddress}</div>
                {r.specialNotes && <div style={{ fontSize: 12, color: '#f97316', marginTop: 3 }}>⚠️ {r.specialNotes}</div>}
              </div>
              {r.status === 'pending' && <Btn small color="#3b82f6" onClick={() => setAssigning(r._id)}>Assign Collector</Btn>}
            </div>
            {assigning === r._id && (
              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <select value={sel} onChange={e => setSel(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit' }}>
                  <option value="">Select certified collector...</option>
                  {collectors.map(c => <option key={c._id} value={c._id}>{c.fullName} — {c.vehicleNumber}</option>)}
                </select>
                <Btn small onClick={() => doAssign(r._id)}>Assign</Btn>
                <Btn small outline color="#6b7280" onClick={() => setAssigning(null)}>Cancel</Btn>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

function Analytics({ token }) {
  const [data, setData] = useState({ dailyPickups: [], wasteBreakdown: [], recyclingRate: 0, co2Saved: 0 })
  useEffect(() => { api.getOfficerAnalytics(token).then(r => setData(r.data)).catch(() => {}) }, [token])
  const COLORS = ['#16a34a', '#3b82f6', '#f97316', '#ef4444', '#a855f7']
  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>Zone Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <StatCard icon={<BarChart3 size={20} />} label="Recycling Rate" value={`${data.recyclingRate}%`} color="#16a34a" bg="#dcfce7" />
        <StatCard icon={<Truck size={20} />} label="CO₂ Saved (kg)" value={data.co2Saved} color="#3b82f6" bg="#dbeafe" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Daily Pickups (Last 7 Days)</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.dailyPickups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="pickups" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Waste Type Breakdown</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.wasteBreakdown} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ type, value }) => `${type}: ${value}`} labelLine={false}>
                {data.wasteBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

function ESGReports({ token }) {
  const [reports, setReports] = useState([])
  useEffect(() => { api.getESGReports(token).then(r => setReports(r.data || [])).catch(() => {}) }, [token])
  const gradeColor = { 'A+': '#16a34a', A: '#16a34a', B: '#3b82f6', C: '#f97316', D: '#ef4444', F: '#7c3aed' }
  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>Industry ESG Reports</h2>
      {reports.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>No ESG reports found</div> :
        reports.map(r => (
          <Card key={r._id} style={{ marginBottom: 12 }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{r.industryId?.companyName}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Period: {r.period} · GST: {r.industryId?.gstNumber}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13 }}>♻️ Recycled: {r.recycledWaste?.toFixed(0)} kg</span>
                  <span style={{ fontSize: 13 }}>🌿 CO₂ Saved: {r.co2Saved} kg</span>
                  <span style={{ fontSize: 13 }}>📊 Rate: {r.recyclingRate}%</span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: gradeColor[r.grade] || '#374151' }}>{r.grade}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>ESG Grade</div>
              </div>
            </div>
          </Card>
        ))}
    </div>
  )
}

export default function OfficerDashboard() {
  const { token, user } = useAuthStore()
  return (
    <div style={layout}>
      <Sidebar links={sidebarLinks} role="government_officer" />
      <div style={main} className="main-content">
        <Topbar title="Officer Dashboard" subtitle={`Zone: ${user?.zone}`} token={token} />
        <div style={content}>
          <Routes>
            <Route index element={<OfficerHome token={token} user={user} />} />
            <Route path="requests" element={<RequestsTab token={token} />} />
            <Route path="fleet" element={<FleetMap token={token} user={user} />} />
            <Route path="complaints" element={<Complaints token={token} />} />
            <Route path="industry" element={<IndustryRequests token={token} />} />
            <Route path="analytics" element={<Analytics token={token} />} />
            <Route path="esg" element={<ESGReports token={token} />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
