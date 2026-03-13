import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { 
  getAllRequests, assignCollector, updateReqStatus, getFleet, 
  getAnalytics, getComplaints, resolveComplaint, 
  getRecyclableInventory, updateRecyclableInventory 
} from '../../utils/api';

const statusStyle = { pending:{bg:'#fef9c3',color:'#854d0e'}, confirmed:{bg:'#dbeafe',color:'#1d4ed8'}, 'en-route':{bg:'#ffedd5',color:'#c2410c'}, collected:{bg:'#dcfce7',color:'#14532d'}, cancelled:{bg:'#fee2e2',color:'#991b1b'} };
const wasteColors = { organic:'#dcfce7',recyclable:'#dbeafe','e-waste':'#fef9c3',hazardous:'#fee2e2',bulky:'#f3f4f6' };

export default function GovtDashboard() {
  const nav = useNavigate();
  const { user, logout } = useAuthStore();
  const [tab,        setTab]        = useState('overview');
  const [requests,   setRequests]   = useState([]);
  const [analytics,  setAnalytics]  = useState({});
  const [complaints, setComplaints] = useState([]);
  const [fleet,      setFleet]      = useState([]);
  const [inventory,  setInventory]  = useState([]); // New state for inventory
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading,    setLoading]    = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [r,a,c,f,i] = await Promise.allSettled([
        getAllRequests(),
        getAnalytics(),
        getComplaints(),
        getFleet(),
        getRecyclableInventory() // Fetch inventory on load
      ]);
      if(r.status==='fulfilled') setRequests(r.value.data);
      if(a.status==='fulfilled') setAnalytics(a.value.data);
      if(c.status==='fulfilled') setComplaints(c.value.data);
      if(f.status==='fulfilled') setFleet(f.value.data);
      if(i.status==='fulfilled') setInventory(i.value.data);
    } finally { setLoading(false); }
  },[]);

  useEffect(()=>{ loadData(); },[]);

  // Refetch inventory specifically when that tab is selected
  useEffect(() => {
    if (tab === 'recyclable-list') {
      getRecyclableInventory().then(res => setInventory(res.data));
    }
  }, [tab]);

  const handleLogout = () => { logout(); nav('/'); };

  const handleAssign = async (requestId) => {
    if (fleet.length===0) return alert('No collectors available.');
    const c = fleet[0];
    try {
      await assignCollector(requestId, c._id);
      setRequests(rs=>rs.map(r=>r._id===requestId?{...r,status:'confirmed',collector:{fullName:c.fullName}}:r));
    } catch(e) { alert(e.response?.data?.message||'Error assigning collector'); }
  };

  const handleStatusChange = async (requestId, status) => {
    try {
      await updateReqStatus(requestId, status);
      setRequests(rs=>rs.map(r=>r._id===requestId?{...r,status}:r));
      if(status==='collected') setAnalytics(a=>({...a,completed:(a.completed||0)+1,pending:Math.max(0,(a.pending||1)-1)}));
    } catch(e) { alert(e.response?.data?.message||'Error'); }
  };

  const handleResolve = async (id) => {
    try {
      await resolveComplaint(id);
      setComplaints(cs=>cs.map(c=>c._id===id?{...c,status:'resolved'}:c));
    } catch(e) { alert(e.response?.data?.message||'Error'); }
  };

  // New handler for updating inventory
  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      itemName: formData.get('itemName'),
      quantity: formData.get('quantity'),
      unit: formData.get('unit'),
    };

    try {
      // 1. Send to backend
      await updateRecyclableInventory(data);

      // 2. Fetch the fresh list immediately
      const res = await getRecyclableInventory();
      setInventory(res.data);

      // 3. Clear form and notify
      e.target.reset();
      alert('Item added/updated in inventory!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Could not update inventory'));
    }
  };

  const tabs = [
    {id:'overview',   icon:'🏠', label:'Overview'},
    {id:'requests',   icon:'📋', label:'Requests'},
    {id:'recyclable-list', icon:'📦', label:'Waste Inventory'}, // New Tab added to list
    {id:'fleet',      icon:'🚛', label:'Fleet'},
    {id:'complaints', icon:'🚨', label:'Complaints'},
    {id:'analytics',  icon:'📊', label:'Analytics'},
  ];

  const filtered = filterStatus==='all' ? requests : requests.filter(r=>r.status===filterStatus);

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',fontFamily:'Plus Jakarta Sans,sans-serif'}}>
      {/* Topbar */}
      <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 1.5rem',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,gap:'1rem'}}>
        <div style={{fontWeight:800,color:'#14532d',fontSize:'1rem',cursor:'pointer',flexShrink:0}} onClick={()=>nav('/')}>🌿 EcoConnect</div>
        <div style={{display:'flex',gap:'0.25rem',overflowX:'auto',flex:1,justifyContent:'center'}}>
          {tabs.map(t=>(
            <div key={t.id} onClick={()=>setTab(t.id)} style={{padding:'0.5rem 1rem',borderRadius:8,cursor:'pointer',fontSize:'0.82rem',fontWeight:600,background:tab===t.id?'#16a34a':'transparent',color:tab===t.id?'#fff':'#6b7280',transition:'all 0.2s',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'0.3rem'}}>
              {t.icon} {t.label}
            </div>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexShrink:0}}>
          <span style={{background:'#dbeafe',color:'#1d4ed8',fontSize:'0.68rem',fontWeight:700,padding:'3px 10px',borderRadius:100,whiteSpace:'nowrap'}}>🏛️ {user?.department||'Govt Admin'}</span>
          <button onClick={handleLogout} style={{padding:'0.45rem 0.9rem',background:'#fff',border:'1.5px solid #e5e7eb',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:'0.82rem',color:'#374151'}}>Logout</button>
        </div>
      </div>

      <div style={{padding:'2rem'}} className="fade-in">
        {/* OVERVIEW */}
        {tab==='overview' && (
          <div>
            <h2 style={{fontWeight:800,color:'#14532d',marginBottom:'1.5rem'}}>📊 Operations Overview</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
              {loading ? Array(4).fill(0).map((_,i)=><div key={i} style={{background:'#f3f4f6',borderRadius:12,height:110}}/>)
              : [
                [fleet.length,'Collectors',   '🚛','#3b82f6'],
                [analytics.pending||0,'Pending',  '📋','#f97316'],
                [analytics.completed||0,'Completed','✅','#16a34a'],
                [(analytics.recyclingRate||0)+'%','Recycling Rate','♻️','#16a34a'],
              ].map(([v,l,ic,cl])=>(
                <div key={l} style={{background:'#fff',borderRadius:12,padding:'1.4rem',border:'1px solid #e5e7eb',borderTop:`3px solid ${cl}`}}>
                  <div style={{fontSize:'1.5rem',marginBottom:6}}>{ic}</div>
                  <div style={{fontSize:'1.8rem',fontWeight:800,color:'#14532d'}}>{v}</div>
                  <div style={{fontSize:'0.72rem',color:'#6b7280',textTransform:'uppercase',marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:'1.5rem'}}>
              <div>
                <div style={{fontWeight:800,color:'#14532d',marginBottom:'0.75rem',fontSize:'0.95rem'}}>⏳ Pending Requests</div>
                <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',overflow:'hidden'}}>
                  {requests.filter(r=>r.status==='pending').slice(0,6).map(req=>(
                    <div key={req._id} style={{padding:'1rem',borderBottom:'1px solid #f3f4f6',display:'flex',alignItems:'center',gap:'0.75rem'}}>
                      <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#14532d,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'0.85rem',flexShrink:0}}>{req.citizen?.fullName?.charAt(0)||'C'}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:'0.875rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{req.citizen?.fullName||'Citizen'}</div>
                        <div style={{fontSize:'0.72rem',color:'#6b7280',marginTop:1}}>{req.wasteTypes?.join(', ')} • {req.address?.slice(0,35)}{req.address?.length>35?'...':''}</div>
                      </div>
                      <button onClick={()=>handleAssign(req._id)} style={{padding:'0.4rem 0.9rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.75rem',flexShrink:0}}>Assign</button>
                    </div>
                  ))}
                  {requests.filter(r=>r.status==='pending').length===0 && <div style={{padding:'2.5rem',textAlign:'center',color:'#6b7280'}}><div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🎉</div>No pending requests!</div>}
                </div>
              </div>

              <div>
                <div style={{fontWeight:800,color:'#14532d',marginBottom:'0.75rem',fontSize:'0.95rem'}}>📈 Quick Stats</div>
                <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1.2rem'}}>
                  {[['Total Requests',analytics.total||0],['En Route',analytics.enRoute||0],['Confirmed',analytics.confirmed||0],['Completed Today',analytics.completed||0],['Citizens',analytics.citizens||0],['Complaints',analytics.complaints||0],['Resolved',analytics.resolved||0]].map(([l,v])=>(
                    <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.6rem 0',borderBottom:'1px solid #f3f4f6',fontSize:'0.85rem'}}>
                      <span style={{color:'#6b7280'}}>{l}</span><strong style={{color:'#14532d'}}>{v}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REQUESTS */}
        {tab==='requests' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
              <h2 style={{fontWeight:800,color:'#14532d'}}>📋 All Pickup Requests</h2>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                {['all','pending','confirmed','en-route','collected','cancelled'].map(s=>(
                  <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:'0.4rem 0.9rem',background:filterStatus===s?'#16a34a':'#fff',color:filterStatus===s?'#fff':'#6b7280',border:'1.5px solid',borderColor:filterStatus===s?'#16a34a':'#e5e7eb',borderRadius:100,fontWeight:600,cursor:'pointer',fontSize:'0.75rem',textTransform:'capitalize'}}>{s} {s!=='all'&&<span style={{fontSize:'0.68rem'}}>({requests.filter(r=>r.status===s).length})</span>}</button>
                ))}
              </div>
            </div>
            <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:750}}>
                <thead style={{background:'#f0fdf4'}}>
                  <tr>{['Citizen','Waste Types','Date','Address','Status','Collector','Actions'].map(h=>(
                    <th key={h} style={{padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'#6b7280',borderBottom:'1px solid #e5e7eb',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filtered.map(req=>{
                    const st = statusStyle[req.status]||{bg:'#f3f4f6',color:'#374151'};
                    return (
                      <tr key={req._id} style={{borderBottom:'1px solid #f3f4f6'}}>
                        <td style={{padding:'0.85rem 1rem',fontWeight:600,fontSize:'0.85rem',whiteSpace:'nowrap'}}>{req.citizen?.fullName||'Unknown'}</td>
                        <td style={{padding:'0.85rem 1rem'}}>{req.wasteTypes?.map(t=><span key={t} style={{background:wasteColors[t]||'#f3f4f6',padding:'2px 7px',borderRadius:100,fontSize:'0.68rem',fontWeight:600,marginRight:3,display:'inline-block',textTransform:'capitalize'}}>{t}</span>)}</td>
                        <td style={{padding:'0.85rem 1rem',fontSize:'0.82rem',whiteSpace:'nowrap'}}>{req.scheduledDate?new Date(req.scheduledDate).toLocaleDateString('en-IN'):'-'}</td>
                        <td style={{padding:'0.85rem 1rem',fontSize:'0.78rem',color:'#6b7280',maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{req.address}</td>
                        <td style={{padding:'0.85rem 1rem'}}><span style={{background:st.bg,color:st.color,padding:'3px 10px',borderRadius:100,fontSize:'0.68rem',fontWeight:700,textTransform:'capitalize',whiteSpace:'nowrap'}}>{req.status}</span></td>
                        <td style={{padding:'0.85rem 1rem',fontSize:'0.82rem',color:'#6b7280'}}>{req.collector?.fullName||'—'}</td>
                        <td style={{padding:'0.85rem 1rem'}}>
                          <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
                            {req.status==='pending'&&<button onClick={()=>handleAssign(req._id)} style={{padding:'0.35rem 0.75rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:6,fontWeight:700,cursor:'pointer',fontSize:'0.72rem'}}>Assign</button>}
                            {req.status==='confirmed'&&<button onClick={()=>handleStatusChange(req._id,'en-route')} style={{padding:'0.35rem 0.75rem',background:'#f97316',color:'#fff',border:'none',borderRadius:6,fontWeight:700,cursor:'pointer',fontSize:'0.72rem'}}>En Route</button>}
                            {req.status==='en-route'&&<button onClick={()=>handleStatusChange(req._id,'collected')} style={{padding:'0.35rem 0.75rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:6,fontWeight:700,cursor:'pointer',fontSize:'0.72rem'}}>Collected</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length===0 && <div style={{padding:'3rem',textAlign:'center',color:'#6b7280'}}>No requests found for this filter.</div>}
            </div>
          </div>
        )}

        {/* RECYCLABLE WASTE INVENTORY - MERGED COMPONENT */}
        {tab === 'recyclable-list' && (
          <div style={{ padding: '0px' }}>
            <h2 style={{ color: '#14532d', fontWeight: 800, marginBottom: '1.5rem' }}>📦 Manage Recyclable Waste Inventory</h2>
            
            {/* Update Form */}
            <form onSubmit={handleUpdateInventory} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e5e7eb', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Item Name</label>
                <input name="itemName" required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #e5e7eb', outline: 'none' }} placeholder="e.g. Plastic Bottles" />
              </div>
              <div style={{ width: '120px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Quantity</label>
                <input name="quantity" type="number" required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #e5e7eb', outline: 'none' }} />
              </div>
              <div style={{ width: '120px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Unit</label>
                <input name="unit" required style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #e5e7eb', outline: 'none' }} placeholder="kg / tons" />
              </div>
              <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>Update List</button>
            </form>

            {/* Inventory Table */}
            <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f0fdf4' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' }}>Material</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' }}>Current Quantity</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' }}>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>{item.itemName}</td>
                      <td style={{ padding: '1rem', fontWeight: 800, color: '#16a34a', fontSize: '1rem' }}>{item.quantity}</td>
                      <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>{item.unit}</td>
                    </tr>
                  ))}
                  {inventory.length === 0 && <tr><td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No inventory recorded yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FLEET */}
        {tab==='fleet' && (
          <div>
            <h2 style={{fontWeight:800,color:'#14532d',marginBottom:'1.5rem'}}>🚛 Fleet Management</h2>
            <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
                <thead style={{background:'#f0fdf4'}}>
                  <tr>{['Collector','Department','Zone','Employee ID','Active Jobs','Completed'].map(h=>(
                    <th key={h} style={{padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'#6b7280',borderBottom:'1px solid #e5e7eb',textTransform:'uppercase',letterSpacing:'0.04em'}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {fleet.map(c=>(
                    <tr key={c._id} style={{borderBottom:'1px solid #f3f4f6'}}>
                      <td style={{padding:'0.9rem 1rem'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.65rem'}}>
                          <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#1d4ed8,#3b82f6)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'0.85rem',flexShrink:0}}>{c.fullName?.charAt(0)}</div>
                          <div><div style={{fontWeight:700,fontSize:'0.875rem'}}>{c.fullName}</div><div style={{fontSize:'0.72rem',color:'#6b7280'}}>{c.email}</div></div>
                        </div>
                      </td>
                      <td style={{padding:'0.9rem 1rem',fontSize:'0.85rem'}}>{c.department||'Solid Waste Mgmt'}</td>
                      <td style={{padding:'0.9rem 1rem'}}><span style={{background:'#eff6ff',color:'#1d4ed8',padding:'2px 8px',borderRadius:100,fontSize:'0.72rem',fontWeight:600}}>{c.zone||'General'}</span></td>
                      <td style={{padding:'0.9rem 1rem',fontSize:'0.82rem',fontFamily:'monospace',color:'#6b7280'}}>{c.employeeId||'—'}</td>
                      <td style={{padding:'0.9rem 1rem',fontWeight:700,color:'#f97316'}}>{c.activeRequests||0}</td>
                      <td style={{padding:'0.9rem 1rem',fontWeight:700,color:'#16a34a'}}>{c.completedRequests||0}</td>
                    </tr>
                  ))}
                  {fleet.length===0 && <tr><td colSpan={6} style={{padding:'3rem',textAlign:'center',color:'#6b7280'}}>No collectors registered yet. Add government accounts to see fleet here.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COMPLAINTS */}
        {tab==='complaints' && (
          <div>
            <h2 style={{fontWeight:800,color:'#14532d',marginBottom:'1.5rem'}}>🚨 Citizen Complaints</h2>
            <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:650}}>
                <thead style={{background:'#f0fdf4'}}>
                  <tr>{['Citizen','Issue Type','Location','Severity','Status','Reported','Action'].map(h=>(
                    <th key={h} style={{padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'#6b7280',borderBottom:'1px solid #e5e7eb',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {complaints.map(c=>(
                    <tr key={c._id} style={{borderBottom:'1px solid #f3f4f6'}}>
                      <td style={{padding:'0.9rem 1rem',fontWeight:600,fontSize:'0.875rem'}}>{c.citizen?.fullName||'Unknown'}</td>
                      <td style={{padding:'0.9rem 1rem',fontSize:'0.85rem'}}>{c.issueType}</td>
                      <td style={{padding:'0.9rem 1rem',fontSize:'0.78rem',color:'#6b7280',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.address||'—'}</td>
                      <td style={{padding:'0.9rem 1rem'}}><span style={{background:c.severity==='high'?'#fee2e2':c.severity==='medium'?'#ffedd5':'#dcfce7',color:c.severity==='high'?'#991b1b':c.severity==='medium'?'#c2410c':'#14532d',padding:'2px 8px',borderRadius:100,fontSize:'0.7rem',fontWeight:700,textTransform:'capitalize'}}>{c.severity}</span></td>
                      <td style={{padding:'0.9rem 1rem'}}>
                        <div style={{display:'flex',flexDirection:'column',gap:2}}>
                          <span style={{background:c.status==='resolved'?'#dcfce7':'#fef9c3',color:c.status==='resolved'?'#14532d':'#854d0e',padding:'2px 8px',borderRadius:100,fontSize:'0.7rem',fontWeight:700,textTransform:'capitalize',display:'inline-block'}}>{c.status}</span>
                          {c.isEscalated&&<span style={{background:'#fee2e2',color:'#991b1b',padding:'1px 6px',borderRadius:100,fontSize:'0.65rem',fontWeight:700,display:'inline-block'}}>⚠️ ESCALATED</span>}
                        </div>
                      </td>
                      <td style={{padding:'0.9rem 1rem',fontSize:'0.75rem',color:'#6b7280',whiteSpace:'nowrap'}}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{padding:'0.9rem 1rem'}}>
                        {c.status!=='resolved'&&<button onClick={()=>handleResolve(c._id)} style={{padding:'0.35rem 0.8rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:6,fontWeight:700,cursor:'pointer',fontSize:'0.72rem',whiteSpace:'nowrap'}}>✓ Resolve</button>}
                      </td>
                    </tr>
                  ))}
                  {complaints.length===0 && <tr><td colSpan={7} style={{padding:'3rem',textAlign:'center',color:'#6b7280'}}><div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🎉</div>No complaints filed!</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {tab==='analytics' && (
          <div>
            <h2 style={{fontWeight:800,color:'#14532d',marginBottom:'1.5rem'}}>📊 Analytics & Reports</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
              {[
                [analytics.total||0,'Total Requests','📋','#16a34a'],
                [analytics.completed||0,'Completed','✅','#16a34a'],
                [(analytics.recyclingRate||0)+'%','Recycling Rate','♻️','#3b82f6'],
                [(analytics.complaintResolutionRate||0)+'%','Resolution Rate','🎯','#f97316'],
              ].map(([v,l,ic,cl])=>(
                <div key={l} style={{background:'#fff',borderRadius:12,padding:'1.4rem',border:'1px solid #e5e7eb',borderTop:`3px solid ${cl}`}}>
                  <div style={{fontSize:'1.5rem',marginBottom:6}}>{ic}</div>
                  <div style={{fontSize:'1.8rem',fontWeight:800,color:'#14532d'}}>{v}</div>
                  <div style={{fontSize:'0.72rem',color:'#6b7280',textTransform:'uppercase',marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>

            {analytics.wasteTypes?.length>0 && (
              <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1.5rem',marginBottom:'1.5rem'}}>
                <div style={{fontWeight:800,color:'#14532d',marginBottom:'1rem'}}>♻️ Waste Type Breakdown</div>
                <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                  {analytics.wasteTypes.map(w=>(
                    <div key={w._id} style={{background:wasteColors[w._id]||'#f3f4f6',borderRadius:8,padding:'0.75rem 1.2rem',textAlign:'center'}}>
                      <div style={{fontWeight:800,fontSize:'1.2rem',color:'#14532d'}}>{w.count}</div>
                      <div style={{fontSize:'0.72rem',color:'#6b7280',textTransform:'capitalize',marginTop:2}}>{w._id}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analytics.dailyPickups?.length>0 && (
              <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1.5rem'}}>
                <div style={{fontWeight:800,color:'#14532d',marginBottom:'1rem'}}>📅 Daily Pickups (Last 7 Days)</div>
                <div style={{display:'flex',gap:'0.5rem',alignItems:'flex-end',height:100}}>
                  {analytics.dailyPickups.map((d,i)=>{
                    const max=Math.max(...analytics.dailyPickups.map(x=>x.count),1);
                    return (
                      <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                        <div style={{fontSize:'0.65rem',color:'#6b7280',fontWeight:700}}>{d.count}</div>
                        <div style={{width:'100%',background:'#16a34a',borderRadius:'4px 4px 0 0',height:Math.max(8,(d.count/max)*70)+'px',transition:'height 0.5s'}}/>
                        <div style={{fontSize:'0.6rem',color:'#9ca3af',whiteSpace:'nowrap'}}>{d._id?.slice(5)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}