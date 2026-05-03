import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createCategory, updateCategory } from '../api/categories'

const CategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    nameRu: '',
    nameKg: '',
    desc: '',
    descRu: '',
    descKg: '',
    icon: '',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        nameRu: category.nameRu || category.name || '',
        nameKg: category.nameKg || category.name || '',
        desc: category.desc || '',
        descRu: category.descRu || category.desc || '',
        descKg: category.descKg || category.desc || '',
        icon: category.icon || '',
        isActive: category.isActive !== undefined ? category.isActive : true
      })
    } else {
      resetForm()
    }
  }, [category, isOpen])

  const resetForm = () => {
    setFormData({
      name: '',
      nameRu: '',
      nameKg: '',
      desc: '',
      descRu: '',
      descKg: '',
      icon: '',
      isActive: true
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.name || formData.name.length < 2) {
        throw new Error('Название обязательно (минимум 2 символа)')
      }

      const categoryData = {
        ...formData,
        nameRu: formData.nameRu || formData.name,
        nameKg: formData.nameKg || formData.name,
        descRu: formData.descRu || formData.desc,
        descKg: formData.descKg || formData.desc
      }

      if (category) {
        await updateCategory(category.id, categoryData)
      } else {
        await createCategory(categoryData)
      }

      onSuccess()
      onClose()
      resetForm()
    } catch (err) {
      setError(err.message || 'Ошибка при сохранении категории')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{category ? 'Редактировать категорию' : 'Добавить категорию'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Название *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              minLength={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Название (РУ)
              </label>
              <input
                type="text"
                value={formData.nameRu}
                onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                placeholder={formData.name}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Название (КГ)
              </label>
              <input
                type="text"
                value={formData.nameKg}
                onChange={(e) => setFormData({ ...formData, nameKg: e.target.value })}
                placeholder={formData.name}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Описание
            </label>
            <textarea
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Иконка (SVG-код или emoji)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="📦 или <svg>...</svg>"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-slate-700">Категория активна</span>
            </label>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryModal
