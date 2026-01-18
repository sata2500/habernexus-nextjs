# ERROR-006: NPM CI Arka Plan İşlem Hatası

**Tarih:** 18 Ocak 2026  
**Önem Derecesi:** Kritik  
**Etkilenen Dosya:** `scripts/install.sh`  
**Çözüm Durumu:** ✅ Çözüldü

---

## Sorun Açıklaması

Install script'i `curl -fsSL ... | bash` komutuyla çalıştırıldığında, "NPM BAĞIMLILIKLARI KURULUYOR" adımında script sessizce sonlanıyordu. Kullanıcı herhangi bir hata mesajı görmüyordu.

### Hata Belirtileri

```bash
$ curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/install.sh | bash

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PROJE KLONLANIYOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ Kurulum dizini hazırlanıyor...
▶ Proje klonlanıyor...
✓ Proje hazır: /var/www/habernexus

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NPM BAĞIMLILIKLARI KURULUYOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ Bağımlılıklar yükleniyor (bu birkaç dakika sürebilir)...
$ # Script burada sessizce sonlanıyor
```

---

## Kök Neden Analizi

Sorun birden fazla faktörün birleşiminden kaynaklanıyordu:

### 1. Arka Plan İşlem Yönetimi

```bash
# Sorunlu kod
npm ci --production=false >> "$LOG_FILE" 2>&1 &
local pid=$!
spinner $pid "Paketler yükleniyor..."
wait $pid
```

Bu kodda:
- `npm ci` arka planda çalıştırılıyor (`&`)
- `spinner` fonksiyonu process'in çalışıp çalışmadığını kontrol ediyor
- `wait $pid` komutu process'in bitmesini bekliyor

### 2. set -e ile Etkileşim

Script'in başında `set -euo pipefail` kullanılıyordu:
- `set -e`: Herhangi bir komut hata döndürürse script'i sonlandır
- `npm ci` başarısız olduğunda, `wait $pid` komutu hata kodunu döndürüyordu
- Bu hata kodu `set -e` tarafından yakalanıyor ve script sessizce sonlanıyordu

### 3. Hata Mesajı Eksikliği

- Hata yakalama mekanizması (`trap`) çalışıyordu
- Ancak `wait` komutunun döndürdüğü hata kodu, kullanıcıya anlamlı bir mesaj gösterilmeden script'i sonlandırıyordu

---

## Çözüm

### 1. set -e Kaldırıldı

```bash
# Eski
set -euo pipefail

# Yeni
set -uo pipefail
```

`set -e` kaldırılarak, hata yönetimi manuel olarak yapılmaya başlandı.

### 2. Arka Plan İşlem Yerine Doğrudan Çalıştırma

```bash
# Yeni kod
install_dependencies() {
    print_header "NPM BAĞIMLILIKLARI KURULUYOR"
    
    cd "$INSTALL_DIR"
    
    print_step "Bağımlılıklar yükleniyor (bu birkaç dakika sürebilir)..."
    
    # npm ci komutunu doğrudan çalıştır ve hata durumunu yakala
    if npm ci --production=false --loglevel=error >> "$LOG_FILE" 2>&1; then
        print_success "Bağımlılıklar yüklendi"
    else
        local exit_code=$?
        print_error "npm ci başarısız oldu (kod: $exit_code)"
        print_info "npm install ile tekrar deneniyor..."
        
        # npm ci başarısız olursa npm install dene
        if npm install --loglevel=error >> "$LOG_FILE" 2>&1; then
            print_success "Bağımlılıklar yüklendi (npm install ile)"
        else
            print_error "Bağımlılık yüklemesi başarısız oldu"
            print_info "Detaylı log: $LOG_FILE"
            print_info "Son 20 satır log:"
            tail -20 "$LOG_FILE" | while read line; do
                echo -e "    ${DIM}$line${NC}"
            done
            exit 1
        fi
    fi
}
```

### 3. Fallback Mekanizması

- `npm ci` başarısız olursa `npm install` deneniyor
- Her iki komut da başarısız olursa, detaylı hata mesajı ve log gösteriliyor

---

## Doğrulama

```bash
# Düzeltme sonrası test
$ curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/install.sh | bash

# Script artık:
# 1. npm ci başarısız olursa npm install deniyor
# 2. Her iki komut da başarısız olursa detaylı hata mesajı gösteriliyor
# 3. Log dosyasının son satırları ekrana yazdırılıyor
```

---

## Öğrenilen Dersler

1. **`set -e` dikkatli kullanılmalı:** Arka plan işlemlerle birlikte kullanıldığında beklenmedik sonuçlara yol açabilir.

2. **Arka plan işlemler için hata yönetimi:** `wait $pid` komutunun çıkış kodunu kontrol etmek yeterli değil, hata durumunda kullanıcıya anlamlı mesaj gösterilmeli.

3. **Fallback mekanizmaları:** Kritik işlemler için alternatif yöntemler sağlanmalı (`npm ci` → `npm install`).

4. **Detaylı hata mesajları:** Hata durumunda kullanıcıya log dosyasının içeriği gösterilmeli.

5. **Spinner animasyonu:** Uzun süren işlemler için spinner kullanılabilir, ancak hata yönetimi ayrı ele alınmalı.

---

## İlgili Commit

- **Script Sürümü:** 2.1.0 → 3.0.0
- **Değişiklik Türü:** Kritik hata düzeltmesi
- **Etkilenen Fonksiyonlar:** `install_dependencies`, `build_project`
