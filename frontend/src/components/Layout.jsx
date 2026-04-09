import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Leaf, LogOut, Bell, Menu, X, ChevronRight } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { getNotifications, markNotificationsRead } from '../utils/api'

export function Sidebar({ links, role }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)

  const roleColors = { citizen: '#16a34a', government_officer: '#3b82f6', garbage_collector: '#f97316', industry: '#a855f7' }
  const color = roleColors[role] || '#16a34a'

  const handleLogout = () => { logout(); nav('/login') }

  return (
    <>
      {/* Mobile Hamburger */}
      <button onClick={() => setOpen(true)} style={{ display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 200, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, cursor: 'pointer' }} className="hamburger">
        <Menu size={22} />
      </button>

      {/* Overlay */}
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 299 }} />}

      <aside style={{ width: 240, background: '#fff', borderRight: '1px solid #e5e7eb', height: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', zIndex: 300, transition: 'transform 0.25s', overflowY: 'auto' }} className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Leaf size={24} color={color} />
            <span style={{ fontWeight: 800, fontSize: 18, color: '#14532d' }}>EcoConnect</span>
          </Link>
          <div style={{ marginTop: 14, padding: '10px 12px', background: '#f9fafb', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color, flexShrink: 0 }}>
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>{role?.replace('_', ' ')}</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {links.map(link => {
            const active = location.pathname === link.to || (link.to !== '/citizen' && location.pathname.startsWith(link.to))
            return (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 2, textDecoration: 'none', background: active ? color + '15' : 'transparent', color: active ? color : '#374151', fontWeight: active ? 700 : 500, fontSize: 14, transition: 'all 0.15s' }}>
                <span style={{ color: active ? color : '#9ca3af' }}>{link.icon}</span>
                {link.label}
                {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '12px 12px', borderTop: '1px solid #e5e7eb' }}>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: '#fef2f2', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            <LogOut size={16} />Sign Out
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .hamburger { display: block !important; }
          .sidebar { transform: translateX(-100%); }
          .sidebar-open { transform: translateX(0); }
          .main-content { margin-left: 0 !important; }
        }
      `}</style>
    </>
  )
}

export function Topbar({ title, subtitle, token }) {
  const [notifs, setNotifs] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (token) {
      getNotifications(token).then(r => {
        setNotifs(r.data.notifications || [])
        setUnread(r.data.unreadCount || 0)
      }).catch(() => {})
    }
  }, [token])

  const handleBellClick = () => {
    setShowNotifs(p => !p)
    if (unread > 0 && token) {
      markNotificationsRead(token).then(() => setUnread(0)).catch(() => {})
    }
  }

  return (
    <header style={{ height: 64, background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ paddingLeft: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#9ca3af' }}>{subtitle}</div>}
      </div>
      <div style={{ position: 'relative' }}>
        <button onClick={handleBellClick} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', position: 'relative' }}>
          <Bell size={18} color="#374151" />
          {unread > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, background: '#ef4444', borderRadius: '50%', fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{unread > 9 ? '9+' : unread}</span>}
        </button>
        {showNotifs && (
          <div style={{ position: 'absolute', right: 0, top: 48, width: 320, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 200, maxHeight: 400, overflowY: 'auto' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: 14 }}>Notifications</div>
            {notifs.length === 0 ? <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No notifications</div> :
              notifs.slice(0, 10).map(n => (
                <div key={n._id} style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: n.isRead ? '#fff' : '#f0fdf4' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    </header>
  )
}

export function StatCard({ icon, label, value, color = '#16a34a', bg = '#f0fdf4', sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
    </div>
  )
}

export function Badge({ status }) {
  const map = {
    pending: { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
    confirmed: { bg: '#dbeafe', color: '#1e40af', label: 'Confirmed' },
    'en-route': { bg: '#fed7aa', color: '#c2410c', label: 'En Route' },
    collected: { bg: '#dcfce7', color: '#15803d', label: 'Collected' },
    cancelled: { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelled' },
    open: { bg: '#fef2f2', color: '#dc2626', label: 'Open' },
    'in-progress': { bg: '#fed7aa', color: '#c2410c', label: 'In Progress' },
    resolved: { bg: '#dcfce7', color: '#15803d', label: 'Resolved' },
    assigned: { bg: '#dbeafe', color: '#1e40af', label: 'Assigned' },
    certified: { bg: '#f3e8ff', color: '#7c3aed', label: 'Certified' },
    active: { bg: '#dcfce7', color: '#15803d', label: 'Active' },
    sold: { bg: '#f3f4f6', color: '#6b7280', label: 'Sold' },
    accepted: { bg: '#dcfce7', color: '#15803d', label: 'Accepted' },
    rejected: { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
  }
  const s = map[status] || { bg: '#f3f4f6', color: '#374151', label: status }
  return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{s.label}</span>
}

export function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', ...style }}>{children}</div>
}

export function Btn({ children, onClick, color = '#16a34a', outline = false, disabled = false, small = false, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: small ? '6px 14px' : '10px 20px', borderRadius: 8, background: outline ? 'transparent' : (disabled ? '#d1d5db' : color), color: outline ? color : '#fff', border: `2px solid ${disabled ? '#d1d5db' : color}`, fontWeight: 700, fontSize: small ? 12 : 14, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', ...style }}>
      {children}
    </button>
  )
}
