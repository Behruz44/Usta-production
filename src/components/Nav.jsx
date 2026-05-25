import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import { getCategoryIcon } from '../lib/icons'

const localCategories = [
  { id: 1, name: 'Гипсокартон', count: 48, desc: 'Листовые материалы для стен и перегородок' },
  { id: 2, name: 'Сухие смеси', count: 62, desc: 'Штукатурки, шпатлевки и кладочные смеси' },
  { id: 3, name: 'Саморезы', count: 120, desc: 'Крепежные изделия различных размеров' },
  { id: 4, name: 'Профиль', count: 35, desc: 'Металлические профили для каркасов' },
  { id: 5, name: 'Генераторы', count: 18, desc: 'Бензиновые и дизельные генераторы' },
  { id: 6, name: 'Инструменты', count: 94, desc: 'Электроинструменты и ручной инструмент' },
  { id: 7, name: 'Краски', count: 45, desc: 'Краски и лакокрасочные материалы' },
  { id: 8, name: 'Утеплители', count: 28, desc: 'Изоляционные материалы' },
]

const Nav = () => {
  const [categories] = useState(localCategories)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(e.target.value.trim())}`)
    }
  }

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="nav-left">
          <Link to="/" className="logo"><img src="/logo.jpg" alt="ALINA PAINT" /></Link>
        </div>
        <div className="nav-center">
          <div className="nav-links">
            {categories.map((cat) => {
              const IconComponent = getCategoryIcon(cat.name)
              return (
                <Link key={cat.id} to={`/catalog?category=${cat.id}`} className="nav-link">
                  <IconComponent size={18} />
                  <span>{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Поиск товаров..."
              onKeyDown={handleSearch}
            />
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-links">
            {categories.map((cat) => {
              const IconComponent = getCategoryIcon(cat.name)
              return (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.id}`}
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IconComponent size={20} />
                  <span>{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Nav
