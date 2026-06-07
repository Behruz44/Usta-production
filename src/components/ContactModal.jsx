import { X, Phone, MapPin, MessageCircle, Send } from 'lucide-react'

const ContactModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box contact-modal">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="contact-modal-icon">
          <Phone size={32} strokeWidth={2} />
        </div>
        <h3 className="contact-modal-title">Связаться с нами</h3>
        <p className="contact-modal-sub">Выберите удобный способ связи</p>
        <a href="tel:+996555095356" className="contact-btn phone-btn">
          <Phone size={20} />
          Позвонить: +996 555 09-53-56
        </a>
        <div className="contact-divider"><span>или написать</span></div>
        <div className="contact-messengers">
          <a href="https://wa.me/996555095356?text=Здравствуйте! Хочу узнать о товаре." target="_blank" className="messenger-btn whatsapp-btn">
            <MessageCircle size={24} />
            WhatsApp
          </a>
          <a href="https://t.me/moonyx11?text=Здравствуйте! Хочу узнать о товаре." target="_blank" className="messenger-btn telegram-btn">
            <Send size={24} />
            Telegram
          </a>
        </div>
        <div className="contact-address">
          <MapPin size={14} />
          Ош, ул. Строительная, 12. Пн-Вс 09:00–18:00
        </div>
      </div>
    </div>
  )
}

export default ContactModal
