
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { getDeclarations, getListings, getMyListings, declareWaste, createListing, deleteListing, getESGData, getCompliance } from '../../utils/api';

export default function IndustryDashboard() {
  const nav = useNavigate();
  const { user, logout } = useAuthStore();
  const [tab,        setTab]        = useState('overview');
  const [declarations,setDeclarations]=useState([]);
  const [listings,   setListings]   = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [esg,        setEsg]        = useState(null);
  const [compliance, setCompliance] = useState([]);
  const [loading,    setLoading]    = useState(true);

  // Declare form
  const [declForm, setDeclForm] = useState({wasteCategory:'Industrial Waste',wasteSubType:'',volumeKg:'',packagingType:'Bagged',hazardLevel:'none',preferredDate:'',notes:''});
  const [declResult,setDeclResult]=useState(null);
  const [declLoading,setDeclLoading]=useState(false);

  // Listing form
  const [listForm, setListForm] = useState({materialType:'Paper',quantityKg:'',pricePerKg:'',minOrderKg:'10',location:'',description:''});
  const [listLoading,setListLoading]=useState(false);
  const [listFilter,setListFilter]=useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [d,l,ml,e,c] = await Promise.allSettled([getDeclarations(),getListings(),getMyListings(),getESGData(),getCompliance()]);
      if(d.status==='fulfilled') setDeclarations(d.value.data);
      if(l.status==='fulfilled') setListings(l.value.data);
      if(ml.status==='fulfilled') setMyListings(ml.value.data);
      if(e.status==='fulfilled') setEsg(e.value.data);
      if(c.status==='fulfilled') setCompliance(c.value.data);
    } finally { setLoading(false); }
  },[]);

  useEffect(()=>{ loadData(); },[]);

  const handleLogout = () => { logout(); nav('/'); };
  const setD = (k,v) => setDeclForm(f=>({...f,[k]:v}));
  const setL = (k,v) => setListForm(f=>({...f,[k]:v}));

  const submitDeclaration = async () => {
    if (!declForm.volumeKg||!declForm.preferredDate) return alert('Volume and preferred date are required');
    setDeclLoading(true);
    try {
      const r = await declareWaste(declForm);
      setDeclResult(r.data);
      setDeclarations(ds=>[r.data,...ds]);
    } catch(e) { alert(e.response?.data?.message||'Error submitting declaration'); }
    setDeclLoading(false);
  };

  const submitListing = async () => {
    if (!listForm.quantityKg||!listForm.pricePerKg) return alert('Quantity and price are required');
    setListLoading(true);
    try {
      const r = await createListing(listForm);
      setMyListings(ml=>[r.data,...ml]);
      setListings(l=>[r.data,...l]);
      setListForm({materialType:'Paper',quantityKg:'',pricePerKg:'',minOrderKg:'10',location:'',description:''});
      alert('Listing created successfully!');
    } catch(e) { alert(e.response?.data?.message||'Error creating listing'); }
    setListLoading(false);
  };

  const handleDeleteListing = async (id) => {
    if(!confirm('Delete this listing?')) return;
    try {
      await deleteListing(id);
      setMyListings(ml=>ml.filter(l=>l._id!==id));
      setListings(l=>l.filter(x=>x._id!==id));
    } catch(e) { alert(e.response?.data?.message||'Error'); }
  };

  const inp = {width:'100%',padding:'0.65rem 0.9rem',border:'1.5px solid #e5e7eb',borderRadius:8,fontSize:'0.875rem',background:'#f9fafb',outline:'none',marginTop:4};
  const lbl = {display:'block',fontSize:'0.78rem',fontWeight:700,color:'#374151'};
  const fg  = {marginBottom:'1rem'};
  const statusColor = { pending:{bg:'#fef9c3',c:'#854d0e'}, confirmed:{bg:'#dbeafe',c:'#1d4ed8'}, collected:{bg:'#dcfce7',c:'#14532d'}, certified:{bg:'#d1fae5',c:'#065f46'} };
  const matIcon = {Paper:'📦',Metal:'🔩',Plastic:'🧴',Glass:'🪟',Rubber:'⚽',Other:'♻️'};

  const navItems = [
    {id:'overview',   icon:'🏠',label:'Overview'},
    {id:'declare',    icon:'📋',label:'Declare Waste'},
    {id:'marketplace',icon:'♻️',label:'Marketplace'},
    {id:'esg',        icon:'📈',label:'ESG Reports'},
    {id:'compliance', icon:'⚠️',label:'Compliance'},
  ];

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f8fafc',fontFamily:'Plus Jakarta Sans,sans-serif'}}>
      {/* Sidebar */}
      <div style={{width:240,background:'#fff',borderRight:'1px solid #e5e7eb',position:'fixed',top:0,left:0,bottom:0,display:'flex',flexDirection:'column',zIndex:50}}>
        <div style={{padding:'1.2rem',borderBottom:'1px solid #e5e7eb'}}>
          <div style={{fontWeight:800,color:'#14532d',fontSize:'1rem',marginBottom:'1rem',cursor:'pointer'}} onClick={()=>nav('/')}>🌿 EcoConnect</div>
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#92400e,#f97316)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:'1rem',flexShrink:0}}>{user?.companyName?.charAt(0)||user?.fullName?.charAt(0)||'I'}</div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:'0.78rem',fontWeight:700,color:'#14532d',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.companyName||user?.fullName}</div>
              <span style={{background:'#fff7ed',color:'#c2410c',fontSize:'0.65rem',fontWeight:700,padding:'1px 7px',borderRadius:100}}>Industry</span>
            </div>
          </div>
          <div style={{marginTop:'1rem',background:'#fff7ed',borderRadius:8,padding:'0.75rem',textAlign:'center'}}>
            <div style={{fontSize:'0.65rem',color:'#92400e',fontWeight:700,textTransform:'uppercase',marginBottom:4}}>Compliance Score</div>
            <div style={{fontSize:'1.4rem',fontWeight:800,color:user?.complianceScore>=80?'#16a34a':'#ef4444'}}>{user?.complianceScore||100}%</div>
            <div style={{fontSize:'0.68rem',color:user?.complianceScore>=80?'#16a34a':'#ef4444',fontWeight:600,marginTop:2}}>
              {user?.complianceScore>=80?'✓ Good Standing':'⚠️ Needs Attention'}
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:'0.75rem',overflowY:'auto'}}>
          {navItems.map(item=>(
            <div key={item.id} onClick={()=>setTab(item.id)} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.6rem 0.75rem',borderRadius:8,cursor:'pointer',marginBottom:2,background:tab===item.id?'#fff7ed':'transparent',color:tab===item.id?'#f97316':'#6b7280',fontWeight:tab===item.id?700:500,fontSize:'0.875rem',transition:'all 0.15s'}}>
              <span>{item.icon}</span>{item.label}
            </div>
          ))}
        </nav>
        <div style={{padding:'0.75rem',borderTop:'1px solid #e5e7eb'}}>
          <button onClick={handleLogout} style={{width:'100%',padding:'0.6rem',background:'none',border:'none',cursor:'pointer',color:'#6b7280',fontSize:'0.85rem',textAlign:'left',borderRadius:8,display:'flex',alignItems:'center',gap:'0.5rem'}}>🚪 Log Out</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{marginLeft:240,flex:1}}>
        <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 2rem',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:40}}>
          <div style={{fontWeight:800,color:'#14532d',fontSize:'1.1rem'}}>{navItems.find(n=>n.id===tab)?.icon} {navItems.find(n=>n.id===tab)?.label}</div>
          {tab==='overview'&&<button onClick={()=>setTab('declare')} style={{padding:'0.5rem 1.2rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.85rem'}}>+ Declare Waste</button>}
          {tab==='marketplace'&&<button onClick={()=>setTab('declare')} style={{padding:'0.5rem 1.2rem',background:'#f97316',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.85rem'}}>+ New Listing</button>}
        </div>

        <div style={{padding:'2rem'}} className="fade-in">

          {/* OVERVIEW */}
          {tab==='overview' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
                {loading ? Array(4).fill(0).map((_,i)=><div key={i} style={{background:'#f3f4f6',borderRadius:12,height:110}}/>)
                : [
                  [declarations.reduce((s,d)=>s+d.volumeKg,0)+' kg','Waste Declared','🏭','#f97316'],
                  [myListings.length+' active','My Listings','♻️','#16a34a'],
                  [(user?.complianceScore||100)+'%','Compliance','📊','#3b82f6'],
                  [declarations.filter(d=>d.status==='collected').length,'Pickups Done','✅','#16a34a'],
                ].map(([v,l,ic,cl])=>(
                  <div key={l} style={{background:'#fff',borderRadius:12,padding:'1.4rem',border:'1px solid #e5e7eb',borderTop:`3px solid ${cl}`}}>
                    <div style={{fontSize:'1.5rem',marginBottom:6}}>{ic}</div>
                    <div style={{fontSize:'1.6rem',fontWeight:800,color:'#14532d'}}>{v}</div>
                    <div style={{fontSize:'0.72rem',color:'#6b7280',textTransform:'uppercase',marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{fontWeight:800,color:'#14532d',marginBottom:'0.75rem',fontSize:'0.95rem'}}>📋 Recent Declarations</div>
              <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',overflow:'auto'}}>
                {declarations.length===0 ? (
                  <div style={{padding:'3rem',textAlign:'center',color:'#6b7280'}}>
                    <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>📋</div>
                    <div style={{fontWeight:700,marginBottom:'0.5rem'}}>No declarations yet</div>
                    <button onClick={()=>setTab('declare')} style={{padding:'0.6rem 1.4rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer'}}>Declare Your First Waste</button>
                  </div>
                ) : (
                  <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
                    <thead style={{background:'#fff7ed'}}>
                      <tr>{['Category','Volume (kg)','Hazard','Pickup Date','Status','QR Code'].map(h=>(
                        <th key={h} style={{padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'#6b7280',borderBottom:'1px solid #e5e7eb',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {declarations.map(d=>{
                        const sc = statusColor[d.status]||{bg:'#f3f4f6',c:'#374151'};
                        return (
                          <tr key={d._id} style={{borderBottom:'1px solid #f3f4f6'}}>
                            <td style={{padding:'0.85rem 1rem'}}><span style={{background:'#fff7ed',color:'#c2410c',padding:'2px 8px',borderRadius:100,fontSize:'0.72rem',fontWeight:600}}>{d.wasteCategory}</span></td>
                            <td style={{padding:'0.85rem 1rem',fontWeight:700,color:'#14532d'}}>{d.volumeKg}</td>
                            <td style={{padding:'0.85rem 1rem'}}><span style={{background:d.hazardLevel==='high'?'#fee2e2':d.hazardLevel==='medium'?'#ffedd5':d.hazardLevel==='low'?'#fef9c3':'#dcfce7',padding:'2px 8px',borderRadius:100,fontSize:'0.7rem',fontWeight:600,textTransform:'capitalize'}}>{d.hazardLevel}</span></td>
                            <td style={{padding:'0.85rem 1rem',fontSize:'0.82rem',color:'#6b7280',whiteSpace:'nowrap'}}>{d.preferredDate?new Date(d.preferredDate).toLocaleDateString('en-IN'):'TBD'}</td>
                            <td style={{padding:'0.85rem 1rem'}}><span style={{background:sc.bg,color:sc.c,padding:'2px 8px',borderRadius:100,fontSize:'0.7rem',fontWeight:600,textTransform:'capitalize'}}>{d.status}</span></td>
                            <td style={{padding:'0.85rem 1rem',fontFamily:'monospace',fontSize:'0.72rem',color:'#16a34a',letterSpacing:'0.03em'}}>{d.qrCode}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* DECLARE WASTE */}
          {tab==='declare' && (
            <div style={{maxWidth:700}}>
              <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'0.5rem'}}>📋 Declare Waste for Pickup</h2>
              <p style={{color:'#6b7280',fontSize:'0.875rem',marginBottom:'1.5rem'}}>Submit a certified waste declaration. A licensed collector will be assigned within 2 hours.</p>

              {!declResult ? (
                <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1.5rem'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                    <div style={fg}><label style={lbl}>Waste Category *</label>
                      <select value={declForm.wasteCategory} onChange={e=>setD('wasteCategory',e.target.value)} style={inp}>
                        {['Industrial Waste','Chemical Waste','Recyclable Material','Construction Debris','Biomedical Waste','Food Processing Waste','Electronic Waste','Textile Waste'].map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={fg}><label style={lbl}>Sub-Type / Description</label><input value={declForm.wasteSubType} onChange={e=>setD('wasteSubType',e.target.value)} placeholder="e.g. Metal Scrap, Solvent Waste" style={inp} /></div>
                    <div style={fg}><label style={lbl}>Volume (kg) *</label><input type="number" value={declForm.volumeKg} onChange={e=>setD('volumeKg',e.target.value)} placeholder="e.g. 450" style={inp} min="1" /></div>
                    <div style={fg}><label style={lbl}>Packaging Type</label>
                      <select value={declForm.packagingType} onChange={e=>setD('packagingType',e.target.value)} style={inp}>
                        {['Bagged','Drummed','Loose','Containerized','Palletized'].map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={fg}>
                    <label style={lbl}>Hazard Level</label>
                    <div style={{display:'flex',gap:'1.5rem',marginTop:8,flexWrap:'wrap'}}>
                      {[['none','🟢','None'],['low','🟡','Low'],['medium','🟠','Medium'],['high','🔴','High']].map(([id,ic,lb])=>(
                        <label key={id} style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.875rem',cursor:'pointer',fontWeight:declForm.hazardLevel===id?700:400}}>
                          <input type="radio" name="haz" checked={declForm.hazardLevel===id} onChange={()=>setD('hazardLevel',id)} style={{accentColor:'#f97316',width:16,height:16}} />{ic} {lb}
                        </label>
                      ))}
                    </div>
                    {declForm.hazardLevel==='high'&&<div style={{marginTop:'0.75rem',background:'#fff7ed',border:'1px solid #f97316',borderRadius:8,padding:'0.75rem',fontSize:'0.82rem',color:'#92400e'}}>⚠️ High hazard waste requires a specially certified collector and proper containment. Ensure safety data sheets are available.</div>}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                    <div style={fg}><label style={lbl}>Preferred Pickup Date *</label><input type="date" value={declForm.preferredDate} onChange={e=>setD('preferredDate',e.target.value)} min={new Date().toISOString().split('T')[0]} style={inp} /></div>
                  </div>
                  <div style={fg}><label style={lbl}>Additional Notes</label><textarea value={declForm.notes} onChange={e=>setD('notes',e.target.value)} rows={3} placeholder="Special handling instructions, access notes, safety precautions..." style={{...inp,resize:'vertical'}} /></div>
                  <div style={{display:'flex',gap:'1rem',marginTop:'0.5rem'}}>
                    <button onClick={submitDeclaration} disabled={declLoading} style={{padding:'0.75rem 1.5rem',background:declLoading?'#86efac':'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.9rem'}}>{declLoading?'⏳ Submitting...':'✅ Submit Declaration'}</button>
                    <button style={{padding:'0.75rem 1.5rem',background:'#fff',border:'1.5px solid #6b7280',color:'#6b7280',borderRadius:8,fontWeight:700,cursor:'pointer'}}>💾 Save Draft</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{background:'#f0fdf4',border:'1px solid #22c55e',borderRadius:8,padding:'1rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'0.75rem',fontWeight:700,color:'#14532d'}}>
                    <span style={{fontSize:'1.5rem'}}>✅</span>
                    Declaration submitted! A certified collector will be assigned within 2 hours.
                  </div>
                  <div style={{background:'#f0fdf4',border:'2px dashed #22c55e',borderRadius:12,padding:'2rem',textAlign:'center'}}>
                    <div style={{fontWeight:800,color:'#14532d',fontSize:'1rem',marginBottom:'0.5rem'}}>📦 Chain of Custody QR Code</div>
                    <div style={{fontFamily:'monospace',fontSize:'1.2rem',fontWeight:800,color:'#16a34a',letterSpacing:'0.1em',margin:'0.75rem 0'}}>{declResult.qrCode}</div>
                    <div style={{fontSize:'0.78rem',color:'#6b7280',marginBottom:'1.5rem'}}>Present this code at each waste transfer checkpoint. Keep for compliance records.</div>
                    <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
                      <button onClick={()=>{setDeclResult(null);setDeclForm({wasteCategory:'Industrial Waste',wasteSubType:'',volumeKg:'',packagingType:'Bagged',hazardLevel:'none',preferredDate:'',notes:''});}} style={{padding:'0.65rem 1.3rem',background:'#fff',border:'1.5px solid #16a34a',color:'#16a34a',borderRadius:8,fontWeight:700,cursor:'pointer'}}>+ New Declaration</button>
                      <button onClick={()=>setTab('overview')} style={{padding:'0.65rem 1.3rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer'}}>Go to Overview</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MARKETPLACE */}
          {tab==='marketplace' && (
            <div>
              <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'0.5rem'}}>♻️ Recyclables Marketplace</h2>
              <p style={{color:'#6b7280',fontSize:'0.875rem',marginBottom:'1.5rem'}}>Buy and sell recyclable materials. Connect with verified buyers and sellers.</p>

              {/* Create Listing Form */}
              <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1.5rem',marginBottom:'1.5rem'}}>
                <div style={{fontWeight:800,color:'#14532d',marginBottom:'1rem',fontSize:'0.9rem'}}>+ Create New Listing</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.75rem',alignItems:'end',flexWrap:'wrap'}}>
                  <div><label style={lbl}>Material</label>
                    <select value={listForm.materialType} onChange={e=>setL('materialType',e.target.value)} style={inp}>
                      {['Paper','Metal','Plastic','Glass','Rubber','Textile','Other'].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Qty (kg) *</label><input type="number" value={listForm.quantityKg} onChange={e=>setL('quantityKg',e.target.value)} placeholder="e.g. 500" style={inp} min="1" /></div>
                  <div><label style={lbl}>Price/kg (₹) *</label><input type="number" value={listForm.pricePerKg} onChange={e=>setL('pricePerKg',e.target.value)} placeholder="e.g. 8" style={inp} min="0.1" /></div>
                  <div><label style={lbl}>Location</label><input value={listForm.location} onChange={e=>setL('location',e.target.value)} placeholder="City, State" style={inp} /></div>
                  <button onClick={submitListing} disabled={listLoading} style={{padding:'0.65rem',background:listLoading?'#86efac':'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',marginTop:4}}>{listLoading?'Creating...':'+ List'}</button>
                </div>
                <div style={{marginTop:'0.75rem'}}><label style={lbl}>Description (optional)</label><input value={listForm.description} onChange={e=>setL('description',e.target.value)} placeholder="Material quality, purity, certifications..." style={{...inp,marginTop:4,width:'100%'}} /></div>
              </div>

              {/* Browse Listings */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'0.5rem'}}>
                <div style={{fontWeight:800,color:'#14532d',fontSize:'0.95rem'}}>All Active Listings ({listings.length})</div>
                <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                  {['All','Paper','Metal','Plastic','Glass','Rubber'].map(m=>(
                    <button key={m} onClick={()=>getListings(m==='All'?{}:{materialType:m}).then(r=>setListings(r.data)).catch(()=>{})} style={{padding:'0.3rem 0.75rem',background:'#fff',border:'1.5px solid #e5e7eb',borderRadius:100,fontWeight:600,cursor:'pointer',fontSize:'0.75rem',color:'#6b7280'}}>{m}</button>
                  ))}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'1rem'}}>
                {listings.map(l=>(
                  <div key={l._id} style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1.3rem',transition:'box-shadow 0.2s'}} onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'} onMouseLeave={e=>e.currentTarget.style.boxShadow=''}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.75rem'}}>
                      <span style={{fontSize:'2.2rem'}}>{matIcon[l.materialType]||'♻️'}</span>
                      <span style={{background:'#f0fdf4',color:'#14532d',fontSize:'0.68rem',fontWeight:700,padding:'2px 8px',borderRadius:100,alignSelf:'flex-start'}}>Active</span>
                    </div>
                    <div style={{fontWeight:700,color:'#14532d',marginBottom:2}}>{l.materialType} {l.subType?`— ${l.subType}`:''}</div>
                    <div style={{fontSize:'0.75rem',color:'#6b7280',marginBottom:'0.75rem'}}>{l.seller?.companyName||'Verified Seller'} • {l.location||'India'}</div>
                    <div style={{fontSize:'1.3rem',fontWeight:800,color:'#16a34a'}}>₹{l.pricePerKg}/kg</div>
                    <div style={{fontSize:'0.75rem',color:'#6b7280',marginBottom:'1rem'}}>{l.quantityKg.toLocaleString()} kg available • Min {l.minOrderKg||10}kg</div>
                    {l.description&&<div style={{fontSize:'0.72rem',color:'#374151',marginBottom:'1rem',lineHeight:1.5,background:'#f9fafb',borderRadius:6,padding:'0.5rem'}}>{l.description}</div>}
                    <div style={{display:'flex',gap:'0.5rem'}}>
                      <button style={{flex:1,padding:'0.5rem',background:'#fff',border:'1.5px solid #16a34a',color:'#16a34a',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.78rem'}}>Contact</button>
                      <button style={{flex:1,padding:'0.5rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.78rem'}}>Order</button>
                    </div>
                  </div>
                ))}
                {listings.length===0&&<div style={{gridColumn:'1/-1',padding:'3rem',textAlign:'center',color:'#6b7280',background:'#fff',borderRadius:12,border:'1px solid #e5e7eb'}}><div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>🏪</div><div style={{fontWeight:700}}>No active listings yet. Create the first one above!</div></div>}
              </div>
            </div>
          )}

          {/* ESG REPORTS */}
          {tab==='esg' && (
            <div>
              <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'0.5rem'}}>📈 ESG & Sustainability Reports</h2>
              <p style={{color:'#6b7280',fontSize:'0.875rem',marginBottom:'1.5rem'}}>Track your environmental impact and download compliance certificates.</p>

              {esg?.recyclingRate>=75&&(
                <div style={{background:'linear-gradient(135deg,#14532d,#16a34a)',borderRadius:12,padding:'1.5rem',color:'#fff',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'1.5rem'}}>
                  <div style={{fontSize:'3rem',flexShrink:0}}>🏆</div>
                  <div><div style={{fontWeight:800,fontSize:'1.1rem'}}>Certified Eco Industry ♻</div><div style={{opacity:0.85,marginTop:'0.25rem',fontSize:'0.875rem'}}>Your recycling rate of {esg.recyclingRate}% exceeds the 75% Green Certification threshold!</div></div>
                  <button style={{marginLeft:'auto',padding:'0.6rem 1.2rem',background:'#fff',color:'#14532d',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.82rem',flexShrink:0}}>Download Certificate</button>
                </div>
              )}

              {loading ? <div style={{color:'#6b7280'}}>Loading ESG data...</div> : esg && (
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
                    {[
                      ['🌍',esg.co2Saved+' T','CO₂ Saved','#16a34a'],
                      ['♻️',esg.recyclingRate+'%','Recycling Rate','#3b82f6'],
                      ['🏭',esg.totalWaste+' kg','Total Waste','#f97316'],
                      ['✅',esg.recycledWaste+' kg','Recycled','#16a34a'],
                    ].map(([ic,v,l,cl])=>(
                      <div key={l} style={{background:'#fff',borderRadius:12,padding:'1.4rem',border:'1px solid #e5e7eb',borderTop:`3px solid ${cl}`}}>
                        <div style={{fontSize:'1.5rem',marginBottom:6}}>{ic}</div>
                        <div style={{fontSize:'1.6rem',fontWeight:800,color:'#14532d'}}>{v}</div>
                        <div style={{fontSize:'0.72rem',color:'#6b7280',textTransform:'uppercase',marginTop:2}}>{l}</div>
                      </div>
                    ))}
                  </div>

                  {esg.monthly?.length>0&&(
                    <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1.5rem',marginBottom:'1.5rem'}}>
                      <div style={{fontWeight:800,color:'#14532d',marginBottom:'1rem'}}>📅 Monthly Recycling Performance (12 months)</div>
                      <div style={{display:'flex',gap:'0.4rem',alignItems:'flex-end',height:120,padding:'0 0.5rem'}}>
                        {esg.monthly.map((m,i)=>{
                          const max=Math.max(...esg.monthly.map(x=>x.declared),1);
                          return (
                            <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                              <div style={{width:'100%',background:'#dcfce7',borderRadius:'4px 4px 0 0',height:Math.max(4,(m.declared/max)*90)+'px',position:'relative'}}>
                                <div style={{position:'absolute',bottom:0,left:0,right:0,background:'#16a34a',borderRadius:'4px 4px 0 0',height:m.declared>0?Math.max(2,(m.recycled/m.declared)*100)+'%':'0'}}/>
                              </div>
                              <div style={{fontSize:'0.55rem',color:'#9ca3af',whiteSpace:'nowrap'}}>{m.month}</div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{display:'flex',gap:'1rem',marginTop:'0.5rem',fontSize:'0.72rem',color:'#6b7280'}}>
                        <span style={{display:'flex',alignItems:'center',gap:'0.3rem'}}><span style={{display:'inline-block',width:10,height:10,background:'#dcfce7',borderRadius:2}}/> Declared</span>
                        <span style={{display:'flex',alignItems:'center',gap:'0.3rem'}}><span style={{display:'inline-block',width:10,height:10,background:'#16a34a',borderRadius:2}}/> Recycled/Certified</span>
                      </div>
                    </div>
                  )}

                  <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1.5rem',textAlign:'center',color:'#6b7280'}}>
                    <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📄</div>
                    <div style={{fontWeight:700,marginBottom:'0.5rem'}}>Generate Full ESG Report</div>
                    <div style={{fontSize:'0.875rem',marginBottom:'1rem'}}>Download a detailed PDF report with waste analytics, compliance status, and CO₂ offset certificates.</div>
                    <button style={{padding:'0.65rem 1.5rem',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer'}}>📥 Download PDF Report</button>
                  </div>
                </div>
              )}
              {!esg&&!loading&&<div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'3rem',textAlign:'center',color:'#6b7280'}}><div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>📊</div>Declare waste and complete pickups to generate your ESG report.</div>}
            </div>
          )}

          {/* COMPLIANCE */}
          {tab==='compliance' && (
            <div>
              <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'0.5rem'}}>⚠️ Compliance Alerts</h2>
              <p style={{color:'#6b7280',fontSize:'0.875rem',marginBottom:'1.5rem'}}>Monitor your compliance status and take action on any pending issues.</p>
              {compliance.length===0&&<div style={{background:'#f0fdf4',border:'2px solid #22c55e',borderRadius:12,padding:'2.5rem',textAlign:'center'}}><div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>✅</div><div style={{fontWeight:700,color:'#14532d',fontSize:'1.1rem'}}>All Compliant</div><div style={{color:'#6b7280',marginTop:'0.5rem'}}>No active compliance issues. Keep up the great work!</div></div>}
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {compliance.map((a,i)=>(
                  <div key={i} style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',borderLeft:'4px solid',borderLeftColor:a.type==='violation'?'#ef4444':a.type==='warning'?'#f97316':'#16a34a',padding:'1.2rem',display:'flex',alignItems:'flex-start',gap:'1rem'}}>
                    <span style={{fontSize:'1.4rem',flexShrink:0}}>{a.type==='violation'?'🔴':a.type==='warning'?'🟠':'🟢'}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:'#14532d',marginBottom:2}}>{a.title}</div>
                      <div style={{fontSize:'0.82rem',color:'#6b7280',lineHeight:1.6}}>{a.message}</div>
                    </div>
                    <button onClick={()=>setTab(a.action==='Download Certificate'?'esg':'declare')} style={{padding:'0.5rem 1rem',background:a.type==='violation'?'#ef4444':a.type==='warning'?'#f97316':'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:'0.78rem',whiteSpace:'nowrap',flexShrink:0}}>{a.action}</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
