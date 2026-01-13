# Geliştirilmiş Görsel Üretim Promptu ve Stil Rehberi

**Tarih:** 13 Ocak 2026  
**Geliştirici:** AI Agent  
**Konu:** v2 Görsel Üretim Promptu Tasarımı

---

## 1. Mevcut Prompt Analizi

**Mevcut Prompt:**
```
A high-quality, professional news article header image.
Topic: {{title}}
Category: {{category}}
Style: {{style}}, photorealistic, editorial quality, 16:9 aspect ratio, no text overlay, suitable for news website.
The image should be visually appealing and relevant to the topic without showing any specific people's faces.
```

**Eksiklikler:**
- Çok genel ve basit
- Yaratıcılığı sınırlıyor
- İnsan yüzlerini yasaklıyor
- Teknik detaylar yetersiz
- Negatif prompt içermiyor

---

## 2. Yeni Prompt Tasarımı (v2)

**Amaç:** Daha sanatsal, dinamik, özgün ve teknik olarak üstün görseller üretmek. İnsan yüzlerine izin vermek.

**Yeni Prompt Şablonu:**
```
An ultra-realistic, dynamic, and emotionally resonant photograph capturing the essence of a news story.

**Subject:** "{{title}}"
**Category:** {{category}}

**Scene Description:**
{{style}}. The scene is rich with authentic details, conveying a powerful narrative. If people are present, their expressions and actions are natural and meaningful, reflecting the core of the news story. The environment is highly detailed and contextually appropriate.

**Composition & Framing:**
Masterful composition, using the rule of thirds. A compelling medium shot or a wide shot that establishes the scene. The main subject is in sharp focus, with a natural depth of field that draws the viewer's eye.

**Lighting:**
Dramatic and natural lighting that enhances the mood. Could be the soft glow of golden hour, the crisp light of a modern office, or the dynamic lighting of a live event. Avoid flat or artificial lighting.

**Atmosphere & Mood:**
The image should evoke a specific emotion relevant to the story: urgency, hope, innovation, tension, or contemplation. The overall tone is professional, suitable for a leading news publication.

**Technical Details:**
Shot on a Sony a7R V with a G Master lens (e.g., 50mm f/1.2 or 24-70mm f/2.8). 16:9 aspect ratio. Hyper-detailed, sharp, and clear.

**Negative Prompt:**
--no text, no logos, no watermarks, blurry, oversaturated, ugly, deformed, disfigured, poor details, bad hands, extra limbs, extra fingers.
```

---

## 3. Geliştirilmiş Kategori Stil Rehberi

**Amaç:** Her kategori için daha belirgin ve çeşitli görsel stiller tanımlamak.

**Yeni Stil Rehberi:**
```javascript
{
  'Teknoloji': 'A sleek, modern environment with glowing data visualizations and innovative gadgets. People interacting with futuristic interfaces. Clean lines, blue and silver tones, a sense of progress and innovation.',
  'Ekonomi': 'A bustling stock exchange floor with blurred screens in the background, or a sharp, professional corporate meeting. Focus on charts, financial data, and business professionals in action. Mood can be tense or optimistic.',
  'Spor': 'A high-energy, dynamic action shot of athletes in motion. Dramatic lighting, motion blur, and a focus on the intensity of the competition. The crowd is a blurred, energetic backdrop.',
  'Sağlık': 'A clean, bright, and modern medical laboratory or a serene wellness scene. Focus on scientific research, healthy lifestyles, or compassionate healthcare professionals. Colors are typically white, green, and blue.',
  'Bilim': 'A sense of discovery and wonder. Could be a researcher in a high-tech lab, a stunning view of a nebula from a telescope, or a microscopic image. Lighting is often dramatic and focused.',
  'Dünya': 'A powerful and culturally rich photograph representing a global event. Could be a cityscape, a natural landscape, or a portrait of a person that tells a story. Authentic and journalistic in style.',
  'Kültür-Sanat': 'Vibrant, creative, and expressive. An artist in their studio, a dramatic scene from a theater performance, or a colorful abstract representation of a cultural theme. Rich textures and bold colors.',
  'Gündem': 'A classic, impactful journalistic photo. Captures a key moment of a current event. Often features people and conveys a sense of immediacy and importance. Black and white can be used for dramatic effect.',
}
```

---

## 4. Uygulama Planı

1. `lib/prompts.ts` dosyasındaki `DEFAULT_PROMPTS.IMAGE.template` alanını yeni prompt ile güncelle.
2. `lib/prompts.ts` dosyasındaki `CATEGORY_IMAGE_STYLES` nesnesini yeni stil rehberi ile güncelle.
3. `lib/imagen.ts` dosyasındaki `generateArticleImage` fonksiyonundan `personGeneration: PersonGeneration.DONT_ALLOW` satırını kaldır.
4. Değişiklikleri test et ve GitHub'a gönder.
