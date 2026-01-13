# Geliştirme Raporu: Görsel Üretim Promptu v2

**Tarih:** 13 Ocak 2026  
**Geliştirici:** AI Agent  
**Versiyon:** v2.0.0  
**Konu:** Geliştirilmiş Görsel Üretim Promptu - Sansürsüz ve Özgün

---

## Özet

Görsel üretim promptu tamamen yeniden tasarlanarak daha güzel, özgün, sanatsal ve sansürsüz hale getirildi. İnsan yüzlerinin gösterilmesine izin veren ve teknik olarak üstün görseller üretmek için optimize edilmiş yeni bir prompt sistemi uygulandı.

---

## Yapılan Değişiklikler

### 1. Yeni Görsel Üretim Promptu

**Eski Prompt:**
```
A high-quality, professional news article header image.
Topic: {{title}}
Category: {{category}}
Style: {{style}}, photorealistic, editorial quality, 16:9 aspect ratio, no text overlay, suitable for news website.
The image should be visually appealing and relevant to the topic without showing any specific people's faces.
```

**Yeni Prompt (v2):**
```
An ultra-realistic, dynamic, and emotionally resonant photograph capturing the essence of a news story.

Subject: "{{title}}"
Category: {{category}}

Scene Description:
{{style}}. The scene is rich with authentic details, conveying a powerful narrative. If people are present, their expressions and actions are natural and meaningful, reflecting the core of the news story. The environment is highly detailed and contextually appropriate.

Composition & Framing:
Masterful composition, using the rule of thirds. A compelling medium shot or a wide shot that establishes the scene. The main subject is in sharp focus, with a natural depth of field that draws the viewer's eye.

Lighting:
Dramatic and natural lighting that enhances the mood. Could be the soft glow of golden hour, the crisp light of a modern office, or the dynamic lighting of a live event. Avoid flat or artificial lighting.

Atmosphere & Mood:
The image should evoke a specific emotion relevant to the story: urgency, hope, innovation, tension, or contemplation. The overall tone is professional, suitable for a leading news publication.

Technical Details:
Shot on a Sony a7R V with a G Master lens (e.g., 50mm f/1.2 or 24-70mm f/2.8). 16:9 aspect ratio. Hyper-detailed, sharp, and clear.

Negative Prompt:
--no text, no logos, no watermarks, blurry, oversaturated, ugly, deformed, disfigured, poor details, bad hands, extra limbs, extra fingers.
```

**Geliştirilmiş Özellikleri:**
- **Ultra-realistic**: Daha gerçekçi ve sanatsal görseller
- **Emotionally resonant**: Duygusal bağlantı kuran görseller
- **İnsan yüzlerine izin**: Sansürsüz, doğal ve anlamlı insan figürleri
- **Teknik detaylar**: Kamera ve lens özellikleri belirtildi
- **Lighting**: Dramatik ve doğal aydınlatma açıklamaları
- **Negatif prompt**: Kalite kontrol ve istenmeyen öğelerin engellenmesi

### 2. Kategori Bazlı Stil Rehberi Güncellemesi

Her kategori için daha belirgin, özgün ve detaylı stil tanımlamaları oluşturuldu:

| Kategori | Yeni Stil Tanımlaması |
|----------|----------------------|
| **Teknoloji** | A sleek, modern environment with glowing data visualizations and innovative gadgets. People interacting with futuristic interfaces. Clean lines, blue and silver tones, a sense of progress and innovation. |
| **Ekonomi** | A bustling stock exchange floor with blurred screens in the background, or a sharp, professional corporate meeting. Focus on charts, financial data, and business professionals in action. Mood can be tense or optimistic. |
| **Spor** | A high-energy, dynamic action shot of athletes in motion. Dramatic lighting, motion blur, and a focus on the intensity of the competition. The crowd is a blurred, energetic backdrop. |
| **Sağlık** | A clean, bright, and modern medical laboratory or a serene wellness scene. Focus on scientific research, healthy lifestyles, or compassionate healthcare professionals. Colors are typically white, green, and blue. |
| **Bilim** | A sense of discovery and wonder. Could be a researcher in a high-tech lab, a stunning view of a nebula from a telescope, or a microscopic image. Lighting is often dramatic and focused. |
| **Dünya** | A powerful and culturally rich photograph representing a global event. Could be a cityscape, a natural landscape, or a portrait of a person that tells a story. Authentic and journalistic in style. |
| **Kültür-Sanat** | Vibrant, creative, and expressive. An artist in their studio, a dramatic scene from a theater performance, or a colorful abstract representation of a cultural theme. Rich textures and bold colors. |
| **Gündem** | A classic, impactful journalistic photo. Captures a key moment of a current event. Often features people and conveys a sense of immediacy and importance. Black and white can be used for dramatic effect. |

### 3. Sansürsüz Görsel Üretimi

**Değişiklik:** `PersonGeneration.DONT_ALLOW` kaldırıldı

**Önceki Durum:**
```typescript
personGeneration: PersonGeneration.DONT_ALLOW,
```

**Yeni Durum:**
```typescript
// Allow people in generated images for more realistic and engaging visuals
// (PersonGeneration ayarı kaldırıldı - varsayılan davranış izin verir)
```

**Sonuç:** AI artık insan yüzleri ve figürleri içeren daha gerçekçi ve ilgi çekici görseller üretebilir.

---

## Teknik İyileştirmeler

### Prompt Yapısı
- **Bölümlü tasarım**: Farklı yönleri açık şekilde tanımlar
- **Değişken sistem**: {{title}}, {{category}}, {{style}} dinamik olarak değiştirilir
- **Negatif prompt**: İstenmeyen özellikleri engeller

### Stil Rehberi
- **Özgünlük**: Her kategori için benzersiz ve belirgin stil tanımlaması
- **Detay**: Renk, duygu, bağlam ve teknik detaylar içerir
- **Esneklik**: Farklı haber türlerine uyarlanabilir

### Kalite Kontrol
- **Teknik spesifikasyonlar**: Kamera ve lens modelleri belirtildi
- **Negatif öğeler**: Blurry, oversaturated, deformed vb. engellendi
- **Sanatsal yönergeler**: Composition, lighting, mood açıklamaları

---

## Beklenen Sonuçlar

### Görsel Kalitesi
- Daha sanatsal ve profesyonel görseller
- Daha iyi composition ve framing
- Daha dramatik ve uygun aydınlatma

### İnsan Figürleri
- Doğal ve anlamlı insan yüzleri
- Bağlamla uyumlu ifadeler ve hareketler
- Daha gerçekçi ve ilgi çekici sahneler

### Kategori Özgüllüğü
- Teknoloji: Futuristic ve modern görünüm
- Spor: Yüksek enerji ve dinamik hareketler
- Ekonomi: Profesyonel ve finansal odak
- Diğer kategoriler: Özgün ve belirgin stiller

---

## Güncellenen Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `lib/prompts.ts` | IMAGE prompt şablonu ve CATEGORY_IMAGE_STYLES güncellendi |
| `lib/imagen.ts` | PersonGeneration kısıtlaması kaldırıldı |
| `docs/ai-agents/work-logs/2026-01-13-image-prompt-v2-design.md` | Tasarım dokümantasyonu eklendi |

---

## Kullanım Örneği

### Teknoloji Haberi
**Input:**
- Title: "Yapay Zeka Devrim Yaratıyor"
- Category: "Teknoloji"

**Generated Prompt:**
```
An ultra-realistic, dynamic, and emotionally resonant photograph capturing the essence of a news story.

Subject: "Yapay Zeka Devrim Yaratıyor"
Category: Teknoloji

Scene Description:
A sleek, modern environment with glowing data visualizations and innovative gadgets. People interacting with futuristic interfaces. Clean lines, blue and silver tones, a sense of progress and innovation. The scene is rich with authentic details, conveying a powerful narrative...
```

**Beklenen Görsel:** Modern ofis ortamında, parlayan ekranlar ve veri görselleştirmeleri ile çalışan insanlar. Mavi ve gümüş tonları, ilerleme ve inovasyonun hissi.

---

## Test Sonuçları

| Test | Sonuç |
|------|-------|
| TypeScript Derleme | ✅ Başarılı |
| Build | ✅ Başarılı |
| Lint | ✅ 0 hata |
| Git Push | ✅ Başarılı |

---

## Sonraki Adımlar (Öneriler)

1. **A/B Testing**: Eski ve yeni promptları karşılaştırma
2. **Kullanıcı Geri Bildirimi**: Üretilen görseller hakkında feedback toplama
3. **Fine-tuning**: Kategori stillerini kullanıcı geri bildirimine göre ayarlama
4. **Prompt Versiyonlama**: Farklı prompt varyasyonları test etme
5. **Görsel Kalite Metrikleri**: Üretilen görsellerin kalitesini ölçme

---

**Rapor Sonu**
