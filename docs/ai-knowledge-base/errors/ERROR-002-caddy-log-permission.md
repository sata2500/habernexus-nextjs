# ERROR-002: Caddy Log Dizini İzin Sorunu

**Tarih:** 29 Aralık 2025  
**Önem Derecesi:** Yüksek  
**Etkilenen Dosya:** `scripts/install.sh`  
**Çözüm Durumu:** ✅ Çözüldü

---

## Sorun Açıklaması

Install script'i Caddy yapılandırması aşamasında başarısız oluyordu. Caddy servisi başlatılamıyor ve SSL 525 hatası alınıyordu.

### Hata Belirtileri

```bash
$ systemctl status caddy.service
× caddy.service - Caddy
     Loaded: loaded (/usr/lib/systemd/system/caddy.service; enabled)
     Active: failed (Result: exit-code)
     Status: "loading new config: setting up custom log 'log0': opening log writer using &logging.FileWriter{F...
```

```
Error code 525 - SSL handshake failed
Cloudflare is unable to establish an SSL connection to the origin server.
```

---

## Kök Neden Analizi

Caddy yapılandırmasında log dosyası tanımlanmış ancak:

1. Log dizini (`/var/log/caddy/`) Caddyfile oluşturulduktan **sonra** oluşturuluyordu
2. Log dosyası (`habernexus.log`) önceden oluşturulmamıştı
3. Caddy kullanıcısının yazma izni yoktu

### Sorunlu Kod Sıralaması

```bash
# Önce Caddyfile oluşturuluyordu (log dosyası tanımlı)
sudo tee /etc/caddy/Caddyfile > /dev/null << EOF
...
    log {
        output file /var/log/caddy/habernexus.log
        format json
    }
...
EOF

# Sonra dizin oluşturuluyordu (çok geç!)
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy
```

---

## Çözüm

Log dizini ve dosyası Caddyfile oluşturulmadan **önce** hazırlanacak şekilde sıralama değiştirildi.

### Düzeltilmiş Kod

```bash
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
    # ... Caddyfile içeriği
}
```

### Eklenen Özellikler

1. **Log rotation ayarları:**
   ```
   log {
       output file /var/log/caddy/habernexus.log {
           roll_size 10mb
           roll_keep 5
       }
       format json
   }
   ```

2. **Fallback mekanizması:** Yapılandırma hatası durumunda log olmadan basit yapılandırma deneniyor.

3. **Durum kontrolü:** Caddy başlatıldıktan sonra durumu kontrol edilip kullanıcıya bilgi veriliyor.

---

## Manuel Düzeltme (Mevcut Kurulumlar İçin)

```bash
# 1. Log dizini ve dosyasını hazırlayın
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy
sudo chmod 755 /var/log/caddy
sudo touch /var/log/caddy/habernexus.log
sudo chown caddy:caddy /var/log/caddy/habernexus.log
sudo chmod 644 /var/log/caddy/habernexus.log

# 2. Caddy'yi yeniden başlatın
sudo systemctl restart caddy

# 3. Durumu kontrol edin
sudo systemctl status caddy
```

---

## Cloudflare ile Kullanım Notu

Cloudflare kullanılıyorsa SSL ayarlarına dikkat edilmeli:

| SSL Modu | Açıklama | Önerilen |
|----------|----------|----------|
| **Flexible** | Cloudflare → Sunucu arası HTTP | ✅ En kolay |
| **Full** | Cloudflare → Sunucu arası HTTPS (self-signed OK) | ⚠️ Caddy SSL gerekli |
| **Full (Strict)** | Cloudflare → Sunucu arası HTTPS (valid cert) | ⚠️ Origin CA gerekli |

---

## Doğrulama

```bash
# Caddy durumu
$ sudo systemctl status caddy
● caddy.service - Caddy
     Active: active (running)

# Site erişimi
$ curl -I https://habernexus.com
HTTP/2 200
```

---

## Öğrenilen Dersler

1. **Dosya/dizin bağımlılıkları yapılandırmadan önce oluşturulmalı**
2. **Servis kullanıcısının izinleri açıkça ayarlanmalı**
3. **Hata durumları için fallback mekanizması eklenmeli**
4. **Cloudflare gibi CDN'ler kullanılıyorsa SSL uyumluluğu kontrol edilmeli**

---

## İlgili Commit

- **Commit:** 37edd1d
- **Mesaj:** `fix(install): Caddy log dizini izin sorunu düzeltildi`
- **Script Sürümü:** 2.0.1 → 2.0.2
