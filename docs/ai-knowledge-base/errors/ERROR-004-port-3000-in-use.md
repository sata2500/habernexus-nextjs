# ERROR-004: Port 3000 Çakışması - EADDRINUSE Hatası

**Tarih:** 7 Ocak 2026  
**Önem:** Yüksek  
**Durum:** Çözüldü

## Hata Açıklaması

PM2 ile uygulama başlatılırken veya yeniden başlatılırken, port 3000'in zaten kullanımda olması nedeniyle uygulama başlatılamıyor.

## Hata Mesajı

```
⨯ Failed to start server
Error: listen EADDRINUSE: address already in use :::3000
    at <unknown> (Error: listen EADDRINUSE: address already in use :::3000)
    at new Promise (<anonymous>) {
  code: 'EADDRINUSE',
  errno: -98,
  syscall: 'listen',
  address: '::',
  port: 3000
}
```

## Kök Neden

PM2 uygulamayı durdurduğunda, Next.js server process'i hemen sonlanmayabilir. Bu durumda port 3000 hala meşgul kalır ve yeni uygulama başlatılamaz.

## Etkilenen Senaryolar

- `pm2 restart habernexus` komutu
- `pm2 delete habernexus && pm2 start ...` komutları
- Sunucu yeniden başlatma sonrası

## Çözüm

### Manuel Çözüm

```bash
# 1. PM2'yi tamamen durdurun
sudo pm2 kill

# 2. Port 3000'i kullanan process'i sonlandırın
sudo fuser -k 3000/tcp

# 3. Birkaç saniye bekleyin
sleep 3

# 4. Uygulamayı yeniden başlatın
cd /var/www/habernexus
sudo pm2 start npm --name "habernexus" -- start
sudo pm2 save
```

### Alternatif Komutlar

```bash
# Port 3000'i kullanan process'i bulma
sudo ss -tulpn | grep 3000
sudo lsof -i :3000

# Node processlerini sonlandırma
sudo pkill -f "next-server"
```

## Önleme

Bu hata, `scripts/update.sh` dosyasındaki `stop_application()` ve `start_application()` fonksiyonlarına port temizleme mekanizması eklenerek önlendi.

### Eklenen Kod (stop_application)

```bash
# Port 3000'i kullanan processleri temizle
print_step "Port 3000 temizleniyor..."
if command -v fuser &> /dev/null; then
    fuser -k 3000/tcp >> "$LOG_FILE" 2>&1 || true
fi

# Node processlerini temizle
pkill -f "next-server" >> "$LOG_FILE" 2>&1 || true

# Portun serbest kalması için bekle
sleep 2
```

### Eklenen Kod (start_application)

```bash
# Başlamadan önce port 3000'in boş olduğundan emin ol
print_step "Port 3000 kontrol ediliyor..."
if command -v fuser &> /dev/null; then
    if fuser 3000/tcp >> "$LOG_FILE" 2>&1; then
        print_warning "Port 3000 kullanımda, temizleniyor..."
        fuser -k 3000/tcp >> "$LOG_FILE" 2>&1 || true
        sleep 2
    fi
fi
```

## İlgili Değişiklikler

- `scripts/update.sh`: Port temizleme mekanizması eklendi
- `scripts/update.sh`: `--update-env` flag'i PM2 restart komutuna eklendi

## Referanslar

- [PM2 Process Management](https://pm2.keymetrics.io/docs/usage/process-management/)
- [Linux fuser Command](https://man7.org/linux/man-pages/man1/fuser.1.html)
