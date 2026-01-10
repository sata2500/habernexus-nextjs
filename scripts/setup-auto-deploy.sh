#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                                                                           ║
# ║   HaberNexus - Auto-Deploy Kurulum Scripti                                ║
# ║   Sürüm: 1.0.0                                                            ║
# ║                                                                           ║
# ║   Bu script, otomatik deployment sistemini kurar ve yapılandırır.         ║
# ║                                                                           ║
# ║   Kullanım:                                                               ║
# ║   curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/setup-auto-deploy.sh | bash
# ║                                                                           ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
# YAPILANDIRMA
# ═══════════════════════════════════════════════════════════════════════════

readonly SCRIPT_VERSION="1.0.0"
readonly INSTALL_DIR="${INSTALL_DIR:-/var/www/habernexus}"
readonly WEBHOOK_PORT="${WEBHOOK_PORT:-9000}"
readonly LOG_DIR="/var/log/habernexus"

# ═══════════════════════════════════════════════════════════════════════════
# RENK TANIMLARI
# ═══════════════════════════════════════════════════════════════════════════

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m'

# ═══════════════════════════════════════════════════════════════════════════
# YARDIMCI FONKSİYONLAR
# ═══════════════════════════════════════════════════════════════════════════

print_header() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_step() {
    echo -e "${BLUE}▶${NC} ${WHITE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "  ${CYAN}ℹ${NC} $1"
}

generate_secret() {
    openssl rand -hex 32
}

# ═══════════════════════════════════════════════════════════════════════════
# BANNER
# ═══════════════════════════════════════════════════════════════════════════

print_banner() {
    clear
    echo -e "${CYAN}"
    cat << 'EOF'
    
    ██╗  ██╗ █████╗ ██████╗ ███████╗██████╗ ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
    ██║  ██║██╔══██╗██╔══██╗██╔════╝██╔══██╗████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
    ███████║███████║██████╔╝█████╗  ██████╔╝██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
    ██╔══██║██╔══██║██╔══██╗██╔══╝  ██╔══██╗██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
    ██║  ██║██║  ██║██████╔╝███████╗██║  ██║██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
    ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
    
EOF
    echo -e "${NC}"
    echo -e "${WHITE}                    Auto-Deploy Kurulum Sistemi v${SCRIPT_VERSION}${NC}"
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════════
# KONTROLLER
# ═══════════════════════════════════════════════════════════════════════════

check_prerequisites() {
    print_header "ÖN KOŞULLAR KONTROL EDİLİYOR"
    
    # Root kontrolü
    if [[ $EUID -eq 0 ]]; then
        print_warning "Root olarak çalıştırılıyor"
    fi
    
    # HaberNexus kurulumu kontrolü
    print_step "HaberNexus kurulumu kontrol ediliyor..."
    if [[ ! -d "$INSTALL_DIR" ]]; then
        print_error "HaberNexus kurulumu bulunamadı: $INSTALL_DIR"
        print_info "Önce ana kurulumu yapın:"
        print_info "curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/install.sh | bash"
        exit 1
    fi
    print_success "HaberNexus kurulumu bulundu"
    
    # Node.js kontrolü
    print_step "Node.js kontrol ediliyor..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js bulunamadı"
        exit 1
    fi
    print_success "Node.js $(node -v) bulundu"
    
    # PM2 kontrolü
    print_step "PM2 kontrol ediliyor..."
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 bulunamadı"
        print_info "Yükleniyor: npm install -g pm2"
        npm install -g pm2
    fi
    print_success "PM2 bulundu"
    
    # Git kontrolü
    print_step "Git kontrol ediliyor..."
    if ! command -v git &> /dev/null; then
        print_error "Git bulunamadı"
        exit 1
    fi
    print_success "Git bulundu"
}

# ═══════════════════════════════════════════════════════════════════════════
# KURULUM
# ═══════════════════════════════════════════════════════════════════════════

setup_webhook_secret() {
    print_header "WEBHOOK SECRET OLUŞTURULUYOR"
    
    local secret_file="$INSTALL_DIR/.webhook-secret"
    
    if [[ -f "$secret_file" ]]; then
        print_warning "Mevcut secret bulundu"
        read -p "Yeni secret oluşturulsun mu? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            WEBHOOK_SECRET=$(cat "$secret_file")
            print_info "Mevcut secret kullanılıyor"
            return
        fi
    fi
    
    WEBHOOK_SECRET=$(generate_secret)
    echo "$WEBHOOK_SECRET" > "$secret_file"
    chmod 600 "$secret_file"
    
    print_success "Webhook secret oluşturuldu"
    print_info "Secret dosyası: $secret_file"
}

setup_webhook_server() {
    print_header "WEBHOOK SUNUCUSU YAPILANDIRILIYOR"
    
    local webhook_script="$INSTALL_DIR/scripts/webhook-server.js"
    
    if [[ ! -f "$webhook_script" ]]; then
        print_error "Webhook script bulunamadı: $webhook_script"
        print_info "Projeyi güncelleyin: cd $INSTALL_DIR && git pull"
        exit 1
    fi
    
    print_step "Webhook sunucusu PM2'ye ekleniyor..."
    
    # Mevcut webhook process'i durdur
    pm2 delete habernexus-webhook 2>/dev/null || true
    
    # Yeni process başlat
    WEBHOOK_SECRET="$WEBHOOK_SECRET" \
    WEBHOOK_PORT="$WEBHOOK_PORT" \
    INSTALL_DIR="$INSTALL_DIR" \
    LOG_DIR="$LOG_DIR" \
    pm2 start "$webhook_script" \
        --name "habernexus-webhook" \
        --cwd "$INSTALL_DIR" \
        --log "$LOG_DIR/webhook.log" \
        --time
    
    # PM2 kaydet
    pm2 save
    
    print_success "Webhook sunucusu başlatıldı (Port: $WEBHOOK_PORT)"
}

setup_firewall() {
    print_header "GÜVENLİK DUVARI YAPILANDIRILIYOR"
    
    if command -v ufw &> /dev/null; then
        print_step "UFW kuralı ekleniyor..."
        
        # Webhook portu için kural ekle
        sudo ufw allow "$WEBHOOK_PORT/tcp" comment "HaberNexus Webhook" 2>/dev/null || true
        
        print_success "Port $WEBHOOK_PORT açıldı"
    else
        print_warning "UFW bulunamadı, manuel olarak port $WEBHOOK_PORT'u açmanız gerekebilir"
    fi
}

setup_caddy_proxy() {
    print_header "CADDY PROXY YAPILANDIRILIYOR (Opsiyonel)"
    
    local caddy_config="/etc/caddy/Caddyfile"
    
    if [[ ! -f "$caddy_config" ]]; then
        print_warning "Caddy yapılandırması bulunamadı, atlanıyor"
        return
    fi
    
    # Webhook proxy zaten var mı kontrol et
    if grep -q "webhook" "$caddy_config" 2>/dev/null; then
        print_info "Webhook proxy zaten yapılandırılmış"
        return
    fi
    
    print_step "Webhook proxy ekleniyor..."
    
    # Domain bilgisini al
    local domain=$(grep -oP '^\S+' "$caddy_config" | head -1)
    
    if [[ -n "$domain" ]]; then
        # Caddy config'e webhook route ekle
        # Bu işlem manuel yapılmalı, sadece talimat ver
        print_info "Caddy yapılandırmasına aşağıdaki bloğu ekleyin:"
        echo ""
        echo -e "${CYAN}# $caddy_config dosyasına ekleyin:${NC}"
        echo ""
        echo "route /webhook* {"
        echo "    reverse_proxy localhost:$WEBHOOK_PORT"
        echo "}"
        echo ""
    fi
}

setup_nginx_proxy() {
    print_header "NGINX PROXY YAPILANDIRILIYOR (Opsiyonel)"
    
    local nginx_config="/etc/nginx/sites-available/habernexus"
    
    if [[ ! -f "$nginx_config" ]]; then
        print_warning "Nginx yapılandırması bulunamadı, atlanıyor"
        return
    fi
    
    # Webhook proxy zaten var mı kontrol et
    if grep -q "webhook" "$nginx_config" 2>/dev/null; then
        print_info "Webhook proxy zaten yapılandırılmış"
        return
    fi
    
    print_info "Nginx yapılandırmasına aşağıdaki bloğu ekleyin:"
    echo ""
    echo -e "${CYAN}# $nginx_config dosyasına ekleyin (server bloğu içine):${NC}"
    echo ""
    echo "location /webhook {"
    echo "    proxy_pass http://localhost:$WEBHOOK_PORT;"
    echo "    proxy_http_version 1.1;"
    echo "    proxy_set_header Host \$host;"
    echo "    proxy_set_header X-Real-IP \$remote_addr;"
    echo "    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
    echo "}"
    echo ""
}

create_management_commands() {
    print_header "YÖNETİM KOMUTLARI OLUŞTURULUYOR"
    
    local cmd_file="/usr/local/bin/habernexus-webhook"
    
    print_step "Yönetim scripti oluşturuluyor..."
    
    sudo tee "$cmd_file" > /dev/null << 'CMDEOF'
#!/bin/bash

case "$1" in
    status)
        pm2 show habernexus-webhook
        ;;
    logs)
        pm2 logs habernexus-webhook --lines 50
        ;;
    restart)
        pm2 restart habernexus-webhook
        ;;
    stop)
        pm2 stop habernexus-webhook
        ;;
    start)
        pm2 start habernexus-webhook
        ;;
    test)
        curl -s http://localhost:${WEBHOOK_PORT:-9000}/health | jq .
        ;;
    *)
        echo "Kullanım: habernexus-webhook {status|logs|restart|stop|start|test}"
        exit 1
        ;;
esac
CMDEOF
    
    sudo chmod +x "$cmd_file"
    
    print_success "Yönetim komutu oluşturuldu: habernexus-webhook"
}

# ═══════════════════════════════════════════════════════════════════════════
# SONUÇ
# ═══════════════════════════════════════════════════════════════════════════

print_summary() {
    local server_ip=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Auto-Deploy Kurulumu Tamamlandı!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${WHITE}Webhook URL:${NC}"
    echo -e "  http://${server_ip}:${WEBHOOK_PORT}/webhook"
    echo ""
    echo -e "${WHITE}Webhook Secret:${NC}"
    echo -e "  ${WEBHOOK_SECRET}"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  ÖNEMLİ: GitHub Repository Ayarları${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  1. GitHub Repository → Settings → Secrets and variables → Actions"
    echo ""
    echo -e "  2. Aşağıdaki secret'ları ekleyin:"
    echo ""
    echo -e "     ${CYAN}DEPLOY_WEBHOOK_URL${NC}"
    echo -e "     http://${server_ip}:${WEBHOOK_PORT}/webhook"
    echo ""
    echo -e "     ${CYAN}DEPLOY_WEBHOOK_SECRET${NC}"
    echo -e "     ${WEBHOOK_SECRET}"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${WHITE}Yönetim Komutları:${NC}"
    echo -e "  habernexus-webhook status   - Durum görüntüleme"
    echo -e "  habernexus-webhook logs     - Logları izleme"
    echo -e "  habernexus-webhook restart  - Yeniden başlatma"
    echo -e "  habernexus-webhook test     - Health check"
    echo ""
    echo -e "${WHITE}Test:${NC}"
    echo -e "  curl http://localhost:${WEBHOOK_PORT}/health"
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════════
# ANA FONKSİYON
# ═══════════════════════════════════════════════════════════════════════════

main() {
    print_banner
    
    check_prerequisites
    setup_webhook_secret
    setup_webhook_server
    setup_firewall
    setup_caddy_proxy
    setup_nginx_proxy
    create_management_commands
    
    print_summary
}

# Script'i çalıştır
main "$@"
