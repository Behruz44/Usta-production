import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Phone, Star } from 'lucide-react'

const Header = ({ onContactClick }) => {
  const [searchValue, setSearchValue] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchValue)}`)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <header id="header">
      <div className="container header-inner">
        <a href="/" className="logo">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          УС<span>ТА</span>
        </a>

        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск по каталогу товаров..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="search-btn" onClick={handleSearch}>Найти</button>
        </div>

        <div className="header-actions">
          <button className="btn-outline" onClick={onContactClick}>
            <MapPin size={15} />
            <span className="btn-text">Адрес</span>
          </button>
          <button className="btn-primary" onClick={onContactClick}>
            <Phone size={15} />
            <span className="btn-text">Позвонить</span>
          </button>
          <a href="/admin" className="btn-admin">
            <Star size={15} />
            <span className="btn-text">Админ</span>
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header
