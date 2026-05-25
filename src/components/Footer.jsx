import { Phone, MapPin } from 'lucide-react'

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

const Footer = () => {
  const categories = localCategories

  return (
    <footer>
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo"><img src="/logo.jpg" alt="ALINA PAINT" /></div>
          <p className="footer-desc">Строительные материалы и инструменты в Оше. Работаем с 2012 года, более 2400 товаров в наличии.</p>
          <div className="footer-contacts">
            <div className="footer-contact">
              <Phone size={14} />
              +996 552 10-70-36
            </div>
            <div className="footer-contact">
              <MapPin size={14} />
              Ош, ул. Строительная, 12
            </div>
          </div>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Каталог</div>
          {categories.slice(0, 6).map((cat) => (
            <a key={cat.id} href={`/catalog?category=${cat.id}`} className="footer-link">
              {cat.name}
            </a>
          ))}
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Компания</div>
          <a href="#" className="footer-link">О нас</a>
          <a href="#" className="footer-link">Доставка</a>
          <a href="#" className="footer-link">Гарантия</a>
          <a href="#" className="footer-link">Документы</a>
        </div>
        <div className="footer-col">
          <div className="footer-col-title">Связь</div>
          <a href="https://wa.me/996552107036" className="footer-link" target="_blank">WhatsApp</a>
          <a href="https://t.me/moonyx11" className="footer-link" target="_blank">Telegram</a>
          <a href="tel:+996552107036" className="footer-link">Позвонить</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2024 ALINA PAINT. Все права защищены. Ош, Кыргызстан.</span>
          <span>Строительные материалы оптом и в розницу</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
