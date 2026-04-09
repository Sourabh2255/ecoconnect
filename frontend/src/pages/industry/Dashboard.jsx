import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Home, FileText, ShoppingBag, Map, BarChart3, FileCheck, ArrowLeftRight, User } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import useAuthStore from '../../store/authStore'
import { Sidebar, Topbar, StatCard, Badge, Card, Btn } from '../../components/Layout'
import * as api from '../../utils/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' })

const sidebarLinks = [
  { to: '/industry', icon: <Home size={18} />, label: 'Dashboard' },
  { to: '/industry/declare', icon: <FileText size={18} />, label: 'Declare Waste' },
  { to: '/industry/declarations', icon: <FileCheck size={18} />, label: 'My Declarations' },
  { to: '/industry/marketplace', icon: <ShoppingBag size={18} />, label: 'Marketplace' },
  { to: '/industry/transfers', icon: <ArrowLeftRight size={18} />, label: 'Transfers' },
  { to: '/industry/map', icon: <Map size={18} />, label: 'Nearby Industries' },
  { to: '/industry/esg', icon: <BarChart3 size={18} />, label: 'ESG Report' },
  { to: '/industry/profile', icon: <User size={18} />, label: 'Profile' },
]

const layout = { display: 'flex', minHeight: '100vh', background: '#f9fafb' }
const main = { marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }
const content = { flex: 1, padding: '24px' }
const inp = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', marginTop: 4 }

function IndustryHome({ token, user }) {
  const [esg, setEsg] = useState(null)
  const [decls, setDecls] = useState([])

  useEffect(() => {
    api.getIndustryESGReport(token).then(r => setEsg(r.data)).catch(() => {})
    api.getDeclarations(token).then(r => setDecls(r.data || [])).catch(() => {})
  }, [token])

  const gradeColor = { 'A+': '#16a34a', A: '#16a34a', B: '#3b82f6', C: '#f97316', D: '#ef4444', F: '#7c3aed' }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)', borderRadius: 16, padding: '28px', marginBottom: 24, color: '#fff' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>{user?.companyName}</h2>
        <p style={{ opacity: 0.8, fontSize: 14 }}>GST: {user?.gstNumber} · {user?.industryType}</p>
        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>📊 Compliance: {user?.complianceScore || 100}/100</span>
          {esg && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>🏆 ESG Grade: {esg.grade}</span>}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={<FileText size={20} />} label="Total Declarations" value={decls.length} color="#7c3aed" bg="#f3e8ff" />
        <StatCard icon={<FileCheck size={20} />} label="Pending" value={decls.filter(d => d.status === 'pending').length} color="#f97316" bg="#fed7aa" />
        {esg && <>
          <StatCard icon={<BarChart3 size={20} />} label="Recycling Rate" value={`${esg.recyclingRate}%`} color="#16a34a" bg="#dcfce7" />
          <StatCard icon={<BarChart3 size={20} />} label="CO₂ Saved (kg)" value={esg.co2Saved} color="#3b82f6" bg="#dbeafe" />
        </>}
      </div>
      <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Recent Declarations</h3>
      {decls.slice(0, 5).map(d => (
        <Card key={d._id} style={{ marginBottom: 10 }}>
          <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{d.wasteCategory} — {d.subType}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{d.volumeKg} kg · {d.hazardLevel} hazard</div>
            </div>
            <Badge status={d.status} />
          </div>
        </Card>
      ))}
    </div>
  )
}

function DeclareWaste({ token }) {
  const [form, setForm] = useState({ wasteCategory: '', subType: '', volumeKg: '', hazardLevel: 'low', preferredDate: '', pickupAddress: '', ownerContact: '', specialNotes: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await api.declareWaste(token, { ...form, volumeKg: parseFloat(form.volumeKg) })
      setResult(data)
    } catch (err) { setError(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  if (result) return (
    <Card style={{ padding: 40, maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Waste Declared!</h2>
      <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#6b7280' }}>QR Code</div>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#14532d', letterSpacing: 1 }}>{result.qrCode}</div>
      </div>
      <p style={{ color: '#6b7280', marginBottom: 20, fontSize: 14 }}>Government officer will assign a collector</p>
      <Btn onClick={() => { setResult(null); setForm({ wasteCategory: '', subType: '', volumeKg: '', hazardLevel: 'low', preferredDate: '', pickupAddress: '', ownerContact: '', specialNotes: '' }) }}>Declare Another</Btn>
    </Card>
  )

  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Declare Waste</h2>
      <p style={{ color: '#6b7280', marginBottom: 20, fontSize: 14 }}>Submit a waste pickup request to government</p>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: 13 }}>{error}</div>}
      <Card style={{ padding: 28 }}>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Waste Category *</label>
              <select style={inp} value={form.wasteCategory} onChange={e => setForm(p => ({ ...p, wasteCategory: e.target.value }))} required>
                <option value="">Select...</option>
                {['organic', 'recyclable', 'hazardous', 'e-waste', 'industrial', 'chemical'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Sub-Type</label>
              <input style={inp} placeholder="e.g. Aluminum Scrap" value={form.subType} onChange={e => setForm(p => ({ ...p, subType: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Volume (kg) *</label>
              <input style={inp} type="number" min="0.1" step="0.1" placeholder="e.g. 500" value={form.volumeKg} onChange={e => setForm(p => ({ ...p, volumeKg: e.target.value }))} required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Hazard Level</label>
              <select style={inp} value={form.hazardLevel} onChange={e => setForm(p => ({ ...p, hazardLevel: e.target.value }))}>
                {['low', 'medium', 'high', 'critical'].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Preferred Pickup Date</label>
            <input style={inp} type="date" value={form.preferredDate} onChange={e => setForm(p => ({ ...p, preferredDate: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Pickup Address *</label>
            <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="Full address for pickup" value={form.pickupAddress} onChange={e => setForm(p => ({ ...p, pickupAddress: e.target.value }))} required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Owner Contact</label>
            <input style={inp} placeholder="Phone number" value={form.ownerContact} onChange={e => setForm(p => ({ ...p, ownerContact: e.target.value }))} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Special Notes</label>
            <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }} placeholder="Safety instructions, access requirements..." value={form.specialNotes} onChange={e => setForm(p => ({ ...p, specialNotes: e.target.value }))} />
          </div>
          <Btn style={{ width: '100%', padding: '12px' }} disabled={loading}>{loading ? 'Submitting...' : 'Submit Declaration'}</Btn>
        </form>
      </Card>
    </div>
  )
}

function Declarations({ token }) {
  const [decls, setDecls] = useState([])
  useEffect(() => { api.getDeclarations(token).then(r => setDecls(r.data || [])).catch(() => {}) }, [token])
  const hazardColors = { low: '#16a34a', medium: '#f97316', high: '#ef4444', critical: '#7c3aed' }

  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>My Waste Declarations</h2>
      {decls.length === 0 ? <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>No declarations yet</div> :
        decls.map(d => (
          <Card key={d._id} style={{ marginBottom: 12 }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700 }}>{d.wasteCategory} — {d.subType}</div>
                  <Badge status={d.status} />
                  <span style={{ background: hazardColors[d.hazardLevel] + '20', color: hazardColors[d.hazardLevel], fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>{d.hazardLevel?.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>📦 {d.volumeKg} kg</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>📍 {d.pickupAddress}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace', marginTop: 4 }}>{d.qrCode}</div>
                {d.collectorId && <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>🚛 Collector: {d.collectorId.fullName}</div>}
              </div>
            </div>
          </Card>
        ))}
    </div>
  )
}

function Marketplace({ token, user }) {
  const [listings, setListings] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', wasteType: '', quantity: '', unit: 'kg', pricePerUnit: '', description: '' })
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => api.getMarketplace(token, filter).then(r => setListings(r.data || [])).catch(() => {})
  useEffect(() => { load() }, [token, filter])

  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await api.createListing(token, { ...form, quantity: parseFloat(form.quantity), pricePerUnit: parseFloat(form.pricePerUnit) || 0 })
      setShowCreate(false); setForm({ title: '', wasteType: '', quantity: '', unit: 'kg', pricePerUnit: '', description: '' }); load()
    } finally { setLoading(false) }
  }

  const interest = async (id) => { await api.expressInterest(token, id); alert('Interest expressed! The seller will contact you.') }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontWeight: 800 }}>Waste Marketplace</h2>
        <Btn small onClick={() => setShowCreate(p => !p)} color="#7c3aed">{showCreate ? 'Cancel' : '+ New Listing'}</Btn>
      </div>

      {showCreate && (
        <Card style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Create Listing</h3>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={{ fontSize: 12, fontWeight: 600 }}>Title</label><input style={inp} placeholder="e.g. Aluminum Scrap" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600 }}>Waste Type</label><input style={inp} placeholder="metal/paper/plastic..." value={form.wasteType} onChange={e => setForm(p => ({ ...p, wasteType: e.target.value }))} required /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600 }}>Quantity</label><input style={inp} type="number" placeholder="500" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600 }}>Price/unit (₹)</label><input style={inp} type="number" placeholder="0" value={form.pricePerUnit} onChange={e => setForm(p => ({ ...p, pricePerUnit: e.target.value }))} /></div>
            </div>
            <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, fontWeight: 600 }}>Description</label><textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <Btn small disabled={loading}>{loading ? 'Creating...' : 'Create Listing'}</Btn>
          </form>
        </Card>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'metal', 'paper', 'plastic', 'organic', 'e-waste'].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: '6px 16px', borderRadius: 20, border: `2px solid ${filter === t ? '#7c3aed' : '#e5e7eb'}`, background: filter === t ? '#f3e8ff' : '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', color: filter === t ? '#7c3aed' : '#374151' }}>{t || 'All Types'}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {listings.map(l => (
          <Card key={l._id} style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{l.title}</div>
              <Badge status={l.status} />
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>🏭 {l.industryId?.companyName}</div>
            <div style={{ fontSize: 13, marginBottom: 4 }}>📦 {l.quantity} {l.unit} of <strong>{l.wasteType}</strong></div>
            {l.pricePerUnit > 0 && <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 700, marginBottom: 8 }}>₹{l.pricePerUnit}/{l.unit}</div>}
            {l.description && <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>{l.description}</div>}
            {l.industryId?._id !== user?._id && l.status === 'active' && (
              <Btn small onClick={() => interest(l._id)} color="#7c3aed">Express Interest</Btn>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

function NearbyIndustriesMap({ token }) {
  const [industries, setIndustries] = useState([])
  useEffect(() => { api.getNearbyIndustriesForIndustry(token).then(r => setIndustries(r.data || [])).catch(() => {}) }, [token])
  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Nearby Industries</h2>
      <p style={{ color: '#6b7280', marginBottom: 16, fontSize: 13 }}>Find partners for waste exchange and collaboration</p>
      <div style={{ height: 480, borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <MapContainer center={[18.5204, 73.8567]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {industries.filter(i => i.lat && i.lng).map(i => (
            <Marker key={i._id} position={[i.lat, i.lng]}>
              <Popup>
                <strong>{i.companyName}</strong><br />
                {i.industryType}<br />
                📍 {i.address}<br />
                ♻️ Accepts: {i.acceptsWasteTypes?.join(', ')}<br />
                GST: {i.gstNumber}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

function Transfers({ token, user }) {
  const [data, setData] = useState({ incoming: [], outgoing: [] })
  const [industries, setIndustries] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ targetIndustryId: '', wasteType: '', quantity: '', description: '', proposedPrice: '' })

  useEffect(() => {
    api.getIndustryTransferRequests(token).then(r => setData(r.data)).catch(() => {})
    api.getNearbyIndustriesForIndustry(token).then(r => setIndustries(r.data || [])).catch(() => {})
  }, [token])

  const submit = async (e) => {
    e.preventDefault()
    await api.createTransferRequest(token, { ...form, quantity: parseFloat(form.quantity), proposedPrice: parseFloat(form.proposedPrice) || 0 })
    setShowCreate(false)
    const r = await api.getIndustryTransferRequests(token); setData(r.data)
  }

  const respond = async (id, status) => {
    await api.updateTransferRequest(token, id, status)
    const r = await api.getIndustryTransferRequests(token); setData(r.data)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800 }}>Industry Transfers</h2>
        <Btn small onClick={() => setShowCreate(p => !p)}>+ New Transfer</Btn>
      </div>
      {showCreate && (
        <Card style={{ padding: 24, marginBottom: 20 }}>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={{ fontSize: 12, fontWeight: 600 }}>Target Industry</label>
                <select style={inp} value={form.targetIndustryId} onChange={e => setForm(p => ({ ...p, targetIndustryId: e.target.value }))} required>
                  <option value="">Select industry...</option>
                  {industries.filter(i => i._id !== user?._id).map(i => <option key={i._id} value={i._id}>{i.companyName}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: 12, fontWeight: 600 }}>Waste Type</label><input style={inp} value={form.wasteType} onChange={e => setForm(p => ({ ...p, wasteType: e.target.value }))} required /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600 }}>Quantity (kg)</label><input style={inp} type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600 }}>Proposed Price (₹)</label><input style={inp} type="number" value={form.proposedPrice} onChange={e => setForm(p => ({ ...p, proposedPrice: e.target.value }))} /></div>
            </div>
            <div style={{ marginTop: 12 }}><Btn small>Send Request</Btn></div>
          </form>
        </Card>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Incoming Requests</h3>
          {data.incoming.length === 0 ? <div style={{ color: '#9ca3af', fontSize: 13 }}>No incoming requests</div> :
            data.incoming.map(t => (
              <Card key={t._id} style={{ padding: 16, marginBottom: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.fromIndustry?.companyName}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{t.wasteType} · {t.quantity} kg</div>
                {t.proposedPrice > 0 && <div style={{ fontSize: 13, color: '#16a34a' }}>₹{t.proposedPrice}</div>}
                <Badge status={t.status} />
                {t.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <Btn small onClick={() => respond(t._id, 'accepted')}>Accept</Btn>
                    <Btn small outline color="#ef4444" onClick={() => respond(t._id, 'rejected')}>Reject</Btn>
                  </div>
                )}
              </Card>
            ))}
        </div>
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Sent Requests</h3>
          {data.outgoing.length === 0 ? <div style={{ color: '#9ca3af', fontSize: 13 }}>No sent requests</div> :
            data.outgoing.map(t => (
              <Card key={t._id} style={{ padding: 16, marginBottom: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>To: {t.toIndustry?.companyName}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{t.wasteType} · {t.quantity} kg</div>
                <Badge status={t.status} />
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}

function ESGDashboard({ token }) {
  const [report, setReport] = useState(null)
  useEffect(() => { api.getIndustryESGReport(token).then(r => setReport(r.data)).catch(() => {}) }, [token])

  const gradeColors = { 'A+': '#16a34a', A: '#22c55e', B: '#3b82f6', C: '#f97316', D: '#ef4444', F: '#7c3aed' }

  if (!report) return <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading ESG report...</div>

  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>ESG Report</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <Card style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['Total Waste', `${report.totalWaste?.toFixed(1)} kg`, '#374151', '#f9fafb'], ['Recycled Waste', `${report.recycledWaste?.toFixed(1)} kg`, '#16a34a', '#f0fdf4'], ['CO₂ Saved', `${report.co2Saved} kg`, '#3b82f6', '#dbeafe'], ['CO₂ Emitted', `${report.co2Emitted} kg`, '#ef4444', '#fef2f2']].map(([l, v, c, bg]) => (
              <div key={l} style={{ background: bg, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 72, fontWeight: 900, color: gradeColors[report.grade] || '#374151', lineHeight: 1 }}>{report.grade}</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>ESG Grade</div>
          <div style={{ color: '#9ca3af', fontSize: 14 }}>Score: {report.score}%</div>
          <div style={{ marginTop: 12, background: gradeColors[report.grade] + '20', borderRadius: 10, padding: '8px 12px', fontSize: 14, color: gradeColors[report.grade], fontWeight: 700 }}>Recycling Rate: {report.recyclingRate}%</div>
        </Card>
      </div>
    </div>
  )
}

function IndustryProfile({ token }) {
  const { user } = useAuthStore()
  return (
    <div style={{ maxWidth: 500 }}>
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>Company Profile</h2>
      <Card style={{ padding: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28, color: '#7c3aed', margin: '0 auto' }}>🏭</div>
          <div style={{ marginTop: 8, fontWeight: 700, fontSize: 16 }}>{user?.companyName}</div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>{user?.industryType}</div>
        </div>
        {[['Owner', user?.fullName], ['Email', user?.email], ['Phone', user?.phone], ['GST', user?.gstNumber], ['Address', user?.address], ['Accepts', user?.acceptsWasteTypes?.join(', ')], ['Compliance Score', `${user?.complianceScore || 100}/100`]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 4 }}>
            <span style={{ color: '#9ca3af', fontSize: 14 }}>{k}</span>
            <span style={{ fontWeight: 600, fontSize: 14, textAlign: 'right', maxWidth: '60%' }}>{v || '-'}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

export default function IndustryDashboard() {
  const { token, user } = useAuthStore()
  return (
    <div style={layout}>
      <Sidebar links={sidebarLinks} role="industry" />
      <div style={main} className="main-content">
        <Topbar title="Industry Dashboard" subtitle={user?.companyName} token={token} />
        <div style={content}>
          <Routes>
            <Route index element={<IndustryHome token={token} user={user} />} />
            <Route path="declare" element={<DeclareWaste token={token} />} />
            <Route path="declarations" element={<Declarations token={token} />} />
            <Route path="marketplace" element={<Marketplace token={token} user={user} />} />
            <Route path="transfers" element={<Transfers token={token} user={user} />} />
            <Route path="map" element={<NearbyIndustriesMap token={token} />} />
            <Route path="esg" element={<ESGDashboard token={token} />} />
            <Route path="profile" element={<IndustryProfile token={token} />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
