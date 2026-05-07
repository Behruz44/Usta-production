#!/bin/bash
# ============================================================
#  USTA — Update Script (запускать при каждом обновлении)
#  Использование: bash /var/www/usta/deploy/update.sh
# ============================================================

set -e
APP_DIR="/var/www/usta"
cd $APP_DIR

echo ">>> Получение обновлений из GitHub..."
git pull origin main

echo ">>> Обновление зависимостей..."
npm install --production=false

echo ">>> Сборка фронтенда..."
npm run build

echo ">>> Сборка админки..."
cd $APP_DIR/admin && npm install --production=false && npm run build
cd $APP_DIR

echo ">>> Перезапуск сервера..."
pm2 restart usta

echo "✅ Обновление завершено!"
pm2 status
