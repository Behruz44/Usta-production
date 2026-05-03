import { useState, useEffect } from 'react'
import { getCategories, deleteCategory } from '../api/categories'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import CategoryModal from '../components/CategoryModal'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) return

    try {
      await deleteCategory(id)
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert(error.response?.data?.error || 'Не удалось удалить категорию')
    }
  }

  const handleAdd = () => {
    setSelectedCategory(null)
    setModalOpen(true)
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setModalOpen(true)
  }

  const handleModalSuccess = () => {
    loadCategories()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Категории</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Добавить категорию
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-600">Загрузка...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Категория</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Товаров</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Порядок</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">{category.icon || '📁'}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{category.name}</p>
                        <p className="text-sm text-slate-600">{category.nameRu} / {category.nameKg}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{category.count || 0}</td>
                  <td className="px-6 py-4 text-slate-600">{category.order || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${category.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                      {category.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} className="text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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

        {!loading && categories.length === 0 && (
          <div className="p-8 text-center text-slate-600">Категории не найдены</div>
        )}
      </div>

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategory}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}

export default Categories
