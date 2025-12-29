# LEARNING-001: Bash Install Script'leri İçin En İyi Uygulamalar

**Tarih:** 29 Aralık 2025  
**Kategori:** DevOps / Scripting  
**Kaynak:** Install Script v2.0.2 Geliştirmesi

---

## Özet

Bu doküman, `curl | bash` ile çalıştırılacak interaktif install script'leri geliştirirken dikkat edilmesi gereken en iyi uygulamaları içerir.

---

## 1. Stdin Yönetimi

### Sorun
Pipe üzerinden çalıştırılan script'lerde stdin, pipe'ın çıktısına bağlıdır. Bu nedenle `read` komutları beklendiği gibi çalışmaz.

### Çözüm
Kullanıcı girdisi için `/dev/tty` kullanın:

```bash
# ❌ Yanlış
read -p "Domain: " DOMAIN

# ✅ Doğru
read -r DOMAIN </dev/tty
printf "Domain: " >/dev/tty
```

### Yardımcı Fonksiyonlar

```bash
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
```

---

## 2. Dosya/Dizin Bağımlılıkları

### Kural
Bir yapılandırma dosyası başka dosya/dizinlere referans veriyorsa, bu bağımlılıklar **önce** oluşturulmalıdır.

```bash
# ❌ Yanlış sıralama
create_config_file()  # Log dosyasına referans veriyor
create_log_directory()  # Çok geç!

# ✅ Doğru sıralama
create_log_directory()  # Önce bağımlılıklar
create_config_file()    # Sonra yapılandırma
```

---

## 3. İzin Yönetimi

### Servis Kullanıcıları
Systemd servisleri genellikle kendi kullanıcılarıyla çalışır. Dosya izinleri buna göre ayarlanmalıdır:

```bash
# Caddy örneği
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy
sudo chmod 755 /var/log/caddy

# Log dosyası
sudo touch /var/log/caddy/app.log
sudo chown caddy:caddy /var/log/caddy/app.log
sudo chmod 644 /var/log/caddy/app.log
```

---

## 4. Hata Yönetimi

### Fallback Mekanizması
Kritik olmayan özellikler için fallback sağlayın:

```bash
if ! validate_config; then
    print_warning "Gelişmiş yapılandırma başarısız, basit yapılandırma deneniyor..."
    create_simple_config
fi
```

### Durum Kontrolü
Servis başlatıldıktan sonra durumu kontrol edin:

```bash
sudo systemctl restart service_name

if sudo systemctl is-active --quiet service_name; then
    print_success "Servis başarıyla başlatıldı"
else
    print_warning "Servis başlatılamadı. Lütfen logları kontrol edin."
fi
```

---

## 5. Script Yapısı

### Önerilen Yapı

```bash
#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# YAPILANDIRMA DEĞİŞKENLERİ
# ═══════════════════════════════════════════════════════════════
readonly SCRIPT_VERSION="1.0.0"
readonly LOG_FILE="/tmp/install-$(date +%Y%m%d-%H%M%S).log"

# ═══════════════════════════════════════════════════════════════
# YARDIMCI FONKSİYONLAR
# ═══════════════════════════════════════════════════════════════
log() { ... }
print_success() { ... }
print_error() { ... }
ask_input() { ... }

# ═══════════════════════════════════════════════════════════════
# KURULUM FONKSİYONLARI
# ═══════════════════════════════════════════════════════════════
check_requirements() { ... }
install_dependencies() { ... }
configure_service() { ... }

# ═══════════════════════════════════════════════════════════════
# ANA FONKSİYON
# ═══════════════════════════════════════════════════════════════
main() {
    check_requirements
    get_user_input
    install_dependencies
    configure_service
    print_summary
}

main "$@"
```

---

## 6. Test Kontrol Listesi

Script'i yayınlamadan önce şu yöntemlerle test edin:

| Test Yöntemi | Komut | Kontrol Edilecek |
|--------------|-------|------------------|
| Doğrudan çalıştırma | `bash script.sh` | Temel işlevsellik |
| Pipe ile çalıştırma | `cat script.sh \| bash` | Stdin yönetimi |
| curl ile çalıştırma | `curl ... \| bash` | Gerçek senaryo |
| Syntax kontrolü | `bash -n script.sh` | Syntax hataları |
| ShellCheck | `shellcheck script.sh` | Best practices |

---

## 7. Cloudflare Entegrasyonu

Cloudflare arkasında çalışacak servisler için:

| Senaryo | SSL Modu | Sunucu Yapılandırması |
|---------|----------|----------------------|
| Basit kurulum | Flexible | HTTP only (port 80) |
| Orta güvenlik | Full | Self-signed SSL |
| Yüksek güvenlik | Full (Strict) | Cloudflare Origin CA |

---

## Referanslar

- [Bash Best Practices](https://mywiki.wooledge.org/BashGuide)
- [ShellCheck](https://www.shellcheck.net/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [Cloudflare SSL Modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)
