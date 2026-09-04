# Sunshine Bakım Günlüğü / Sunshine Care Log

> Yaşlı hastalar için ücretsiz, açık kaynaklı günlük bakım takibi aracı — aile bakıcıları için tasarlanmıştır.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-rose)](https://anwer3712.github.io/diet-log/)

---

## Bu nedir?

**Aile bakıcılarının** yaşlı hastaların günlük sağlık verilerini evde takip etmesine yardımcı olmak için tasarlanmış iki dilli (Geleneksel Çince 🇹🇼 / Endonezya 🇮🇩) bir web uygulaması — özellikle katı sıvı yönetimi gerektiren kronik hastalıkları olan hastalar (kalp yetmezliği, diyaliz, ameliyat sonrası iyileşme).

Kurulum gerekmez. Herhangi bir akıllı telefon tarayıcısında çalışır. Veriler Google Apps Script aracılığıyla Google Sheets ile senkronize edilir.

---

## Özellikler

- **Sıvı alımı takibi** — su, ilaç içecekleri, beslenme takviyesi, yemekler (günlük hedef ve ilerleme çubuğu ile)
- **Sıvı çıkış takibi** — idrar hacmi + rengi, bağırsak hareketleri durumu ile
- **Akıllı idrar hedefi algoritması** — su alımı hedefine dayalı beklenen idrar çıkışını otomatik olarak hesaplar, diüretik ilaçlar için ayarlanır (×1,1–1,5 aralığı) - ilaç yok (×0,4–0,6 aralığı)
- **Sıvı aşırı yüklemesi uyarısı** — toplam alım 1.200 cc'yi aştığında kırmızı uyarı
- **Egzersiz günlüğü** — şişe kaldırma, ayak basma, diz bükme, kalkmaya yardım (güvenlik protokolü kontrol listesi ile)
- **Kan basıncı ve kalp atış hızı** — sabah ve akşam ölçümleri ölçüm yönergeleri ile
- **Kabızlık uyarı sistemi** — son bağırsak hareketinden 60–72 saat arasında her 2 saatte bir otomatik olarak uyarı tetikler, gözetimsiz klysti kullanımını yasaklayan iki dilli güvenlik talimatları ile
- **İlaç durumu takibi** — diüretikler ve laksatifler, bulutta kalıcı
- **Zamana dayalı hatırlatma sistemi** — kan basıncı ölçümü, egzersiz yuvaları ve uyku öncesi idrar kontrolü için akıllı hatırlatmalar
- **Bulut sinkronizasyonu** — tüm veriler Google Sheets'te Google Apps Script aracılığıyla kaydedilir; çok bakıcılı aileleri destekler
- **İyimser arayüz** — kayıtlar sunucu yanıtını beklemeden anında görünür
- **Haftalık temizlik hatırlatıcıları** — ev hijyeni görevleri için yerleşik zamanlama

---

## Bu kimin için?

- Evde yaşlı anne-baba veya dedelerine bakanlık yapan aile üyeleri
- Çoklu rotasyonlu bakıcılarla aileler (özellikle dil bariyerleri arasında)
- Katı sıvı takibi gerektiren koşulları olan hastalar (kalp yetmezliği, diyaliz, ameliyat sonrası iyileşme)

---

## Teknoloji Yığını

| Katman | Teknoloji |
|-------|-----------|
| Ön uç | Vanilla HTML + JavaScript + Tailwind CSS |
| Arka uç | Google Apps Script (sunucusuz) |
| Veritabanı | Google Sheets |
| Barındırma | GitHub Pages (ücretsiz) |

Framework yok. Derleme araçları yok. Kurulacak bağımlılık yok. Herhangi bir tarayıcıda doğrudan açılır.

---

## Kurulum / Kendi Barındırma

1. Bu depoyu çatallayın
2. Kendi Google Apps Script arka uçunuzu dağıtın (`index.html` 'de `GAS_URL` 'ye bakın)
3. Veri depolaması için Google Sheet oluşturun
4. `index.html` 'de `GAS_URL` ve `SPREADSHEET_URL` sabitlerini güncelleyin
5. Çatalınızda GitHub Pages'i etkinleştirin → bitti

---

## Ekran Görüntüleri

| Günlük Takip | İki Dilli Rehberli Giriş | Trend Analizi |
|---|---|---|
| Günlük bakım günlüğü: ilerleme şeridi, sıvı alımı hedefi ilerleme çubuğu ile, su/ilaç/beslenme/yemek kategorileri seçimi | Rehberli giriş ekranı Geleneksel Çince ve Endonezya dilinde yan yana talimatlar numaralandırılmış adımlar ile gösterir | 7/14/30 günlük aralık seçici ve on beş seçilebilir çapraz değişken grafiklerle sağlık eğilimi analiz sayfası |
| İlerleme şeridi, sıvı hedefi ve kategori günlüğü | Her dize Geleneksel Çince ve Endonezya dilinde, adım adım | 15 çapraz değişken grafik (7/14/30 gün) |

*（Canlı demo: https://anwer3712.github.io/diet-log/ — 414×896 telefon görüntü alanında alınan ekran görüntüleri）*

---

## Motivasyon

Gereklilik nedeniyle oluşturuldu. Bir aile üyesinin katı sıvı yönetimi ile 24/7 ev bakımına ihtiyaç duyduğunda, mevcut uygulamalar çok karmaşık, yalnızca İngilizce veya aylık abonelik gerektiriyordu. Bu araç, bakıcıların uygulamaya değil hastaya odaklanabilmesi için basit, ücretsiz ve çok dilli bir çözüm sağlamayı amaçlamaktadır.

---

## Yol Haritası

Planlanan iyileştirmeler — her biri açık bir sorundur, topluluk girdisi hoşlanılır:

- [ ] [#15](https://github.com/anwer3712/diet-log/issues/15) **Yapay zeka destekli sağlık analizi** — Claude'u entegre edin, sıvı alımı, idrar çıkışı ve kan basıncı verilerinde anormal eğilimleri tespit etmek ve ham sayıları düz dille bakım rehberliğine çevirmek için
- [ ] [#16](https://github.com/anwer3712/diet-log/issues/16) **Yapay zeka bakıcı S&J** — bakıcıların kendi dillerinde soru sormasını sağlayın (örneğin "onun idrarı bugün koyuydu, endişelenmeli miyim?") hastanın gerçek kayıtlı verilerine dayalı
- [ ] [#17](https://github.com/anwer3712/diet-log/issues/17) **Ek dil çiftleri** — çok kültürlü bakım aileleri için İngilizce, Vietnamca, Tagalogca, Thaica
- [ ] [#18](https://github.com/anwer3712/diet-log/issues/18) **Çevrimdışı mod** — kararsız bağlantılar için hizmet işçisi önbelleği
- [ ] [#19](https://github.com/anwer3712/diet-log/issues/19) **Yazdırılabilir haftalık raporlar** — doktor ziyaretleri için tek sayfalık özetler
- [ ] [#20](https://github.com/anwer3712/diet-log/issues/20) **Çok hasta desteği** — birden fazla kişiyi takip eden aileler veya küçük bakım tesisleri için

---

## Katkı Sağlama

Pull request'ler hoşlanılır — nasıl yardımcı olabileceğiniz için [CONTRIBUTING.md](CONTRIBUTING.md) 'ye bakın (çeviri katkıları özellikle takdir edilir). Bu proje bir [Davranış Kuralları](CODE_OF_CONDUCT.md) tarafındandır.

Yaşlı bir aile üyesine bakıyorsanız ve bir özelliğe ihtiyaç duyuyorsanız — [sorun açın](https://github.com/anwer3712/diet-log/issues).

---

## Güvenlik

Bir güvenlik açığı buldunuz mu? Lütfen özel olarak bildirin — [SECURITY.md](SECURITY.md) 'ye bakın.
Herkese açık bir sorun açmayın ve bir raporda gerçek hasta verileri eklemeyin.

---

## Lisans

MIT © 2026 anwer3712
