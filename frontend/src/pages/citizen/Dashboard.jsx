
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { getMyPickups, getEcoPoints, getLeaderboard, schedulePickup, submitReport, getNotifications, markAllRead, getDropPoints } from '../../utils/api';

// ─── Shared Styles ────────────────────────────────────────────
const card = { background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',borderTop:'3px solid #16a34a',padding:'1.4rem' };
const kpiCard = (val,label,icon,color='#16a34a') => (
  <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',borderTop:`3px solid ${color}`,padding:'1.4rem'}}>
    <div style={{fontSize:'1.5rem',marginBottom:6}}>{icon}</div>
    <div style={{fontSize:'1.8rem',fontWeight:800,color:'#14532d'}}>{val}</div>
    <div style={{fontSize:'0.72rem',color:'#6b7280',marginTop:2,textTransform:'uppercase',letterSpacing:'0.04em'}}>{label}</div>
  </div>
);

const statusStyle = { pending:{bg:'#fef9c3',color:'#854d0e'}, confirmed:{bg:'#dbeafe',color:'#1d4ed8'}, 'en-route':{bg:'#ffedd5',color:'#c2410c'}, collected:{bg:'#dcfce7',color:'#14532d'}, cancelled:{bg:'#fee2e2',color:'#991b1b'} };
const wasteColors = { organic:'#dcfce7',recyclable:'#dbeafe','e-waste':'#fef9c3',hazardous:'#fee2e2',bulky:'#f3f4f6' };

// ─── CITIZEN DASHBOARD ──────────────────────────────────────
export default function CitizenDashboard() {
  const nav = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [tab,      setTab]      = useState('dashboard');
  const [pickups,  setPickups]  = useState([]);
  const [ecoData,  setEcoData]  = useState(null);
  const [leaders,  setLeaders]  = useState([]);
  const [notifs,   setNotifs]   = useState([]);
  const [notifOpen,setNotifOpen]= useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{from:'bot',text:'Hi! I am EcoAssist 🌿 How can I help with waste management today?'}]);
  const [chatInput,setChatInput]= useState('');
  const [loading,  setLoading]  = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [p,e,l,n] = await Promise.allSettled([getMyPickups(),getEcoPoints(),getLeaderboard(),getNotifications()]);
      if(p.status==='fulfilled') setPickups(p.value.data);
      if(e.status==='fulfilled') { setEcoData(e.value.data); updateUser({ ecoPoints: e.value.data.ecoPoints, level: e.value.data.level }); }
      if(l.status==='fulfilled') setLeaders(l.value.data);
      if(n.status==='fulfilled') setNotifs(n.value.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, []);

  const handleLogout = () => { logout(); nav('/'); };
  const unread = notifs.filter(n=>!n.isRead).length;

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const q = chatInput.toLowerCase();
    setMessages(m=>[...m,{from:'user',text:chatInput}]);
    setChatInput('');
    setTimeout(()=>{
      let reply = 'I can help you with waste disposal, pickups, and recycling tips! 🌿';
      if(q.includes('pickup')||q.includes('schedule')) reply = 'Go to the "Schedule Pickup" tab to book a waste collection. Choose waste type, date, time slot, and location!';
      else if(q.includes('battery')||q.includes('e-waste')||q.includes('electronic')) reply = '⚠️ E-Waste (batteries, electronics) should NOT go in regular bins. Use the Schedule Pickup tab to book an E-Waste pickup or visit a drop point.';
      else if(q.includes('recycl')) reply = 'Recyclables include: paper, cardboard, plastic bottles, glass jars, metal cans. Rinse before disposing. Earn 5 eco points per pickup! ♻️';
      else if(q.includes('point')||q.includes('eco')) reply = `You currently have ${ecoData?.ecoPoints || user?.ecoPoints || 0} eco points! Earn more by scheduling pickups (+5), reporting issues (+10), and completing pickups (+20).`;
      else if(q.includes('organic')||q.includes('food')) reply = 'Organic waste includes food scraps, vegetable peels, garden waste. Keep it separate in a biodegradable bag and schedule an organic pickup!';
      setMessages(m=>[...m,{from:'bot',text:reply}]);
    }, 800);
  };

  const navItems = [
    {id:'dashboard',icon:'🏠',label:'Dashboard'},
    {id:'schedule', icon:'📅',label:'Schedule Pickup'},
    {id:'classify', icon:'🧠',label:'Classify Waste'},
    {id:'droppoints',icon:'🗺️',label:'Find Drop Points'},
    {id:'report',   icon:'🚨',label:'Report Issue'},
    {id:'leaderboard',icon:'🏆',label:'Leaderboard'},
  ];

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f8fafc',fontFamily:'Plus Jakarta Sans,sans-serif'}}>
      {/* Sidebar */}
      <div style={{width:240,background:'#fff',borderRight:'1px solid #e5e7eb',position:'fixed',top:0,left:0,bottom:0,display:'flex',flexDirection:'column',zIndex:50}}>
        <div style={{padding:'1.2rem',borderBottom:'1px solid #e5e7eb'}}>
          <div style={{fontWeight:800,color:'#14532d',fontSize:'1rem',marginBottom:'1rem',cursor:'pointer'}} onClick={()=>nav('/')}>🌿 EcoConnect</div>
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#14532d,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'1rem',flexShrink:0}}>
              {user?.fullName?.charAt(0)||'U'}
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:'0.82rem',fontWeight:700,color:'#14532d',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.fullName}</div>
              <span style={{background:'#dcfce7',color:'#14532d',fontSize:'0.65rem',fontWeight:700,padding:'1px 7px',borderRadius:100}}>Citizen</span>
            </div>
          </div>
          <div style={{marginTop:'1rem',background:'#f0fdf4',borderRadius:8,padding:'0.75rem'}}>
            <div style={{fontSize:'0.65rem',color:'#6b7280',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>🌿 Eco Points</div>
            <div style={{fontSize:'1.1rem',fontWeight:800,color:'#16a34a'}}>{ecoData?.ecoPoints ?? user?.ecoPoints ?? 0} pts</div>
            <div style={{height:4,background:'#dcfce7',borderRadius:2,marginTop:6}}>
              <div style={{height:'100%',width:`${Math.min(100,((ecoData?.ecoPoints||0)/5000)*100)}%`,background:'#16a34a',borderRadius:2,transition:'width 0.5s'}}/>
            </div>
            <div style={{fontSize:'0.68rem',color:'#6b7280',marginTop:4}}>{ecoData?.level || user?.level || 'Eco Starter'}</div>
          </div>
        </div>
        <nav style={{flex:1,padding:'0.75rem',overflowY:'auto'}}>
          {navItems.map(item=>(
            <div key={item.id} onClick={()=>setTab(item.id)} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.6rem 0.75rem',borderRadius:8,cursor:'pointer',marginBottom:2,background:tab===item.id?'#dcfce7':'transparent',color:tab===item.id?'#16a34a':'#6b7280',fontWeight:tab===item.id?700:500,fontSize:'0.875rem',transition:'all 0.15s'}}>
              <span style={{fontSize:'1rem'}}>{item.icon}</span>{item.label}
            </div>
          ))}
        </nav>
        <div style={{padding:'0.75rem',borderTop:'1px solid #e5e7eb'}}>
          <button onClick={handleLogout} style={{width:'100%',padding:'0.6rem 0.75rem',background:'none',border:'none',cursor:'pointer',color:'#6b7280',fontSize:'0.85rem',textAlign:'left',borderRadius:8,display:'flex',alignItems:'center',gap:'0.5rem'}}>🚪 Log Out</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{marginLeft:240,flex:1,display:'flex',flexDirection:'column'}}>
        {/* Topbar */}
        <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 2rem',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:40}}>
          <div style={{fontWeight:800,color:'#14532d',fontSize:'1.1rem'}}>
            {tab==='dashboard' ? `Good day, ${user?.fullName?.split(' ')[0]} 👋` : navItems.find(n=>n.id===tab)?.label}
          </div>
          <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
            <div style={{position:'relative',cursor:'pointer'}} onClick={()=>setNotifOpen(o=>!o)}>
              <div style={{width:38,height:38,borderRadius:'50%',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem'}}>🔔</div>
              {unread>0 && <div style={{position:'absolute',top:-2,right:-2,width:18,height:18,borderRadius:'50%',background:'#ef4444',color:'#fff',fontSize:'0.65rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{unread}</div>}
            </div>
            <button onClick={()=>setChatOpen(o=>!o)} style={{padding:'0.5rem 1rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:'0.82rem'}}>🤖 EcoAssist</button>
          </div>
        </div>

        {/* Notification Panel */}
        {notifOpen && (
          <div style={{position:'fixed',top:64,right:0,width:360,height:'calc(100vh - 64px)',background:'#fff',borderLeft:'1px solid #e5e7eb',zIndex:200,boxShadow:'-4px 0 20px rgba(0,0,0,0.08)',display:'flex',flexDirection:'column'}}>
            <div style={{padding:'1rem 1.2rem',borderBottom:'1px solid #e5e7eb',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontWeight:800,color:'#14532d'}}>🔔 Notifications</span>
              <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
                <span onClick={()=>markAllRead().then(()=>setNotifs(n=>n.map(x=>({...x,isRead:true}))))} style={{fontSize:'0.75rem',color:'#16a34a',fontWeight:700,cursor:'pointer'}}>Mark all read</span>
                <span onClick={()=>setNotifOpen(false)} style={{cursor:'pointer',color:'#6b7280',fontWeight:700}}>✕</span>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'0.75rem'}}>
              {notifs.length===0 ? <div style={{textAlign:'center',padding:'3rem',color:'#6b7280'}}><div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>📭</div>No notifications yet</div>
              : notifs.map(n=>(
                <div key={n._id} style={{padding:'0.9rem',borderRadius:10,marginBottom:'0.5rem',background:n.isRead?'#fff':'#f0fdf4',border:`1px solid ${n.isRead?'#e5e7eb':'#bbf7d0'}`}}>
                  <div style={{fontWeight:700,fontSize:'0.85rem',color:'#14532d',marginBottom:2}}>{n.title}</div>
                  <div style={{fontSize:'0.78rem',color:'#6b7280',lineHeight:1.5}}>{n.message}</div>
                  <div style={{fontSize:'0.68rem',color:'#9ca3af',marginTop:4}}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page Content */}
        <div style={{padding:'2rem',flex:1}} className="fade-in">
          {tab==='dashboard' && <DashboardHome pickups={pickups} ecoData={ecoData} user={user} setTab={setTab} statusStyle={statusStyle} wasteColors={wasteColors} loading={loading} />}
          {tab==='schedule'  && <ScheduleTab onSuccess={()=>{ loadData(); setTab('dashboard'); }} />}
          {tab==='classify'  && <ClassifyTab />}
          {tab==='droppoints'&& <DropPointsTab />}
          {tab==='report'    && <ReportTab onSuccess={()=>{ loadData(); setTab('dashboard'); }} />}
          {tab==='leaderboard'&&<LeaderboardTab leaders={leaders} userId={user?._id} />}
        </div>
      </div>

      {/* Chatbot */}
      {chatOpen && (
        <div style={{position:'fixed',bottom:'1.5rem',right:'1.5rem',width:340,background:'#fff',borderRadius:18,boxShadow:'0 12px 40px rgba(0,0,0,0.15)',display:'flex',flexDirection:'column',overflow:'hidden',maxHeight:480,zIndex:300}}>
          <div style={{background:'linear-gradient(135deg,#14532d,#16a34a)',padding:'1rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <span style={{fontSize:'1.4rem'}}>🌿</span>
              <div><div style={{color:'#fff',fontWeight:800,fontSize:'0.9rem'}}>EcoAssist AI</div><div style={{color:'rgba(255,255,255,0.7)',fontSize:'0.68rem'}}>🟢 Online</div></div>
            </div>
            <button onClick={()=>setChatOpen(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.8)',cursor:'pointer',fontSize:'1rem',fontWeight:700}}>✕</button>
          </div>
          <div style={{flex:1,padding:'0.75rem',overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.6rem',maxHeight:340}}>
            {messages.map((m,i)=>(
              <div key={i} style={{maxWidth:'82%',padding:'0.6rem 0.9rem',borderRadius:12,fontSize:'0.82rem',lineHeight:1.5,alignSelf:m.from==='user'?'flex-end':'flex-start',background:m.from==='user'?'#16a34a':'#f0fdf4',color:m.from==='user'?'#fff':'#374151',borderBottomRightRadius:m.from==='user'?2:12,borderBottomLeftRadius:m.from==='bot'?2:12}}>{m.text}</div>
            ))}
          </div>
          <div style={{display:'flex',padding:'0.6rem',gap:'0.5rem',borderTop:'1px solid #e5e7eb'}}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder="Ask about waste disposal..." style={{flex:1,padding:'0.5rem 0.75rem',border:'1.5px solid #e5e7eb',borderRadius:20,fontSize:'0.82rem',outline:'none'}} />
            <button onClick={sendChat} style={{background:'#16a34a',color:'#fff',border:'none',borderRadius:'50%',width:34,height:34,fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Home ───────────────────────────────────────────
function DashboardHome({ pickups, ecoData, user, setTab, statusStyle, wasteColors, loading }) {
  const actions = [
    {icon:'📅',label:'Schedule Pickup',tab:'schedule',bg:'linear-gradient(135deg,#14532d,#16a34a)'},
    {icon:'🧠',label:'Classify Waste', tab:'classify', bg:'linear-gradient(135deg,#0f766e,#0d9488)'},
    {icon:'🚨',label:'Report Issue',   tab:'report',   bg:'linear-gradient(135deg,#c2410c,#f97316)'},
    {icon:'🗺️',label:'Find Drop Points',tab:'droppoints',bg:'linear-gradient(135deg,#1d4ed8,#3b82f6)'},
  ];
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        {loading ? Array(4).fill(0).map((_,i)=><div key={i} style={{background:'#f3f4f6',borderRadius:12,height:110,animation:'pulse 1.5s infinite'}}/>)
        : [
          [pickups.length, 'Total Pickups', '♻️'],
          [ecoData?.ecoPoints??user?.ecoPoints??0, 'Eco Points', '🌿'],
          [pickups.filter(p=>p.status==='collected').length, 'Completed', '✅'],
          [pickups.filter(p=>['pending','confirmed','en-route'].includes(p.status)).length, 'Active', '📋']
        ].map(([v,l,i])=>(
          <div key={l} style={{background:'#fff',borderRadius:12,padding:'1.4rem',border:'1px solid #e5e7eb',borderTop:'3px solid #16a34a'}}>
            <div style={{fontSize:'1.5rem',marginBottom:6}}>{i}</div>
            <div style={{fontSize:'1.8rem',fontWeight:800,color:'#14532d'}}>{v}</div>
            <div style={{fontSize:'0.72rem',color:'#6b7280',marginTop:2,textTransform:'uppercase'}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
        {actions.map(a=>(
          <div key={a.tab} onClick={()=>setTab(a.tab)} style={{borderRadius:12,padding:'1.4rem',cursor:'pointer',color:'#fff',background:a.bg,transition:'transform 0.2s,box-shadow 0.2s'}} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.15)'}} onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
            <div style={{fontSize:'1.8rem',marginBottom:'0.5rem'}}>{a.icon}</div>
            <div style={{fontWeight:700,fontSize:'0.875rem'}}>{a.label}</div>
          </div>
        ))}
      </div>

      <div style={{fontWeight:800,color:'#14532d',marginBottom:'0.75rem'}}>📋 Recent Pickup Requests</div>
      <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',overflow:'hidden'}}>
        {pickups.length===0 ? (
          <div style={{padding:'3rem',textAlign:'center',color:'#6b7280'}}>
            <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>📭</div>
            <div style={{fontWeight:700,marginBottom:'0.5rem'}}>No pickup requests yet</div>
            <button onClick={()=>setTab('schedule')} style={{marginTop:'0.5rem',padding:'0.6rem 1.4rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer'}}>Schedule Your First Pickup</button>
          </div>
        ) : (
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
              <thead style={{background:'#f0fdf4'}}>
                <tr>{['Waste Types','Scheduled Date','Time Slot','Status','Collector'].map(h=>(
                  <th key={h} style={{padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'#6b7280',borderBottom:'1px solid #e5e7eb',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {pickups.slice(0,8).map(p=>{
                  const st = statusStyle[p.status]||{bg:'#f3f4f6',color:'#374151'};
                  return (
                    <tr key={p._id} style={{borderBottom:'1px solid #f3f4f6'}}>
                      <td style={{padding:'0.85rem 1rem'}}>{p.wasteTypes?.map(t=><span key={t} style={{background:wasteColors[t]||'#f3f4f6',padding:'2px 8px',borderRadius:100,fontSize:'0.68rem',fontWeight:600,marginRight:4,display:'inline-block'}}>{t}</span>)}</td>
                      <td style={{padding:'0.85rem 1rem',fontSize:'0.85rem'}}>{p.scheduledDate?new Date(p.scheduledDate).toLocaleDateString('en-IN'):'-'}</td>
                      <td style={{padding:'0.85rem 1rem',fontSize:'0.82rem',color:'#6b7280',textTransform:'capitalize'}}>{p.timeSlot||'-'}</td>
                      <td style={{padding:'0.85rem 1rem'}}><span style={{background:st.bg,color:st.color,padding:'3px 10px',borderRadius:100,fontSize:'0.7rem',fontWeight:700,textTransform:'capitalize'}}>{p.status}</span></td>
                      <td style={{padding:'0.85rem 1rem',fontSize:'0.82rem',color:'#6b7280'}}>{p.collector?.fullName||'Not assigned'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Schedule Pickup ──────────────────────────────────────────
function ScheduleTab({ onSuccess }) {
  const [step,    setStep]    = useState(1);
  const [types,   setTypes]   = useState([]);
  const [date,    setDate]    = useState('');
  const [slot,    setSlot]    = useState('morning');
  const [qty,     setQty]     = useState('small');
  const [address, setAddress] = useState('');
  const [notes,   setNotes]   = useState('');
  const [qrCode,  setQrCode]  = useState('');
  const [loading, setLoading] = useState(false);

  const toggle = (t) => setTypes(s=>s.includes(t)?s.filter(x=>x!==t):[...s,t]);
  const wasteTypes = [
    {id:'organic',   icon:'🥬',label:'Organic',    tip:'Food & garden waste',   color:'#dcfce7'},
    {id:'recyclable',icon:'♻️',label:'Recyclable', tip:'Paper, plastic, glass', color:'#dbeafe'},
    {id:'e-waste',   icon:'💻',label:'E-Waste',    tip:'Electronics, batteries',color:'#fef9c3'},
    {id:'hazardous', icon:'⚠️',label:'Hazardous',  tip:'Chemicals, paints',     color:'#fee2e2'},
    {id:'bulky',     icon:'🪑',label:'Bulky',      tip:'Furniture, appliances', color:'#f3f4f6'},
  ];

  const submit = async () => {
    setLoading(true);
    try {
      const r = await schedulePickup({ wasteTypes:types, scheduledDate:date, timeSlot:slot, quantity:qty, address, specialInstructions:notes });
      setQrCode(r.data.pickup?.qrCode || r.data.qrCode || 'ECO-' + Date.now());
      setStep(4);
    } catch(e) { alert('Error: '+( e.response?.data?.message || e.message)); }
    setLoading(false);
  };

  const inp = {width:'100%',padding:'0.65rem 0.9rem',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:'0.875rem',background:'#f9fafb',outline:'none',marginTop:4};
  const steps = ['Select Waste','Date & Time','Location','Confirm'];

  return (
    <div style={{maxWidth:800,margin:'0 auto'}}>
      {/* Stepper */}
      <div style={{display:'flex',alignItems:'center',marginBottom:'2.5rem',gap:'0',background:'#fff',borderRadius:12,padding:'1.2rem',border:'1px solid #e5e7eb',overflowX:'auto'}}>
        {steps.map((s,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',flex:i<3?1:'auto'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',whiteSpace:'nowrap'}}>
              <div style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.875rem',background:step>i+1?'#16a34a':step===i+1?'#16a34a':'#e5e7eb',color:step>=i+1?'#fff':'#9ca3af',transition:'all 0.3s'}}>{step>i+1?'✓':i+1}</div>
              <span style={{fontSize:'0.72rem',marginTop:4,fontWeight:step===i+1?700:400,color:step===i+1?'#16a34a':'#9ca3af'}}>{s}</span>
            </div>
            {i<3 && <div style={{flex:1,height:2,background:step>i+1?'#16a34a':'#e5e7eb',margin:'0 0.5rem',marginBottom:20,transition:'background 0.3s'}}/>}
          </div>
        ))}
      </div>

      {step===1 && (
        <div>
          <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'0.5rem'}}>What types of waste do you have?</h2>
          <p style={{color:'#6b7280',fontSize:'0.875rem',marginBottom:'1.5rem'}}>Select all that apply. You earn 5 eco points per scheduled pickup!</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.9rem',marginBottom:'2rem'}}>
            {wasteTypes.map(t=>(
              <div key={t.id} onClick={()=>toggle(t.id)} style={{border:'2px solid',borderColor:types.includes(t.id)?'#16a34a':'#e5e7eb',borderRadius:12,padding:'1.2rem 0.5rem',textAlign:'center',cursor:'pointer',background:types.includes(t.id)?'#f0fdf4':'#fff',transition:'all 0.2s',position:'relative'}}>
                {types.includes(t.id) && <div style={{position:'absolute',top:4,right:4,width:18,height:18,borderRadius:'50%',background:'#16a34a',color:'#fff',fontSize:'0.6rem',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800}}>✓</div>}
                <div style={{fontSize:'2rem',marginBottom:6}}>{t.icon}</div>
                <div style={{fontSize:'0.8rem',fontWeight:700,color:'#14532d'}}>{t.label}</div>
                <div style={{fontSize:'0.65rem',color:'#6b7280',marginTop:2,lineHeight:1.3}}>{t.tip}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button onClick={()=>types.length?setStep(2):alert('Please select at least one waste type')} style={{padding:'0.75rem 2rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer'}}>Next: Choose Time →</button>
          </div>
        </div>
      )}

      {step===2 && (
        <div>
          <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'1.5rem'}}>When should we collect?</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
            <div>
              <label style={{display:'block',fontWeight:700,fontSize:'0.8rem',marginBottom:4}}>Preferred Date *</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={inp} />
              <label style={{display:'block',fontWeight:700,fontSize:'0.8rem',marginTop:'1rem',marginBottom:8}}>Time Slot</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem'}}>
                {[['morning','🌅','Morning','6AM–10AM'],['afternoon','☀️','Afternoon','12PM–4PM'],['evening','🌙','Evening','5PM–8PM']].map(([id,ic,lb,t])=>(
                  <div key={id} onClick={()=>setSlot(id)} style={{border:'2px solid',borderColor:slot===id?'#16a34a':'#e5e7eb',borderRadius:10,padding:'0.75rem 0.25rem',textAlign:'center',cursor:'pointer',background:slot===id?'#f0fdf4':'#fff'}}>
                    <div style={{fontSize:'1.3rem'}}>{ic}</div>
                    <div style={{fontSize:'0.75rem',fontWeight:700}}>{lb}</div>
                    <div style={{fontSize:'0.65rem',color:'#6b7280'}}>{t}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={{display:'block',fontWeight:700,fontSize:'0.8rem',marginBottom:4}}>Estimated Quantity</label>
              <select value={qty} onChange={e=>setQty(e.target.value)} style={inp}>
                <option value="small">Small (1–2 bags)</option>
                <option value="medium">Medium (3–5 bags)</option>
                <option value="large">Large (6–10 bags)</option>
                <option value="bulk">Bulk (truck needed)</option>
              </select>
              <div style={{marginTop:'1rem',background:'#f0fdf4',borderRadius:10,padding:'1rem',fontSize:'0.82rem',color:'#14532d',lineHeight:1.7}}>
                <strong>Selected waste types:</strong><br/>
                {types.map(t=><span key={t} style={{display:'inline-block',background:'#dcfce7',padding:'2px 8px',borderRadius:100,fontSize:'0.7rem',fontWeight:600,marginRight:4,marginTop:4,textTransform:'capitalize'}}>{t}</span>)}
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:'1rem',justifyContent:'flex-end',marginTop:'2rem'}}>
            <button onClick={()=>setStep(1)} style={{padding:'0.75rem 1.5rem',background:'#fff',border:'1.5px solid #16a34a',color:'#16a34a',borderRadius:8,fontWeight:700,cursor:'pointer'}}>← Back</button>
            <button onClick={()=>date?setStep(3):alert('Please select a date')} style={{padding:'0.75rem 2rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer'}}>Next: Location →</button>
          </div>
        </div>
      )}

      {step===3 && (
        <div style={{maxWidth:560}}>
          <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'1.5rem'}}>Where should we collect from?</h2>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',fontWeight:700,fontSize:'0.8rem',marginBottom:4}}>Pickup Address *</label>
            <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="e.g. 12, Rose Garden, Koregaon Park, Pune 411001" style={{...inp,height:46}} />
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block',fontWeight:700,fontSize:'0.8rem',marginBottom:4}}>Special Instructions (optional)</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Gate code, landmark, fragile items, special handling..." style={{...inp,resize:'vertical'}} />
          </div>
          <div style={{background:'#f0fdf4',borderRadius:10,padding:'1rem',fontSize:'0.82rem',color:'#14532d',marginBottom:'1.5rem',lineHeight:1.7}}>
            📋 <strong>Summary:</strong> {types.join(', ')} pickup on {date ? new Date(date).toDateString() : '—'} ({slot})
          </div>
          <div style={{display:'flex',gap:'1rem',justifyContent:'flex-end'}}>
            <button onClick={()=>setStep(2)} style={{padding:'0.75rem 1.5rem',background:'#fff',border:'1.5px solid #16a34a',color:'#16a34a',borderRadius:8,fontWeight:700,cursor:'pointer'}}>← Back</button>
            <button onClick={()=>address?submit():alert('Please enter your address')} disabled={loading} style={{padding:'0.75rem 2rem',background:loading?'#86efac':'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer'}}>{loading?'⏳ Booking...':'✅ Confirm Booking'}</button>
          </div>
        </div>
      )}

      {step===4 && (
        <div style={{maxWidth:480,margin:'0 auto',textAlign:'center',padding:'2rem 0'}}>
          <div style={{fontSize:'4rem',marginBottom:'1rem'}}>🎉</div>
          <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'0.5rem'}}>Pickup Confirmed!</h2>
          <p style={{color:'#6b7280',marginBottom:'1.5rem'}}>Your request has been submitted. A collector will be assigned shortly and you will be notified.</p>
          <div style={{background:'#f0fdf4',border:'2px dashed #22c55e',borderRadius:12,padding:'1.5rem',marginBottom:'1.5rem'}}>
            <div style={{fontWeight:800,color:'#14532d',marginBottom:'0.5rem'}}>📦 Chain of Custody QR Code</div>
            <div style={{fontFamily:'monospace',fontSize:'1.1rem',fontWeight:800,color:'#16a34a',letterSpacing:'0.05em',margin:'0.5rem 0'}}>{qrCode}</div>
            <div style={{fontSize:'0.75rem',color:'#6b7280'}}>Show this at each waste transfer point. You earned +5 Eco Points! 🌿</div>
          </div>
          <div style={{display:'flex',gap:'1rem',justifyContent:'center'}}>
            <button onClick={onSuccess} style={{padding:'0.75rem 1.5rem',background:'#fff',border:'1.5px solid #16a34a',color:'#16a34a',borderRadius:8,fontWeight:700,cursor:'pointer'}}>Go to Dashboard</button>
            <button onClick={()=>{setStep(1);setTypes([]);setDate('');setAddress('');setNotes('');}} style={{padding:'0.75rem 1.5rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer'}}>Schedule Another</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Classify Waste ───────────────────────────────────────────
function ClassifyTab() {
  const [result, setResult] = useState(null);
  const mockResults = [
    { category:'E-Waste', icon:'💻', color:'#fef9c3', confidence:94, instructions:['Do NOT put in regular bins','Remove battery if possible','Schedule an E-Waste pickup','Or visit nearest drop point'] },
    { category:'Organic', icon:'🥬', color:'#dcfce7', confidence:97, instructions:['Use a compostable bag','Keep separate from dry waste','Schedule organic pickup for composting','Can also be home composted'] },
    { category:'Recyclable', icon:'♻️', color:'#dbeafe', confidence:91, instructions:['Rinse containers before disposal','Flatten cardboard boxes','Sort: paper / plastic / glass / metal','Place in blue recycling bin'] },
    { category:'Hazardous', icon:'⚠️', color:'#fee2e2', confidence:88, instructions:['Do NOT mix with other waste','Use sealed containers','Schedule a Hazardous Waste pickup','Keep away from children'] },
  ];

  const analyze = () => setResult(mockResults[Math.floor(Math.random()*mockResults.length)]);

  return (
    <div>
      <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'0.5rem'}}>🧠 AI Waste Classifier</h2>
      <p style={{color:'#6b7280',fontSize:'0.875rem',marginBottom:'1.5rem'}}>Upload a photo of your waste — AI identifies the type and provides disposal instructions instantly.</p>

      {!result ? (
        <div onClick={analyze} style={{border:'2.5px dashed #22c55e',borderRadius:16,padding:'4rem 2rem',textAlign:'center',cursor:'pointer',background:'#f0fdf4',transition:'all 0.2s',maxWidth:600}} onMouseEnter={e=>{e.currentTarget.style.background='#dcfce7'}} onMouseLeave={e=>{e.currentTarget.style.background='#f0fdf4'}}>
          <div style={{fontSize:'3.5rem',marginBottom:'1rem'}}>📸</div>
          <div style={{fontSize:'1rem',fontWeight:800,color:'#14532d',marginBottom:'0.5rem'}}>Drag & drop or click to upload</div>
          <div style={{fontSize:'0.82rem',color:'#6b7280',marginBottom:'1.5rem'}}>Supports JPG, PNG, WEBP — Max 10MB<br/><em>(Demo: click anywhere to simulate AI analysis)</em></div>
          <button style={{padding:'0.65rem 1.5rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:'0.875rem'}}>📁 Choose Photo</button>
        </div>
      ) : (
        <div>
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,padding:'0.75rem 1rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'0.5rem',fontWeight:700,color:'#14532d',fontSize:'0.875rem'}}>
            ✅ Analysis Complete! You earned +5 Eco Points 🌿
            <button onClick={()=>setResult(null)} style={{marginLeft:'auto',padding:'0.3rem 0.75rem',background:'#fff',border:'1.5px solid #16a34a',color:'#16a34a',borderRadius:6,fontWeight:700,cursor:'pointer',fontSize:'0.75rem'}}>Try Another</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:'1.5rem',maxWidth:750}}>
            <div style={{borderRadius:12,overflow:'hidden',background:`linear-gradient(135deg,${result.color},#fff)`,display:'flex',alignItems:'center',justifyContent:'center',minHeight:200,fontSize:'7rem'}}>{result.icon}</div>
            <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',borderTop:'3px solid #16a34a',padding:'1.5rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem'}}>
                <span style={{background:result.color,padding:'4px 12px',borderRadius:100,fontSize:'0.75rem',fontWeight:700}}>{result.category}</span>
                <span style={{fontSize:'0.75rem',color:'#6b7280'}}>Confidence: <strong style={{color:'#16a34a'}}>{result.confidence}%</strong></span>
              </div>
              <h3 style={{fontWeight:800,color:'#14532d',marginBottom:'0.75rem'}}>{result.category} Waste Detected</h3>
              <div style={{fontWeight:700,fontSize:'0.82rem',marginBottom:'0.5rem',color:'#374151'}}>Disposal Instructions:</div>
              <ul style={{listStyle:'none'}}>
                {result.instructions.map((ins,i)=>(
                  <li key={i} style={{padding:'0.4rem 0',borderBottom:'1px solid #f0fdf4',fontSize:'0.82rem',display:'flex',alignItems:'flex-start',gap:'0.5rem'}}><span style={{color:'#16a34a',fontWeight:700,flexShrink:0}}>→</span>{ins}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Drop Points ──────────────────────────────────────────────
function DropPointsTab() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    getDropPoints().then(r=>setPoints(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const typeColors = { 'Recycling Center':'#dbeafe','E-Waste Drop':'#fef9c3','Organic Waste':'#dcfce7','Hazardous':'#fee2e2' };

  return (
    <div>
      <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'0.5rem'}}>🗺️ Find Drop Points</h2>
      <p style={{color:'#6b7280',fontSize:'0.875rem',marginBottom:'1.5rem'}}>Locate the nearest waste collection and drop-off points in your area.</p>
      <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'2rem',textAlign:'center',marginBottom:'1.5rem',height:200,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'0.5rem'}}>
        <div style={{fontSize:'2.5rem'}}>🗺️</div>
        <div style={{fontWeight:700,color:'#14532d'}}>Interactive Map</div>
        <div style={{fontSize:'0.82rem',color:'#6b7280'}}>Integrate Google Maps or Leaflet.js for live map view</div>
      </div>
      {loading ? <div style={{color:'#6b7280',textAlign:'center'}}>Loading...</div> : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'1rem'}}>
          {points.map(p=>(
            <div key={p._id} style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1.2rem',borderTop:'3px solid #16a34a'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                <div style={{fontWeight:700,color:'#14532d'}}>{p.name}</div>
                <span style={{background:typeColors[p.type]||'#f3f4f6',padding:'2px 8px',borderRadius:100,fontSize:'0.68rem',fontWeight:600,whiteSpace:'nowrap'}}>{p.type}</span>
              </div>
              <div style={{fontSize:'0.78rem',color:'#6b7280',marginBottom:'0.5rem'}}>📍 {p.address}</div>
              <div style={{fontSize:'0.78rem',color:'#6b7280',marginBottom:'0.5rem'}}>🕐 {p.hours}</div>
              <div style={{fontSize:'0.75rem',color:'#16a34a',fontWeight:600,marginBottom:'0.75rem'}}>📏 {p.distance}</div>
              <div style={{fontSize:'0.72rem',color:'#374151'}}><strong>Accepts: </strong>{p.accepts.join(', ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Report Issue ─────────────────────────────────────────────
function ReportTab({ onSuccess }) {
  const [form, setForm] = useState({ issueType:'Overflowing Bin',address:'',severity:'low',description:'' });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inp = {width:'100%',padding:'0.65rem 0.9rem',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:'0.875rem',background:'#f9fafb',outline:'none',marginTop:4};

  const submit = async () => {
    if (!form.address) return alert('Please enter the location of the issue');
    setLoading(true);
    try {
      await submitReport(form);
      onSuccess();
    } catch(e) { alert(e.response?.data?.message || 'Error submitting report'); }
    setLoading(false);
  };

  return (
    <div style={{maxWidth:600}}>
      <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'0.5rem'}}>🚨 Report a Waste Issue</h2>
      <p style={{color:'#6b7280',fontSize:'0.875rem',marginBottom:'1.5rem'}}>All reports are tracked and resolved by the municipal team. You earn +10 Eco Points per report!</p>
      <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1.5rem'}}>
        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block',fontWeight:700,fontSize:'0.8rem',marginBottom:4}}>Issue Type *</label>
          <select value={form.issueType} onChange={e=>set('issueType',e.target.value)} style={inp}>
            {['Overflowing Bin','Illegal Dumping','Missed Pickup','Damaged Bin','Bad Odor','Blocked Road','Other'].map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block',fontWeight:700,fontSize:'0.8rem',marginBottom:4}}>Location / Address *</label>
          <input value={form.address} onChange={e=>set('address',e.target.value)} placeholder="Enter street address or landmark" style={inp} />
        </div>
        <div style={{marginBottom:'1rem'}}>
          <label style={{display:'block',fontWeight:700,fontSize:'0.8rem',marginBottom:8}}>Severity Level</label>
          <div style={{display:'flex',gap:'1.5rem'}}>
            {[['low','🟢','Low — Minor issue'],['medium','🟠','Medium — Needs attention'],['high','🔴','High — Urgent']].map(([id,ic,lb])=>(
              <label key={id} style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.875rem',cursor:'pointer',fontWeight:form.severity===id?700:400}}>
                <input type="radio" name="sev" checked={form.severity===id} onChange={()=>set('severity',id)} style={{accentColor:'#16a34a',width:16,height:16}} />
                {ic} {lb}
              </label>
            ))}
          </div>
        </div>
        <div style={{marginBottom:'1.5rem'}}>
          <label style={{display:'block',fontWeight:700,fontSize:'0.8rem',marginBottom:4}}>Description</label>
          <textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={4} placeholder="Describe the issue in detail — what you see, how long it has been there, any additional context..." style={{...inp,resize:'vertical'}} />
        </div>
        <button onClick={submit} disabled={loading} style={{padding:'0.75rem 2rem',background:loading?'#86efac':'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.9rem'}}>
          {loading?'⏳ Submitting...':'🚨 Submit Report (+10 pts)'}
        </button>
      </div>
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────
function LeaderboardTab({ leaders, userId }) {
  const medals = ['🥇','🥈','🥉'];
  return (
    <div>
      <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'0.5rem'}}>🏆 Eco Points Leaderboard</h2>
      <p style={{color:'#6b7280',fontSize:'0.875rem',marginBottom:'1.5rem'}}>See who is leading the sustainability movement in your community!</p>
      <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead style={{background:'#f0fdf4'}}>
            <tr>{['Rank','Citizen','Level','Eco Points'].map(h=>(
              <th key={h} style={{padding:'0.75rem 1.2rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'#6b7280',borderBottom:'1px solid #e5e7eb',textTransform:'uppercase',letterSpacing:'0.04em'}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {leaders.map((l,i)=>(
              <tr key={l._id} style={{borderBottom:'1px solid #f3f4f6',background:l._id===userId?'#f0fdf4':'transparent'}}>
                <td style={{padding:'0.9rem 1.2rem',fontWeight:700,fontSize:'1rem'}}>{i<3?medals[i]:i+1}</td>
                <td style={{padding:'0.9rem 1.2rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                    <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#14532d,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'0.85rem',flexShrink:0}}>{l.fullName?.charAt(0)}</div>
                    <div>
                      <div style={{fontWeight:l._id===userId?800:600,fontSize:'0.875rem'}}>{l.fullName}{l._id===userId?' (You)':''}</div>
                      <div style={{fontSize:'0.72rem',color:'#6b7280'}}>{l.neighbourhood||'Community'}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'0.9rem 1.2rem'}}><span style={{background:'#dcfce7',color:'#14532d',fontSize:'0.72rem',fontWeight:700,padding:'3px 10px',borderRadius:100}}>{l.level}</span></td>
                <td style={{padding:'0.9rem 1.2rem',fontWeight:800,color:'#16a34a',fontSize:'1rem'}}>{l.ecoPoints.toLocaleString()} pts</td>
              </tr>
            ))}
            {leaders.length===0&&<tr><td colSpan={4} style={{padding:'3rem',textAlign:'center',color:'#6b7280'}}>No data yet. Be the first to earn eco points!</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
