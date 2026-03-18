import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-2 rounded transition-colors ${
      isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
    }`

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-blue-700 text-lg">
          <span className="text-2xl" aria-hidden="true">🏙️</span>
          NaboPlan
        </Link>
        <nav className="flex items-center gap-1" aria-label="Hovedmeny">
          <NavLink to="/" end className={linkClass}>Hjem</NavLink>
          <NavLink to="/plan" className={linkClass}>Planen</NavLink>
          <NavLink to="/merknad" className={linkClass}>Send merknad</NavLink>
          <NavLink to="/om" className={linkClass}>Om</NavLink>
          <NavLink
            to="/admin"
            className="text-sm font-medium px-3 py-2 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
