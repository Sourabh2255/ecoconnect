import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { loginUser } from '../utils/api'

const inp = { width: '100%', padding: '12px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', fontFamily: 'inherit', marginTop: 6 }
const lbl = { fontSize: 13, fontWeight: 600, color: '#374151' }

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await loginUser(form)
      login(data.token, data.user)
      const role = data.user.role
      if (role === 'citizen') nav('/citizen')
      else if (role === 'government_officer') nav('/officer')
      else if (role === 'garbage_collector') nav('/collector')
      else if (role === 'industry') nav('/industry')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const demoLogins = [
    { label: '🏠 Citizen', email: 'citizen@demo.com', password: 'Demo1234' },
    { label: '🏛️ Officer', email: 'officer1@ecoconnect.com', password: 'Admin1234' },
    { label: '🚛 Collector', email: 'collector1@ecoconnect.com', password: 'Driver1234' },
    { label: '🏭 Industry', email: 'industry@demo.com', password: 'Demo1234' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, textDecoration: 'none' }}>
          <Leaf size={28} color="#16a34a" />
          <span style={{ fontWeight: 800, fontSize: 20, color: '#14532d' }}>EcoConnect</span>
        </Link>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, color: '#111827' }}>Welcome back</h2>
        <p style={{ color: '#6b7280', marginBottom: 28, fontSize: 14 }}>Sign in to your account</p>

        {/* Demo Quick Login */}
        <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '14px 16px', marginBottom: 24, border: '1px solid #bbf7d0' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 10 }}>⚡ QUICK DEMO LOGIN</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {demoLogins.map(d => (
              <button key={d.label} onClick={() => setForm({ email: d.email, password: d.password })}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #bbf7d0', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#16a34a' }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center', color: '#ef4444', fontSize: 13 }}>
            <AlertCircle size={16} />{error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Email Address</label>
            <input style={inp} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={lbl}>Password</label>
            <div style={{ position: 'relative', marginTop: 6 }}>
              <input style={{ ...inp, marginTop: 0, paddingRight: 44 }} type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 8, background: loading ? '#86efac' : '#16a34a', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
