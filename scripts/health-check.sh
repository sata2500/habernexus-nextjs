#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║   HaberNexus - Sağlık Kontrolü                                            ║
# ║   Kullanım: bash health-check.sh                                          ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Yapılandırma
readonly INSTALL_DIR="/var/www/habernexus"
readonly PM2_APP_NAME="habernexus"

# Renkler
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m'

print_check() { echo -e "${BLUE}●${NC} $1"; }
print_ok() { echo -e "  ${GREEN}✓${NC} $1"; }
print_warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
print_fail() { echo -e "  ${RED}✗${NC} $1"; }

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${WHITE}  HaberNexus Sağlık Kontrolü${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ISSUES=0

# Kurulum kontrolü
print_check "Kurulum Dizini"
if [[ -d "$INSTALL_DIR" ]]; then
    print_ok "Kurulum dizini mevcut: $INSTALL_DIR"
else
    print_fail "Kurulum dizini bulunamadı!"
    ((ISSUES++))
fi

# Node.js kontrolü
print_check "Node.js"
if command -v node &> /dev/null; then
    version=$(node -v)
    major_version=$(echo "$version" | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $major_version -ge 20 ]]; then
        print_ok "Node.js $version"
    else
        print_warn "Node.js $version (v20+ önerilir)"
        ((ISSUES++))
    fi
else
    print_fail "Node.js kurulu değil!"
    ((ISSUES++))
fi

# PM2 kontrolü
print_check "PM2 Process Manager"
if command -v pm2 &> /dev/null; then
    print_ok "PM2 kurulu"
    
    # Uygulama durumu
    if pm2 show "$PM2_APP_NAME" &> /dev/null; then
        status=$(pm2 show "$PM2_APP_NAME" | grep "status" | awk '{print $4}')
        if [[ "$status" == "online" ]]; then
            print_ok "Uygulama çalışıyor (online)"
            
            # Uptime
            uptime=$(pm2 show "$PM2_APP_NAME" | grep "uptime" | awk '{print $4, $5}')
            print_ok "Uptime: $uptime"
            
            # Memory
            memory=$(pm2 show "$PM2_APP_NAME" | grep "heap size" | awk '{print $4, $5}')
            print_ok "Memory: $memory"
        else
            print_fail "Uygulama çalışmıyor (status: $status)"
            ((ISSUES++))
        fi
    else
        print_fail "PM2'de uygulama bulunamadı!"
        ((ISSUES++))
    fi
else
    print_fail "PM2 kurulu değil!"
    ((ISSUES++))
fi

# Port kontrolü
print_check "Port 3000"
if ss -tuln | grep -q ":3000 "; then
    print_ok "Port 3000 dinleniyor"
else
    print_fail "Port 3000 dinlenmiyor!"
    ((ISSUES++))
fi

# Web sunucusu kontrolü
print_check "Web Sunucusu"
if command -v caddy &> /dev/null; then
    if systemctl is-active --quiet caddy; then
        print_ok "Caddy çalışıyor"
    else
        print_warn "Caddy kurulu ama çalışmıyor"
        ((ISSUES++))
    fi
elif command -v nginx &> /dev/null; then
    if systemctl is-active --quiet nginx; then
        print_ok "Nginx çalışıyor"
    else
        print_warn "Nginx kurulu ama çalışmıyor"
        ((ISSUES++))
    fi
else
    print_warn "Web sunucusu bulunamadı"
fi

# Veritabanı kontrolü
print_check "Veritabanı"
if [[ -f "$INSTALL_DIR/data.db" ]]; then
    size=$(du -h "$INSTALL_DIR/data.db" | cut -f1)
    print_ok "SQLite veritabanı mevcut ($size)"
else
    print_warn "Veritabanı dosyası bulunamadı"
fi

# Environment kontrolü
print_check "Environment Dosyası"
if [[ -f "$INSTALL_DIR/.env" ]]; then
    print_ok ".env dosyası mevcut"
    
    # Kritik değişkenleri kontrol et
    if grep -q "AUTH_SECRET=" "$INSTALL_DIR/.env"; then
        print_ok "AUTH_SECRET tanımlı"
    else
        print_fail "AUTH_SECRET eksik!"
        ((ISSUES++))
    fi
    
    if grep -q "GOOGLE_CLIENT_ID=" "$INSTALL_DIR/.env"; then
        print_ok "GOOGLE_CLIENT_ID tanımlı"
    else
        print_warn "GOOGLE_CLIENT_ID eksik"
    fi
    
    if grep -q "GEMINI_API_KEY=" "$INSTALL_DIR/.env"; then
        print_ok "GEMINI_API_KEY tanımlı"
    else
        print_warn "GEMINI_API_KEY eksik"
    fi
else
    print_fail ".env dosyası bulunamadı!"
    ((ISSUES++))
fi

# Disk alanı kontrolü
print_check "Disk Alanı"
available=$(df -BG "$INSTALL_DIR" | awk 'NR==2 {print $4}' | tr -d 'G')
if [[ $available -gt 5 ]]; then
    print_ok "Kullanılabilir: ${available}GB"
elif [[ $available -gt 1 ]]; then
    print_warn "Düşük disk alanı: ${available}GB"
    ((ISSUES++))
else
    print_fail "Kritik disk alanı: ${available}GB"
    ((ISSUES++))
fi

# HTTP kontrolü
print_check "HTTP Yanıtı"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|304"; then
    print_ok "HTTP 200 OK"
else
    http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
    if [[ "$http_code" == "000" ]]; then
        print_fail "Bağlantı kurulamadı"
        ((ISSUES++))
    else
        print_warn "HTTP $http_code"
    fi
fi

# Özet
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [[ $ISSUES -eq 0 ]]; then
    echo -e "${GREEN}  ✓ Tüm kontroller başarılı! Sistem sağlıklı.${NC}"
else
    echo -e "${YELLOW}  ⚠ $ISSUES sorun tespit edildi.${NC}"
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

exit $ISSUES
