import { useState, useEffect, useMemo } from 'react'
import { getProducts, deleteProduct } from '../api/products'
import { getCategories } from '../api/categories'
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductModal from '../components/ProductModal'
import { API_BASE } from '../api/config'

const ITEMS_PER_PAGE = 50

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts(page)
  }, [page])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data.categories || data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadProducts = async (currentPage = 1) => {
    setLoading(true)
    try {
      const data = await getProducts({ page: currentPage, limit: ITEMS_PER_PAGE })
      setProducts(data.products || [])
      setTotalPages(data.pages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return
    try {
      await deleteProduct(id)
      loadProducts(page)
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Ошибка удаления товара')
    }
  }

  const handleAdd = () => {
    setSelectedProduct(null)
    setModalOpen(true)
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  const handleModalSuccess = () => {
    loadProducts(page)
  }

  const filteredProducts = useMemo(() =>
    products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Товары</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Добавить товар
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Поиск по товарам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-600">Загрузка...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Товар</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Категория</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Цена</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Склад</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={`${API_BASE.replace('/api', '')}${product.images[0]}`}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-800">{product.name}</p>
                        <p className="text-sm text-slate-600">{product.sku || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {product.price?.toLocaleString()} сом
                  </td>
                  <td className="px-6 py-4 text-slate-600">{product.stock || 0} {product.unit || 'шт'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${product.stock > 0 && product.isActive ? 'bg-green-100 text-green-600' :
                      product.stock === 0 && product.isActive ? 'bg-red-100 text-red-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                      {product.stock > 0 && product.isActive ? 'В наличии' :
                        product.stock === 0 && product.isActive ? 'Нет в наличии' :
                          'Неактивен'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} className="text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="p-8 text-center text-slate-600">Товары не найдены</div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 px-2">
        <span className="text-sm text-slate-500">
          {total > 0 && `Показано ${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, total)} из ${total} товаров`}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-slate-600">Стр. {page} из {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        categories={categories}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}

export default Products
