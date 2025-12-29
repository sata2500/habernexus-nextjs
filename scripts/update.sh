#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                                                                           ║
# ║   HaberNexus - Profesyonel Güncelleme Sistemi                             ║
# ║   Sürüm: 2.0.0                                                            ║
# ║                                                                           ║
# ║   Kullanım: habernexus update                                             ║
# ║   veya: bash /var/www/habernexus/scripts/update.sh                        ║
# ║                                                                           ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
# YAPILANDIRMA
# ═══════════════════════════════════════════════════════════════════════════

readonly SCRIPT_VERSION="2.0.0"
readonly INSTALL_DIR="/var/www/habernexus"
readonly PM2_APP_NAME="habernexus"
readonly BACKUP_DIR="/var/www/habernexus-backups"
readonly LOG_FILE="/tmp/habernexus-update-$(date +%Y%m%d-%H%M%S).log"

# ═══════════════════════════════════════════════════════════════════════════
# RENK TANIMLARI
# ═══════════════════════════════════════════════════════════════════════════

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly GRAY='\033[0;90m'
readonly NC='\033[0m'
readonly BOLD='\033[1m'

# ═══════════════════════════════════════════════════════════════════════════
# YARDIMCI FONKSİYONLAR
# ═══════════════════════════════════════════════════════════════════════════

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

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
    echo -e "${GRAY}  ℹ${NC} $1"
    log "INFO: $1"
}

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

error_handler() {
    local line_no=$1
    print_error "Güncelleme sırasında hata oluştu (satır: $line_no)"
    print_info "Uygulama geri yükleniyor..."
    
    # Uygulamayı yeniden başlat
    pm2 restart "$PM2_APP_NAME" >> "$LOG_FILE" 2>&1 || true
    
    print_info "Detaylı log: $LOG_FILE"
    exit 1
}

trap 'error_handler ${LINENO}' ERR

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
    echo -e "${WHITE}                    Güncelleme Sistemi v${SCRIPT_VERSION}${NC}"
    echo ""
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════════
# KONTROL FONKSİYONLARI
# ═══════════════════════════════════════════════════════════════════════════

check_installation() {
    if [[ ! -d "$INSTALL_DIR" ]]; then
        print_error "HaberNexus kurulumu bulunamadı: $INSTALL_DIR"
        print_info "Önce kurulum yapın: curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/install.sh | bash"
        exit 1
    fi
    
    if [[ ! -f "$INSTALL_DIR/package.json" ]]; then
        print_error "Geçersiz kurulum dizini"
        exit 1
    fi
}

check_for_updates() {
    cd "$INSTALL_DIR"
    
    print_step "Güncellemeler kontrol ediliyor..."
    
    # Uzak değişiklikleri al
    git fetch origin master >> "$LOG_FILE" 2>&1
    
    # Mevcut ve uzak commit'leri karşılaştır
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/master)
    
    if [[ "$local_commit" == "$remote_commit" ]]; then
        print_success "Zaten en güncel sürümdesiniz!"
        echo ""
        
        # Mevcut sürüm bilgisi
        local current_version=$(grep '"version"' package.json | cut -d'"' -f4)
        echo -e "  ${WHITE}Mevcut Sürüm:${NC} $current_version"
        echo -e "  ${WHITE}Commit:${NC}       ${local_commit:0:8}"
        echo ""
        
        exit 0
    fi
    
    # Değişiklik sayısını hesapla
    local commits_behind=$(git rev-list HEAD..origin/master --count)
    print_success "$commits_behind yeni güncelleme bulundu"
    
    # Değişiklikleri listele
    echo ""
    echo -e "${WHITE}Yapılacak Değişiklikler:${NC}"
    echo -e "${GRAY}─────────────────────────────────────────────────────────────────${NC}"
    git log HEAD..origin/master --oneline --no-decorate | head -10 | while read line; do
        echo -e "  ${CYAN}•${NC} $line"
    done
    
    if [[ $commits_behind -gt 10 ]]; then
        echo -e "  ${GRAY}... ve $((commits_behind - 10)) daha fazla değişiklik${NC}"
    fi
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════════
# YEDEKLEME FONKSİYONLARI
# ═══════════════════════════════════════════════════════════════════════════

create_backup() {
    print_header "YEDEKLEME OLUŞTURULUYOR"
    
    local backup_name="habernexus-backup-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    # Yedekleme dizini oluştur
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$backup_path"
    
    print_step "Veritabanı yedekleniyor..."
    if [[ -f "$INSTALL_DIR/data.db" ]]; then
        cp "$INSTALL_DIR/data.db" "$backup_path/"
        print_success "Veritabanı yedeklendi"
    else
        print_info "Veritabanı dosyası bulunamadı"
    fi
    
    print_step "Environment dosyası yedekleniyor..."
    if [[ -f "$INSTALL_DIR/.env" ]]; then
        cp "$INSTALL_DIR/.env" "$backup_path/"
        print_success "Environment dosyası yedeklendi"
    fi
    
    print_step "Özel dosyalar yedekleniyor..."
    if [[ -d "$INSTALL_DIR/public/uploads" ]]; then
        cp -r "$INSTALL_DIR/public/uploads" "$backup_path/"
        print_success "Upload dosyaları yedeklendi"
    fi
    
    # Eski yedekleri temizle (son 5 yedek kalsın)
    print_step "Eski yedekler temizleniyor..."
    ls -dt "$BACKUP_DIR"/habernexus-backup-* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true
    
    print_success "Yedekleme tamamlandı: $backup_path"
    
    echo "$backup_path"
}

# ═══════════════════════════════════════════════════════════════════════════
# GÜNCELLEME FONKSİYONLARI
# ═══════════════════════════════════════════════════════════════════════════

stop_application() {
    print_header "UYGULAMA DURDURULUYOR"
    
    print_step "PM2 uygulaması durduruluyor..."
    pm2 stop "$PM2_APP_NAME" >> "$LOG_FILE" 2>&1 || true
    
    print_success "Uygulama durduruldu"
}

update_code() {
    print_header "KOD GÜNCELLENİYOR"
    
    cd "$INSTALL_DIR"
    
    # Mevcut sürümü kaydet
    local old_version=$(grep '"version"' package.json | cut -d'"' -f4)
    local old_commit=$(git rev-parse HEAD)
    
    print_step "Değişiklikler kontrol ediliyor..."
    
    # Kaydedilmemiş değişiklikler varsa stash yap
    if [[ -n "$(git status --porcelain)" ]]; then
        print_warning "Kaydedilmemiş değişiklikler tespit edildi"
        print_step "Değişiklikler geçici olarak saklanıyor..."
        git stash push -m "Auto-stash before update $(date +%Y%m%d-%H%M%S)" >> "$LOG_FILE" 2>&1
    fi
    
    print_step "Güncellemeler uygulanıyor..."
    git pull origin master >> "$LOG_FILE" 2>&1
    
    # Yeni sürüm bilgisi
    local new_version=$(grep '"version"' package.json | cut -d'"' -f4)
    local new_commit=$(git rev-parse HEAD)
    
    print_success "Kod güncellendi"
    echo ""
    echo -e "  ${WHITE}Eski Sürüm:${NC} $old_version (${old_commit:0:8})"
    echo -e "  ${WHITE}Yeni Sürüm:${NC} $new_version (${new_commit:0:8})"
    echo ""
}

update_dependencies() {
    print_header "BAĞIMLILIKLAR GÜNCELLENİYOR"
    
    cd "$INSTALL_DIR"
    
    print_step "NPM paketleri güncelleniyor..."
    
    npm ci >> "$LOG_FILE" 2>&1 &
    local pid=$!
    spinner $pid "Paketler yükleniyor..."
    wait $pid
    
    print_success "Bağımlılıklar güncellendi"
}

update_database() {
    print_header "VERİTABANI GÜNCELLENİYOR"
    
    cd "$INSTALL_DIR"
    
    print_step "Prisma Client yeniden oluşturuluyor..."
    npx prisma generate >> "$LOG_FILE" 2>&1
    
    print_step "Veritabanı şeması güncelleniyor..."
    npx prisma db push >> "$LOG_FILE" 2>&1
    
    print_success "Veritabanı güncellendi"
}

rebuild_project() {
    print_header "PROJE YENİDEN BUILD EDİLİYOR"
    
    cd "$INSTALL_DIR"
    
    print_step "Eski build temizleniyor..."
    rm -rf .next >> "$LOG_FILE" 2>&1 || true
    
    print_step "Production build alınıyor..."
    
    npm run build >> "$LOG_FILE" 2>&1 &
    local pid=$!
    spinner $pid "Build işlemi devam ediyor..."
    wait $pid
    
    print_success "Build tamamlandı"
}

start_application() {
    print_header "UYGULAMA BAŞLATILIYOR"
    
    cd "$INSTALL_DIR"
    
    print_step "PM2 uygulaması başlatılıyor..."
    pm2 restart "$PM2_APP_NAME" >> "$LOG_FILE" 2>&1
    
    # Uygulamanın başlamasını bekle
    sleep 3
    
    # Durum kontrolü
    if pm2 show "$PM2_APP_NAME" | grep -q "online"; then
        print_success "Uygulama başarıyla başlatıldı"
    else
        print_warning "Uygulama başlatılamadı, logları kontrol edin"
        print_info "pm2 logs $PM2_APP_NAME"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# GÜNCELLEME ÖZETİ
# ═══════════════════════════════════════════════════════════════════════════

print_summary() {
    local new_version=$(grep '"version"' "$INSTALL_DIR/package.json" | cut -d'"' -f4)
    
    echo ""
    echo -e "${GREEN}"
    cat << 'EOF'
    ╔═══════════════════════════════════════════════════════════════════════════╗
    ║                                                                           ║
    ║                    GÜNCELLEME BAŞARIYLA TAMAMLANDI!                       ║
    ║                                                                           ║
    ╚═══════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}  GÜNCELLEME BİLGİLERİ${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${WHITE}Yeni Sürüm:${NC}     $new_version"
    echo -e "  ${WHITE}Güncelleme:${NC}     $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "  ${WHITE}Log Dosyası:${NC}    $LOG_FILE"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${GREEN}Uygulama güncel ve çalışıyor! 🚀${NC}"
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════════
# ANA FONKSİYON
# ═══════════════════════════════════════════════════════════════════════════

main() {
    # Log dosyası başlat
    echo "HaberNexus Güncelleme Logu - $(date)" > "$LOG_FILE"
    
    # Banner
    print_banner
    
    # Kurulum kontrolü
    check_installation
    
    # Güncelleme kontrolü
    check_for_updates
    
    # Onay al
    read -p "Güncellemeye devam etmek istiyor musunuz? (e/h) [e]: " confirm
    confirm=${confirm:-e}
    if [[ ! $confirm =~ ^[Ee]$ ]]; then
        print_info "Güncelleme iptal edildi."
        exit 0
    fi
    
    # Güncelleme adımları
    local backup_path=$(create_backup)
    stop_application
    update_code
    update_dependencies
    update_database
    rebuild_project
    start_application
    
    # Özet
    print_summary
}

# Script'i çalıştır
main "$@"
