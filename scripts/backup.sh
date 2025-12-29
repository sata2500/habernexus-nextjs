#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║   HaberNexus - Yedekleme Sistemi                                          ║
# ║   Kullanım: habernexus backup                                             ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Yapılandırma
readonly INSTALL_DIR="/var/www/habernexus"
readonly BACKUP_DIR="/var/www/habernexus-backups"
readonly MAX_BACKUPS=10

# Renkler
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m'

print_step() { echo -e "${BLUE}▶${NC} ${WHITE}$1${NC}"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_info() { echo -e "${CYAN}ℹ${NC} $1"; }

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${WHITE}  HaberNexus Yedekleme Sistemi${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Kurulum kontrolü
if [[ ! -d "$INSTALL_DIR" ]]; then
    echo -e "${YELLOW}HaberNexus kurulumu bulunamadı!${NC}"
    exit 1
fi

# Yedekleme dizini oluştur
mkdir -p "$BACKUP_DIR"

# Yedekleme adı
BACKUP_NAME="habernexus-backup-$(date +%Y%m%d-%H%M%S)"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
mkdir -p "$BACKUP_PATH"

# Veritabanı yedekle
print_step "Veritabanı yedekleniyor..."
if [[ -f "$INSTALL_DIR/data.db" ]]; then
    cp "$INSTALL_DIR/data.db" "$BACKUP_PATH/"
    print_success "Veritabanı yedeklendi"
else
    print_info "Veritabanı dosyası bulunamadı"
fi

# Environment dosyası yedekle
print_step "Environment dosyası yedekleniyor..."
if [[ -f "$INSTALL_DIR/.env" ]]; then
    cp "$INSTALL_DIR/.env" "$BACKUP_PATH/"
    print_success "Environment dosyası yedeklendi"
fi

# Upload dosyaları yedekle
print_step "Upload dosyaları yedekleniyor..."
if [[ -d "$INSTALL_DIR/public/uploads" ]]; then
    cp -r "$INSTALL_DIR/public/uploads" "$BACKUP_PATH/"
    print_success "Upload dosyaları yedeklendi"
fi

# Sıkıştır
print_step "Yedek sıkıştırılıyor..."
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
print_success "Yedek sıkıştırıldı"

# Eski yedekleri temizle
print_step "Eski yedekler temizleniyor..."
ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f 2>/dev/null || true

# Özet
BACKUP_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" | cut -f1)

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  YEDEKLEME TAMAMLANDI!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${WHITE}Yedek Dosyası:${NC} $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
echo -e "  ${WHITE}Boyut:${NC}         $BACKUP_SIZE"
echo ""

# Mevcut yedekleri listele
echo -e "${WHITE}Mevcut Yedekler:${NC}"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}' | head -5
echo ""
