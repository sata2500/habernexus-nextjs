#!/bin/bash

# ============================================
# HaberNexus - Güncelleme Script'i
# ============================================
# Bu script, mevcut HaberNexus kurulumunuzu
# en son sürüme günceller.
# ============================================

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

echo ""
echo -e "${YELLOW}HaberNexus Güncelleme${NC}"
echo "═══════════════════════════════════════"
echo ""

# Proje dizininde olduğumuzdan emin ol
if [ ! -f "package.json" ]; then
    log_error "Bu script proje dizininde çalıştırılmalıdır."
    exit 1
fi

# Mevcut sürümü kaydet
CURRENT_VERSION=$(grep '"version"' package.json | cut -d'"' -f4)
log_info "Mevcut sürüm: $CURRENT_VERSION"

# Değişiklikleri kontrol et
if [ -n "$(git status --porcelain)" ]; then
    log_error "Kaydedilmemiş değişiklikler var. Önce commit yapın veya stash edin."
    exit 1
fi

# Güncellemeleri çek
log_info "Güncellemeler kontrol ediliyor..."
git fetch origin master

# Güncelleme var mı kontrol et
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)

if [ "$LOCAL" = "$REMOTE" ]; then
    log_success "Zaten en güncel sürümdesiniz!"
    exit 0
fi

# Uygulamayı durdur
log_info "Uygulama durduruluyor..."
pm2 stop habernexus > /dev/null 2>&1 || true

# Güncellemeleri uygula
log_info "Güncellemeler uygulanıyor..."
git pull origin master

# Bağımlılıkları güncelle
log_info "Bağımlılıklar güncelleniyor..."
npm ci > /dev/null 2>&1

# Veritabanı migrasyonları
log_info "Veritabanı güncelleniyor..."
npx prisma generate > /dev/null 2>&1
npx prisma db push > /dev/null 2>&1

# Yeniden build
log_info "Proje yeniden build ediliyor..."
npm run build > /dev/null 2>&1

# Uygulamayı başlat
log_info "Uygulama başlatılıyor..."
pm2 restart habernexus > /dev/null 2>&1

# Yeni sürümü göster
NEW_VERSION=$(grep '"version"' package.json | cut -d'"' -f4)

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}     GÜNCELLEME TAMAMLANDI!            ${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "  Eski sürüm: ${YELLOW}$CURRENT_VERSION${NC}"
echo -e "  Yeni sürüm: ${GREEN}$NEW_VERSION${NC}"
echo ""
