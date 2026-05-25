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
          <img src="/logo.jpg" alt="ALINA PAINT" />
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
