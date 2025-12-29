#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║   HaberNexus - Geri Yükleme Sistemi                                       ║
# ║   Kullanım: bash restore.sh [yedek_dosyası]                               ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Yapılandırma
readonly INSTALL_DIR="/var/www/habernexus"
readonly BACKUP_DIR="/var/www/habernexus-backups"
readonly PM2_APP_NAME="habernexus"

# Renkler
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m'

print_step() { echo -e "${BLUE}▶${NC} ${WHITE}$1${NC}"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${WHITE}  HaberNexus Geri Yükleme Sistemi${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Yedek dosyası seçimi
if [[ -n "${1:-}" ]]; then
    BACKUP_FILE="$1"
else
    # Mevcut yedekleri listele
    echo -e "${WHITE}Mevcut Yedekler:${NC}"
    echo ""
    
    backups=($(ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null))
    
    if [[ ${#backups[@]} -eq 0 ]]; then
        print_error "Hiç yedek bulunamadı!"
        exit 1
    fi
    
    for i in "${!backups[@]}"; do
        size=$(du -h "${backups[$i]}" | cut -f1)
        name=$(basename "${backups[$i]}")
        echo -e "  ${CYAN}$((i+1))${NC}) $name ($size)"
    done
    
    echo ""
    read -p "Geri yüklenecek yedeği seçin (1-${#backups[@]}): " selection
    
    if [[ ! "$selection" =~ ^[0-9]+$ ]] || [[ $selection -lt 1 ]] || [[ $selection -gt ${#backups[@]} ]]; then
        print_error "Geçersiz seçim!"
        exit 1
    fi
    
    BACKUP_FILE="${backups[$((selection-1))]}"
fi

# Yedek dosyası kontrolü
if [[ ! -f "$BACKUP_FILE" ]]; then
    print_error "Yedek dosyası bulunamadı: $BACKUP_FILE"
    exit 1
fi

echo ""
print_warning "Bu işlem mevcut veritabanını ve ayarları değiştirecektir!"
read -p "Devam etmek istiyor musunuz? (e/h): " confirm

if [[ ! $confirm =~ ^[Ee]$ ]]; then
    echo "İşlem iptal edildi."
    exit 0
fi

# Uygulamayı durdur
print_step "Uygulama durduruluyor..."
pm2 stop "$PM2_APP_NAME" 2>/dev/null || true
print_success "Uygulama durduruldu"

# Geçici dizin oluştur
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Yedeği aç
print_step "Yedek açılıyor..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"
BACKUP_CONTENT=$(ls "$TEMP_DIR")
print_success "Yedek açıldı"

# Veritabanını geri yükle
print_step "Veritabanı geri yükleniyor..."
if [[ -f "$TEMP_DIR/$BACKUP_CONTENT/data.db" ]]; then
    cp "$TEMP_DIR/$BACKUP_CONTENT/data.db" "$INSTALL_DIR/"
    print_success "Veritabanı geri yüklendi"
else
    print_warning "Yedekte veritabanı bulunamadı"
fi

# Environment dosyasını geri yükle
print_step "Environment dosyası geri yükleniyor..."
if [[ -f "$TEMP_DIR/$BACKUP_CONTENT/.env" ]]; then
    cp "$TEMP_DIR/$BACKUP_CONTENT/.env" "$INSTALL_DIR/"
    print_success "Environment dosyası geri yüklendi"
else
    print_warning "Yedekte environment dosyası bulunamadı"
fi

# Upload dosyalarını geri yükle
print_step "Upload dosyaları geri yükleniyor..."
if [[ -d "$TEMP_DIR/$BACKUP_CONTENT/uploads" ]]; then
    rm -rf "$INSTALL_DIR/public/uploads"
    cp -r "$TEMP_DIR/$BACKUP_CONTENT/uploads" "$INSTALL_DIR/public/"
    print_success "Upload dosyaları geri yüklendi"
else
    print_warning "Yedekte upload dosyaları bulunamadı"
fi

# Uygulamayı başlat
print_step "Uygulama başlatılıyor..."
pm2 restart "$PM2_APP_NAME"
print_success "Uygulama başlatıldı"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  GERİ YÜKLEME TAMAMLANDI!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
