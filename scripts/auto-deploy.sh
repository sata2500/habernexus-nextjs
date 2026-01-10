#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                                                                           ║
# ║   HaberNexus - Otomatik Deployment Scripti                                ║
# ║   Sürüm: 1.0.0                                                            ║
# ║                                                                           ║
# ║   Bu script webhook tarafından tetiklenir ve uygulamayı günceller.        ║
# ║                                                                           ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
# YAPILANDIRMA
# ═══════════════════════════════════════════════════════════════════════════

readonly SCRIPT_VERSION="1.0.0"
readonly INSTALL_DIR="${INSTALL_DIR:-/var/www/habernexus}"
readonly PM2_APP_NAME="${PM2_APP_NAME:-habernexus}"
readonly BACKUP_DIR="${BACKUP_DIR:-/var/www/habernexus-backups}"
readonly LOG_DIR="${LOG_DIR:-/var/log/habernexus}"
readonly LOG_FILE="${LOG_DIR}/auto-deploy-$(date +%Y%m%d-%H%M%S).log"
readonly LOCK_FILE="/tmp/habernexus-deploy.lock"
readonly MAX_BACKUP_COUNT=5

# Environment variables from webhook
readonly DEPLOY_SHA="${DEPLOY_SHA:-}"
readonly DEPLOY_REF="${DEPLOY_REF:-}"
readonly DEPLOY_PUSHER="${DEPLOY_PUSHER:-}"

# ═══════════════════════════════════════════════════════════════════════════
# RENK TANIMLARI
# ═══════════════════════════════════════════════════════════════════════════

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# ═══════════════════════════════════════════════════════════════════════════
# YARDIMCI FONKSİYONLAR
# ═══════════════════════════════════════════════════════════════════════════

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case "$level" in
        INFO)  echo -e "${GREEN}✓${NC} $message" ;;
        WARN)  echo -e "${YELLOW}⚠${NC} $message" ;;
        ERROR) echo -e "${RED}✗${NC} $message" ;;
        STEP)  echo -e "${BLUE}▶${NC} $message" ;;
        *)     echo "$message" ;;
    esac
}

cleanup() {
    rm -f "$LOCK_FILE"
    log "INFO" "Lock dosyası temizlendi"
}

error_handler() {
    local line_no=$1
    log "ERROR" "Hata oluştu (satır: $line_no)"
    log "INFO" "Uygulama yeniden başlatılıyor..."
    
    # Uygulamayı yeniden başlat
    pm2 restart "$PM2_APP_NAME" >> "$LOG_FILE" 2>&1 || true
    
    cleanup
    exit 1
}

trap 'error_handler ${LINENO}' ERR
trap cleanup EXIT

# ═══════════════════════════════════════════════════════════════════════════
# KONTROLLER
# ═══════════════════════════════════════════════════════════════════════════

check_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local lock_pid=$(cat "$LOCK_FILE" 2>/dev/null)
        if kill -0 "$lock_pid" 2>/dev/null; then
            log "ERROR" "Başka bir deployment işlemi devam ediyor (PID: $lock_pid)"
            exit 1
        else
            log "WARN" "Eski lock dosyası bulundu, temizleniyor"
            rm -f "$LOCK_FILE"
        fi
    fi
    
    echo $$ > "$LOCK_FILE"
}

check_installation() {
    if [[ ! -d "$INSTALL_DIR" ]]; then
        log "ERROR" "Kurulum dizini bulunamadı: $INSTALL_DIR"
        exit 1
    fi
    
    if [[ ! -f "$INSTALL_DIR/package.json" ]]; then
        log "ERROR" "Geçersiz kurulum dizini"
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# YEDEKLEME
# ═══════════════════════════════════════════════════════════════════════════

create_quick_backup() {
    log "STEP" "Hızlı yedekleme oluşturuluyor..."
    
    local backup_name="auto-backup-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    mkdir -p "$backup_path"
    
    # Sadece kritik dosyaları yedekle
    if [[ -f "$INSTALL_DIR/data.db" ]]; then
        cp "$INSTALL_DIR/data.db" "$backup_path/"
    fi
    
    if [[ -f "$INSTALL_DIR/.env" ]]; then
        cp "$INSTALL_DIR/.env" "$backup_path/"
    fi
    
    # Eski yedekleri temizle
    ls -dt "$BACKUP_DIR"/auto-backup-* 2>/dev/null | tail -n +$((MAX_BACKUP_COUNT + 1)) | xargs rm -rf 2>/dev/null || true
    
    log "INFO" "Yedekleme tamamlandı: $backup_path"
}

# ═══════════════════════════════════════════════════════════════════════════
# GÜNCELLEME
# ═══════════════════════════════════════════════════════════════════════════

pull_changes() {
    log "STEP" "Git değişiklikleri çekiliyor..."
    
    cd "$INSTALL_DIR"
    
    # Mevcut commit
    local old_commit=$(git rev-parse HEAD)
    
    # Kaydedilmemiş değişiklikleri stash yap
    if [[ -n "$(git status --porcelain)" ]]; then
        log "WARN" "Kaydedilmemiş değişiklikler stash yapılıyor"
        git stash push -m "Auto-stash before deploy $(date +%Y%m%d-%H%M%S)" >> "$LOG_FILE" 2>&1
    fi
    
    # Değişiklikleri çek
    git fetch origin >> "$LOG_FILE" 2>&1
    git reset --hard origin/master >> "$LOG_FILE" 2>&1
    
    # Yeni commit
    local new_commit=$(git rev-parse HEAD)
    
    if [[ "$old_commit" == "$new_commit" ]]; then
        log "INFO" "Zaten güncel"
    else
        log "INFO" "Güncellendi: ${old_commit:0:8} → ${new_commit:0:8}"
    fi
}

install_dependencies() {
    log "STEP" "Bağımlılıklar güncelleniyor..."
    
    cd "$INSTALL_DIR"
    
    # npm ci daha hızlı ve tutarlı
    npm ci --production=false >> "$LOG_FILE" 2>&1
    
    log "INFO" "Bağımlılıklar güncellendi"
}

update_database() {
    log "STEP" "Veritabanı güncelleniyor..."
    
    cd "$INSTALL_DIR"
    
    npx prisma generate >> "$LOG_FILE" 2>&1
    npx prisma db push >> "$LOG_FILE" 2>&1
    
    log "INFO" "Veritabanı güncellendi"
}

build_project() {
    log "STEP" "Proje build ediliyor..."
    
    cd "$INSTALL_DIR"
    
    # Eski build'i temizle
    rm -rf .next >> "$LOG_FILE" 2>&1 || true
    
    # Yeni build
    npm run build >> "$LOG_FILE" 2>&1
    
    log "INFO" "Build tamamlandı"
}

restart_application() {
    log "STEP" "Uygulama yeniden başlatılıyor..."
    
    # PM2 ile restart
    pm2 restart "$PM2_APP_NAME" >> "$LOG_FILE" 2>&1
    
    # Uygulamanın başlaması için bekle
    sleep 5
    
    # Health check
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
            log "INFO" "Uygulama başarıyla başlatıldı"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 2
    done
    
    log "WARN" "Health check zaman aşımına uğradı, ancak uygulama çalışıyor olabilir"
}

# ═══════════════════════════════════════════════════════════════════════════
# ANA FONKSİYON
# ═══════════════════════════════════════════════════════════════════════════

main() {
    # Log dizini oluştur
    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKUP_DIR"
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  HaberNexus Auto-Deploy v${SCRIPT_VERSION}${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    log "INFO" "Auto-deploy başlatıldı"
    
    if [[ -n "$DEPLOY_SHA" ]]; then
        log "INFO" "Tetikleyen: $DEPLOY_PUSHER | SHA: ${DEPLOY_SHA:0:8}"
    fi
    
    # Kontroller
    check_lock
    check_installation
    
    # Deployment adımları
    local start_time=$(date +%s)
    
    create_quick_backup
    pull_changes
    install_dependencies
    update_database
    build_project
    restart_application
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Deployment başarıyla tamamlandı!${NC}"
    echo -e "${GREEN}  Süre: ${duration} saniye${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    log "INFO" "Auto-deploy tamamlandı (${duration}s)"
}

# Script'i çalıştır
main "$@"
