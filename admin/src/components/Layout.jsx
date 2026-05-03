import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

const Layout = ({ user, onLogout }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            Welcome, {user?.name || 'Admin'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.role || 'Admin'}</span>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
