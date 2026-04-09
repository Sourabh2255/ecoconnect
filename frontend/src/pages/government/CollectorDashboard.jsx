import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Home, List, Map, User, Power } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import useAuthStore from '../../store/authStore'
import { Sidebar, Topbar, StatCard, Badge, Card, Btn } from '../../components/Layout'
import * as api from '../../utils/api'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' })

const sidebarLinks = [
  { to: '/collector', icon: <Home size={18} />, label: 'Dashboard' },
  { to: '/collector/pickups', icon: <List size={18} />, label: "Today's Pickups" },
  { to: '/collector/map', icon: <Map size={18} />, label: 'Route Map' },
  { to: '/collector/profile', icon: <User size={18} />, label: 'Profile' },
]

const layout = { display: 'flex', minHeight: '100vh', background: '#f9fafb' }
const main = { marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }
const content = { flex: 1, padding: '24px' }

function CollectorHome({ token }) {
  const { user, updateUser } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [onDuty, setOnDuty] = useState(user?.isOnDuty || false)
  const locationInterval = useRef(null)
  useEffect(() => {
    api.getCollectorProfile(token).then(r => { setProfile(r.data); setOnDuty(r.data.isOnDuty) }).catch(() => {})
    return () => clearInterval(locationInterval.current)
  }, [token])
  const toggle = async () => {
    const newStatus = !onDuty
    try {
      if (newStatus && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords
          await api.toggleDuty(token, { isOnDuty: true, lat, lng })
          locationInterval.current = setInterval(async () => {
            navigator.geolocation.getCurrentPosition(p => {
              api.updateLocation(token, { lat: p.coords.latitude, lng: p.coords.longitude })
            }, () => api.updateLocation(token, { lat: 18.52 + Math.random() * 0.05, lng: 73.85 + Math.random() * 0.05 }))
          }, 10000)
        }, async () => {
          await api.toggleDuty(token, { isOnDuty: true, lat: 18.5204, lng: 73.8567 })
        })
      } else {
        clearInterval(locationInterval.current)
        await api.toggleDuty(token, { isOnDuty: false })
      }
      setOnDuty(newStatus)
      updateUser({ isOnDuty: newStatus })
    } catch (e) { console.error(e) }
  }
  return (
    <div>
      <div style={{ background: onDuty ? 'linear-gradient(135deg, #14532d, #16a34a)' : 'linear-gradient(135deg, #374151, #6b7280)', borderRadius: 16, padding: '28px', marginBottom: 24, color: '#fff' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.fullName}</h2>
        <p style={{ opacity: 0.8, marginBottom: 20 }}>🚛 {user?.vehicleNumber} · Zone: {user?.zone}</p>
        <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 10, background: onDuty ? '#ef4444' : '#16a34a', color: '#fff', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Power size={20} /> {onDuty ? '🟢 ON DUTY — Click to Go Off' : '⚫ OFF DUTY — Click to Start'}
        </button>
        {onDuty && <p style={{ marginTop: 10, opacity: 0.7, fontSize: 13 }}>📡 GPS broadcasting every 10 seconds</p>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard icon={<List size={20} />} label="Today's Pickups" value={profile?.completedToday || 0} color="#f97316" bg="#fed7aa" />
        <StatCard icon={<Power size={20} />} label="Status" value={onDuty ? 'On Duty' : 'Off Duty'} color={onDuty ? '#16a34a' : '#6b7280'} bg={onDuty ? '#dcfce7' : '#f3f4f6'} />
      </div>
    </div>
  )
}
function TodaysPickups({ token }) {
  const [pickups, setPickups] = useState([])
  useEffect(() => { api.getMyPickups(token).then(r => setPickups(r.data || [])).catch(() => {}) }, [token])
  const updateStatus = async (id, status) => {
    await api.updatePickupStatus(token, id, status)
    const r = await api.getMyPickups(token); setPickups(r.data || [])
  }
  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>Today's Assigned Pickups</h2>
      {pickups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>No pickups assigned. Turn on duty to receive assignments.</div>
      ) : pickups.map((p, i) => (
        <Card key={p._id} style={{ marginBottom: 12 }}>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>#{i + 1}</div>
                  <div style={{ fontWeight: 700 }}>{p.citizenId?.fullName}</div>
                  <Badge status={p.status} />
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 3 }}>📍 {p.address}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 3 }}>♻️ {p.wasteTypes?.join(', ')}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>📞 {p.citizenId?.phone}</div>
                {p.specialInstructions && <div style={{ fontSize: 12, color: '#f97316', marginTop: 4 }}>⚠️ {p.specialInstructions}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.status === 'confirmed' && <Btn small color="#f97316" onClick={() => updateStatus(p._id, 'en-route')}>🚛 En Route</Btn>}
                {p.status === 'en-route' && <Btn small color="#16a34a" onClick={() => updateStatus(p._id, 'collected')}>✅ Collected</Btn>}
                {p.status === 'collected' && <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>✅ Done</span>}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function RouteMap({ token }) {
  const [pickups, setPickups] = useState([])
  const [currentLocation, setCurrentLocation] = useState(null)
  const routingRef = useRef(null)
  const { user } = useAuthStore()
  useEffect(() => {
    // Fetch pickups
    api.getMyPickups(token)
      .then(r => setPickups(r.data || []))
      .catch(() => {})
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      })
    }
  }, [token])
  // 🔥 ROUTE FUNCTION
  const showRoute = (map, pickup) => {
    if (!currentLocation) return
    // remove old route
    if (routingRef.current) {
      map.removeControl(routingRef.current)
    }
    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(currentLocation.lat, currentLocation.lng),
        L.latLng(pickup.addressLat, pickup.addressLng)
      ],
      routeWhileDragging: false,
      show: false
    }).addTo(map)
  }
  const filteredPickups = pickups.filter(
    (p) => p.zone === user?.zone
  )
  return (
    <div>
      <h2 style={{ fontWeight: 800, marginBottom: 6 }}>Today's Route</h2>
      <p style={{ color: '#6b7280', marginBottom: 16, fontSize: 13 }}>
        All assigned pickups for today
      </p>

      <div style={{
        height: 450,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}>
      <MapContainer
  center={[18.5204, 73.8567]}
  zoom={12}
  style={{ height: '100%', width: '100%' }}
  whenCreated={(map) => { window.mapInstance = map }}
>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* 🚛 CURRENT LOCATION */}
          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]}>
              <Popup>🚛 You are here</Popup>
            </Marker>
          )}

          {/* 📍 PICKUP MARKERS */}
          {filteredPickups.map((p, i) => (
            <Marker
              key={p._id}
              position={[p.addressLat || 18.52, p.addressLng || 73.85]}
              eventHandlers={{
                click: () => showRoute(window.mapInstance, p)
              }}
            >
              <Popup>
                <strong>Stop #{i + 1}: {p.citizenId?.fullName}</strong><br />
                {p.address}<br />
                ♻️ {p.wasteTypes?.join(', ')}<br />
                📅 {p.timeSlot}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
function CollectorProfile({ token }) {
  const { user } = useAuthStore()

  if (!user) {
    return <div>Loading profile...</div>
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ fontWeight: 800, marginBottom: 20 }}>My Profile</h2>

      <Card style={{ padding: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#fed7aa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 28,
            color: '#f97316',
            margin: '0 auto'
          }}>
            {user?.fullName?.[0] || "U"}
          </div>

          <div style={{ marginTop: 8, fontWeight: 700 }}>
            {user.fullName}
          </div>

          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            Garbage Collector
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {[
            ['Email', user.email || '-'],
            ['Phone', user.phone || '-'],
            ['Vehicle', user.vehicleNumber || '-'],
            ['Zone', user.zone || '-']
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{ color: '#9ca3af' }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
export default function CollectorDashboard() {
  const { token, user } = useAuthStore()
  return (
    <div style={layout}>
      <Sidebar links={sidebarLinks} role="garbage_collector" />
      <div style={main} className="main-content">
        <Topbar title="Collector Dashboard" subtitle={user?.vehicleNumber} token={token} />
        <div style={content}>
          <Routes>
            <Route index element={<CollectorHome token={token} />} />
            <Route path="pickups" element={<TodaysPickups token={token} />} />
            <Route path="map" element={<RouteMap token={token} />} />
            <Route path="profile" element={<CollectorProfile token={token} />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}