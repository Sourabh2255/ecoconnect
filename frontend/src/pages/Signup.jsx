import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, AlertCircle, CheckCircle } from 'lucide-react'
import { registerUser, verifyEmail, resendOTP } from '../utils/api'
import useAuthStore from '../store/authStore'

const inp = (err) => ({ width: '100%', padding: '11px 14px', borderRadius: 8, border: `1.5px solid ${err ? '#fca5a5' : '#e5e7eb'}`, fontSize: 14, outline: 'none', fontFamily: 'inherit', marginTop: 4 })
const lbl = { fontSize: 13, fontWeight: 600, color: '#374151' }

export default function Signup() {
  const [step, setStep] = useState('form')
  const [role, setRole] = useState('citizen')
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', address: '', companyName: '', gstNumber: '', industryType: '' })
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const nav = useNavigate()

  const validate = () => {
    const e = {}
    if (!/^[a-zA-Z\s]{2,50}$/.test(form.fullName)) e.fullName = 'Name: 2–50 letters only'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = '10-digit Indian mobile number'
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) e.password = 'Min 8 chars with uppercase, lowercase, number'
    if (role === 'industry') {
      if (!form.gstNumber || !/^[A-Z0-9]{15}$/i.test(form.gstNumber)) e.gstNumber = '15 alphanumeric characters'
      if (!form.address || form.address.length < 10) e.address = 'Address must be at least 10 characters'
    }
    return e
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await registerUser({ ...form, role, gstNumber: form.gstNumber?.toUpperCase() })
      setStep('otp')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setServerError('')
    setLoading(true)
    try {
      const { data } = await verifyEmail({ email: form.email, otp })
      login(data.token, data.user)
      const r = data.user.role
      nav(r === 'citizen' ? '/citizen' : r === 'industry' ? '/industry' : '/login')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    try { await resendOTP({ email: form.email }); alert('OTP resent!') }
    catch (err) { setServerError(err.response?.data?.message || 'Resend failed') }
  }

  const F = (key, label, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={lbl}>{label}</label>
      <input style={inp(errors[key])} type={type} placeholder={placeholder} value={form[key]} onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })) }} />
      {errors[key] && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 3 }}>{errors[key]}</p>}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, textDecoration: 'none' }}>
          <Leaf size={26} color="#16a34a" />
          <span style={{ fontWeight: 800, fontSize: 20, color: '#14532d' }}>EcoConnect</span>
        </Link>

        {step === 'form' ? (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Create Account</h2>
            <p style={{ color: '#6b7280', marginBottom: 20, fontSize: 13 }}>Join the smart waste management platform</p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['citizen', 'industry'].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: `2px solid ${role === r ? '#16a34a' : '#e5e7eb'}`, background: role === r ? '#f0fdf4' : '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13, color: role === r ? '#16a34a' : '#6b7280', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                  {r === 'citizen' ? '🏠 Citizen' : '🏭 Industry'}
                </button>
              ))}
            </div>

            {serverError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', marginBottom: 14, display: 'flex', gap: 8, color: '#ef4444', fontSize: 13 }}><AlertCircle size={15} />{serverError}</div>}

            <form onSubmit={handleRegister}>
              {F('fullName', 'Full Name', 'text', 'John Doe')}
              {F('email', 'Email Address', 'email', 'you@example.com')}
              {F('phone', 'Mobile Number', 'tel', '9876543210')}
              {F('password', 'Password', 'password', 'Min 8 chars...')}
              {role === 'industry' && <>
                {F('companyName', 'Company Name', 'text', 'Acme Industries')}
                {F('gstNumber', 'GST Number', 'text', '15 alphanumeric chars')}
                {F('address', 'Company Address', 'text', 'Plot no, Area, City - 6 digit PIN')}
              </>}
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 8, background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: 6 }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#6b7280' }}>
              Already have an account? <Link to="/login" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={28} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Verify Your Email</h2>
              <p style={{ color: '#6b7280', fontSize: 14 }}>We sent a 6-digit code to <strong>{form.email}</strong></p>
            </div>
            {serverError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', marginBottom: 14, color: '#ef4444', fontSize: 13 }}>{serverError}</div>}
            <form onSubmit={handleVerify}>
              <input style={{ ...inp(), width: '100%', fontSize: 28, textAlign: 'center', letterSpacing: 12, fontWeight: 800, marginBottom: 20, marginTop: 8 }} type="text" maxLength={6} placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 8, background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#6b7280' }}>
              Didn't receive it? <button onClick={handleResend} style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Resend OTP</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
