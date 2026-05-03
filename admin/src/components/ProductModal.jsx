import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { createProduct, updateProduct } from '../api/products'
import { getCategories } from '../api/categories'
import { API_BASE } from '../api/config'

const ProductModal = ({ isOpen, onClose, product, onSuccess, categories: categoriesProp = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    nameRu: '',
    nameKg: '',
    desc: '',
    descRu: '',
    descKg: '',
    categoryId: '',
    price: '',
    oldPrice: '',
    unit: 'шт',
    stock: '',
    sku: '',
    specs: [],
    badge: '',
    isActive: true
  })
  const [categories, setCategories] = useState(categoriesProp)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (categoriesProp.length > 0) {
      setCategories(categoriesProp)
    } else {
      getCategories()
        .then(data => setCategories(data.categories || data))
        .catch(err => console.error('Failed to load categories:', err))
    }
  }, [categoriesProp])

  useEffect(() => {
    if (product) {
      const baseUrl = API_BASE.startsWith('http') ? API_BASE.replace('/api', '') : window.location.origin
      setFormData({
        name: product.name || '',
        nameRu: product.nameRu || product.name || '',
        nameKg: product.nameKg || product.name || '',
        desc: product.desc || '',
        descRu: product.descRu || product.desc || '',
        descKg: product.descKg || product.desc || '',
        categoryId: product.categoryId || '',
        price: product.price || '',
        oldPrice: product.oldPrice || '',
        unit: product.unit || 'шт',
        stock: product.stock || '',
        sku: product.sku || '',
        specs: product.specs ? Object.entries(product.specs).map(([key, value]) => ({ key, value })) : [],
        badge: product.badge || '',
        isActive: product.isActive !== undefined ? product.isActive : true
      })
      if (product.images?.[0]) {
        setImagePreview(`${baseUrl}${product.images[0]}`)
      }
    } else {
      resetForm()
    }
  }, [product, isOpen])

  const resetForm = () => {
    setFormData({
      name: '',
      nameRu: '',
      nameKg: '',
      desc: '',
      descRu: '',
      descKg: '',
      categoryId: '',
      price: '',
      oldPrice: '',
      unit: 'шт',
      stock: '',
      sku: '',
      specs: [],
      badge: '',
      isActive: true
    })
    setImage(null)
    setImagePreview(null)
    setError('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specs]
    newSpecs[index][field] = value
    setFormData({ ...formData, specs: newSpecs })
  }

  const addSpec = () => {
    setFormData({ ...formData, specs: [...formData.specs, { key: '', value: '' }] })
  }

  const removeSpec = (index) => {
    setFormData({ ...formData, specs: formData.specs.filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.name || formData.name.length < 3) {
        throw new Error('Название обязательно (минимум 3 символа)')
      }
      if (!formData.categoryId) {
        throw new Error('Выберите категорию')
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('Цена обязательна и должна быть больше 0')
      }
      if (formData.stock === '' || parseInt(formData.stock) < 0) {
        throw new Error('Количество обязательно')
      }
      // Convert specs to object
      const specsObj = {}
      formData.specs.forEach(spec => {
        if (spec.key && spec.value) {
          specsObj[spec.key] = spec.value
        }
      })

      // Create FormData manually to properly handle specs as JSON string
      const productData = new FormData()
      productData.append('name', formData.name)
      productData.append('nameRu', formData.nameRu || formData.name)
      productData.append('nameKg', formData.nameKg || formData.name)
      productData.append('desc', formData.desc)
      productData.append('descRu', formData.descRu || formData.desc)
      productData.append('descKg', formData.descKg || formData.desc)
      productData.append('categoryId', formData.categoryId)
      productData.append('price', formData.price)
      if (formData.oldPrice) productData.append('oldPrice', formData.oldPrice)
      productData.append('unit', formData.unit)
      productData.append('stock', formData.stock)
      productData.append('badge', formData.badge || '')
      productData.append('isActive', formData.isActive ? '1' : '0')
      if (formData.sku) productData.append('sku', formData.sku)
      productData.append('specs', JSON.stringify(specsObj))
      if (image) productData.append('images', image)

      if (product) {
        await updateProduct(product.id, productData)
      } else {
        await createProduct(productData)
      }

      onSuccess()
      onClose()
      resetForm()
    } catch (err) {
      setError(err.message || 'Ошибка при сохранении товара')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{product ? 'Редактировать товар' : 'Добавить товар'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Основная информация</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Название товара *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Категория *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Артикул (SKU)
                </label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Описание товара
                </label>
                <textarea
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Price and Stock */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Цена и наличие</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Цена (сом) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  min={0}
                  step={0.01}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Старая цена (сом)
                </label>
                <input
                  type="number"
                  value={formData.oldPrice}
                  onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min={0}
                  step={0.01}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Единица измерения
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="шт">шт</option>
                  <option value="мешок">мешок</option>
                  <option value="кг">кг</option>
                  <option value="м">м</option>
                  <option value="м²">м²</option>
                  <option value="л">л</option>
                  <option value="рулон">рулон</option>
                  <option value="упак">упак</option>
                  <option value="пара">пара</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Количество на складе *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Бейдж
                </label>
                <select
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Без бейджа</option>
                  <option value="🔥 Хит">🔥 Хит</option>
                  <option value="🆕 Новинка">🆕 Новинка</option>
                  <option value="⚡ Мощный">⚡ Мощный</option>
                  <option value="💸 Акция">💸 Акция</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">Товар активен (виден на сайте)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Specifications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Характеристики товара</h3>
            <div className="space-y-2">
              {formData.specs.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                    placeholder="Название характеристики"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                    placeholder="Значение"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpec}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Plus size={20} />
                Добавить характеристику
              </button>
            </div>
          </div>

          {/* Section 4: Images */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Изображения</h3>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer"
              >
                <div className="text-slate-400 mb-2">
                  <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8m0-8h-8m8 0h-8m-12-4v8m0 0v-8m0 0h8m-8 0H12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm text-slate-600">
                  Нажмите для выбора изображения
                </p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP — до 5 МБ</p>
              </label>
            </div>
            {imagePreview && (
              <div className="mt-4 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null)
                    setImagePreview(null)
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
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
              {loading ? 'Сохранение...' : 'Сохранить товар'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductModal
