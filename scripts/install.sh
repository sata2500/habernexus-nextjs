#!/bin/bash

# ============================================
# HaberNexus - Otomatik Kurulum Script'i
# ============================================
# Bu script, HaberNexus projesini Ubuntu sunucunuza
# interaktif olarak kurar ve yapılandırır.
# ============================================

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║   ██╗  ██╗ █████╗ ██████╗ ███████╗██████╗                 ║"
    echo "║   ██║  ██║██╔══██╗██╔══██╗██╔════╝██╔══██╗                ║"
    echo "║   ███████║███████║██████╔╝█████╗  ██████╔╝                ║"
    echo "║   ██╔══██║██╔══██║██╔══██╗██╔══╝  ██╔══██╗                ║"
    echo "║   ██║  ██║██║  ██║██████╔╝███████╗██║  ██║                ║"
    echo "║   ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝                ║"
    echo "║                                                           ║"
    echo "║   ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗             ║"
    echo "║   ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝             ║"
    echo "║   ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗             ║"
    echo "║   ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║             ║"
    echo "║   ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║             ║"
    echo "║   ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝             ║"
    echo "║                                                           ║"
    echo "║   AI Destekli Haber Platformu - Otomatik Kurulum          ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Log fonksiyonları
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Spinner
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Sistem kontrolü
check_system() {
    log_info "Sistem gereksinimleri kontrol ediliyor..."
    
    # Ubuntu kontrolü
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [ "$ID" != "ubuntu" ]; then
            log_warning "Bu script Ubuntu için optimize edilmiştir. Diğer dağıtımlarda sorun yaşayabilirsiniz."
        fi
    fi
    
    # Root kontrolü
    if [ "$EUID" -eq 0 ]; then
        log_error "Bu script root olarak çalıştırılmamalıdır. Normal kullanıcı ile çalıştırın."
        exit 1
    fi
    
    log_success "Sistem kontrolü tamamlandı"
}

# Bağımlılıkları yükle
install_dependencies() {
    log_info "Sistem bağımlılıkları kontrol ediliyor..."
    
    # Node.js kontrolü
    if ! command -v node &> /dev/null; then
        log_info "Node.js kuruluyor..."
        curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - > /dev/null 2>&1
        sudo apt-get install -y nodejs > /dev/null 2>&1
        log_success "Node.js kuruldu: $(node -v)"
    else
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 20 ]; then
            log_warning "Node.js sürümünüz eski. Güncelleniyor..."
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - > /dev/null 2>&1
            sudo apt-get install -y nodejs > /dev/null 2>&1
        fi
        log_success "Node.js mevcut: $(node -v)"
    fi
    
    # Git kontrolü
    if ! command -v git &> /dev/null; then
        log_info "Git kuruluyor..."
        sudo apt-get install -y git > /dev/null 2>&1
        log_success "Git kuruldu"
    else
        log_success "Git mevcut: $(git --version)"
    fi
    
    # PM2 kontrolü
    if ! command -v pm2 &> /dev/null; then
        log_info "PM2 kuruluyor..."
        sudo npm install -g pm2 > /dev/null 2>&1
        log_success "PM2 kuruldu"
    else
        log_success "PM2 mevcut"
    fi
}

# Projeyi klonla
clone_project() {
    log_info "Proje klonlanıyor..."
    
    if [ -d "habernexus-nextjs" ]; then
        log_warning "Proje dizini zaten mevcut. Güncelleniyor..."
        cd habernexus-nextjs
        git pull origin master > /dev/null 2>&1
    else
        git clone https://github.com/sata2500/habernexus-nextjs.git > /dev/null 2>&1
        cd habernexus-nextjs
    fi
    
    log_success "Proje hazır"
}

# Bağımlılıkları yükle
install_npm_packages() {
    log_info "NPM paketleri yükleniyor..."
    npm ci > /dev/null 2>&1 &
    spinner $!
    log_success "NPM paketleri yüklendi"
}

# Environment yapılandırması
configure_environment() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}              ENVIRONMENT YAPILANDIRMASI                    ${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # AUTH_SECRET oluştur
    AUTH_SECRET=$(openssl rand -base64 32)
    
    # Domain
    echo -e "${YELLOW}Site domain'inizi girin (örn: habernexus.com):${NC}"
    read -p "> " SITE_DOMAIN
    SITE_DOMAIN=${SITE_DOMAIN:-localhost}
    
    # Google OAuth
    echo ""
    echo -e "${YELLOW}Google OAuth bilgilerini girin:${NC}"
    echo -e "${BLUE}(Google Cloud Console'dan alabilirsiniz: https://console.cloud.google.com/apis/credentials)${NC}"
    echo ""
    read -p "Google Client ID: " GOOGLE_CLIENT_ID
    read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET
    
    # Gemini API
    echo ""
    echo -e "${YELLOW}Gemini API anahtarını girin:${NC}"
    echo -e "${BLUE}(Google AI Studio'dan alabilirsiniz: https://aistudio.google.com/app/apikey)${NC}"
    echo ""
    read -p "Gemini API Key: " GEMINI_API_KEY
    
    # .env dosyasını oluştur
    cat > .env << EOF
# Database
DATABASE_URL="file:./data.db"

# Auth.js v5
AUTH_SECRET="${AUTH_SECRET}"
AUTH_TRUST_HOST=true

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
    
    log_success "Environment dosyası oluşturuldu"
}

# Veritabanı ve build
build_project() {
    log_info "Veritabanı hazırlanıyor..."
    npx prisma generate > /dev/null 2>&1
    npx prisma db push > /dev/null 2>&1
    log_success "Veritabanı hazır"
    
    log_info "Proje build ediliyor (bu birkaç dakika sürebilir)..."
    npm run build > /dev/null 2>&1 &
    spinner $!
    log_success "Build tamamlandı"
}

# PM2 ile başlat
start_with_pm2() {
    log_info "Uygulama başlatılıyor..."
    
    # Mevcut instance varsa durdur
    pm2 delete habernexus > /dev/null 2>&1 || true
    
    # Yeni instance başlat
    pm2 start npm --name "habernexus" -- start > /dev/null 2>&1
    pm2 save > /dev/null 2>&1
    
    log_success "Uygulama başlatıldı"
}

# Nginx yapılandırması
configure_nginx() {
    echo ""
    echo -e "${YELLOW}Nginx yapılandırması yapmak ister misiniz? (e/h)${NC}"
    read -p "> " CONFIGURE_NGINX
    
    if [ "$CONFIGURE_NGINX" = "e" ] || [ "$CONFIGURE_NGINX" = "E" ]; then
        # Nginx kurulumu
        if ! command -v nginx &> /dev/null; then
            log_info "Nginx kuruluyor..."
            sudo apt-get install -y nginx > /dev/null 2>&1
        fi
        
        # Nginx yapılandırması
        sudo tee /etc/nginx/sites-available/habernexus > /dev/null << EOF
server {
    listen 80;
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
    }
}
EOF
        
        sudo ln -sf /etc/nginx/sites-available/habernexus /etc/nginx/sites-enabled/
        sudo nginx -t > /dev/null 2>&1
        sudo systemctl restart nginx
        
        log_success "Nginx yapılandırıldı"
        
        # SSL
        echo ""
        echo -e "${YELLOW}SSL sertifikası kurmak ister misiniz? (Let's Encrypt) (e/h)${NC}"
        read -p "> " CONFIGURE_SSL
        
        if [ "$CONFIGURE_SSL" = "e" ] || [ "$CONFIGURE_SSL" = "E" ]; then
            log_info "Certbot kuruluyor..."
            sudo apt-get install -y certbot python3-certbot-nginx > /dev/null 2>&1
            
            log_info "SSL sertifikası alınıyor..."
            sudo certbot --nginx -d ${SITE_DOMAIN} -d www.${SITE_DOMAIN} --non-interactive --agree-tos -m admin@${SITE_DOMAIN}
            
            log_success "SSL sertifikası kuruldu"
        fi
    fi
}

# Özet
print_summary() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}              KURULUM TAMAMLANDI!                          ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${CYAN}Uygulama Bilgileri:${NC}"
    echo -e "  • URL: https://${SITE_DOMAIN}"
    echo -e "  • Port: 3000"
    echo -e "  • PM2 Adı: habernexus"
    echo ""
    echo -e "${CYAN}Faydalı Komutlar:${NC}"
    echo -e "  • Durumu görüntüle: ${YELLOW}pm2 status${NC}"
    echo -e "  • Logları görüntüle: ${YELLOW}pm2 logs habernexus${NC}"
    echo -e "  • Yeniden başlat: ${YELLOW}pm2 restart habernexus${NC}"
    echo -e "  • Durdur: ${YELLOW}pm2 stop habernexus${NC}"
    echo ""
    echo -e "${CYAN}Sonraki Adımlar:${NC}"
    echo -e "  1. Google Cloud Console'da OAuth callback URL'ini ayarlayın:"
    echo -e "     ${YELLOW}https://${SITE_DOMAIN}/api/auth/callback/google${NC}"
    echo -e "  2. Admin paneline erişin: ${YELLOW}https://${SITE_DOMAIN}/admin${NC}"
    echo -e "  3. RSS kaynakları ekleyin ve AI motorunu çalıştırın"
    echo ""
    echo -e "${GREEN}İyi çalışmalar! 🚀${NC}"
    echo ""
}

# Ana fonksiyon
main() {
    print_banner
    
    echo -e "${YELLOW}HaberNexus kurulumuna hoş geldiniz!${NC}"
    echo -e "Bu script, projeyi otomatik olarak kuracak ve yapılandıracaktır."
    echo ""
    echo -e "${YELLOW}Devam etmek istiyor musunuz? (e/h)${NC}"
    read -p "> " CONTINUE
    
    if [ "$CONTINUE" != "e" ] && [ "$CONTINUE" != "E" ]; then
        echo "Kurulum iptal edildi."
        exit 0
    fi
    
    echo ""
    
    check_system
    install_dependencies
    clone_project
    install_npm_packages
    configure_environment
    build_project
    start_with_pm2
    configure_nginx
    print_summary
}

# Script'i çalıştır
main
