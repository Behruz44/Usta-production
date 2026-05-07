# Деплой USTA на VPS (Hostinger)

## Шаги

### 1. Купи VPS на Hostinger
- Выбери **Ubuntu 22.04**
- Минимум: **2 vCPU, 2GB RAM** (KVM 2 подойдёт)
- Регион: Singapore

### 2. Направь домен на VPS
В DNS настройках своего домена (.com):
```
A     @          YOUR_VPS_IP
A     www        YOUR_VPS_IP  
A     admin      YOUR_VPS_IP
```
⏳ Подождать 5-30 минут пока DNS обновится

### 3. Подключись к серверу
```bash
ssh root@YOUR_VPS_IP
```

### 4. Запусти скрипт деплоя
```bash
curl -O https://raw.githubusercontent.com/Behruz44/Usta-production/main/deploy/setup-vps.sh
sudo bash setup-vps.sh yourdomain.com
```

Скрипт автоматически:
- ✅ Установит Node.js, Nginx, PM2, Certbot
- ✅ Клонирует репозиторий с GitHub
- ✅ Соберёт фронтенд и админку
- ✅ Создаст `.env` с секретными ключами
- ✅ Запустит сервер через PM2
- ✅ Настроит Nginx
- ✅ Получит SSL сертификат (HTTPS)

### 5. После деплоя

| Сервис | URL |
|--------|-----|
| Сайт | `https://yourdomain.com` |
| Админ панель | `https://admin.yourdomain.com` |
| API | `https://yourdomain.com/api` |

---

## Полезные команды на сервере

```bash
# Статус сервера
pm2 status

# Логи
pm2 logs usta

# Перезапустить
pm2 restart usta

# Обновить после изменений в коде
bash /var/www/usta/deploy/update.sh
```

---

## Перенос фото с локального компьютера на сервер

```bash
# Запусти на своём компьютере (Windows PowerShell)
scp -r d:/knauf/test/uploads/products/* root@YOUR_VPS_IP:/var/www/usta/uploads/products/
```
