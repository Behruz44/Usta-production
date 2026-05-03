import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Upload, X, Save } from 'lucide-react'
import { api } from '../services/api'

const Admin = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    categoryId: '',
    desc: '',
    price: '',
    unit: 'шт',
    specs: '{}',
    badge: '',
    image: null
  })
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, image: file })
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let specsObj = {}
      try {
        specsObj = formData.specs ? JSON.parse(formData.specs) : {}
      } catch {
        alert('Неверный формат характеристик (JSON)')
        return
      }

      // Auto-fill nameRu and nameKg with name value
      const productData = {
        ...formData,
        nameRu: formData.name,
        nameKg: formData.name,
        specs: specsObj
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData, formData.image)
      } else {
        await api.createProduct(productData, formData.image)
      }

      setIsModalOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Failed to save product:', error)
      alert('Ошибка при сохранении товара')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      categoryId: product.categoryId,
      desc: product.desc,
      price: product.price,
      unit: product.unit,
      specs: JSON.stringify(product.specs || {}),
      badge: product.badge || '',
      image: null
    })
    setImagePreview(product.images?.[0] ? `http://localhost:3000${product.images[0]}` : null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await api.deleteProduct(id)
        loadData()
      } catch (error) {
        console.error('Failed to delete product:', error)
        alert('Ошибка при удалении товара')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      categoryId: '',
      desc: '',
      price: '',
      unit: 'шт',
      specs: '{}',
      badge: '',
      image: null
    })
    setImagePreview(null)
    setEditingProduct(null)
  }

  const openModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0B1F3A' }}>Админ-панель</h1>
        <button
          onClick={openModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#1565C0',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Plus size={18} />
          Добавить товар
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#F8FAFC' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>Изображение</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>Название</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>Категория</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>Цена</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '16px' }}>
                  {product.images?.[0] ? (
                    <img
                      src={`http://localhost:3000${product.images[0]}`}
                      alt={product.name}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <div style={{ width: '60px', height: '60px', background: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '24px' }}>📦</span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px', fontWeight: '600', color: '#0B1F3A' }}>{product.name}</td>
                <td style={{ padding: '16px', color: '#475569' }}>{product.category}</td>
                <td style={{ padding: '16px', fontWeight: '700', color: '#1565C0' }}>{product.price.toLocaleString()} сом</td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{ padding: '8px', background: '#E3F2FD', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#1565C0' }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{ padding: '8px', background: '#FEE2E2', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#DC2626' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,31,58,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0B1F3A' }}>
                {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0B1F3A' }}>Название товара</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0B1F3A' }}>Категория</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => {
                    const cat = categories.find(c => c.id === parseInt(e.target.value))
                    setFormData({ ...formData, categoryId: e.target.value, category: cat?.name || '' })
                  }}
                  required
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0B1F3A' }}>Описание</label>
                <textarea
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  required
                  rows={3}
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0B1F3A' }}>Цена (сом)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0B1F3A' }}>Единица измерения</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                  >
                    <option value="шт">шт</option>
                    <option value="сом">сом</option>
                    <option value="мешок">мешок</option>
                    <option value="кг">кг</option>
                    <option value="м">м</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0B1F3A' }}>Характеристики (JSON)</label>
                <textarea
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  rows={3}
                  placeholder='{"Размер": "1200x2500 мм", "Толщина": "12.5 мм"}'
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0B1F3A' }}>Бейдж</label>
                <select
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="">Без бейджа</option>
                  <option value="hot">Хит</option>
                  <option value="new">Новинка</option>
                  <option value="power">Мощный</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#0B1F3A' }}>Изображение</label>
                <div style={{ border: '2px dashed #E2E8F0', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="imageInput"
                  />
                  <label htmlFor="imageInput" style={{ cursor: 'pointer' }}>
                    <Upload size={32} style={{ color: '#94A3B8', marginBottom: '8px' }} />
                    <div style={{ color: '#475569', fontSize: '14px' }}>Нажмите для загрузки изображения</div>
                  </label>
                </div>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" style={{ marginTop: '12px', maxWidth: '200px', borderRadius: '8px' }} />
                )}
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#1565C0',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Save size={18} />
                {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
