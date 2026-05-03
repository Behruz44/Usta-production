import { useState, useEffect } from 'react'
import { getUsers, blockUser, unblockUser, deleteUser } from '../api/users'
import { Shield, Ban, ShieldCheck, Trash2, Edit2 } from 'lucide-react'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlock = async (id) => {
    if (!window.confirm('Заблокировать пользователя?')) return
    try {
      await blockUser(id)
      loadUsers()
    } catch (error) {
      console.error('Error blocking user:', error)
      alert(error.response?.data?.error || 'Ошибка блокировки')
    }
  }

  const handleUnblock = async (id) => {
    if (!window.confirm('Разблокировать пользователя?')) return
    try {
      await unblockUser(id)
      loadUsers()
    } catch (error) {
      console.error('Error unblocking user:', error)
      alert(error.response?.data?.error || 'Ошибка разблокировки')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этого пользователя?')) return

    try {
      await deleteUser(id)
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(error.response?.data?.error || 'Ошибка при удалении пользователя')
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-600'
      case 'admin': return 'bg-blue-100 text-blue-600'
      case 'manager': return 'bg-green-100 text-green-600'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin': return Shield
      case 'admin': return ShieldCheck
      case 'manager': return Shield
      default: return Shield
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Пользователи</h1>

      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-600">Загрузка...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Пользователь</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Роль</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Зарегистрирован</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => {
                const RoleIcon = getRoleIcon(user.role)
                return (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">{user.name}</p>
                        <p className="text-sm text-slate-600">{user.phone}</p>
                        {user.email && <p className="text-sm text-slate-500">{user.email}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${getRoleColor(user.role)}`}>
                        <RoleIcon size={14} />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${user.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                        {user.isBlocked ? <Ban size={14} /> : <ShieldCheck size={14} />}
                        {user.isBlocked ? 'Заблокирован' : 'Активен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.isBlocked ? (
                          <button
                            onClick={() => handleUnblock(user.id)}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="Разблокировать"
                          >
                            <ShieldCheck size={18} className="text-green-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(user.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Заблокировать"
                          >
                            <Ban size={18} className="text-red-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {!loading && users.length === 0 && (
          <div className="p-8 text-center text-slate-600">Пользователи не найдены</div>
        )}
      </div>
    </div>
  )
}

export default Users
