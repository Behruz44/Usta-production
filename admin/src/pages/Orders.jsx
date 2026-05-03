import { useState, useEffect } from 'react'
import { getOrders, updateOrderStatus } from '../api/orders'
import { Phone, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const data = await getOrders()
      setOrders(data.orders || [])
      setError(null)
    } catch (error) {
      console.error('Error loading orders:', error)
      setError('Не удалось загрузить заказы. Проверьте API и права администратора.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      loadOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      setError('Не удалось обновить статус заказа.')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-600'
      case 'processing': return 'bg-yellow-100 text-yellow-600'
      case 'shipped': return 'bg-purple-100 text-purple-600'
      case 'completed': return 'bg-green-100 text-green-600'
      case 'cancelled': return 'bg-red-100 text-red-600'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return Clock
      case 'processing': return Phone
      case 'shipped': return Truck
      case 'completed': return CheckCircle
      case 'cancelled': return XCircle
      default: return Clock
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Заказы</h1>

      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-600">Загрузка...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl">{error}</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">№ Заказа</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Покупатель</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Товары</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Сумма</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => {
                const StatusIcon = getStatusIcon(order.status)
                return (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">{order.customerName}</p>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <Phone size={14} />
                          {order.customerPhone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {Array.isArray(order.products) && order.products.length > 0 ? (
                        <div className="space-y-1">
                          {order.products.slice(0, 3).map((item, index) => (
                            <div key={`${order.id}-${item.productId || index}`} className="text-sm">
                              <span className="font-medium text-slate-800">{item.nameRu || item.name}</span>
                              <span className="text-slate-500"> × {item.quantity}</span>
                            </div>
                          ))}
                          {order.products.length > 3 && <div className="text-xs text-slate-500">+ ещё {order.products.length - 3}</div>}
                        </div>
                      ) : 'Нет товаров'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      KGS {parseFloat(order.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                        <StatusIcon size={14} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="new">Новый</option>
                        <option value="processing">В обработке</option>
                        <option value="shipped">Отправлен</option>
                        <option value="completed">Выполнен</option>
                        <option value="cancelled">Отменён</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="p-8 text-center text-slate-600">Заказы не найдены</div>
        )}
      </div>
    </div>
  )
}

export default Orders
