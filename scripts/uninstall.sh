#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║   HaberNexus - Kaldırma Sistemi                                           ║
# ║   Kullanım: bash uninstall.sh                                             ║
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

echo ""
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${WHITE}  HaberNexus Kaldırma Sistemi${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

print_warning "Bu işlem HaberNexus'u tamamen kaldıracaktır!"
echo ""
echo "Kaldırılacaklar:"
echo "  • PM2 uygulaması"
echo "  • Proje dosyaları ($INSTALL_DIR)"
echo "  • Web sunucusu yapılandırması"
echo "  • Yönetim scripti"
echo ""
echo "Kaldırılmayacaklar:"
echo "  • Yedekler ($BACKUP_DIR)"
echo "  • Node.js, PM2, Caddy/Nginx"
echo ""

read -p "Devam etmek istiyor musunuz? (evet yazın): " confirm

if [[ "$confirm" != "evet" ]]; then
    echo "Kaldırma iptal edildi."
    exit 0
fi

# Son yedek al
echo ""
print_step "Son yedek alınıyor..."
if [[ -f "$INSTALL_DIR/scripts/backup.sh" ]]; then
    bash "$INSTALL_DIR/scripts/backup.sh" || true
fi

# PM2 uygulamasını kaldır
print_step "PM2 uygulaması kaldırılıyor..."
pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
pm2 save 2>/dev/null || true
print_success "PM2 uygulaması kaldırıldı"

# Caddy yapılandırmasını kaldır
if [[ -f /etc/caddy/Caddyfile ]]; then
    print_step "Caddy yapılandırması kaldırılıyor..."
    sudo rm -f /etc/caddy/Caddyfile
    sudo systemctl restart caddy 2>/dev/null || true
    print_success "Caddy yapılandırması kaldırıldı"
fi

# Nginx yapılandırmasını kaldır
if [[ -f /etc/nginx/sites-enabled/habernexus ]]; then
    print_step "Nginx yapılandırması kaldırılıyor..."
    sudo rm -f /etc/nginx/sites-enabled/habernexus
    sudo rm -f /etc/nginx/sites-available/habernexus
    sudo systemctl restart nginx 2>/dev/null || true
    print_success "Nginx yapılandırması kaldırıldı"
fi

# Yönetim scriptini kaldır
print_step "Yönetim scripti kaldırılıyor..."
sudo rm -f /usr/local/bin/habernexus
print_success "Yönetim scripti kaldırıldı"

# Proje dosyalarını kaldır
print_step "Proje dosyaları kaldırılıyor..."
sudo rm -rf "$INSTALL_DIR"
print_success "Proje dosyaları kaldırıldı"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  KALDIRMA TAMAMLANDI!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Yedekleriniz korundu: ${WHITE}$BACKUP_DIR${NC}"
echo ""
echo "Yeniden kurmak için:"
echo -e "${CYAN}curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/install.sh | bash${NC}"
echo ""
