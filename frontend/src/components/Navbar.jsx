import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './ui'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = {
    patient: [
      { to: '/patient', label: 'Dashboard' },
      { to: '/doctors', label: 'Find Doctors' },
      { to: '/my-appointments', label: 'My Appointments' },
    ],
    doctor: [
      { to: '/doctor', label: 'Dashboard' },
      { to: '/doctor/profile', label: 'My Profile' },
      { to: '/doctor/schedule', label: 'Schedule' },
    ],
    admin: [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/appointments', label: 'Appointments' },
    ],
  }

  const links = user ? (navLinks[user.role] || []) : []

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-xl text-primary-600">
          🏥 MediBook
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === to
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Avatar name={user.full_name} size="sm" />
              <div className="text-sm">
                <p className="font-medium text-gray-900 leading-tight">{user.full_name}</p>
                <p className="text-gray-400 text-xs capitalize">{user.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
