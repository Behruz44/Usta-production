#!/bin/bash
# ============================================================
#  USTA — VPS Setup Script (Ubuntu 22.04, Hostinger)
#  Использование: sudo bash setup-vps.sh yourdomain.com
# ============================================================

set -e

DOMAIN=${1:-"yourdomain.com"}
REPO="https://github.com/Behruz44/Usta-production.git"
APP_DIR="/var/www/usta"
NODE_VERSION="20"

echo "======================================"
echo "  USTA Deploy — домен: $DOMAIN"
echo "======================================"

# 1. Обновить систему
echo ">>> [1/8] Обновление системы..."
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx ufw

# 2. Установить Node.js
echo ">>> [2/8] Установка Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs
node -v && npm -v

# 3. Установить PM2
echo ">>> [3/8] Установка PM2..."
npm install -g pm2

# 4. Клонировать репозиторий
echo ">>> [4/8] Клонирование репозитория..."
mkdir -p $APP_DIR
git clone $REPO $APP_DIR || (cd $APP_DIR && git pull)
cd $APP_DIR

# 5. Установить зависимости и собрать проекты
echo ">>> [5/8] Установка зависимостей и сборка..."

# Backend + Frontend зависимости
npm install --production=false

# Собрать фронтенд
npm run build

# Собрать админку
cd $APP_DIR/admin
npm install --production=false
npm run build
cd $APP_DIR

# Создать папку для загрузок
mkdir -p $APP_DIR/uploads/products

# 6. Создать .env файл
echo ">>> [6/8] Настройка окружения..."
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

cat > $APP_DIR/.env << EOF
NODE_ENV=production
PORT=3000
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
SQLITE_STORAGE=$APP_DIR/usta_db.sqlite
ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN,https://admin.$DOMAIN
EOF

echo ">>> .env создан (JWT_SECRET сгенерирован автоматически)"

# Инициализировать БД
cd $APP_DIR
node scripts/init-db.js || echo "БД уже инициализирована"

# 7. Запустить через PM2
echo ">>> [7/8] Запуск сервера через PM2..."
pm2 delete usta 2>/dev/null || true
pm2 start server.js --name "usta" --cwd $APP_DIR
pm2 save
pm2 startup | tail -1 | bash || true

# 8. Настроить Nginx
echo ">>> [8/8] Настройка Nginx..."

cat > /etc/nginx/sites-available/usta << EOF
# ── Основной сайт ─────────────────────────────────────────
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Загрузки
    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # API → Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # React фронтенд (SPA)
    location / {
        root $APP_DIR/dist;
        try_files \$uri \$uri/ /index.html;
        expires 1h;
    }
}

# ── Админ панель ──────────────────────────────────────────
server {
    listen 80;
    server_name admin.$DOMAIN;

    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 30d;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        root $APP_DIR/admin/dist;
        try_files \$uri \$uri/ /index.html;
        expires 1h;
    }
}
EOF

ln -sf /etc/nginx/sites-available/usta /etc/nginx/sites-enabled/usta
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# SSL через Certbot
echo ""
echo "======================================"
echo "  Получение SSL сертификата..."
echo "======================================"
certbot --nginx -d $DOMAIN -d www.$DOMAIN -d admin.$DOMAIN \
    --non-interactive --agree-tos --email admin@$DOMAIN \
    --redirect

echo ""
echo "======================================"
echo "  ✅ ДЕПЛОЙ ЗАВЕРШЁН!"
echo "======================================"
echo "  Сайт:       https://$DOMAIN"
echo "  Админ:      https://admin.$DOMAIN"
echo "  API:        https://$DOMAIN/api"
echo ""
echo "  PM2 статус: pm2 status"
echo "  Логи:       pm2 logs usta"
echo "  Обновить:   bash $APP_DIR/deploy/update.sh"
echo "======================================"
