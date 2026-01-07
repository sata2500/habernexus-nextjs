#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                                                                           ║
# ║   HaberNexus - Profesyonel Otomatik Kurulum Sistemi                       ║
# ║   Sürüm: 2.0.2                                                            ║
# ║   Desteklenen Sistemler: Ubuntu 22.04 LTS, Ubuntu 24.04 LTS               ║
# ║                                                                           ║
# ║   Tek Satırlık Kurulum:                                                   ║
# ║   curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/install.sh | bash
# ║                                                                           ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
# YAPILANDIRMA DEĞİŞKENLERİ
# ═══════════════════════════════════════════════════════════════════════════

readonly SCRIPT_VERSION="2.0.2"
readonly GITHUB_REPO="https://github.com/sata2500/habernexus-nextjs.git"
readonly INSTALL_DIR="/var/www/habernexus"
readonly NODE_VERSION="22"
readonly PM2_APP_NAME="habernexus"
readonly LOG_FILE="/tmp/habernexus-install-$(date +%Y%m%d-%H%M%S).log"

# Web sunucusu seçimi (caddy veya nginx)
WEB_SERVER="caddy"

# ═══════════════════════════════════════════════════════════════════════════
# RENK TANIMLARI
# ═══════════════════════════════════════════════════════════════════════════

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly MAGENTA='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly GRAY='\033[0;90m'
readonly NC='\033[0m'
readonly BOLD='\033[1m'
readonly DIM='\033[2m'

# ═══════════════════════════════════════════════════════════════════════════
# YARDIMCI FONKSİYONLAR
# ═══════════════════════════════════════════════════════════════════════════

# Loglama
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# Ekrana yazdırma fonksiyonları
print_header() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_step() {
    echo -e "${BLUE}▶${NC} ${WHITE}$1${NC}"
    log "STEP: $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
    log "SUCCESS: $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    log "WARNING: $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    log "ERROR: $1"
}

print_info() {
    echo -e "${GRAY}  ℹ${NC} ${DIM}$1${NC}"
    log "INFO: $1"
}

# İlerleme çubuğu
progress_bar() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))
    local remaining=$((width - completed))
    
    printf "\r${CYAN}["
    printf "%${completed}s" | tr ' ' '█'
    printf "%${remaining}s" | tr ' ' '░'
    printf "] ${percentage}%%${NC}"
}

# Spinner animasyonu
spinner() {
    local pid=$1
    local message=$2
    local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0
    
    while kill -0 $pid 2>/dev/null; do
        i=$(( (i+1) % 10 ))
        printf "\r${CYAN}${spin:$i:1}${NC} ${message}"
        sleep 0.1
    done
    printf "\r"
}

# Hata yakalama
error_handler() {
    local line_no=$1
    local error_code=$2
    print_error "Hata oluştu (satır: $line_no, kod: $error_code)"
    print_info "Detaylı log: $LOG_FILE"
    exit 1
}

trap 'error_handler ${LINENO} $?' ERR

# ═══════════════════════════════════════════════════════════════════════════
# İNTERAKTİF GİRDİ FONKSİYONLARI
# ═══════════════════════════════════════════════════════════════════════════

# Pipe üzerinden çalıştırıldığında bile kullanıcı girdisi almak için
# /dev/tty'den okuma yapan fonksiyonlar

# Kullanıcıdan metin girdisi al
ask_input() {
    local prompt="$1"
    local var_name="$2"
    local default="${3:-}"
    local result
    
    if [[ -n "$default" ]]; then
        printf "%s [%s]: " "$prompt" "$default" >/dev/tty
    else
        printf "%s: " "$prompt" >/dev/tty
    fi
    
    read -r result </dev/tty
    
    if [[ -z "$result" && -n "$default" ]]; then
        result="$default"
    fi
    
    eval "$var_name=\"\$result\""
}

# Kullanıcıdan tek karakter girdisi al
ask_char() {
    local prompt="$1"
    local var_name="$2"
    local result
    
    printf "%s " "$prompt" >/dev/tty
    read -r -n 1 result </dev/tty
    echo "" >/dev/tty
    
    eval "$var_name=\"\$result\""
}

# Enter bekle
wait_enter() {
    local prompt="${1:-Devam etmek icin Enter tusuna basin...}"
    printf "%s" "$prompt" >/dev/tty
    read -r </dev/tty
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
    echo -e "${WHITE}                    AI Destekli Haber Platformu${NC}"
    echo -e "${GRAY}                    Profesyonel Kurulum Sistemi v${SCRIPT_VERSION}${NC}"
    echo ""
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════════
# SİSTEM KONTROL FONKSİYONLARI
# ═══════════════════════════════════════════════════════════════════════════

check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "Bu script root olarak çalıştırılmamalıdır!"
        print_info "Sudo yetkisi olan normal bir kullanıcı ile çalıştırın."
        exit 1
    fi
}

check_sudo() {
    if ! sudo -n true 2>/dev/null; then
        print_warning "Sudo şifresi gerekebilir..."
        sudo true
    fi
}

check_os() {
    if [[ ! -f /etc/os-release ]]; then
        print_error "Desteklenmeyen işletim sistemi!"
        exit 1
    fi
    
    source /etc/os-release
    
    if [[ "$ID" != "ubuntu" ]]; then
        print_warning "Bu script Ubuntu için optimize edilmiştir."
        print_info "Diğer dağıtımlarda sorun yaşayabilirsiniz."
        echo ""
        local reply
        ask_char "Devam etmek istiyor musunuz? (e/h):" reply
        if [[ ! $reply =~ ^[Ee]$ ]]; then
            exit 0
        fi
    fi
    
    local version_id="${VERSION_ID:-0}"
    if [[ "${version_id%%.*}" -lt 22 ]]; then
        print_warning "Ubuntu 22.04 veya üzeri önerilir."
    fi
    
    print_success "İşletim sistemi: $PRETTY_NAME"
}

check_memory() {
    local total_mem=$(free -m | awk '/^Mem:/{print $2}')
    
    if [[ $total_mem -lt 1024 ]]; then
        print_warning "Düşük RAM tespit edildi: ${total_mem}MB"
        print_info "En az 1GB RAM önerilir."
    else
        print_success "RAM: ${total_mem}MB"
    fi
}

check_disk() {
    local available=$(df -BG / | awk 'NR==2 {print $4}' | tr -d 'G')
    
    if [[ $available -lt 5 ]]; then
        print_error "Yetersiz disk alanı: ${available}GB"
        print_info "En az 5GB boş alan gereklidir."
        exit 1
    fi
    
    print_success "Kullanılabilir disk: ${available}GB"
}

check_ports() {
    local ports_in_use=""
    
    for port in 80 443 3000; do
        if ss -tuln | grep -q ":$port "; then
            ports_in_use+="$port "
        fi
    done
    
    if [[ -n "$ports_in_use" ]]; then
        print_warning "Kullanımda olan portlar: $ports_in_use"
        print_info "Bu portlar kurulum sırasında yeniden yapılandırılacak."
    else
        print_success "Gerekli portlar kullanılabilir (80, 443, 3000)"
    fi
}

run_system_checks() {
    print_header "SİSTEM KONTROLLERİ"
    
    check_root
    check_sudo
    check_os
    check_memory
    check_disk
    check_ports
    
    echo ""
    print_success "Tüm sistem kontrolleri başarılı!"
}

# ═══════════════════════════════════════════════════════════════════════════
# İNTERAKTİF YAPILANDIRMA
# ═══════════════════════════════════════════════════════════════════════════

get_user_input() {
    print_header "YAPILANDIRMA"
    
    echo -e "${WHITE}Lütfen aşağıdaki bilgileri girin:${NC}"
    echo ""
    
    # Domain
    echo -e "${CYAN}1. Site Domain${NC}"
    echo -e "${GRAY}   Örnek: habernexus.com (www olmadan)${NC}"
    while true; do
        ask_input "   Domain" SITE_DOMAIN
        if [[ -n "$SITE_DOMAIN" ]]; then
            # www. varsa kaldır
            SITE_DOMAIN="${SITE_DOMAIN#www.}"
            break
        fi
        print_warning "Domain boş olamaz!"
    done
    echo ""
    
    # Web sunucusu seçimi
    echo -e "${CYAN}2. Web Sunucusu Seçimi${NC}"
    echo -e "${GRAY}   1) Caddy - Otomatik SSL, kolay yapılandırma (Önerilen)${NC}"
    echo -e "${GRAY}   2) Nginx - Klasik, daha fazla kontrol${NC}"
    while true; do
        local ws_choice
        ask_input "   Seçiminiz (1/2)" ws_choice "1"
        if [[ "$ws_choice" == "1" ]]; then
            WEB_SERVER="caddy"
            break
        elif [[ "$ws_choice" == "2" ]]; then
            WEB_SERVER="nginx"
            break
        fi
        print_warning "Geçersiz seçim!"
    done
    echo ""
    
    # Google OAuth
    echo -e "${CYAN}3. Google OAuth 2.0 Bilgileri${NC}"
    echo -e "${GRAY}   Google Cloud Console'dan alabilirsiniz:${NC}"
    echo -e "${GRAY}   https://console.cloud.google.com/apis/credentials${NC}"
    echo ""
    ask_input "   Google Client ID" GOOGLE_CLIENT_ID
    ask_input "   Google Client Secret" GOOGLE_CLIENT_SECRET
    echo ""
    
    # Gemini API
    echo -e "${CYAN}4. Gemini AI API Anahtarı${NC}"
    echo -e "${GRAY}   Google AI Studio'dan alabilirsiniz:${NC}"
    echo -e "${GRAY}   https://aistudio.google.com/app/apikey${NC}"
    echo ""
    ask_input "   Gemini API Key" GEMINI_API_KEY
    echo ""
    
    # E-posta (SSL için)
    echo -e "${CYAN}5. E-posta Adresi${NC}"
    echo -e "${GRAY}   SSL sertifikası bildirimleri için kullanılacak${NC}"
    ask_input "   E-posta" ADMIN_EMAIL
    echo ""
    
    # Özet
    print_header "YAPILANDIRMA ÖZETİ"
    echo -e "  ${WHITE}Domain:${NC}        $SITE_DOMAIN"
    echo -e "  ${WHITE}Web Sunucusu:${NC}  $WEB_SERVER"
    echo -e "  ${WHITE}E-posta:${NC}       $ADMIN_EMAIL"
    echo -e "  ${WHITE}Kurulum Yolu:${NC}  $INSTALL_DIR"
    echo ""
    
    local confirm
    ask_input "Bu ayarlarla devam etmek istiyor musunuz? (e/h)" confirm "e"
    if [[ ! $confirm =~ ^[Ee]$ ]]; then
        print_info "Kurulum iptal edildi."
        exit 0
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# KURULUM FONKSİYONLARI
# ═══════════════════════════════════════════════════════════════════════════

install_system_packages() {
    print_header "SİSTEM PAKETLERİ KURULUYOR"
    
    print_step "Paket listesi güncelleniyor..."
    sudo apt-get update -qq >> "$LOG_FILE" 2>&1
    print_success "Paket listesi güncellendi"
    
    print_step "Temel paketler kuruluyor..."
    sudo apt-get install -y -qq \
        curl \
        wget \
        git \
        unzip \
        build-essential \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release >> "$LOG_FILE" 2>&1
    print_success "Temel paketler kuruldu"
}

install_nodejs() {
    print_header "NODE.JS KURULUYOR"
    
    if command -v node &> /dev/null; then
        local current_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $current_version -ge 20 ]]; then
            print_success "Node.js zaten kurulu: $(node -v)"
            return
        fi
        print_warning "Node.js sürümü eski, güncelleniyor..."
    fi
    
    print_step "NodeSource deposu ekleniyor..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash - >> "$LOG_FILE" 2>&1
    
    print_step "Node.js kuruluyor..."
    sudo apt-get install -y -qq nodejs >> "$LOG_FILE" 2>&1
    
    print_success "Node.js kuruldu: $(node -v)"
    print_success "npm kuruldu: $(npm -v)"
}

install_pm2() {
    print_header "PM2 KURULUYOR"
    
    if command -v pm2 &> /dev/null; then
        print_success "PM2 zaten kurulu"
        return
    fi
    
    print_step "PM2 global olarak kuruluyor..."
    sudo npm install -g pm2 >> "$LOG_FILE" 2>&1
    
    print_step "PM2 startup yapılandırılıyor..."
    pm2 startup systemd -u $USER --hp $HOME 2>/dev/null | grep -E "^sudo" | bash >> "$LOG_FILE" 2>&1 || true
    
    print_success "PM2 kuruldu"
}

install_caddy() {
    print_header "CADDY WEB SUNUCUSU KURULUYOR"
    
    if command -v caddy &> /dev/null; then
        print_success "Caddy zaten kurulu: $(caddy version)"
        return
    fi
    
    print_step "Caddy deposu ekleniyor..."
    sudo apt-get install -y -qq debian-keyring debian-archive-keyring >> "$LOG_FILE" 2>&1
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg 2>/dev/null
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list >> "$LOG_FILE" 2>&1
    
    print_step "Caddy kuruluyor..."
    sudo apt-get update -qq >> "$LOG_FILE" 2>&1
    sudo apt-get install -y -qq caddy >> "$LOG_FILE" 2>&1
    
    print_success "Caddy kuruldu: $(caddy version)"
}

install_nginx() {
    print_header "NGINX WEB SUNUCUSU KURULUYOR"
    
    if command -v nginx &> /dev/null; then
        print_success "Nginx zaten kurulu"
        return
    fi
    
    print_step "Nginx kuruluyor..."
    sudo apt-get install -y -qq nginx >> "$LOG_FILE" 2>&1
    
    print_step "Certbot kuruluyor..."
    sudo apt-get install -y -qq certbot python3-certbot-nginx >> "$LOG_FILE" 2>&1
    
    print_success "Nginx kuruldu"
}

clone_project() {
    print_header "PROJE KLONLANIYOR"
    
    print_step "Kurulum dizini hazırlanıyor..."
    sudo mkdir -p "$INSTALL_DIR"
    sudo chown -R $USER:$USER "$INSTALL_DIR"
    
    if [[ -d "$INSTALL_DIR/.git" ]]; then
        print_warning "Mevcut kurulum tespit edildi, güncelleniyor..."
        cd "$INSTALL_DIR"
        git fetch origin master >> "$LOG_FILE" 2>&1
        git reset --hard origin/master >> "$LOG_FILE" 2>&1
    else
        print_step "Proje klonlanıyor..."
        rm -rf "$INSTALL_DIR"/* 2>/dev/null || true
        git clone "$GITHUB_REPO" "$INSTALL_DIR" >> "$LOG_FILE" 2>&1
    fi
    
    cd "$INSTALL_DIR"
    print_success "Proje hazır: $INSTALL_DIR"
}

install_dependencies() {
    print_header "NPM BAĞIMLILIKLARI KURULUYOR"
    
    cd "$INSTALL_DIR"
    
    print_step "Bağımlılıklar yükleniyor (bu birkaç dakika sürebilir)..."
    
    npm ci --production=false >> "$LOG_FILE" 2>&1 &
    local pid=$!
    spinner $pid "Paketler yükleniyor..."
    wait $pid
    
    print_success "Bağımlılıklar yüklendi"
}

create_env_file() {
    print_header "ENVIRONMENT DOSYASI OLUŞTURULUYOR"
    
    cd "$INSTALL_DIR"
    
    # AUTH_SECRET oluştur
    local auth_secret=$(openssl rand -base64 32)
    
    print_step ".env dosyası oluşturuluyor..."
    
    cat > .env << EOF
# ═══════════════════════════════════════════════════════════════════════════
# HaberNexus Environment Configuration
# Oluşturulma Tarihi: $(date '+%Y-%m-%d %H:%M:%S')
# ═══════════════════════════════════════════════════════════════════════════

# Database (SQLite)
DATABASE_URL="file:./data.db"

# Auth.js v5
AUTH_SECRET="${auth_secret}"
AUTH_TRUST_HOST=true
AUTH_URL="https://${SITE_DOMAIN}"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}"

# Gemini AI API
GEMINI_API_KEY="${GEMINI_API_KEY}"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://${SITE_DOMAIN}"
NEXT_PUBLIC_SITE_NAME="HaberNexus"

# Node Environment
NODE_ENV="production"
EOF
    
    chmod 600 .env
    print_success "Environment dosyası oluşturuldu"
}

setup_database() {
    print_header "VERİTABANI HAZIRLANIYOR"
    
    cd "$INSTALL_DIR"
    
    print_step "Prisma Client oluşturuluyor..."
    npx prisma generate >> "$LOG_FILE" 2>&1
    
    print_step "Veritabanı şeması uygulanıyor..."
    npx prisma db push >> "$LOG_FILE" 2>&1
    
    print_success "Veritabanı hazır"
}

build_project() {
    print_header "PROJE BUILD EDİLİYOR"
    
    cd "$INSTALL_DIR"
    
    print_step "Production build alınıyor (bu birkaç dakika sürebilir)..."
    
    npm run build >> "$LOG_FILE" 2>&1 &
    local pid=$!
    spinner $pid "Build işlemi devam ediyor..."
    wait $pid
    
    print_success "Build tamamlandı"
}

configure_pm2() {
    print_header "PM2 YAPILANDIRILIYOR"
    
    cd "$INSTALL_DIR"
    
    # PM2 ecosystem dosyası oluştur
    print_step "PM2 ecosystem dosyası oluşturuluyor..."
    
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${PM2_APP_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '${INSTALL_DIR}',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '${INSTALL_DIR}/logs/pm2-error.log',
    out_file: '${INSTALL_DIR}/logs/pm2-out.log',
    log_file: '${INSTALL_DIR}/logs/pm2-combined.log',
    time: true
  }]
};
EOF
    
    # Log dizini oluştur
    mkdir -p logs
    
    # Mevcut instance'ı durdur
    print_step "Mevcut uygulama durduruluyor..."
    pm2 delete "$PM2_APP_NAME" >> "$LOG_FILE" 2>&1 || true
    
    # Yeni instance başlat
    print_step "Uygulama başlatılıyor..."
    pm2 start ecosystem.config.js >> "$LOG_FILE" 2>&1
    
    # PM2 kaydet
    pm2 save >> "$LOG_FILE" 2>&1
    
    print_success "PM2 yapılandırıldı ve uygulama başlatıldı"
}

configure_caddy() {
    print_header "CADDY YAPILANDIRILIYOR"
    
    # Önce log dizinini oluştur ve izinleri ayarla
    print_step "Log dizini hazırlanıyor..."
    sudo mkdir -p /var/log/caddy
    sudo chown caddy:caddy /var/log/caddy
    sudo chmod 755 /var/log/caddy
    # Log dosyasını önceden oluştur
    sudo touch /var/log/caddy/habernexus.log
    sudo chown caddy:caddy /var/log/caddy/habernexus.log
    sudo chmod 644 /var/log/caddy/habernexus.log
    
    print_step "Caddyfile oluşturuluyor..."
    
    sudo tee /etc/caddy/Caddyfile > /dev/null << EOF
# HaberNexus Caddy Configuration
# Otomatik SSL ile reverse proxy

${SITE_DOMAIN} {
    # Reverse proxy to Next.js
    reverse_proxy localhost:3000
    
    # Güvenlik başlıkları
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
        -Server
    }
    
    # Gzip sıkıştırma
    encode gzip
    
    # Loglama
    log {
        output file /var/log/caddy/habernexus.log {
            roll_size 10mb
            roll_keep 5
        }
        format json
    }
}

www.${SITE_DOMAIN} {
    redir https://${SITE_DOMAIN}{uri} permanent
}
EOF
    
    print_step "Caddy yapılandırması test ediliyor..."
    if ! sudo caddy validate --config /etc/caddy/Caddyfile >> "$LOG_FILE" 2>&1; then
        print_warning "Caddy yapılandırma hatası, basit yapılandırma deneniyor..."
        # Basitleştirilmiş yapılandırma (log olmadan)
        sudo tee /etc/caddy/Caddyfile > /dev/null << EOF
# HaberNexus Caddy Configuration (Simplified)

${SITE_DOMAIN} {
    reverse_proxy localhost:3000
    
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
        -Server
    }
    
    encode gzip
}

www.${SITE_DOMAIN} {
    redir https://${SITE_DOMAIN}{uri} permanent
}
EOF
    fi
    
    print_step "Caddy yeniden başlatılıyor..."
    sudo systemctl restart caddy
    sudo systemctl enable caddy >> "$LOG_FILE" 2>&1
    
    # Caddy durumunu kontrol et
    if sudo systemctl is-active --quiet caddy; then
        print_success "Caddy yapılandırıldı (SSL otomatik olarak alınacak)"
    else
        print_warning "Caddy başlatılamadı. Lütfen 'sudo systemctl status caddy' ile kontrol edin."
    fi
}

configure_nginx() {
    print_header "NGINX YAPILANDIRILIYOR"
    
    print_step "Nginx site yapılandırması oluşturuluyor..."
    
    sudo tee /etc/nginx/sites-available/habernexus > /dev/null << EOF
# HaberNexus Nginx Configuration

server {
    listen 80;
    listen [::]:80;
    server_name ${SITE_DOMAIN} www.${SITE_DOMAIN};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF
    
    # Site'ı etkinleştir
    sudo ln -sf /etc/nginx/sites-available/habernexus /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    
    print_step "Nginx yapılandırması test ediliyor..."
    sudo nginx -t >> "$LOG_FILE" 2>&1
    
    print_step "Nginx yeniden başlatılıyor..."
    sudo systemctl restart nginx
    sudo systemctl enable nginx >> "$LOG_FILE" 2>&1
    
    print_success "Nginx yapılandırıldı"
    
    # SSL kurulumu
    print_step "SSL sertifikası alınıyor..."
    sudo certbot --nginx \
        -d ${SITE_DOMAIN} \
        -d www.${SITE_DOMAIN} \
        --non-interactive \
        --agree-tos \
        --email ${ADMIN_EMAIL} \
        --redirect >> "$LOG_FILE" 2>&1 || {
            print_warning "SSL sertifikası alınamadı. DNS kayıtlarını kontrol edin."
            print_info "Daha sonra manuel olarak çalıştırabilirsiniz:"
            print_info "sudo certbot --nginx -d ${SITE_DOMAIN} -d www.${SITE_DOMAIN}"
        }
    
    print_success "Nginx ve SSL yapılandırıldı"
}

setup_firewall() {
    print_header "GÜVENLİK DUVARI YAPILANDIRILIYOR"
    
    if command -v ufw &> /dev/null; then
        print_step "UFW kuralları ekleniyor..."
        sudo ufw allow 22/tcp >> "$LOG_FILE" 2>&1 || true
        sudo ufw allow 80/tcp >> "$LOG_FILE" 2>&1 || true
        sudo ufw allow 443/tcp >> "$LOG_FILE" 2>&1 || true
        
        if ! sudo ufw status | grep -q "Status: active"; then
            print_info "UFW aktif değil. Etkinleştirmek için: sudo ufw enable"
        else
            print_success "Güvenlik duvarı kuralları eklendi"
        fi
    else
        print_info "UFW bulunamadı, güvenlik duvarı yapılandırması atlandı"
    fi
}

create_management_scripts() {
    print_header "YÖNETİM SCRIPTLERI OLUŞTURULUYOR"
    
    cd "$INSTALL_DIR"
    
    # Hızlı komut scripti
    print_step "Yönetim scripti oluşturuluyor..."
    
    cat > habernexus << 'SCRIPT_EOF'
#!/bin/bash

# HaberNexus Yönetim Aracı
# Kullanım: habernexus [komut]

INSTALL_DIR="/var/www/habernexus"
PM2_APP="habernexus"

case "$1" in
    start)
        pm2 start $PM2_APP
        ;;
    stop)
        pm2 stop $PM2_APP
        ;;
    restart)
        pm2 restart $PM2_APP
        ;;
    status)
        pm2 status $PM2_APP
        ;;
    logs)
        pm2 logs $PM2_APP --lines ${2:-100}
        ;;
    update)
        cd $INSTALL_DIR && bash scripts/update.sh
        ;;
    backup)
        cd $INSTALL_DIR && bash scripts/backup.sh
        ;;
    *)
        echo "HaberNexus Yönetim Aracı"
        echo ""
        echo "Kullanım: habernexus [komut]"
        echo ""
        echo "Komutlar:"
        echo "  start    - Uygulamayı başlat"
        echo "  stop     - Uygulamayı durdur"
        echo "  restart  - Uygulamayı yeniden başlat"
        echo "  status   - Durum bilgisi"
        echo "  logs     - Logları görüntüle (logs [satır sayısı])"
        echo "  update   - Güncelleme yap"
        echo "  backup   - Yedekleme al"
        ;;
esac
SCRIPT_EOF
    
    chmod +x habernexus
    sudo ln -sf "$INSTALL_DIR/habernexus" /usr/local/bin/habernexus
    
    print_success "Yönetim scripti oluşturuldu: habernexus"
}

# ═══════════════════════════════════════════════════════════════════════════
# KURULUM ÖZETİ
# ═══════════════════════════════════════════════════════════════════════════

print_summary() {
    echo ""
    echo -e "${GREEN}"
    cat << 'EOF'
    ╔═══════════════════════════════════════════════════════════════════════════╗
    ║                                                                           ║
    ║   ██╗  ██╗██╗   ██╗██████╗ ██╗   ██╗██╗     ██╗   ██╗███╗   ███╗██╗       ║
    ║   ██║ ██╔╝██║   ██║██╔══██╗██║   ██║██║     ██║   ██║████╗ ████║██║       ║
    ║   █████╔╝ ██║   ██║██████╔╝██║   ██║██║     ██║   ██║██╔████╔██║██║       ║
    ║   ██╔═██╗ ██║   ██║██╔══██╗██║   ██║██║     ██║   ██║██║╚██╔╝██║╚═╝       ║
    ║   ██║  ██╗╚██████╔╝██║  ██║╚██████╔╝███████╗╚██████╔╝██║ ╚═╝ ██║██╗       ║
    ║   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝       ║
    ║                                                                           ║
    ║                    KURULUM BAŞARIYLA TAMAMLANDI!                          ║
    ║                                                                           ║
    ╚═══════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}  UYGULAMA BİLGİLERİ${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${WHITE}Site URL:${NC}        https://${SITE_DOMAIN}"
    echo -e "  ${WHITE}Admin Panel:${NC}     https://${SITE_DOMAIN}/admin"
    echo -e "  ${WHITE}Kurulum Yolu:${NC}    ${INSTALL_DIR}"
    echo -e "  ${WHITE}Web Sunucusu:${NC}    ${WEB_SERVER}"
    echo -e "  ${WHITE}Log Dosyası:${NC}     ${LOG_FILE}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}  HIZLI KOMUTLAR${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${YELLOW}habernexus status${NC}   - Uygulama durumunu görüntüle"
    echo -e "  ${YELLOW}habernexus logs${NC}     - Logları görüntüle"
    echo -e "  ${YELLOW}habernexus restart${NC}  - Uygulamayı yeniden başlat"
    echo -e "  ${YELLOW}habernexus update${NC}   - Güncelleme yap"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}  SONRAKİ ADIMLAR${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${WHITE}1.${NC} Google Cloud Console'da OAuth callback URL'ini ekleyin:"
    echo -e "     ${YELLOW}https://${SITE_DOMAIN}/api/auth/callback/google${NC}"
    echo ""
    echo -e "  ${WHITE}2.${NC} Admin paneline giriş yapın:"
    echo -e "     ${YELLOW}https://${SITE_DOMAIN}/admin${NC}"
    echo ""
    echo -e "  ${WHITE}3.${NC} RSS kaynakları ekleyin ve AI motorunu çalıştırın"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${GREEN}İyi çalışmalar! 🚀${NC}"
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════════
# ANA FONKSİYON
# ═══════════════════════════════════════════════════════════════════════════

main() {
    # Log dosyası başlat
    echo "HaberNexus Kurulum Logu - $(date)" > "$LOG_FILE"
    
    # Banner
    print_banner
    
    # Hoş geldin mesajı
    echo -e "${WHITE}HaberNexus Profesyonel Kurulum Sistemine hoş geldiniz!${NC}"
    echo ""
    echo -e "Bu script, HaberNexus'u sunucunuza otomatik olarak kuracak ve"
    echo -e "yapılandıracaktır. Kurulum yaklaşık 5-10 dakika sürecektir."
    echo ""
    echo -e "${GRAY}Kurulum sırasında sizden bazı bilgiler istenecektir.${NC}"
    echo ""
    
    wait_enter "Kuruluma başlamak için Enter'a basın (iptal için Ctrl+C)..."
    
    # Kurulum adımları
    run_system_checks
    get_user_input
    install_system_packages
    install_nodejs
    install_pm2
    
    if [[ "$WEB_SERVER" == "caddy" ]]; then
        install_caddy
    else
        install_nginx
    fi
    
    clone_project
    install_dependencies
    create_env_file
    setup_database
    build_project
    configure_pm2
    
    if [[ "$WEB_SERVER" == "caddy" ]]; then
        configure_caddy
    else
        configure_nginx
    fi
    
    setup_firewall
    create_management_scripts
    
    # Özet
    print_summary
}

# Script'i çalıştır
main "$@"
