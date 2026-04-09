import React from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Truck, BarChart3, MessageCircle, MapPin, Shield, ArrowRight, Recycle, Zap, Globe } from 'lucide-react'

const S = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #e5e7eb' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 22, color: '#14532d' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 16 },
  btnOutline: { padding: '8px 20px', borderRadius: 8, border: '2px solid #16a34a', color: '#16a34a', background: 'transparent', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', fontSize: 14 },
  btnPrimary: { padding: '10px 24px', borderRadius: 8, background: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', fontSize: 14, border: 'none' },
  hero: { textAlign: 'center', padding: '80px 24px 60px', maxWidth: 800, margin: '0 auto' },
  heroTag: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dcfce7', color: '#16a34a', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24 },
  heroTitle: { fontSize: 56, fontWeight: 800, lineHeight: 1.1, color: '#14532d', marginBottom: 20 },
  heroSub: { fontSize: 18, color: '#6b7280', marginBottom: 40, lineHeight: 1.6 },
  heroBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  btnLarge: { padding: '14px 32px', borderRadius: 10, background: '#16a34a', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8 },
  btnLargeOutline: { padding: '14px 32px', borderRadius: 10, border: '2px solid #16a34a', color: '#16a34a', fontWeight: 700, textDecoration: 'none', fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8 },
  stats: { display: 'flex', justifyContent: 'center', gap: 48, padding: '40px 24px', flexWrap: 'wrap' },
  stat: { textAlign: 'center' },
  statNum: { fontSize: 36, fontWeight: 800, color: '#16a34a' },
  statLabel: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  section: { padding: '60px 48px', maxWidth: 1200, margin: '0 auto' },
  sectionTitle: { fontSize: 36, fontWeight: 800, color: '#14532d', textAlign: 'center', marginBottom: 12 },
  sectionSub: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 48 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 },
  card: { background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  cardTitle: { fontWeight: 700, fontSize: 18, color: '#111827', marginBottom: 8 },
  cardText: { color: '#6b7280', lineHeight: 1.6, fontSize: 14 },
  roles: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginTop: 40 },
  roleCard: { background: '#fff', borderRadius: 16, padding: 24, border: '2px solid #e5e7eb', textAlign: 'center', transition: 'border-color 0.2s' },
  footer: { background: '#14532d', color: '#fff', textAlign: 'center', padding: '32px 24px', marginTop: 60 },
}

const features = [
  { icon: <Truck size={24} />, color: '#dcfce7', iconColor: '#16a34a', title: 'Smart Pickup Scheduling', text: 'Schedule waste pickups with 4-step wizard. Real-time tracking, QR codes, and automatic notifications.' },
  { icon: <BarChart3 size={24} />, color: '#dbeafe', iconColor: '#3b82f6', title: 'AI Waste Classification', text: 'Upload photos for instant ML classification — organic, recyclable, e-waste, hazardous, or bulky.' },
  { icon: <MapPin size={24} />, color: '#fed7aa', iconColor: '#f97316', title: 'Live Fleet Tracking', text: 'Real-time GPS tracking of garbage trucks. See collector location, ETA, and route on Leaflet maps.' },
  { icon: <MessageCircle size={24} />, color: '#f3e8ff', iconColor: '#a855f7', title: 'AI Chatbot (EcoAssist)', text: 'Claude-powered chatbot answers questions about pickups, eco points, recycling tips, and facilities.' },
  { icon: <Globe size={24} />, color: '#fef9c3', iconColor: '#eab308', title: 'Industry ESG Reports', text: 'Automated ESG scoring with CO₂ tracking, recycling rates, and compliance monitoring for industries.' },
  { icon: <Zap size={24} />, color: '#ffe4e6', iconColor: '#ef4444', title: 'Eco Points & Leaderboard', text: 'Gamified rewards system with points for pickups, issue reports, waste classification, and daily logins.' },
]

const roles = [
  { emoji: '🏠', title: 'Citizens', desc: 'Schedule pickups, earn eco points, report issues, track trucks live', color: '#f0fdf4', border: '#16a34a' },
  { emoji: '🏛️', title: 'Government Officers', desc: 'Manage fleet, assign collectors, resolve complaints, view analytics', color: '#eff6ff', border: '#3b82f6' },
  { emoji: '🚛', title: 'Garbage Collectors', desc: 'Mobile-optimized dashboard, GPS tracking, pickup management', color: '#fff7ed', border: '#f97316' },
  { emoji: '🏭', title: 'Industries', desc: 'Declare waste, marketplace trading, ESG reporting, compliance', color: '#fdf4ff', border: '#a855f7' },
]

export default function Landing() {
  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.logo}><Leaf size={28} color="#16a34a" />EcoConnect</div>
        <div style={S.navLinks}>
          <Link to="/login" style={S.btnOutline}>Sign In</Link>
          <Link to="/signup" style={S.btnPrimary}>Get Started</Link>
        </div>
      </nav>

      <div style={S.hero}>
        <div style={S.heroTag}><Recycle size={14} /> Smart Waste Management Platform</div>
        <h1 style={S.heroTitle}>Making Cities Cleaner,<br /><span style={{ color: '#16a34a' }}>One Pickup at a Time</span></h1>
        <p style={S.heroSub}>EcoConnect connects citizens, government officers, garbage collectors, and industries in a unified smart waste management ecosystem powered by AI and real-time tracking.</p>
        <div style={S.heroBtns}>
          <Link to="/signup" style={S.btnLarge}>Get Started Free <ArrowRight size={18} /></Link>
          <Link to="/login" style={S.btnLargeOutline}>Sign In</Link>
        </div>
      </div>

      <div style={S.stats}>
        {[['12,400+', 'Pickups Completed'], ['98.2%', 'Satisfaction Rate'], ['840 tons', 'Waste Recycled'], ['₹18L+', 'CO₂ Credits Generated']].map(([n, l]) => (
          <div key={l} style={S.stat}><div style={S.statNum}>{n}</div><div style={S.statLabel}>{l}</div></div>
        ))}
      </div>

      <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={S.section}>
          <div style={S.sectionTitle}>Everything You Need</div>
          <div style={S.sectionSub}>A complete waste management solution for every stakeholder</div>
          <div style={S.grid3}>
            {features.map(f => (
              <div key={f.title} style={S.card}>
                <div style={{ ...S.cardIcon, background: f.color }}><span style={{ color: f.iconColor }}>{f.icon}</span></div>
                <div style={S.cardTitle}>{f.title}</div>
                <div style={S.cardText}>{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Built for Every Role</div>
        <div style={S.sectionSub}>Each user gets a tailored experience</div>
        <div style={S.roles}>
          {roles.map(r => (
            <div key={r.title} style={{ ...S.roleCard, background: r.color, borderColor: r.border }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{r.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#111827' }}>{r.title}</div>
              <div style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #14532d, #16a34a)', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Ready to Go Green?</h2>
        <p style={{ color: '#bbf7d0', fontSize: 18, marginBottom: 32 }}>Join thousands of citizens making their city cleaner</p>
        <Link to="/signup" style={{ ...S.btnLarge, background: '#fff', color: '#16a34a' }}>Start for Free <ArrowRight size={18} /></Link>
      </div>

      <footer style={S.footer}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8, fontSize: 20, fontWeight: 800 }}>
          <Leaf size={22} />EcoConnect
        </div>
        <p style={{ color: '#86efac', fontSize: 14 }}>© 2025 EcoConnect. Smart Waste Management for a Greener Tomorrow.</p>
      </footer>
    </div>
  )
}
