import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, FolderKanban, Users, LogOut, ShoppingCart } from 'lucide-react'

const Sidebar = ({ onLogout }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Главная' },
    { path: '/products', icon: Package, label: 'Товары' },
    { path: '/categories', icon: FolderKanban, label: 'Категории' },
    { path: '/orders', icon: ShoppingCart, label: 'Заказы' },
    { path: '/users', icon: Users, label: 'Пользователи' },
  ]

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">УСТА</h1>
        <p className="text-slate-400 text-sm">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors w-full"
        >
          <LogOut size={20} />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
