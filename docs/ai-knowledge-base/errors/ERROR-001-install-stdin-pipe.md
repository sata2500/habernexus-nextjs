# ERROR-001: Install Script Stdin Pipe Sorunu

**Tarih:** 29 Aralık 2025  
**Önem Derecesi:** Kritik  
**Etkilenen Dosya:** `scripts/install.sh`  
**Çözüm Durumu:** ✅ Çözüldü

---

## Sorun Açıklaması

Install script'i `curl -fsSL ... | bash` komutuyla çalıştırıldığında, script hoş geldin mesajını gösterdikten sonra kullanıcıdan girdi beklemeden aniden sonlanıyordu.

### Hata Belirtileri

```bash
$ curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/install.sh | bash

HaberNexus Profesyonel Kurulum Sistemine hoş geldiniz!

Bu script, HaberNexus'u sunucunuza otomatik olarak kuracak ve
yapılandıracaktır. Kurulum yaklaşık 5-10 dakika sürecektir.

Kurulum sırasında sizden bazı bilgiler istenecektir.

$ # Script burada aniden sonlanıyor
```

---

## Kök Neden Analizi

Script `curl | bash` ile çalıştırıldığında, stdin (standart girdi) curl'ün çıktısına (script içeriğine) bağlı oluyordu. Bu nedenle:

1. `read -p "..."` komutları stdin'den veri okumaya çalıştığında boş değer alıyordu
2. Script, kullanıcıdan girdi beklemeden hemen sonlanıyordu
3. Özellikle `read -p "Kuruluma başlamak için Enter'a basın..."` komutu bu soruna neden oluyordu

### Teknik Detay

```bash
# Sorunlu kod
read -p "Kuruluma başlamak için Enter'a basın..."

# Pipe üzerinden çalıştırıldığında stdin script içeriğine bağlı
# Bu nedenle read komutu boş değer alıyor ve devam ediyor
```

---

## Çözüm

Tüm `read` komutlarını `/dev/tty` üzerinden okuyacak şekilde değiştirdik. Bu sayede pipe ile çalıştırılsa bile terminal'den kullanıcı girdisi alınabiliyor.

### Eklenen Yardımcı Fonksiyonlar

```bash
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
```

### Değiştirilen Satırlar

| Eski Kod | Yeni Kod |
|----------|----------|
| `read -p "Domain: " SITE_DOMAIN` | `ask_input "Domain" SITE_DOMAIN` |
| `read -p "Seçiminiz (1/2) [1]: " ws_choice` | `ask_input "Seçiminiz (1/2)" ws_choice "1"` |
| `read -p "Kuruluma başlamak için Enter'a basın..."` | `wait_enter "Kuruluma başlamak için Enter'a basın..."` |

---

## Doğrulama

```bash
# Düzeltme sonrası test
$ curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/install.sh | bash

# Script artık kullanıcıdan girdi bekliyor ve interaktif olarak çalışıyor
```

---

## Öğrenilen Dersler

1. **Pipe üzerinden çalıştırılacak script'lerde stdin kullanımına dikkat edilmeli**
2. **İnteraktif girdi için `/dev/tty` kullanılmalı**
3. **Script'ler farklı çalıştırma yöntemleriyle test edilmeli:**
   - Doğrudan: `bash script.sh`
   - Pipe ile: `curl ... | bash`
   - Dosyadan: `bash < script.sh`

---

## İlgili Commit

- **Commit:** 545f142
- **Mesaj:** `fix(install): pipe üzerinden çalıştırıldığında stdin sorunu düzeltildi`
- **Script Sürümü:** 2.0.0 → 2.0.1
