import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { 
  getDeclarations, getListings, getMyListings, declareWaste, 
  createListing, deleteListing, getESGData, getCompliance,
  getAvailableMaterials // Added new API call
} from '../../utils/api';

export default function IndustryDashboard() {
  const nav = useNavigate();
  const { user, logout } = useAuthStore();
  const [tab,        setTab]        = useState('overview');
  const [declarations,setDeclarations]=useState([]);
  const [listings,   setListings]   = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [materials,  setMaterials]  = useState([]); // New state for Govt Waste
  const [esg,        setEsg]        = useState(null);
  const [compliance, setCompliance] = useState([]);
  const [loading,    setLoading]    = useState(true);

  // Form states
  const [declForm, setDeclForm] = useState({wasteCategory:'Industrial Waste',wasteSubType:'',volumeKg:'',packagingType:'Bagged',hazardLevel:'none',preferredDate:'',notes:''});
  const [declResult,setDeclResult]=useState(null);
  const [declLoading,setDeclLoading]=useState(false);
  const [listForm, setListForm] = useState({materialType:'Paper',quantityKg:'',pricePerKg:'',minOrderKg:'10',location:'',description:''});
  const [listLoading,setListLoading]=useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [d,l,ml,e,c,am] = await Promise.allSettled([
        getDeclarations(),
        getListings(),
        getMyListings(),
        getESGData(),
        getCompliance(),
        getAvailableMaterials() // Load initial data
      ]);
      if(d.status==='fulfilled') setDeclarations(d.value.data);
      if(l.status==='fulfilled') setListings(l.value.data);
      if(ml.status==='fulfilled') setMyListings(ml.value.data);
      if(e.status==='fulfilled') setEsg(e.value.data);
      if(c.status==='fulfilled') setCompliance(c.value.data);
      if(am.status==='fulfilled') setMaterials(am.value.data);
    } finally { setLoading(false); }
  },[]);

  useEffect(()=>{ loadData(); },[loadData]);

  // Fetch government available waste when tab changes
  useEffect(() => {
    if (tab === 'available-waste') {
      getAvailableMaterials().then(res => setMaterials(res.data)).catch(err => console.error(err));
    }
  }, [tab]);

  const handleLogout = () => { logout(); nav('/'); };
  const setD = (k,v) => setDeclForm(f=>({...f,[k]:v}));
  const setL = (k,v) => setListForm(f=>({...f,[k]:v}));

  const handleRequest = (itemName) => {
    alert(`Request for ${itemName} has been sent to the Government authority.`);
  };

  const handleComplianceAction = (action) => {
    const normalized = String(action || '').toLowerCase();
    if (normalized.includes('view esg')) return setTab('esg');
    if (normalized.includes('schedule')) return setTab('declare');
    if (normalized.includes('track')) return setTab('overview');
    alert(`${action} feature will be available soon.`);
  };

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
    {id:'available-waste', icon:'📦', label:'Available Waste'}, // New Shared Option
    {id:'marketplace',icon:'♻️',label:'Marketplace'},
    {id:'esg',        icon:'📈',label:'ESG Reports'},
    {id:'compliance', icon:'⚠️',label:'Compliance'},
  ];

  const today = new Date().toISOString().split('T')[0];
  const totalDeclaredKg = declarations.reduce((sum, item) => sum + Number(item.volumeKg || 0), 0);
  const activeListingsCount = myListings.filter((item) => item.status === 'active').length;
  const pendingDeclarations = declarations.filter((item) => item.status === 'pending').length;
  const maxMonthlyValue = Math.max(
    1,
    ...(Array.isArray(esg?.monthly)
      ? esg.monthly.map((m) => Math.max(Number(m.declared || 0), Number(m.recycled || 0)))
      : [1])
  );

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
        </div>
        <nav style={{flex:1,padding:'0.75rem',overflowY:'auto'}}>
          {navItems.map(item=>(
            <div key={item.id} onClick={()=>setTab(item.id)} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.6rem 0.75rem',borderRadius:8,cursor:'pointer',marginBottom:2,background:tab===item.id?'#fff7ed':'transparent',color:tab===item.id?'#f97316':'#6b7280',fontWeight:tab===item.id?700:500,fontSize:'0.875rem',transition:'all 0.15s'}}>
              <span>{item.icon}</span>{item.label}
            </div>
          ))}
        </nav>
        <div style={{padding:'0.75rem',borderTop:'1px solid #e5e7eb'}}>
          <button onClick={handleLogout} style={{width:'100%',padding:'0.6rem',background:'none',border:'none',cursor:'pointer',color:'#6b7280',fontSize:'0.85rem',textAlign:'left',borderRadius:8,display:'flex',alignItems:'center',gap:'0.5rem'}}>Log Out</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{marginLeft:240,flex:1}}>
        <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 2rem',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:40}}>
          <div style={{fontWeight:800,color:'#14532d',fontSize:'1.1rem'}}>{navItems.find(n=>n.id===tab)?.icon} {navItems.find(n=>n.id===tab)?.label}</div>
        </div>

        <div style={{padding:'2rem'}} className="fade-in">
          {tab==='overview' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
                {[
                  [declarations.length,'Declarations','📄','#f97316'],
                  [`${Math.round(totalDeclaredKg)} kg`,'Declared Waste','⚖️','#3b82f6'],
                  [activeListingsCount,'Active Listings','🏷️','#16a34a'],
                  [`${esg?.recyclingRate ?? 0}%`,'Recycling Rate','♻️','#14532d'],
                ].map(([value,label,icon,color]) => (
                  <div key={label} style={{background:'#fff',borderRadius:12,padding:'1.2rem',border:'1px solid #e5e7eb',borderTop:`3px solid ${color}`}}>
                    <div style={{fontSize:'1.4rem',marginBottom:6}}>{icon}</div>
                    <div style={{fontSize:'1.6rem',fontWeight:800,color:'#14532d'}}>{value}</div>
                    <div style={{fontSize:'0.72rem',color:'#6b7280',textTransform:'uppercase',marginTop:2}}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',gap:'0.75rem',marginBottom:'1.5rem'}}>
                {[
                  ['declare','📝 Declare New Waste','linear-gradient(135deg,#92400e,#f97316)'],
                  ['marketplace','🛒 Manage Listings','linear-gradient(135deg,#0f766e,#14b8a6)'],
                  ['available-waste','📦 Browse Govt Inventory','linear-gradient(135deg,#14532d,#16a34a)'],
                  ['esg','📈 View ESG Report','linear-gradient(135deg,#1d4ed8,#3b82f6)'],
                ].map(([id,label,bg]) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    style={{background:bg,color:'#fff',border:'none',padding:'0.95rem 1rem',borderRadius:10,fontWeight:700,fontSize:'0.82rem',cursor:'pointer',textAlign:'left'}}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',gap:'1rem'}}>
                <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',overflow:'auto'}}>
                  <div style={{padding:'1rem',fontWeight:800,color:'#14532d',borderBottom:'1px solid #e5e7eb'}}>📋 Recent Declarations</div>
                  {declarations.length === 0 ? (
                    <div style={{padding:'2rem',textAlign:'center',color:'#6b7280'}}>No declarations yet. Create your first declaration from the Declare Waste tab.</div>
                  ) : (
                    <table style={{width:'100%',borderCollapse:'collapse',minWidth:560}}>
                      <thead style={{background:'#fff7ed'}}>
                        <tr>
                          {['Category','Volume','Preferred Date','Status'].map((header) => (
                            <th key={header} style={{padding:'0.7rem 0.9rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'#6b7280',textTransform:'uppercase',borderBottom:'1px solid #e5e7eb'}}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {declarations.slice(0,8).map((item) => {
                          const st = statusColor[item.status] || { bg:'#f3f4f6', c:'#374151' };
                          return (
                            <tr key={item._id} style={{borderBottom:'1px solid #f3f4f6'}}>
                              <td style={{padding:'0.8rem 0.9rem',fontSize:'0.85rem',fontWeight:600}}>{item.wasteCategory}</td>
                              <td style={{padding:'0.8rem 0.9rem',fontSize:'0.82rem'}}>{item.volumeKg} kg</td>
                              <td style={{padding:'0.8rem 0.9rem',fontSize:'0.82rem',color:'#6b7280'}}>{item.preferredDate ? new Date(item.preferredDate).toLocaleDateString('en-IN') : '-'}</td>
                              <td style={{padding:'0.8rem 0.9rem'}}>
                                <span style={{background:st.bg,color:st.c,padding:'2px 9px',borderRadius:100,fontSize:'0.68rem',fontWeight:700,textTransform:'capitalize'}}>{item.status}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1rem'}}>
                  <div style={{fontWeight:800,color:'#14532d',marginBottom:'0.8rem'}}>🛒 Open Marketplace Listings</div>
                  {listings.length === 0 ? (
                    <div style={{color:'#6b7280',fontSize:'0.85rem'}}>No active listings available.</div>
                  ) : (
                    <div style={{display:'grid',gap:'0.65rem'}}>
                      {listings.slice(0,6).map((item) => (
                        <div key={item._id} style={{border:'1px solid #e5e7eb',borderRadius:10,padding:'0.75rem'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4,gap:'0.5rem'}}>
                            <strong style={{fontSize:'0.88rem',color:'#14532d'}}>{matIcon[item.materialType] || '♻️'} {item.materialType}</strong>
                            <span style={{fontSize:'0.74rem',color:'#16a34a',fontWeight:700}}>₹{item.pricePerKg}/kg</span>
                          </div>
                          <div style={{fontSize:'0.75rem',color:'#6b7280'}}>{item.quantityKg} kg • Min order {item.minOrderKg || 0} kg</div>
                          <div style={{fontSize:'0.72rem',color:'#9ca3af',marginTop:3}}>{item.seller?.companyName || 'Industry Seller'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab==='declare' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',gap:'1rem'}}>
              <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1.25rem'}}>
                <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'1rem'}}>📋 Declare Industrial Waste</h2>
                <form onSubmit={(e) => { e.preventDefault(); submitDeclaration(); }}>
                  <div style={fg}>
                    <label style={lbl}>Waste Category</label>
                    <select value={declForm.wasteCategory} onChange={(e)=>setD('wasteCategory',e.target.value)} style={inp}>
                      {['Industrial Waste','Plastic Scrap','Metal Scrap','Chemical Waste','E-Waste','Paper Waste'].map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div style={fg}>
                    <label style={lbl}>Waste Sub Type</label>
                    <input value={declForm.wasteSubType} onChange={(e)=>setD('wasteSubType',e.target.value)} style={inp} placeholder="e.g. HDPE, Steel shavings" />
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                    <div style={fg}>
                      <label style={lbl}>Volume (kg) *</label>
                      <input type="number" min="1" value={declForm.volumeKg} onChange={(e)=>setD('volumeKg',e.target.value)} style={inp} required />
                    </div>
                    <div style={fg}>
                      <label style={lbl}>Packaging Type</label>
                      <select value={declForm.packagingType} onChange={(e)=>setD('packagingType',e.target.value)} style={inp}>
                        {['Bagged','Baled','Drum','Container','Loose'].map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                    <div style={fg}>
                      <label style={lbl}>Hazard Level</label>
                      <select value={declForm.hazardLevel} onChange={(e)=>setD('hazardLevel',e.target.value)} style={inp}>
                        {['none','low','medium','high'].map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                    <div style={fg}>
                      <label style={lbl}>Preferred Pickup Date *</label>
                      <input type="date" min={today} value={declForm.preferredDate} onChange={(e)=>setD('preferredDate',e.target.value)} style={inp} required />
                    </div>
                  </div>
                  <div style={fg}>
                    <label style={lbl}>Notes</label>
                    <textarea value={declForm.notes} onChange={(e)=>setD('notes',e.target.value)} style={{...inp,minHeight:90,resize:'vertical'}} placeholder="Add handling or safety notes" />
                  </div>
                  <button type="submit" disabled={declLoading} style={{width:'100%',padding:'0.75rem',background:declLoading?'#9ca3af':'#f97316',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:declLoading?'not-allowed':'pointer'}}>
                    {declLoading ? 'Submitting...' : 'Submit Declaration'}
                  </button>
                </form>

                {declResult && (
                  <div style={{marginTop:'1rem',background:'#ecfdf5',border:'1px solid #bbf7d0',borderRadius:10,padding:'0.75rem'}}>
                    <div style={{fontWeight:700,color:'#14532d',fontSize:'0.82rem'}}>Declaration submitted successfully</div>
                    <div style={{fontSize:'0.75rem',color:'#065f46',marginTop:2}}>Tracking Code: {declResult.qrCode || declResult._id}</div>
                  </div>
                )}
              </div>

              <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',overflow:'auto'}}>
                <div style={{padding:'1rem',fontWeight:800,color:'#14532d',borderBottom:'1px solid #e5e7eb'}}>🧾 My Declarations</div>
                {declarations.length === 0 ? (
                  <div style={{padding:'2rem',textAlign:'center',color:'#6b7280'}}>No declarations yet.</div>
                ) : (
                  <table style={{width:'100%',borderCollapse:'collapse',minWidth:620}}>
                    <thead style={{background:'#fff7ed'}}>
                      <tr>
                        {['Category','Volume','Hazard','Preferred Date','Status'].map((header) => (
                          <th key={header} style={{padding:'0.72rem 0.9rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'#6b7280',textTransform:'uppercase',borderBottom:'1px solid #e5e7eb'}}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {declarations.map((item) => {
                        const st = statusColor[item.status] || { bg:'#f3f4f6', c:'#374151' };
                        return (
                          <tr key={item._id} style={{borderBottom:'1px solid #f3f4f6'}}>
                            <td style={{padding:'0.8rem 0.9rem',fontSize:'0.85rem',fontWeight:600}}>{item.wasteCategory}</td>
                            <td style={{padding:'0.8rem 0.9rem',fontSize:'0.82rem'}}>{item.volumeKg} kg</td>
                            <td style={{padding:'0.8rem 0.9rem',fontSize:'0.8rem',textTransform:'capitalize'}}>{item.hazardLevel || 'none'}</td>
                            <td style={{padding:'0.8rem 0.9rem',fontSize:'0.82rem',color:'#6b7280'}}>{item.preferredDate ? new Date(item.preferredDate).toLocaleDateString('en-IN') : '-'}</td>
                            <td style={{padding:'0.8rem 0.9rem'}}>
                              <span style={{background:st.bg,color:st.c,padding:'2px 9px',borderRadius:100,fontSize:'0.68rem',fontWeight:700,textTransform:'capitalize'}}>{item.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {tab==='marketplace' && (
            <div style={{display:'grid',gap:'1rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',gap:'1rem'}}>
                <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',padding:'1.25rem'}}>
                  <h2 style={{color:'#14532d',fontWeight:800,marginBottom:'1rem'}}>♻️ Create Marketplace Listing</h2>
                  <form onSubmit={(e) => { e.preventDefault(); submitListing(); }}>
                    <div style={fg}>
                      <label style={lbl}>Material Type</label>
                      <select value={listForm.materialType} onChange={(e)=>setL('materialType',e.target.value)} style={inp}>
                        {['Paper','Plastic','Metal','Glass','Rubber','Other'].map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                      <div style={fg}>
                        <label style={lbl}>Quantity (kg) *</label>
                        <input type="number" min="1" value={listForm.quantityKg} onChange={(e)=>setL('quantityKg',e.target.value)} style={inp} required />
                      </div>
                      <div style={fg}>
                        <label style={lbl}>Price per kg (INR) *</label>
                        <input type="number" min="1" value={listForm.pricePerKg} onChange={(e)=>setL('pricePerKg',e.target.value)} style={inp} required />
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                      <div style={fg}>
                        <label style={lbl}>Minimum Order (kg)</label>
                        <input type="number" min="1" value={listForm.minOrderKg} onChange={(e)=>setL('minOrderKg',e.target.value)} style={inp} />
                      </div>
                      <div style={fg}>
                        <label style={lbl}>Location</label>
                        <input value={listForm.location} onChange={(e)=>setL('location',e.target.value)} style={inp} placeholder="e.g. Pune MIDC" />
                      </div>
                    </div>
                    <div style={fg}>
                      <label style={lbl}>Description</label>
                      <textarea value={listForm.description} onChange={(e)=>setL('description',e.target.value)} style={{...inp,minHeight:90,resize:'vertical'}} placeholder="Optional details for buyers" />
                    </div>
                    <button type="submit" disabled={listLoading} style={{width:'100%',padding:'0.75rem',background:listLoading?'#9ca3af':'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,cursor:listLoading?'not-allowed':'pointer'}}>
                      {listLoading ? 'Publishing...' : 'Publish Listing'}
                    </button>
                  </form>
                </div>

                <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',overflow:'auto'}}>
                  <div style={{padding:'1rem',fontWeight:800,color:'#14532d',borderBottom:'1px solid #e5e7eb'}}>🛍️ Open Listings</div>
                  {listings.length === 0 ? (
                    <div style={{padding:'2rem',textAlign:'center',color:'#6b7280'}}>No active listings available.</div>
                  ) : (
                    <table style={{width:'100%',borderCollapse:'collapse',minWidth:640}}>
                      <thead style={{background:'#f0fdf4'}}>
                        <tr>
                          {['Material','Quantity','Price','Min Order','Seller','Location'].map((header) => (
                            <th key={header} style={{padding:'0.72rem 0.9rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'#6b7280',textTransform:'uppercase',borderBottom:'1px solid #e5e7eb'}}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map((item) => (
                          <tr key={item._id} style={{borderBottom:'1px solid #f3f4f6'}}>
                            <td style={{padding:'0.8rem 0.9rem',fontSize:'0.84rem',fontWeight:700,color:'#14532d'}}>{matIcon[item.materialType] || '♻️'} {item.materialType}</td>
                            <td style={{padding:'0.8rem 0.9rem',fontSize:'0.82rem'}}>{item.quantityKg} kg</td>
                            <td style={{padding:'0.8rem 0.9rem',fontSize:'0.82rem',fontWeight:700,color:'#16a34a'}}>₹{item.pricePerKg}/kg</td>
                            <td style={{padding:'0.8rem 0.9rem',fontSize:'0.82rem'}}>{item.minOrderKg || 0} kg</td>
                            <td style={{padding:'0.8rem 0.9rem',fontSize:'0.8rem',color:'#6b7280'}}>{item.seller?.companyName || 'Industry Seller'}</td>
                            <td style={{padding:'0.8rem 0.9rem',fontSize:'0.8rem',color:'#6b7280'}}>{item.location || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div style={{background:'#fff',borderRadius:12,border:'1px solid #e5e7eb',overflow:'auto'}}>
                <div style={{padding:'1rem',fontWeight:800,color:'#14532d',borderBottom:'1px solid #e5e7eb'}}>🏷️ My Listings</div>
                {myListings.length === 0 ? (
                  <div style={{padding:'2rem',textAlign:'center',color:'#6b7280'}}>You have not created any listings yet.</div>
                ) : (
                  <table style={{width:'100%',borderCollapse:'collapse',minWidth:620}}>
                    <thead style={{background:'#ecfdf5'}}>
                      <tr>
                        {['Material','Quantity','Price','Status','Created','Action'].map((header) => (
                          <th key={header} style={{padding:'0.72rem 0.9rem',textAlign:'left',fontSize:'0.72rem',fontWeight:700,color:'#6b7280',textTransform:'uppercase',borderBottom:'1px solid #e5e7eb'}}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {myListings.map((item) => (
                        <tr key={item._id} style={{borderBottom:'1px solid #f3f4f6'}}>
                          <td style={{padding:'0.8rem 0.9rem',fontSize:'0.84rem',fontWeight:700,color:'#14532d'}}>{matIcon[item.materialType] || '♻️'} {item.materialType}</td>
                          <td style={{padding:'0.8rem 0.9rem',fontSize:'0.82rem'}}>{item.quantityKg} kg</td>
                          <td style={{padding:'0.8rem 0.9rem',fontSize:'0.82rem',fontWeight:700,color:'#16a34a'}}>₹{item.pricePerKg}/kg</td>
                          <td style={{padding:'0.8rem 0.9rem'}}>
                            <span style={{background:item.status==='active'?'#dcfce7':'#f3f4f6',color:item.status==='active'?'#14532d':'#374151',padding:'2px 9px',borderRadius:100,fontSize:'0.68rem',fontWeight:700,textTransform:'capitalize'}}>{item.status}</span>
                          </td>
                          <td style={{padding:'0.8rem 0.9rem',fontSize:'0.8rem',color:'#6b7280'}}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '-'}</td>
                          <td style={{padding:'0.8rem 0.9rem'}}>
                            <button onClick={() => handleDeleteListing(item._id)} style={{padding:'0.32rem 0.7rem',background:'#ef4444',color:'#fff',border:'none',borderRadius:7,fontWeight:700,cursor:'pointer',fontSize:'0.72rem'}}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {tab==='esg' && (
            <div>
              {!esg ? (
                <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:'2rem',textAlign:'center',color:'#6b7280'}}>No ESG data available yet.</div>
              ) : (
                <>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
                    {[
                      [`${Math.round(esg.totalWaste || 0)} kg`,'Total Waste','🧮','#0f766e'],
                      [`${Math.round(esg.recycledWaste || 0)} kg`,'Recycled','♻️','#16a34a'],
                      [`${Math.round(esg.landfillWaste || 0)} kg`,'Landfill','🗑️','#f97316'],
                      [`${esg.recyclingRate || 0}%`,'Recycling Rate','📈','#1d4ed8'],
                      [`${esg.co2Saved || 0} t`,'CO2 Saved','🌍','#14532d'],
                      [`${esg.complianceRate ?? user?.complianceScore ?? 0}%`,'Compliance Score','✅','#7c3aed'],
                    ].map(([value,label,icon,color]) => (
                      <div key={label} style={{background:'#fff',border:'1px solid #e5e7eb',borderTop:`3px solid ${color}`,borderRadius:12,padding:'1.2rem'}}>
                        <div style={{fontSize:'1.35rem',marginBottom:4}}>{icon}</div>
                        <div style={{fontSize:'1.35rem',fontWeight:800,color:'#14532d'}}>{value}</div>
                        <div style={{fontSize:'0.72rem',color:'#6b7280',textTransform:'uppercase',marginTop:2}}>{label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:'1.2rem',marginBottom:'1rem'}}>
                    <div style={{fontWeight:800,color:'#14532d',marginBottom:'1rem'}}>📊 Monthly Waste Performance</div>
                    {Array.isArray(esg.monthly) && esg.monthly.length > 0 ? (
                      <div style={{display:'flex',gap:'0.55rem',alignItems:'flex-end',height:180,overflowX:'auto'}}>
                        {esg.monthly.map((item, index) => (
                          <div key={`${item.month}-${index}`} style={{minWidth:62,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                            <div style={{fontSize:'0.62rem',color:'#6b7280',fontWeight:700}}>{item.declared || 0}</div>
                            <div style={{width:18,height:`${Math.max(8,(Number(item.declared || 0) / maxMonthlyValue) * 110)}px`,background:'#93c5fd',borderRadius:'5px 5px 0 0'}} />
                            <div style={{fontSize:'0.62rem',color:'#6b7280',fontWeight:700}}>{item.recycled || 0}</div>
                            <div style={{width:18,height:`${Math.max(8,(Number(item.recycled || 0) / maxMonthlyValue) * 110)}px`,background:'#16a34a',borderRadius:'5px 5px 0 0'}} />
                            <div style={{fontSize:'0.62rem',color:'#9ca3af',marginTop:2}}>{item.month}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{color:'#6b7280',fontSize:'0.85rem'}}>Monthly trend is not available yet.</div>
                    )}
                    <div style={{display:'flex',gap:'1rem',fontSize:'0.72rem',color:'#6b7280',marginTop:'0.8rem'}}>
                      <span>■ Declared (blue)</span>
                      <span>■ Recycled (green)</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {tab==='compliance' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',gap:'1rem',marginBottom:'1.2rem'}}>
                <div style={{background:'#fff',border:'1px solid #e5e7eb',borderTop:'3px solid #16a34a',borderRadius:12,padding:'1rem'}}>
                  <div style={{fontSize:'0.72rem',color:'#6b7280',textTransform:'uppercase'}}>Compliance Score</div>
                  <div style={{fontSize:'1.5rem',fontWeight:800,color:'#14532d'}}>{user?.complianceScore ?? esg?.complianceRate ?? 0}%</div>
                </div>
                <div style={{background:'#fff',border:'1px solid #e5e7eb',borderTop:'3px solid #f97316',borderRadius:12,padding:'1rem'}}>
                  <div style={{fontSize:'0.72rem',color:'#6b7280',textTransform:'uppercase'}}>Pending Declarations</div>
                  <div style={{fontSize:'1.5rem',fontWeight:800,color:'#14532d'}}>{pendingDeclarations}</div>
                </div>
                <div style={{background:'#fff',border:'1px solid #e5e7eb',borderTop:'3px solid #3b82f6',borderRadius:12,padding:'1rem'}}>
                  <div style={{fontSize:'0.72rem',color:'#6b7280',textTransform:'uppercase'}}>Active Alerts</div>
                  <div style={{fontSize:'1.5rem',fontWeight:800,color:'#14532d'}}>{compliance.length}</div>
                </div>
              </div>

              <div style={{display:'grid',gap:'0.8rem'}}>
                {compliance.map((item, index) => {
                  const type = item.type || 'compliant';
                  const cardStyle =
                    type === 'violation'
                      ? { borderColor:'#fecaca', background:'#fff1f2', title:'#991b1b' }
                      : type === 'warning'
                        ? { borderColor:'#fed7aa', background:'#fff7ed', title:'#9a3412' }
                        : { borderColor:'#bbf7d0', background:'#f0fdf4', title:'#14532d' };

                  return (
                    <div key={item.declarationId || `${item.title}-${index}`} style={{border:`1px solid ${cardStyle.borderColor}`,background:cardStyle.background,borderRadius:12,padding:'1rem',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap'}}>
                      <div style={{flex:1,minWidth:220}}>
                        <div style={{fontWeight:800,color:cardStyle.title,fontSize:'0.92rem',marginBottom:4}}>{item.title}</div>
                        <div style={{fontSize:'0.83rem',color:'#6b7280',lineHeight:1.45}}>{item.message}</div>
                      </div>
                      {item.action && (
                        <button onClick={() => handleComplianceAction(item.action)} style={{padding:'0.5rem 0.9rem',border:'none',borderRadius:8,background:'#14532d',color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'0.75rem',whiteSpace:'nowrap'}}>
                          {item.action}
                        </button>
                      )}
                    </div>
                  );
                })}
                {compliance.length === 0 && (
                  <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:'2rem',textAlign:'center',color:'#6b7280'}}>No compliance alerts right now.</div>
                )}
              </div>
            </div>
          )}

          {tab === 'available-waste' && (
            <div>
              <h2 style={{ color: '#14532d', fontWeight: 800, marginBottom: '1.2rem' }}>♻️ Available Recyclable Materials (Govt Inventory)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {materials.map((mat) => (
                  <div key={mat._id} style={{ background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #e5e7eb', borderTop: '4px solid #16a34a' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.02rem', color:'#14532d' }}>{mat.itemName}</h3>
                    <p style={{ fontSize: '1.45rem', fontWeight: '800', color: '#16a34a', margin: '0' }}>
                      {mat.quantity} <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{mat.unit}</span>
                    </p>
                    <p style={{ fontSize: '0.74rem', color: '#6b7280', marginBottom: '0.9rem' }}>Material available from government collection centers.</p>
                    <button
                      onClick={() => handleRequest(mat.itemName)}
                      style={{ width: '100%', padding: '0.55rem 0.8rem', background: '#14532d', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize:'0.8rem' }}
                    >
                      Request for Processing
                    </button>
                  </div>
                ))}
                {materials.length === 0 && (
                  <div style={{ background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:'2rem',textAlign:'center',color:'#6b7280' }}>
                    No recyclable waste currently listed by the government.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}