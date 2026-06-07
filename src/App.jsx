import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useSearchParams, useParams } from 'react-router-dom'
import { Menu, Search, MapPin, Phone, Globe, Clock, ChevronRight, Heart, X, Send, MessageCircle, Grid, Lock } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
import './App.css'
import { api } from './services/api'

// Contact constants — edit here once to update everywhere
const PHONE = '+996555095356'
const PHONE_LABEL = '+996 555 09-53-56'
const WA_NUMBER = '996555095356'
const TG_USERNAME = 'moonyx11'

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('usta_favorites') || '[]') } catch { return [] }
  })
  const toggle = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem('usta_favorites', JSON.stringify(next))
      return next
    })
  }
  const isFav = (id) => favorites.includes(id)
  return { toggle, isFav }
}

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const IMG_BASE = API_BASE.startsWith('http') ? API_BASE.replace('/api', '') : ''

const getCategoryName = (cat) => {
  if (!cat) return ''
  if (typeof cat === 'object') return cat.name || ''
  return cat
}

const getProductImages = (product) => {
  const rawImages = product?.images
  if (Array.isArray(rawImages)) return rawImages
  if (typeof rawImages === 'string') {
    try {
      const parsed = JSON.parse(rawImages)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

const isProductInCategory = (product, category) => {
  if (!category || category === 'all') return true
  if (typeof category === 'object') {
    return Number(product.categoryId) === Number(category.id) || getCategoryName(product.category) === category.name
  }
  return getCategoryName(product.category) === category
}

const buildPurchaseText = (product) => `Здравствуйте! Хочу купить: ${product?.name || 'товар'}${product?.price ? `. Цена: ${Number(product.price).toLocaleString()} сом` : ''}`
const buildWhatsappLink = (product) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildPurchaseText(product))}`
const buildTelegramLink = () => `https://t.me/${TG_USERNAME}`

const iconToEmoji = (icon) => {
  const mapping = {
    'Sheet': '📄',
    'Package': '📦',
    'Wrench': '🔧',
    'Ruler': '📐',
    'Zap': '⚡',
    'Grid': '📋',
    'Hammer': '🔨',
    'Paintbrush': '🎨',
    'Drill': '🪚',
    'Saw': '🪚',
    'Home': '🏠',
    'Building': '🏗️',
    'Layers': '🧱',
    'Box': '📦',
  }
  return mapping[icon] || icon || '📦'
}

const getLang = (obj, field, lang) => {
  if (!obj) return ''
  if (lang === 'kg') return obj[field + 'Kg'] || obj[field + 'Ru'] || obj[field] || ''
  return obj[field + 'Ru'] || obj[field] || ''
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

const translations = {
  ru: {
    location: 'Ош, Кыргызстан',
    about: 'О компании',
    delivery: 'Доставка',
    contacts: 'Контакты',
    address: 'Адрес',
    call: 'Связаться',
    catalog: 'Каталог',
    heroTitle: 'Всё для вашего <em>строительства</em> и ремонта',
    heroDesc: 'Строительные материалы и инструменты — всё в одном месте. Качество проверено временем.',
    viewCatalog: 'Смотреть каталог',
    callUs: 'Позвонить нам',
    catalogLabel: 'Каталог',
    allCategories: 'Все категории',
    categories: 'Категории товаров',
    popular: 'Популярные товары',
    seeMore: 'Смотреть подробнее',
    buy: 'Купить',
    searchPlaceholder: 'Поиск по каталогу товаров...',
    inStock: 'В наличии',
    sortBy: 'Сортировка:',
    byPopularity: 'По популярности',
    byPriceAsc: 'По цене (по возрастанию)',
    byPriceDesc: 'По цене (по убыванию)',
    byName: 'По названию',
    filter: 'Фильтр:',
    all: 'Все',
    backToCatalog: '← Вернуться в каталог',
    admin: 'Админ-панель',
    addProduct: 'Добавить товар',
    productName: 'Название товара',
    category: 'Категория',
    description: 'Описание',
    price: 'Цена',
    image: 'Изображение',
    filterWall: 'Настенный',
    filterCeiling: 'Потолочный',
    filterMoisture: 'Влагостойкий',
    priceFrom: 'От',
    priceTo: 'До',
    addressText: 'Ош, ул. Строительная, 12',
    phoneText: PHONE_LABEL,
  },
  kg: {
    location: 'Ош, Кыргызстан',
    about: 'Биз жөнүндө',
    delivery: 'Жеткирүү',
    contacts: 'Байланыш',
    address: 'Дарек',
    call: 'Байланышуу',
    catalog: 'Каталог',
    heroTitle: 'Сиздин <em>курулуш</em> жана оңдоп-түзөөңүз үчүн баары',
    heroDesc: 'Курулуш материалдары жана аспаптары — баары бир жерде. Сапаты убакыт менен текшерилди.',
    viewCatalog: 'Каталогду көрүү',
    callUs: 'Бизге чалыңыз',
    catalogLabel: 'Каталог',
    allCategories: 'Бардык категориялар',
    categories: 'Товардардын категориялары',
    popular: 'Популярдуу товарлар',
    seeMore: 'Көбүрөөк көрүү',
    buy: 'Сатып алуу',
    searchPlaceholder: 'Каталогдон товарларды издөө...',
    inStock: 'Жеткиликтүү',
    sortBy: 'Сорттоо:',
    byPopularity: 'Популярдуулук боюнча',
    byPriceAsc: 'Баа боюнча (өсүү тартибинде)',
    byPriceDesc: 'Баа боюнча (төмөндөө тартибинде)',
    byName: 'Аты боюнча',
    filter: 'Фильтр:',
    all: 'Баары',
    backToCatalog: '← Каталогго кайтуу',
    admin: 'Админ-панель',
    addProduct: 'Товар кошуу',
    productName: 'Товардун аты',
    category: 'Категория',
    description: 'Баяндама',
    price: 'Баа',
    image: 'Сүрөт',
    filterWall: 'Дубалдык',
    filterCeiling: 'Тосмолук',
    filterMoisture: 'Нымдуулукка каршы',
    priceFrom: 'Башы',
    priceTo: 'Аягы',
    addressText: 'Ош, Курулуш көчөсү, 12',
    phoneText: PHONE_LABEL,
  }
}

function App() {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [language, setLanguage] = useState('ru')

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage setMegaMenuOpen={setMegaMenuOpen} megaMenuOpen={megaMenuOpen} language={language} setLanguage={setLanguage} translations={translations} />} />
        <Route path="/catalog" element={<CatalogPage language={language} setLanguage={setLanguage} translations={translations} />} />
        <Route path="/product/:id" element={<ProductDetailPage language={language} setLanguage={setLanguage} translations={translations} />} />
        <Route path="/login" element={<LoginPage language={language} translations={translations} />} />
      </Routes>
    </Router>
  )
}

function HomePage({ setMegaMenuOpen, megaMenuOpen, language, setLanguage, translations }) {
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false)
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false)
  const [statsAnimated, setStatsAnimated] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResultsOpen, setSearchResultsOpen] = useState(false)
  const [sortBy, setSortBy] = useState('popular')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const navigate = useNavigate()
  const { toggle: toggleFav, isFav } = useFavorites()

  // Fetch all data in one shot — no race condition
  useEffect(() => {
    Promise.all([api.getCategories(), api.getProducts({ limit: 500 })])
      .then(([cats, productsData]) => {
        const list = productsData.products || productsData
        const result = Array.isArray(list) ? list : []
        setProducts(result)
        setLoadError(null)
        setCategories(cats.map(cat => ({
          ...cat,
          count: result.filter(p => isProductInCategory(p, cat)).length
        })))
      })
      .catch(error => {
        console.error('Failed to load home data:', error)
        setLoadError('Не удалось загрузить товары. Проверьте подключение к серверу.')
        setProducts([])
        setCategories([])
      })
      .finally(() => setLoading(false))
  }, [])

  // Track visitor
  useEffect(() => {
    const visitorCount = localStorage.getItem('visitorCount') || '0'
    localStorage.setItem('visitorCount', (parseInt(visitorCount) + 1).toString())
  }, [])

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    setSearchResultsOpen(query.length > 0)
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCategoryName(p.category).toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5)

  const handleSort = (type) => setSortBy(type)

  const displayedProducts = useMemo(() => {
    const sorted = [...products]
    if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    else sorted.sort((a, b) => (b.popularity || b.views || 0) - (a.popularity || a.views || 0))
    return sorted
  }, [products, sortBy])

  const t = translations[language]

  // Count up animation
  const animateValue = (id, start, end, duration) => {
    const obj = document.getElementById(id)
    if (!obj) return
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString()
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }

  // Trigger animations on mount
  useEffect(() => {
    let ctx
    // GSAP animations for reveal elements
    try {
      ctx = gsap.context(() => {
        gsap.fromTo('.reveal',
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        )

        // Hero animations
        gsap.fromTo('.hero-pill',
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, delay: 0.1 }
        )
        gsap.fromTo('.hero h1',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.2 }
        )
        gsap.fromTo('.hero-sub',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, delay: 0.3 }
        )
        gsap.fromTo('.hero-cta',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, delay: 0.4 }
        )
        gsap.fromTo('.hero-stats',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, delay: 0.5 }
        )
        gsap.fromTo('.hero-panel',
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.7, delay: 0.25 }
        )

        // ScrollTrigger for products and categories
        gsap.utils.toArray('.product-card').forEach((card, i) => {
          gsap.fromTo(card,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              delay: i * 0.05,
              scrollTrigger: {
                trigger: card,
                start: 'top 85%'
              }
            }
          )
        })

        gsap.utils.toArray('.cat-card').forEach((card, i) => {
          gsap.fromTo(card,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              delay: i * 0.08,
              scrollTrigger: {
                trigger: card,
                start: 'top 85%'
              }
            }
          )
        })
      }) // end gsap.context
    } catch (e) {
      console.log('GSAP animation skipped:', e)
    }

    // Stats counter animation
    const statsTimer = setTimeout(() => {
      animateValue('stat-1', 0, products.length || 2400, 2000)
      animateValue('stat-2', 0, 12, 1500)
      const stat3 = document.getElementById('stat-3')
      if (stat3) {
        stat3.style.opacity = '0'
        stat3.style.transition = 'opacity 0.5s ease'
        setTimeout(() => {
          stat3.style.opacity = '1'
          stat3.innerHTML = '100<span>%</span>'
        }, 100)
      }
      setStatsAnimated(true)
    }, 500)

    return () => {
      ctx?.revert()
      clearTimeout(statsTimer)
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-wrap')) {
        setLanguageDropdownOpen(false)
        setContactDropdownOpen(false)
        setAddressDropdownOpen(false)
      }
      if (!event.target.closest('.mega-menu') && !event.target.closest('.nav-catalog-btn')) {
        setMegaMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setLanguageDropdownOpen(false)
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedProduct(null)
    document.body.style.overflow = ''
  }

  return (
    <div className="page-transition-enter">
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <Clock size={13} />
            Пн–Сб (Кроме Пт): 09:00 – 18:00
            <span style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={13} />
              {t.location}
            </span>
          </div>
          <div className="topbar-right">
            <a href="#about">{t.about}</a>
            <a href="#delivery">{t.delivery}</a>
            <a href="#contacts">{t.contacts}</a>
            <span className="topbar-phone">{PHONE_LABEL}</span>
            <div className="language-switcher" onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}>
              <Globe size={12} />
              {language === 'ru' ? 'RU' : 'KG'}
            </div>
            {languageDropdownOpen && (
              <div className="language-dropdown">
                <button onClick={() => handleLanguageChange('ru')}>RU</button>
                <button onClick={() => handleLanguageChange('kg')}>KG</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <header>
        <div className="header-inner">
          <Link to="/" className="logo">
            <img src="/logo.jpg" alt="ALINA PAINT" />
          </Link>

          <div className="search-wrap">
            <input type="text" placeholder={t.searchPlaceholder} id="searchInput" value={searchQuery} onChange={handleSearch} onFocus={() => setSearchResultsOpen(searchQuery.length > 0)} />
            <button className="search-btn">
              <Search size={18} />
            </button>
            {searchResultsOpen && filteredProducts.length > 0 && (
              <div className="search-results-dropdown">
                {filteredProducts.map(product => (
                  <div key={product.id} className="search-result-item" onClick={() => { handleProductClick(product); setSearchResultsOpen(false); }}>
                    {(() => {
                      const images = getProductImages(product);
                      return images[0] ? (
                        <img src={`${IMG_BASE}${images[0]}`} alt={product.name} className="search-result-icon" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                      ) : (
                        <div className="search-result-icon">📦</div>
                      );
                    })()}
                    <div className="search-result-info">
                      <div className="search-result-name">{product.name}</div>
                      <div className="search-result-cat">{typeof product.category === 'object' ? product.category?.name : product.category}</div>
                    </div>
                    <div className="search-result-price">{product.price.toLocaleString()} сом</div>
                  </div>
                ))}
                <div className="search-result-footer" onClick={() => { navigate('/catalog'); setSearchResultsOpen(false); }}>
                  Смотреть все результаты
                </div>
              </div>
            )}
          </div>

          <div className="header-actions">
            <div className="dropdown-wrap">
              <button className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); setAddressDropdownOpen(!addressDropdownOpen); }}>
                <MapPin size={14} />
                {t.address}
              </button>
              {addressDropdownOpen && (
                <div className="dropdown open" onClick={(e) => e.stopPropagation()}>
                  <div className="drop-label">Наш магазин</div>
                  <div className="drop-item">
                    <div className="drop-icon blue"><MapPin size={16} /></div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--ink)' }}>{t.address}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{t.addressText}</div>
                    </div>
                  </div>
                  <div className="drop-divider"></div>
                  <div className="drop-item">
                    <div className="drop-icon green"><Lock size={16} /></div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--ink)' }}>Пн–Сб (Кроме Пт)</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>09:00 – 18:00</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="dropdown-wrap">
              <button className="btn btn-blue" onClick={(e) => { e.stopPropagation(); setContactDropdownOpen(!contactDropdownOpen); }}>
                <Phone size={14} />
                {t.call}
              </button>
              {contactDropdownOpen && (
                <div className="dropdown open" onClick={(e) => e.stopPropagation()}>
                  <div className="drop-label">Контакты</div>
                  <a href={`tel:${PHONE}`} className="drop-item">
                    <div className="drop-icon blue"><Phone size={16} /></div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700' }}>{t.phoneText}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '1px' }}>Позвонить</div>
                    </div>
                  </a>
                  <div className="drop-divider"></div>
                  <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" className="drop-item">
                    <div className="drop-icon green"><MessageCircle size={16} /></div>
                    WhatsApp
                  </a>
                  <a href={buildTelegramLink()} target="_blank" rel="noreferrer" className="drop-item">
                    <div className="drop-icon sky"><Send size={16} /></div>
                    Telegram
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav>
        <div className="nav-inner">
          <div className="nav-catalog-wrap">
            <button className="nav-catalog-btn" onClick={() => setMegaMenuOpen(!megaMenuOpen)}>
              <Menu size={15} />
              {t.catalog}
            </button>
            {megaMenuOpen && (
              <div className="mega-menu open">
                {categories.length === 0 ? (
                  <div style={{ padding: '16px', color: 'var(--muted)' }}>Загрузка...</div>
                ) : (
                  <>
                    <Link className="mega-link" to="/catalog" onClick={() => setMegaMenuOpen(false)}><div className="mega-link-icon" style={{ background: '#eff6ff' }}>�</div> Все категории</Link>
                    {categories.map(cat => (
                      <Link key={cat.id} className="mega-link" to={`/catalog?category=${encodeURIComponent(cat.name)}`} onClick={() => setMegaMenuOpen(false)}>
                        <div className="mega-link-icon" style={{ background: '#f8fafc' }}>{iconToEmoji(cat.icon)}</div> {cat.name}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          {categories.length === 0 ? (
            <span style={{ color: 'var(--muted)', padding: '8px 12px' }}>Загрузка...</span>
          ) : (
            categories.slice(0, 6).map((cat, idx) => (
              <Link key={cat.id} className={`nav-link${idx === 0 ? ' active' : ''}`} to={`/catalog?category=${encodeURIComponent(cat.name)}`}>{cat.name}</Link>
            ))
          )}
        </div>
      </nav>


      <section className="hero">
        <div className="hero-grid-overlay"></div>
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-pill reveal">
              <span className="hero-pill-dot"></span>
              Официальный дилер Alina Group
            </div>
            <h1 className="reveal" style={{ animationDelay: '0.1s' }}>
              Всё для<br />
              <em>строительства</em><br />
              и ремонта
            </h1>
            <p className="hero-sub reveal" style={{ animationDelay: '0.2s' }}>
              {t.heroDesc}
            </p>
            <div className="hero-cta reveal" style={{ animationDelay: '0.3s' }}>
              <Link to="/catalog" className="btn-hero btn-hero-primary">
                <Grid size={15} />
                {t.viewCatalog}
              </Link>
              <a href={`tel:${PHONE}`} className="btn-hero btn-hero-ghost">
                <Phone size={15} />
                {t.callUs}
              </a>
            </div>
            <div className="hero-stats reveal" style={{ animationDelay: '0.4s' }}>
              <div className="stat-item">
                <div className="stat-num" id="stat-1">{products.length || '2<span>400</span>'}</div>
                <div className="stat-label">Товаров в каталоге</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-num" id="stat-2">12<span>+</span></div>
                <div className="stat-label">Лет на рынке</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-num" id="stat-3">100<span>%</span></div>
                <div className="stat-label">Гарантия качества</div>
              </div>
            </div>
          </div>

          <div className="hero-panel reveal" style={{ animationDelay: '0.25s' }}>
            {products[0] && (
              <div className="hero-panel-card featured" onClick={() => handleProductClick(products[0])}>
                <div className="panel-top">
                  {(() => {
                    const catName = typeof products[0].category === 'object' ? products[0].category?.name : products[0].category;
                    const category = categories.find(c => c.name === catName);
                    const emoji = category ? iconToEmoji(category.icon) : '📦';
                    return (
                      <div className="panel-icon" style={{ fontSize: '32px', lineHeight: 1 }}>{emoji}</div>
                    );
                  })()}
                  <div>
                    <div className="panel-title">{products[0].name}</div>
                    <div className="panel-sub">{products[0].desc?.substring(0, 30)}...</div>
                  </div>
                </div>
                <div className="panel-price">{products[0].price.toLocaleString()} <span>сом</span></div>
                <div className="panel-badge">
                  <span>●</span>
                  {t.inStock}
                </div>
              </div>
            )}

            {products[6] && products[0] && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="hero-panel-card" onClick={() => handleProductClick(products[6])}>
                  <div className="panel-top" style={{ marginBottom: '8px' }}>
                    {(() => {
                      const catName = typeof products[6].category === 'object' ? products[6].category?.name : products[6].category;
                      const category = categories.find(c => c.name === catName);
                      const emoji = category ? iconToEmoji(category.icon) : '📦';
                      return (
                        <div className="panel-icon green" style={{ fontSize: '28px', lineHeight: 1 }}>{emoji}</div>
                      );
                    })()}
                    <div>
                      <div className="panel-title" style={{ fontSize: '12px' }}>{products[6].name}</div>
                      <div className="panel-sub" style={{ fontSize: '10.5px' }}>{products[6].desc?.substring(0, 20)}...</div>
                    </div>
                  </div>
                  <div className="panel-price" style={{ fontSize: '17px' }}>{products[6].price.toLocaleString()} <span style={{ fontSize: '11px' }}>сом</span></div>
                </div>
                <div className="hero-panel-card" onClick={() => handleProductClick(products[0])}>
                  <div className="panel-top" style={{ marginBottom: '8px' }}>
                    {(() => {
                      const catName = typeof products[0].category === 'object' ? products[0].category?.name : products[0].category;
                      const category = categories.find(c => c.name === catName);
                      const emoji = category ? iconToEmoji(category.icon) : '📦';
                      return (
                        <div className="panel-icon purple" style={{ fontSize: '28px', lineHeight: 1 }}>{emoji}</div>
                      );
                    })()}
                    <div>
                      <div className="panel-title" style={{ fontSize: '12px' }}>{products[0].name}</div>
                      <div className="panel-sub" style={{ fontSize: '10.5px' }}>{products[0].desc?.substring(0, 20)}...</div>
                    </div>
                  </div>
                  <div className="panel-price" style={{ fontSize: '17px' }}>{products[0].price.toLocaleString()} <span style={{ fontSize: '11px' }}>сом</span></div>
                </div>
              </div>
            )}

            {products[7] && (
              <div className="hero-panel-card" onClick={() => handleProductClick(products[7])}>
                <div className="panel-top">
                  {(() => {
                    const catName = typeof products[7].category === 'object' ? products[7].category?.name : products[7].category;
                    const category = categories.find(c => c.name === catName);
                    const emoji = category ? iconToEmoji(category.icon) : '📦';
                    return (
                      <div className="panel-icon" style={{ fontSize: '32px', lineHeight: 1 }}>{emoji}</div>
                    );
                  })()}
                  <div>
                    <div className="panel-title">{products[7].name}</div>
                    <div className="panel-sub">{products[7].desc?.substring(0, 30)}...</div>
                  </div>
                </div>
                <div className="panel-price">{products[7].price.toLocaleString()} <span>сом</span></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--gray-100)' }}>
        <div className="section-inner">
          <div className="section-header">
            <div>
              <div className="section-label">Навигация</div>
              <div className="section-title">{t.categories}</div>
            </div>
            <Link to="/catalog" className="see-all">{t.allCategories} <ChevronRight size={14} /></Link>
          </div>
          {loadError && (
            <div style={{ padding: '16px 18px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', marginBottom: '24px', fontWeight: 600 }}>
              {loadError}
            </div>
          )}
          <div className="categories-grid">
            {loading ? (
              <div style={{ gridColumn: '1 / -1', color: 'var(--muted)', padding: '32px 0' }}>Загрузка категорий...</div>
            ) : categories.map(cat => (
              <Link key={cat.id} className="cat-card" to={`/catalog?category=${encodeURIComponent(cat.name)}`}>
                <div className="cat-icon" style={{ fontSize: '32px', lineHeight: 1 }}>{iconToEmoji(cat.icon)}</div>
                <div className="cat-name">{cat.name}</div>
                <div className="cat-count">{cat.count} товаров</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="products-section" style={{ paddingTop: '64px' }}>
        <div className="products-inner">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">Популярное</div>
              <div className="section-title">Товары</div>
            </div>
          </div>
          <div className="filter-bar">
            <span className="filter-label">Сортировка:</span>
            <button className={`chip ${sortBy === 'popular' ? 'active' : ''}`} onClick={() => handleSort('popular')}>По популярности</button>
            <button className={`chip ${sortBy === 'price-asc' ? 'active' : ''}`} onClick={() => handleSort('price-asc')}>По цене ↑</button>
            <button className={`chip ${sortBy === 'price-desc' ? 'active' : ''}`} onClick={() => handleSort('price-desc')}>По цене ↓</button>
          </div>
          <div className="products-grid">
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>Загрузка товаров...</div>
            ) : loadError ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#b91c1c', background: '#fef2f2', borderRadius: '16px', fontWeight: 600 }}>{loadError}</div>
            ) : displayedProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>Товары пока не добавлены</div>
            ) : displayedProducts.slice(0, 8).map(product => (
              <div key={product.id} className="product-card" onClick={() => handleProductClick(product)}>
                <div className="product-img" style={{ background: 'linear-gradient(145deg, #f0f4ff, #e8eeff)' }}>
                  {(() => {
                    const images = getProductImages(product);
                    return (
                      <>
                        {images[0] && (
                          <img
                            src={`${IMG_BASE}${images[0]}`}
                            alt={product.name}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                          />
                        )}
                        <div style={{ display: images[0] ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '44px' }}>📦</span>
                        </div>
                      </>
                    );
                  })()}
                  {product.badge === 'hot' && <div className="product-badge badge-blue">Хит</div>}
                  {product.badge === 'new' && <div className="product-badge badge-green">Новинка</div>}
                  <div className="product-fav" onClick={(e) => { e.stopPropagation(); toggleFav(product.id) }} title={isFav(product.id) ? 'Убрать из избранного' : 'Добавить в избранное'}>
                    <Heart size={16} fill={isFav(product.id) ? 'currentColor' : 'none'} style={{ color: isFav(product.id) ? '#ef4444' : undefined }} />
                  </div>
                </div>
                <div className="product-body">
                  <div className="product-cat">{typeof product.category === 'object' ? product.category?.name : product.category}</div>
                  <div className="product-name">{getLang(product, 'name', language)}</div>
                  <div className="product-desc">{getLang(product, 'desc', language)}</div>
                  <div className="product-footer">
                    <div className="product-price">{product.price.toLocaleString()}<small>сом</small></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Link to="/catalog" className="see-all" style={{ justifyContent: 'center', fontSize: '16px' }}>
              {t.seeMore} <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <div className="trust-section">
        <div className="trust-grid">
          <div className="trust-card reveal" data-num="01" style={{ animationDelay: '0.1s' }}>
            <div className="trust-icon">
              🛡️
            </div>
            <div className="trust-title">Гарантия качества</div>
            <div className="trust-desc">Все товары сертифицированы и прошли проверку качества</div>
          </div>
          <div className="trust-card reveal" data-num="02" style={{ animationDelay: '0.2s' }}>
            <div className="trust-icon">
              💬
            </div>
            <div className="trust-title">WhatsApp заказ</div>
            <div className="trust-desc">Пишите нам в WhatsApp — ответим быстро и поможем с выбором</div>
          </div>
          <div className="trust-card reveal" data-num="03" style={{ animationDelay: '0.3s' }}>
            <div className="trust-icon">
              💰
            </div>
            <div className="trust-title">Лучшие цены</div>
            <div className="trust-desc">Прямые поставки от производителей без лишних наценок</div>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-logo"><img src="/logo.jpg" alt="ALINA PAINT" /></div>
            <div className="footer-desc">Строительные материалы и инструменты в Оше. Работаем с 2012 года, широкий ассортимент товаров в наличии.</div>
          </div>
          <div>
            <div className="footer-col-title">Связь</div>
            <a className="footer-link" href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer">WhatsApp</a>
            <a className="footer-link" href={buildTelegramLink()} target="_blank" rel="noreferrer">Telegram</a>
            <a className="footer-link" href={`tel:${PHONE}`}>Позвонить</a>
          </div>
          <div>
            <div className="footer-col-title">Каталог</div>
            {categories.length === 0 ? (
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Загрузка...</span>
            ) : (
              categories.slice(0, 6).map(cat => (
                <Link key={cat.id} className="footer-link" to={`/catalog?category=${encodeURIComponent(cat.name)}`}>{cat.name}</Link>
              ))
            )}
          </div>
          <div id="about">
            <div className="footer-col-title">Компания</div>
            <Link className="footer-link" to="#about">О нас</Link>
            <Link className="footer-link" to="#delivery">Доставка</Link>
            <Link className="footer-link" to="#">Гарантия</Link>
          </div>
          <div id="delivery">
            <div className="footer-col-title">Доставка</div>
            <div className="footer-desc" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
              Доставляем по Ошу и области в течение 24-48 часов. Бесплатная доставка при заказе от 10,000 сом.
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2024 ALINA PAINT. Все права защищены. Ош, Кыргызстан.</span>
          <span>Строительные материалы оптом и в розницу</span>
        </div>
      </footer>

      {modalOpen && selectedProduct && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <div className="modal-img-side">
              {(() => {
                const images = getProductImages(selectedProduct);
                return images[0] ? (
                  <img src={`${IMG_BASE}${images[0]}`} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="modal-img-icon">📦</div>
                );
              })()}
              <button className="modal-close" onClick={closeModal}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-cat-tag">{typeof selectedProduct.category === 'object' ? selectedProduct.category?.name : selectedProduct.category}</div>
              <div className="modal-title">{getLang(selectedProduct, 'name', language)}</div>
              <div className="modal-desc" style={{ fontSize: '15px', lineHeight: '1.6' }}>{getLang(selectedProduct, 'desc', language)}</div>
              <div className="modal-specs">
                <div className="modal-spec">
                  <span className="modal-spec-key">Категория</span>
                  <span className="modal-spec-val">{typeof selectedProduct.category === 'object' ? selectedProduct.category?.name : selectedProduct.category}</span>
                </div>
                <div className="modal-spec">
                  <span className="modal-spec-key">Наличие</span>
                  <span className="modal-spec-val" style={{ color: selectedProduct?.stock > 0 ? '#16a34a' : '#dc2626' }}>
                    {selectedProduct?.stock > 0 ? '✓ Есть в наличии' : '✗ Нет в наличии'}
                  </span>
                </div>
                <div className="modal-spec">
                  <span className="modal-spec-key">Доставка</span>
                  <span className="modal-spec-val">24–48 часов</span>
                </div>
              </div>
              <div className="modal-price">{selectedProduct.price.toLocaleString()} <small>сом</small></div>
              <div className="modal-actions">
                <a href={buildWhatsappLink(selectedProduct)} target="_blank" rel="noreferrer" className="modal-btn modal-btn-wa">
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
                <a href={buildTelegramLink()} target="_blank" rel="noreferrer" className="modal-btn modal-btn-tg">
                  <Send size={16} />
                  Telegram
                </a>
                <a href={`tel:${PHONE}`} className="modal-btn modal-btn-main">
                  <Phone size={16} />
                  Позвонить
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CatalogPage({ language, setLanguage, translations }) {
  const [searchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category')
  const [sortBy, setSortBy] = useState('popular')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResultsOpen, setSearchResultsOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false)
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const allProductsRef = useRef([])
  const debouncedSearch = useDebounce(searchQuery, 300)
  const { toggle: toggleFav, isFav } = useFavorites()

  // Fetch all data in one shot to avoid race condition with category counts
  useEffect(() => {
    Promise.all([api.getCategories(), api.getProducts({ limit: 500 })])
      .then(([cats, productsData]) => {
        const list = productsData.products || productsData
        const result = Array.isArray(list) ? list : []
        allProductsRef.current = result
        setProducts(result)
        setLoadError(null)
        setCategories(cats.map(cat => ({
          ...cat,
          count: result.filter(p => isProductInCategory(p, cat)).length
        })))
      })
      .catch(error => {
        console.error('Failed to load catalog data:', error)
        setLoadError('Не удалось загрузить каталог. Проверьте подключение к серверу.')
        allProductsRef.current = []
        setProducts([])
        setCategories([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCategoryFilter = useCallback((category) => {
    setActiveCategory(category)
    if (category === 'all') {
      setProducts(allProductsRef.current)
    } else {
      const filtered = allProductsRef.current.filter(p => {
        return isProductInCategory(p, category)
      })
      setProducts(filtered)
    }
  }, [])

  // Apply category filter from URL
  useEffect(() => {
    if (categoryFromUrl && products.length > 0) {
      handleCategoryFilter(categoryFromUrl)
    }
  }, [categoryFromUrl, products.length, handleCategoryFilter])

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedProduct(null)
    document.body.style.overflow = ''
  }

  const handleSort = (type) => setSortBy(type)

  const displayedProducts = useMemo(() => {
    const sorted = [...products]
    if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    else if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    else sorted.sort((a, b) => (b.views || 0) - (a.views || 0))
    return sorted
  }, [products, sortBy])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  useEffect(() => {
    if (debouncedSearch.length === 0) {
      setProducts(activeCategory === 'all' ? allProductsRef.current : allProductsRef.current.filter(p => {
        return isProductInCategory(p, activeCategory)
      }))
      setSearchResultsOpen(false)
    } else {
      const q = debouncedSearch.toLowerCase()
      const filtered = allProductsRef.current.filter(p => {
        const cat = typeof p.category === 'object' ? p.category?.name : p.category
        return p.name.toLowerCase().includes(q) || cat?.toLowerCase().includes(q)
      })
      setProducts(filtered)
      setSearchResultsOpen(true)
    }
  }, [debouncedSearch, activeCategory])

  const filteredSearchProducts = allProductsRef.current.filter(p => {
    const categoryName = typeof p.category === 'object' ? p.category?.name : p.category
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  }).slice(0, 5)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-wrap')) {
        setLanguageDropdownOpen(false)
        setContactDropdownOpen(false)
        setAddressDropdownOpen(false)
      }
      if (!e.target.closest('.mega-menu') && !e.target.closest('.nav-catalog-btn')) {
        setMegaMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const t = translations[language]

  return (
    <div className="page-transition-enter">
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <Clock size={13} />
            Пн–Сб (Кроме Пт): 09:00 – 18:00
            <span style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={13} />
              {t.location}
            </span>
          </div>
          <div className="topbar-right">
            <a href="#about">{t.about}</a>
            <a href="#delivery">{t.delivery}</a>
            <a href="#contacts">{t.contacts}</a>
            <span className="topbar-phone">{PHONE_LABEL}</span>
            <button onClick={() => setLanguage(language === 'ru' ? 'kg' : 'ru')} style={{ marginLeft: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={12} />
              {language === 'ru' ? 'RU' : 'KG'}
            </button>
          </div>
        </div>
      </div>

      <header>
        <div className="header-inner">
          <Link to="/" className="logo" onClick={() => setActiveCategory('all')}>
            <img src="/logo.jpg" alt="ALINA PAINT" />
          </Link>
          <div className="search-wrap">
            <input type="text" placeholder={t.searchPlaceholder} id="searchInput" value={searchQuery} onChange={handleSearch} onFocus={() => setSearchResultsOpen(searchQuery.length > 0)} />
            <button className="search-btn">
              <Search size={18} />
            </button>
            {searchResultsOpen && filteredSearchProducts.length > 0 && (
              <div className="search-results-dropdown">
                {filteredSearchProducts.map(product => (
                  <div key={product.id} className="search-result-item" onClick={() => { handleProductClick(product); setSearchResultsOpen(false); }}>
                    {(() => {
                      const images = getProductImages(product);
                      return images[0] ? (
                        <img src={`${IMG_BASE}${images[0]}`} alt={product.name} className="search-result-icon" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                      ) : (
                        <div className="search-result-icon">📦</div>
                      );
                    })()}
                    <div className="search-result-info">
                      <div className="search-result-name">{product.name}</div>
                      <div className="search-result-cat">{typeof product.category === 'object' ? product.category?.name : product.category}</div>
                    </div>
                    <div className="search-result-price">{product.price.toLocaleString()} сом</div>
                  </div>
                ))}
                <div className="search-result-footer" onClick={() => setSearchResultsOpen(false)}>
                  Показано {filteredSearchProducts.length} из {allProductsRef.current.length}
                </div>
              </div>
            )}
          </div>
          <div className="header-actions">
            <div className="dropdown-wrap">
              <button className="btn btn-ghost" onClick={() => setAddressDropdownOpen(!addressDropdownOpen)}>
                <MapPin size={15} />
                {t.address}
              </button>
              {addressDropdownOpen && (
                <div className="dropdown open">
                  <div className="drop-label">Наш магазин</div>
                  <div className="drop-item">
                    <div className="drop-icon blue"><MapPin size={16} /></div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--ink)' }}>{t.address}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{t.addressText}</div>
                    </div>
                  </div>
                  <div className="drop-divider"></div>
                  <div className="drop-item">
                    <div className="drop-icon green"><Lock size={16} /></div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--ink)' }}>Пн–Сб (Кроме Пт)</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>09:00 – 18:00</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="dropdown-wrap">
              <button className="btn btn-blue" onClick={() => setContactDropdownOpen(!contactDropdownOpen)}>
                <Phone size={15} />
                {t.call}
              </button>
              {contactDropdownOpen && (
                <div className="dropdown open">
                  <div className="drop-label">Контакты</div>
                  <a href={`tel:${PHONE}`} className="drop-item">
                    <div className="drop-icon blue"><Phone size={16} /></div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700' }}>{t.phoneText}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '1px' }}>Позвонить</div>
                    </div>
                  </a>
                  <div className="drop-divider"></div>
                  <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer" className="drop-item">
                    <div className="drop-icon green"><MessageCircle size={16} /></div>
                    WhatsApp
                  </a>
                  <a href={buildTelegramLink()} target="_blank" rel="noreferrer" className="drop-item">
                    <div className="drop-icon sky"><Send size={16} /></div>
                    Telegram
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav>
        <div className="nav-inner">
          <div className="nav-catalog-wrap">
            <button className="nav-catalog-btn" onClick={() => setMegaMenuOpen(!megaMenuOpen)}>
              <Menu size={15} />
              {t.catalog}
            </button>
            {megaMenuOpen && (
              <div className="mega-menu open">
                <button className="mega-link" onClick={() => { handleCategoryFilter('all'); setMegaMenuOpen(false); }}><div className="mega-link-icon" style={{ background: '#eff6ff' }}>📋</div> {t.all}</button>
                {categories.map(cat => (
                  <button key={cat.id} className="mega-link" onClick={() => { handleCategoryFilter(cat.name); setMegaMenuOpen(false); }}><div className="mega-link-icon" style={{ background: '#eff6ff' }}>{iconToEmoji(cat.icon)}</div> {cat.name} ({cat.count})</button>
                ))}
              </div>
            )}
          </div>
          <button className={`nav-link ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => handleCategoryFilter('all')}>{t.all}</button>
          {categories.map(cat => (
            <button key={cat.id} className={`nav-link ${activeCategory === cat.name ? 'active' : ''}`} onClick={() => handleCategoryFilter(cat.name)}>
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </nav>

      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <div className="section-label">{t.catalogLabel}</div>
              <div className="section-title">{t.allCategories}</div>
            </div>
          </div>
          {loadError && (
            <div style={{ padding: '16px 18px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', marginBottom: '24px', fontWeight: 600 }}>
              {loadError}
            </div>
          )}
          <div className="categories-grid">
            {loading ? (
              <div style={{ gridColumn: '1 / -1', color: 'var(--muted)', padding: '32px 0' }}>Загрузка категорий...</div>
            ) : categories.map(cat => (
              <Link
                key={cat.id}
                className={`cat-card ${activeCategory === cat.name ? 'active' : ''}`}
                to={`/catalog?category=${encodeURIComponent(cat.name)}`}
                onClick={() => handleCategoryFilter(cat.name)}
              >
                <div className="cat-icon" style={{ fontSize: '32px', lineHeight: 1 }}>{iconToEmoji(cat.icon)}</div>
                <div className="cat-name">{cat.name}</div>
                <div className="cat-count">{cat.count ?? 0} товаров</div>
              </Link>
            ))}
          </div>

          <div className="filter-bar" style={{ marginTop: '48px' }}>
            <span className="filter-label">Сортировка:</span>
            <button className={`chip ${sortBy === 'popular' ? 'active' : ''}`} onClick={() => handleSort('popular')}>По популярности</button>
            <button className={`chip ${sortBy === 'price-asc' ? 'active' : ''}`} onClick={() => handleSort('price-asc')}>По цене ↑</button>
            <button className={`chip ${sortBy === 'price-desc' ? 'active' : ''}`} onClick={() => handleSort('price-desc')}>По цене ↓</button>
          </div>

          <div className="products-grid">
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>Загрузка товаров...</div>
            ) : loadError ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px', color: '#b91c1c', background: '#fef2f2', borderRadius: '16px', fontWeight: 600 }}>{loadError}</div>
            ) : displayedProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Нет товаров</div>
                <div style={{ fontSize: '14px' }}>В этой категории пока нет товаров</div>
              </div>
            ) : displayedProducts.map(product => (
              <div key={product.id} className="product-card" onClick={() => handleProductClick(product)}>
                <div className="product-img" style={{ background: 'linear-gradient(145deg, #f0f4ff, #e8eeff)' }}>
                  {(() => {
                    const images = getProductImages(product);
                    return (
                      <>
                        {images[0] && (
                          <img
                            src={`${IMG_BASE}${images[0]}`}
                            alt={product.name}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                          />
                        )}
                        <div style={{ display: images[0] ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '44px' }}>📦</span>
                        </div>
                      </>
                    );
                  })()}
                  {product.badge === 'hot' && <div className="product-badge badge-blue">Хит</div>}
                  {product.badge === 'new' && <div className="product-badge badge-green">Новинка</div>}
                  <div className="product-fav" onClick={(e) => { e.stopPropagation(); toggleFav(product.id) }} title={isFav(product.id) ? 'Убрать из избранного' : 'Добавить в избранное'}>
                    <Heart size={16} fill={isFav(product.id) ? 'currentColor' : 'none'} style={{ color: isFav(product.id) ? '#ef4444' : undefined }} />
                  </div>
                </div>
                <div className="product-body">
                  <div className="product-cat">{typeof product.category === 'object' ? product.category?.name : product.category}</div>
                  <div className="product-name">{getLang(product, 'name', language)}</div>
                  <div className="product-desc">{getLang(product, 'desc', language)}</div>
                  <div className="product-footer">
                    <div className="product-price">{product.price.toLocaleString()}<small>сом</small></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {
        modalOpen && selectedProduct && (
          <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
            <div className="modal">
              <div className="modal-img-side">
                {(() => {
                  const images = getProductImages(selectedProduct);
                  return images[0] ? (
                    <img src={`${IMG_BASE}${images[0]}`} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="modal-img-icon">📦</div>
                  );
                })()}
                <button className="modal-close" onClick={closeModal}>
                  <X size={16} />
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-cat-tag">{typeof selectedProduct.category === 'object' ? selectedProduct.category?.name : selectedProduct.category}</div>
                <div className="modal-title">{getLang(selectedProduct, 'name', language)}</div>
                <div className="modal-desc">{getLang(selectedProduct, 'desc', language)}</div>
                <div className="modal-specs">
                  <div className="modal-spec">
                    <span className="modal-spec-key">Категория</span>
                    <span className="modal-spec-val">{typeof selectedProduct.category === 'object' ? selectedProduct.category?.name : selectedProduct.category}</span>
                  </div>
                  <div className="modal-spec">
                    <span className="modal-spec-key">Наличие</span>
                    <span className="modal-spec-val" style={{ color: selectedProduct?.stock > 0 ? '#16a34a' : '#dc2626' }}>
                      {selectedProduct?.stock > 0 ? '✓ Есть в наличии' : '✗ Нет в наличии'}
                    </span>
                  </div>
                  <div className="modal-spec">
                    <span className="modal-spec-key">Доставка</span>
                    <span className="modal-spec-val">24–48 часов</span>
                  </div>
                </div>
                <div className="modal-price">{selectedProduct.price.toLocaleString()} <small>сом</small></div>
                <div className="modal-actions">
                  <a href={buildWhatsappLink(selectedProduct)} target="_blank" rel="noreferrer" className="modal-btn modal-btn-wa">
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                  <a href={buildTelegramLink()} target="_blank" rel="noreferrer" className="modal-btn modal-btn-tg">
                    <Send size={16} />
                    Telegram
                  </a>
                  <button className="modal-btn modal-btn-main" onClick={() => { window.location.href = `tel:${PHONE}`; }}>
                    <Phone size={16} />
                    Позвонить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}

function ProductDetailPage({ language, setLanguage, translations }) {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const t = translations[language]
  const navigate = useNavigate()

  useEffect(() => {
    api.getProduct(id)
      .then(setProduct)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '18px', color: '#64748b' }}>Загрузка...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontSize: '24px', color: '#dc2626' }}>{error === 'Product not found' ? 'Товар не найден' : 'Ошибка загрузки. Повторите позже.'}</div>
        <button onClick={() => navigate('/catalog')} style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Вернуться в каталог
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontSize: '24px', color: '#dc2626' }}>Товар не найден</div>
        <button onClick={() => navigate('/catalog')} style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Вернуться в каталог
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="topbar">
        <div className="topbar-inner">
          <span><MapPin size={12} /> {t.location}</span>
          <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
            <Link to="/">О компании</Link>
            <Link to="/">Доставка</Link>
            <Link to="/">Контакты</Link>
            <a href={`tel:${PHONE}`}>{PHONE_LABEL}</a>
            <button onClick={() => setLanguage(language === 'ru' ? 'kg' : 'ru')} style={{ marginLeft: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={12} />
              {language === 'ru' ? 'RU' : 'KG'}
            </button>
          </div>
        </div>
      </div>

      <header>
        <div className="header-inner">
          <Link to="/" className="logo"><img src="/logo.jpg" alt="ALINA PAINT" /></Link>
          <div className="search-bar">
            <input type="text" placeholder="Поиск по каталогу товаров..." />
            <Search className="search-icon" size={18} />
          </div>
          <div className="header-actions">
            <a href="#" className="btn-outline">
              <MapPin size={15} />
              {t.address}
            </a>
            <a href={`tel:${PHONE}`} className="btn-primary">
              <Phone size={15} />
              {t.call}
            </a>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="section-inner">
          <Link to="/catalog" style={{ color: 'var(--blue)', fontSize: '14px', marginBottom: '24px', display: 'inline-block' }}>
            {t.backToCatalog}
          </Link>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginTop: '24px' }}>
            <div style={{ background: 'var(--gray-100)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', overflow: 'hidden' }}>
              {(() => {
                const images = getProductImages(product);
                return images[0] ? (
                  <img src={`${IMG_BASE}${images[0]}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '120px' }}>📦</div>
                );
              })()}
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue-light)', marginBottom: '10px' }}>
                {typeof product.category === 'object' ? product.category?.name : product.category}
              </div>
              <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '32px', fontWeight: '800', color: 'var(--navy)', marginBottom: '16px', lineHeight: '1.2' }}>
                {product.name}
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--text-light)', lineHeight: '1.7', marginBottom: '32px' }}>
                {product.desc}
              </p>

              <div style={{ marginBottom: '24px' }}>
                {(() => {
                  let specs = {}
                  try {
                    specs = typeof product.specs === 'string'
                      ? JSON.parse(product.specs)
                      : (product.specs || {})
                  } catch { specs = {} }
                  return Object.entries(specs).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '12px 0', borderBottom: '1px solid var(--gray-200)' }}>
                      <span style={{ color: 'var(--text-light)' }}>{key}</span>
                      <span style={{ fontWeight: '600', color: 'var(--navy)' }}>{value}</span>
                    </div>
                  ))
                })()}
              </div>

              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '36px', fontWeight: '900', color: 'var(--navy)', marginBottom: '24px' }}>
                {product.price.toLocaleString()} <small style={{ fontSize: '18px', color: 'var(--gray-400)', fontWeight: '400' }}>сом</small>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={buildWhatsappLink(product)} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
                <a href={buildTelegramLink()} target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px', background: '#0088cc', borderColor: '#0088cc' }}>
                  <Send size={18} />
                  Telegram
                </a>
                <a href={`tel:${PHONE}`} className="btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '14px' }}>
                  <Phone size={18} />
                  {t.call}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function LoginPage({ language, translations }) {
  const t = translations[language]
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      localStorage.setItem('auth_token', data.accessToken)
      localStorage.setItem('refresh_token', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = import.meta.env.VITE_ADMIN_URL || '/admin-panel'
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo.jpg" alt="ALINA PAINT" style={{ height: '40px', marginBottom: '8px' }} />
          <div style={{ fontSize: '14px', color: '#64748b' }}>Вход в админ-панель</div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0b121f', marginBottom: '8px' }}>Логин</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0b121f', marginBottom: '8px' }}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? '#94a3b8' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          <Link to="/" style={{ color: '#2563eb', textDecoration: 'none' }}>← Вернуться на главную</Link>
        </div>
      </div>
    </div>
  )
}

export default App