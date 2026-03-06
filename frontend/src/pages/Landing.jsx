import { useNavigate } from 'react-router-dom';

const S = {
  nav:  { position:'sticky',top:0,zIndex:100,background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 2rem',height:64,display:'flex',alignItems:'center',justifyContent:'space-between' },
  logo: { fontWeight:800,fontSize:'1.1rem',color:'#14532d',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem' },
  hero: { background:'linear-gradient(135deg,#14532d 0%,#16a34a 60%,#22c55e 100%)',padding:'6rem 2rem',textAlign:'center',position:'relative',overflow:'hidden' },
  h1:   { fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:800,color:'#fff',maxWidth:700,margin:'0 auto 1.2rem',lineHeight:1.1 },
  sub:  { color:'rgba(255,255,255,0.88)',fontSize:'1.05rem',maxWidth:520,margin:'0 auto 2.5rem',lineHeight:1.7 },
  card: { background:'#fff',borderRadius:16,padding:'2rem',border:'1px solid #e5e7eb',borderTop:'3px solid #16a34a',textAlign:'center',transition:'transform 0.2s,box-shadow 0.2s',cursor:'pointer' },
  step: { display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',maxWidth:260 },
  stat: { padding:'1.8rem',textAlign:'center',borderRight:'1px solid #e5e7eb',flex:1 },
};

export default function Landing() {
  const nav = useNavigate();
  const features = [
    { icon:'📅', title:'Smart Scheduling',  desc:'Schedule pickups in 3 easy steps with preferred date, time slot and location pin.' },
    { icon:'🧠', title:'AI Waste Classifier',desc:'Upload a photo — AI identifies waste type and gives disposal instructions instantly.' },
    { icon:'♻️', title:'Eco Points & Rewards',desc:'Earn points for every pickup and report. Climb the leaderboard and win badges.' },
    { icon:'🏭', title:'Industry Marketplace',desc:'Industries sell recyclable materials. Buyers find quality secondary raw materials.' },
    { icon:'📊', title:'ESG & Compliance',   desc:'Automated ESG reports, disposal certificates, and real-time compliance alerts.' },
    { icon:'🗺️', title:'Fleet Management',   desc:'Government tracks trucks, manages zones, and resolves complaints in real time.' },
  ];
  const steps = [
    { n:'01', icon:'📱', title:'Sign Up',       desc:'Choose your role: Citizen, Government Collector, or Industry' },
    { n:'02', icon:'📅', title:'Schedule',      desc:'Request a pickup, declare waste, or list recyclables for sale' },
    { n:'03', icon:'🌍', title:'Track & Earn',  desc:'Track in real-time. Earn eco-points and sustainability certificates' },
  ];
  const roles = [
    { icon:'👥', title:'Citizens',    sub:'Schedule pickups, earn eco-points, find drop points, report issues', role:'citizen',    color:'#16a34a', bg:'#f0fdf4' },
    { icon:'🏛️', title:'Government',  sub:'Manage fleet, assign collectors, resolve complaints, view analytics', role:'government', color:'#3b82f6', bg:'#eff6ff' },
    { icon:'🏭', title:'Industries',  sub:'Declare hazardous waste, sell recyclables, get ESG certifications',   role:'industry',   color:'#f97316', bg:'#fff7ed' },
  ];

  return (
    <div style={{minHeight:'100vh',fontFamily:'Plus Jakarta Sans,sans-serif'}}>
      {/* Navbar */}
      <nav style={S.nav}>
        <div style={S.logo} onClick={()=>nav('/')}>🌿 EcoConnect</div>
        <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
          {['Features','How It Works','About'].map(l=>(
            <span key={l} style={{color:'#6b7280',fontSize:'0.875rem',fontWeight:500,cursor:'pointer'}}>{l}</span>
          ))}
        </div>
        <div style={{display:'flex',gap:'0.75rem'}}>
          <button onClick={()=>nav('/login')} style={{padding:'0.55rem 1.3rem',border:'1.5px solid #16a34a',background:'#fff',color:'#16a34a',borderRadius:8,fontWeight:700,fontSize:'0.875rem'}}>Log In</button>
          <button onClick={()=>nav('/signup')} style={{padding:'0.55rem 1.3rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:'0.875rem'}}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={S.hero}>
        <div style={{position:'absolute',top:-60,right:-60,width:300,height:300,borderRadius:'50%',background:'rgba(255,255,255,0.06)'}}/>
        <div style={{position:'absolute',bottom:-40,left:-40,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}}/>
        <h1 style={S.h1}>Smart Waste Management<br/>for a Sustainable Future 🌿</h1>
        <p style={S.sub}>Connecting Citizens, Government Collectors, and Industries through intelligent waste solutions — schedule pickups, earn rewards, sell recyclables, and generate ESG reports.</p>
        <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>nav('/signup')} style={{padding:'0.85rem 2.2rem',background:'#fff',color:'#14532d',border:'none',borderRadius:10,fontWeight:800,fontSize:'1rem',boxShadow:'0 4px 15px rgba(0,0,0,0.15)'}}>🚀 Get Started Free</button>
          <button onClick={()=>nav('/login')} style={{padding:'0.85rem 2rem',background:'transparent',color:'#fff',border:'2px solid rgba(255,255,255,0.5)',borderRadius:10,fontWeight:700,fontSize:'1rem'}}>Log In →</button>
        </div>
        <div style={{marginTop:'2.5rem',display:'flex',gap:'2rem',justifyContent:'center',flexWrap:'wrap'}}>
          {[['50K+','Pickups Completed'],['200+','Industries Connected'],['30T','CO₂ Avoided'],['98%','Satisfaction Rate']].map(([n,l])=>(
            <div key={l} style={{textAlign:'center'}}><div style={{fontSize:'1.5rem',fontWeight:800,color:'#fff'}}>{n}</div><div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.7)',marginTop:2}}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div style={{padding:'5rem 2rem',background:'#fff',textAlign:'center'}}>
        <p style={{color:'#16a34a',fontWeight:700,letterSpacing:'0.08em',fontSize:'0.8rem',textTransform:'uppercase',marginBottom:'0.75rem'}}>Simple Process</p>
        <h2 style={{fontSize:'2rem',fontWeight:800,color:'#14532d',marginBottom:'3rem'}}>How EcoConnect Works</h2>
        <div style={{display:'flex',gap:'3rem',justifyContent:'center',flexWrap:'wrap',maxWidth:900,margin:'0 auto'}}>
          {steps.map((s,i)=>(
            <div key={i} style={S.step}>
              <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#14532d,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',marginBottom:'1rem',boxShadow:'0 4px 15px rgba(22,163,74,0.3)'}}>{s.icon}</div>
              <div style={{background:'#dcfce7',color:'#14532d',fontSize:'0.7rem',fontWeight:800,padding:'2px 10px',borderRadius:100,marginBottom:'0.75rem',letterSpacing:'0.06em'}}>{s.n}</div>
              <h3 style={{fontWeight:800,color:'#14532d',marginBottom:'0.5rem'}}>{s.title}</h3>
              <p style={{fontSize:'0.875rem',color:'#6b7280',lineHeight:1.7}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{padding:'5rem 2rem',background:'#f0fdf4'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <p style={{color:'#16a34a',fontWeight:700,letterSpacing:'0.08em',fontSize:'0.8rem',textTransform:'uppercase',marginBottom:'0.75rem'}}>Everything You Need</p>
          <h2 style={{fontSize:'2rem',fontWeight:800,color:'#14532d'}}>Platform Features</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1.5rem',maxWidth:1100,margin:'0 auto'}}>
          {features.map((f,i)=>(
            <div key={i} style={S.card} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'}} onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
              <div style={{fontSize:'2.2rem',marginBottom:'0.75rem'}}>{f.icon}</div>
              <h3 style={{fontWeight:800,color:'#14532d',marginBottom:'0.5rem',fontSize:'1rem'}}>{f.title}</h3>
              <p style={{fontSize:'0.85rem',color:'#6b7280',lineHeight:1.7}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div style={{padding:'5rem 2rem',background:'#fff',textAlign:'center'}}>
        <h2 style={{fontSize:'2rem',fontWeight:800,color:'#14532d',marginBottom:'0.75rem'}}>Built for Every Stakeholder</h2>
        <p style={{color:'#6b7280',marginBottom:'3rem',fontSize:'0.95rem'}}>One platform, three powerful portals — each tailored to your needs.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem',maxWidth:1000,margin:'0 auto'}}>
          {roles.map((r)=>(
            <div key={r.role} style={{background:r.bg,borderRadius:16,padding:'2.5rem',border:`2px solid ${r.color}20`,textAlign:'center'}}>
              <div style={{width:72,height:72,borderRadius:'50%',background:`${r.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.2rem',margin:'0 auto 1rem'}}>{r.icon}</div>
              <h3 style={{fontWeight:800,color:r.color,fontSize:'1.2rem',marginBottom:'0.5rem'}}>{r.title}</h3>
              <p style={{fontSize:'0.875rem',color:'#374151',lineHeight:1.7,marginBottom:'1.5rem'}}>{r.sub}</p>
              <button onClick={()=>nav('/signup')} style={{padding:'0.65rem 1.5rem',background:r.color,color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:'0.875rem'}}>Join as {r.title} →</button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{background:'linear-gradient(135deg,#14532d,#16a34a)',padding:'5rem 2rem',textAlign:'center'}}>
        <h2 style={{fontSize:'2.2rem',fontWeight:800,color:'#fff',marginBottom:'1rem'}}>Ready to Make a Difference? 🌍</h2>
        <p style={{color:'rgba(255,255,255,0.85)',marginBottom:'2.5rem',fontSize:'1rem'}}>Join thousands of citizens, collectors, and industries building a cleaner tomorrow.</p>
        <button onClick={()=>nav('/signup')} style={{padding:'1rem 2.5rem',background:'#fff',color:'#14532d',border:'none',borderRadius:10,fontWeight:800,fontSize:'1.1rem',boxShadow:'0 4px 15px rgba(0,0,0,0.2)'}}>🌿 Join EcoConnect Today</button>
      </div>

      {/* Footer */}
      <footer style={{background:'#14532d',color:'rgba(255,255,255,0.7)',padding:'2rem',textAlign:'center',fontSize:'0.85rem'}}>
        <div style={{fontWeight:800,color:'#fff',marginBottom:'0.5rem',fontSize:'1rem'}}>🌿 EcoConnect</div>
        <div>Building sustainable communities through smart waste management.</div>
        <div style={{marginTop:'0.5rem',opacity:0.6}}>© 2025 EcoConnect. All rights reserved.</div>
      </footer>
    </div>
  );
}
