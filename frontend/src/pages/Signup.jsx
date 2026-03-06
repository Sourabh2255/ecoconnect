import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { registerUser } from '../utils/api';

export default function Signup() {
  const nav = useNavigate();
  const { login } = useAuthStore();
  const [role, setRole] = useState('citizen');
  const [form, setForm] = useState({ fullName:'',email:'',phone:'',password:'',confirm:'',department:'',employeeId:'',zone:'North Zone',companyName:'',industryType:'Manufacturing',businessRegNum:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const roles = [
    { id:'citizen',    icon:'👥', title:'Citizen',    sub:'Request pickups, earn eco-points' },
    { id:'government', icon:'🏛️', title:'Government', sub:'Manage collections & fleet' },
    { id:'industry',   icon:'🏭', title:'Industry',   sub:'Declare waste, sell recyclables' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true); setError('');
    try {
      const { data } = await registerUser({ ...form, role });
      login(data, data.token);
      if (role === 'government') nav('/government');
      else if (role === 'industry') nav('/industry');
      else nav('/citizen');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inp = { width:'100%',padding:'0.65rem 0.9rem',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:'0.875rem',background:'#f9fafb',outline:'none',transition:'border-color 0.2s',marginTop:4 };
  const lbl = { display:'block',fontSize:'0.78rem',fontWeight:700,color:'#374151' };
  const fg  = { marginBottom:'0.9rem' };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
      <div style={{background:'#fff',borderRadius:20,padding:'2.5rem',width:'100%',maxWidth:540,boxShadow:'0 12px 40px rgba(0,0,0,0.12)'}}>
        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          <div onClick={()=>nav('/')} style={{cursor:'pointer',display:'inline-block',width:52,height:52,background:'linear-gradient(135deg,#14532d,#16a34a)',borderRadius:14,fontSize:'1.6rem',lineHeight:'52px',marginBottom:'0.75rem'}}>🌿</div>
          <h2 style={{fontSize:'1.5rem',fontWeight:800,color:'#14532d'}}>Create Your Account</h2>
          <p style={{color:'#6b7280',fontSize:'0.875rem'}}>Join the smart waste revolution</p>
        </div>

        {/* Role selector */}
        <p style={{fontSize:'0.8rem',fontWeight:700,textAlign:'center',marginBottom:'0.75rem',color:'#374151'}}>I am signing up as:</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.75rem',marginBottom:'1.5rem'}}>
          {roles.map(r=>(
            <div key={r.id} onClick={()=>setRole(r.id)} style={{border:`2px solid`,borderColor:role===r.id?'#16a34a':'#e5e7eb',borderRadius:12,padding:'1rem 0.5rem',textAlign:'center',cursor:'pointer',background:role===r.id?'#f0fdf4':'#fff',transition:'all 0.2s'}}>
              <div style={{fontSize:'1.5rem'}}>{r.icon}</div>
              <div style={{fontSize:'0.78rem',fontWeight:700,color:'#14532d',marginTop:4}}>{r.title}</div>
              <div style={{fontSize:'0.65rem',color:'#6b7280',marginTop:2,lineHeight:1.3}}>{r.sub}</div>
            </div>
          ))}
        </div>

        {error && <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,padding:'0.75rem',marginBottom:'1rem',fontSize:'0.85rem',color:'#b91c1c'}}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={fg}><label style={lbl}>Full Name *</label><input style={inp} value={form.fullName} onChange={e=>set('fullName',e.target.value)} placeholder="Your full name" required onFocus={e=>e.target.style.borderColor='#16a34a'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.9rem'}}>
            <div style={fg}><label style={lbl}>Email *</label><input style={inp} type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com" required onFocus={e=>e.target.style.borderColor='#16a34a'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} /></div>
            <div style={fg}><label style={lbl}>Phone</label><input style={inp} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 98765 43210" onFocus={e=>e.target.style.borderColor='#16a34a'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} /></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.9rem'}}>
            <div style={fg}><label style={lbl}>Password *</label><input style={inp} type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Min 6 characters" required onFocus={e=>e.target.style.borderColor='#16a34a'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} /></div>
            <div style={fg}><label style={lbl}>Confirm Password *</label><input style={inp} type="password" value={form.confirm} onChange={e=>set('confirm',e.target.value)} placeholder="Repeat password" required onFocus={e=>e.target.style.borderColor='#16a34a'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} /></div>
          </div>

          {role === 'government' && (
            <div style={{background:'#eff6ff',borderRadius:10,padding:'1rem',marginBottom:'0.9rem'}}>
              <p style={{fontSize:'0.75rem',fontWeight:700,color:'#1d4ed8',marginBottom:'0.75rem'}}>🏛️ Government Details</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                <div><label style={lbl}>Department</label><input style={inp} value={form.department} onChange={e=>set('department',e.target.value)} placeholder="Municipal Corp." onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} /></div>
                <div><label style={lbl}>Employee ID</label><input style={inp} value={form.employeeId} onChange={e=>set('employeeId',e.target.value)} placeholder="EMP-001" onFocus={e=>e.target.style.borderColor='#3b82f6'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} /></div>
              </div>
              <div style={{marginTop:'0.75rem'}}><label style={lbl}>Assigned Zone</label>
                <select style={inp} value={form.zone} onChange={e=>set('zone',e.target.value)}>
                  {['North Zone','South Zone','East Zone','West Zone','Central Zone'].map(z=><option key={z}>{z}</option>)}
                </select>
              </div>
            </div>
          )}

          {role === 'industry' && (
            <div style={{background:'#fff7ed',borderRadius:10,padding:'1rem',marginBottom:'0.9rem'}}>
              <p style={{fontSize:'0.75rem',fontWeight:700,color:'#c2410c',marginBottom:'0.75rem'}}>🏭 Industry Details</p>
              <div style={fg}><label style={lbl}>Company Name</label><input style={inp} value={form.companyName} onChange={e=>set('companyName',e.target.value)} placeholder="ABC Manufacturing Ltd." onFocus={e=>e.target.style.borderColor='#f97316'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                <div><label style={lbl}>Industry Type</label>
                  <select style={inp} value={form.industryType} onChange={e=>set('industryType',e.target.value)}>
                    {['Manufacturing','Chemical','Construction','Food Processing','Pharmaceutical','Textile','Other'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Business Reg. No.</label><input style={inp} value={form.businessRegNum} onChange={e=>set('businessRegNum',e.target.value)} placeholder="CIN/GSTIN" onFocus={e=>e.target.style.borderColor='#f97316'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} /></div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} style={{width:'100%',padding:'0.8rem',background:loading?'#86efac':'linear-gradient(135deg,#16a34a,#14532d)',color:'#fff',border:'none',borderRadius:10,fontWeight:800,fontSize:'1rem',marginTop:'0.5rem'}}>
            {loading ? '⏳ Creating Account...' : '🌿 Create Account'}
          </button>
        </form>

        <p style={{textAlign:'center',marginTop:'1rem',fontSize:'0.875rem',color:'#6b7280'}}>
          Already have an account?{' '}
          <span onClick={()=>nav('/login')} style={{color:'#16a34a',fontWeight:700,cursor:'pointer'}}>Sign in →</span>
        </p>
      </div>
    </div>
  );
}
