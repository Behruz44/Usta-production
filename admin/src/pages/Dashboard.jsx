import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Eye, Plus, Folder, CheckCircle, XCircle, TrendingUp, ExternalLink } from 'lucide-react'
import { getStats } from '../api/stats'
import { getProducts } from '../api/products'
import { API_BASE } from '../api/config'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    totalCategories: 0,
    topProduct: null
  })
  const [topProducts, setTopProducts] = useState([])
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Load products independently - if stats fails, products still show
        const [topData, recentData] = await Promise.all([
          getProducts({ sort: 'views', order: 'DESC', limit: 5 }),
          getProducts({ sort: 'createdAt', order: 'DESC', limit: 5 })
        ])
        setTopProducts(topData.products || [])
        setRecentProducts(recentData.products || [])

        // Stats separately - doesn't block main content
        try {
          const statsData = await getStats()
          setStats(statsData)
        } catch (e) {
          console.warn('Stats unavailable:', e)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    {
      title: 'Товаров',
      value: stats.totalProducts,
      subtitle: 'всего',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Категорий',
      value: stats.totalCategories,
      subtitle: 'активных',
      icon: Folder,
      color: 'orange'
    },
    {
      title: 'В наличии',
      value: stats.inStockProducts,
      subtitle: 'товаров',
      icon: CheckCircle,
      color: 'green'
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Главная</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`${colorClasses[card.color]} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-slate-800">{typeof card.value === 'number' ? card.value : card.value}</p>
              <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Добавить товар
          </button>
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Folder size={20} />
            Добавить категорию
          </button>
          <a
            href={import.meta.env.VITE_SITE_URL || window.location.origin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <ExternalLink size={20} />
            Перейти на сайт
          </a>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-4">Топ-5 товаров по просмотрам</h2>
        {topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Фото</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Название</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Просмотров</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Цена</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      {product.images?.[0] ? (
                        <img
                          src={`${API_BASE.replace('/api', '')}${product.images[0]}`}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center">
                          <Package size={20} className="text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">{product.views || 0}</td>
                    <td className="py-3 px-4">{product.price} сом</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500">Нет данных</p>
        )}
      </div>

      {/* Recent Products */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Последние добавленные товары</h2>
        {recentProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Фото</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Название</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Дата</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Цена</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      {product.images?.[0] ? (
                        <img
                          src={`${API_BASE.replace('/api', '')}${product.images[0]}`}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center">
                          <Package size={20} className="text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(product.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="py-3 px-4">{product.price} сом</td>
                    <td className="py-3 px-4">
                      <button onClick={() => navigate('/products')} className="text-blue-600 hover:text-blue-800 text-sm">
                        Редактировать
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500">Нет данных</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
