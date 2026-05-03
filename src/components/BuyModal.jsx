import { X, Phone, MessageCircle, Send } from 'lucide-react'

const BuyModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null

  const whatsappMessage = encodeURIComponent(`Здравствуйте! Хочу купить: ${product.name}. Цена: ${product.price} сом`)
  const telegramMessage = encodeURIComponent(`Здравствуйте! Хочу купить: ${product.name}. Цена: ${product.price} сом`)

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box buy-modal">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="buy-modal-product">
          <div className="buy-modal-product-name">{product.name}</div>
          <div className="buy-modal-product-price">{product.price.toLocaleString()} сом</div>
        </div>
        <h3 className="contact-modal-title" style={{ marginTop: '8px' }}>Купить товар</h3>
        <p className="contact-modal-sub">Выберите способ связи для заказа</p>
        <a href="tel:+996312000000" className="contact-btn phone-btn">
          <Phone size={20} />
          Позвонить: +996 312 00-00-00
        </a>
        <div className="contact-divider"><span>или написать</span></div>
        <div className="contact-messengers">
          <a href={`https://wa.me/996312000000?text=${whatsappMessage}`} target="_blank" className="messenger-btn whatsapp-btn">
            <MessageCircle size={24} />
            WhatsApp
          </a>
          <a href={`https://t.me/usta_osh?text=${telegramMessage}`} target="_blank" className="messenger-btn telegram-btn">
            <Send size={24} />
            Telegram
          </a>
        </div>
      </div>
    </div>
  )
}

export default BuyModal
