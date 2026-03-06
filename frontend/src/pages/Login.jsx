import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { loginUser } from '../utils/api';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuthStore();
  const [role,     setRole]     = useState('citizen');
  const [email,    setEmail]    = useState('citizen@demo.com');
  const [password, setPassword] = useState('demo1234');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const demos = {
    citizen:    { email:'citizen@demo.com',   pass:'demo1234' },
    government: { email:'govt@demo.com',      pass:'demo1234' },
    industry:   { email:'industry@demo.com',  pass:'demo1234' },
  };

  const handleRoleClick = (r) => {
    setRole(r);
    setEmail(demos[r].email);
    setPassword(demos[r].pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await loginUser({ email, password });
      login(data, data.token);
      if (data.role === 'government') nav('/government');
      else if (data.role === 'industry') nav('/industry');
      else nav('/citizen');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const inp = { width:'100%',padding:'0.7rem 1rem',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:'0.9rem',background:'#f9fafb',outline:'none',transition:'border-color 0.2s' };
  const lbl = { display:'block',fontSize:'0.8rem',fontWeight:700,color:'#374151',marginBottom:6 };

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem'}}>
      <div style={{background:'#fff',borderRadius:20,padding:'2.5rem',width:'100%',maxWidth:460,boxShadow:'0 12px 40px rgba(0,0,0,0.12)'}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'1.8rem'}}>
          <div onClick={()=>nav('/')} style={{cursor:'pointer',display:'inline-block',width:52,height:52,background:'linear-gradient(135deg,#14532d,#16a34a)',borderRadius:14,fontSize:'1.6rem',lineHeight:'52px',marginBottom:'0.75rem'}}>🌿</div>
          <h2 style={{fontSize:'1.5rem',fontWeight:800,color:'#14532d'}}>Welcome Back</h2>
          <p style={{color:'#6b7280',fontSize:'0.875rem',marginTop:4}}>Sign in to your EcoConnect account</p>
        </div>

        {/* Role Tabs */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',border:'2px solid #e5e7eb',borderRadius:10,overflow:'hidden',marginBottom:'1.5rem'}}>
          {[['citizen','👥','Citizen'],['government','🏛️','Government'],['industry','🏭','Industry']].map(([r,ic,lb],i)=>(
            <div key={r} onClick={()=>handleRoleClick(r)} style={{padding:'0.7rem 0.3rem',textAlign:'center',cursor:'pointer',fontWeight:600,fontSize:'0.78rem',background:role===r?'#16a34a':'#fff',color:role===r?'#fff':'#6b7280',borderRight:i<2?'2px solid #e5e7eb':'none',transition:'all 0.2s'}}>
              {ic} {lb}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,padding:'0.75rem 1rem',marginBottom:'1rem',fontSize:'0.85rem',color:'#b91c1c',display:'flex',alignItems:'center',gap:'0.5rem'}}>⚠️ {error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:'1rem'}}>
            <label style={lbl}>Email Address</label>
            <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required
              onFocus={e=>e.target.style.borderColor='#16a34a'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <label style={lbl}>Password</label>
            <input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
              onFocus={e=>e.target.style.borderColor='#16a34a'} onBlur={e=>e.target.style.borderColor='#e5e7eb'} />
          </div>
          <button type="submit" disabled={loading} style={{width:'100%',padding:'0.8rem',background:loading?'#86efac':'linear-gradient(135deg,#16a34a,#14532d)',color:'#fff',border:'none',borderRadius:10,fontWeight:800,fontSize:'1rem',transition:'opacity 0.2s'}}>
            {loading ? '⏳ Signing In...' : '🌿 Sign In'}
          </button>
        </form>

        {/* Demo hint */}
        <div style={{marginTop:'1rem',background:'#f0fdf4',borderRadius:8,padding:'0.75rem',fontSize:'0.75rem',color:'#14532d',textAlign:'center',lineHeight:1.6}}>
          <strong>Demo Credentials (pre-filled above)</strong><br/>
          citizen@demo.com · govt@demo.com · industry@demo.com<br/>
          <span style={{color:'#6b7280'}}>Password: <strong>demo1234</strong> for all accounts</span>
        </div>

        <p style={{textAlign:'center',marginTop:'1rem',fontSize:'0.875rem',color:'#6b7280'}}>
          No account?{' '}
          <span onClick={()=>nav('/signup')} style={{color:'#16a34a',fontWeight:700,cursor:'pointer'}}>Create one free →</span>
        </p>
      </div>
    </div>
  );
}
