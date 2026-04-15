# Gemma iPhone Voice Assistant

Bu proje, iPhone cihazlarında tamamen yerel (cihaz üzerinde) çalışan, Türkçe destekli bir yapay zeka sesli asistanıdır. WebLLM kütüphanesini kullanarak Gemma 2B modelini tarayıcı üzerinden doğrudan cihazın GPU'sunda çalıştırır.

## 🚀 Nasıl Kullanılır?

GitHub Pages üzerinden yayınlandığında şu adımları izleyin:

1.  **URL'yi Açın:** iPhone'unuzda **Safari** tarayıcısını açın ve projenin GitHub Pages bağlantısına gidin.
2.  **Ana Ekrana Ekleyin (PWA):**
    *   Safari'nin alt kısmındaki **"Paylaş"** (yukarı ok olan kare) simgesine dokunun.
    *   Listeyi aşağı kaydırın ve **"Ana Ekrana Ekle"** seçeneğini seçin.
    *   İsim verin ve sağ üstteki **"Ekle"** butonuna basın.
3.  **Uygulamayı Başlatın:** Artık ana ekranınızda bir uygulama simgesi göreceksiniz. Ona dokunarak uygulamayı sesli asistan modunda açın.
4.  **Modeli İndirin:**
    *   Uygulamayı ilk açtığınızda merkezdeki küreye veya **"Motoru Hazırla"** butonuna dokunun.
    *   Yaklaşık **1.5GB** boyutunda bir model dosyası indirilecektir (Bu bir kez yapılır ve tarayıcı önbelleğine kaydedilir).
5.  **Konuşmaya Başlayın:**
    *   İndirme tamamlandığında **"Konuşmaya Başla"** diyerek asistanla Türkçe sohbet edebilirsiniz.

## 🛠️ Teknik Gereksinimler

*   **iPhone 12 veya üzeri:** WebGPU desteği için daha yeni nesil bir iPhone önerilir (En iyi performans iPhone 15/16 Pro serisinde alınır).
*   **iOS 17.4+:** WebGPU ve modern PWA özellikleri için güncel iOS sürümü gereklidir.
*   **İnternet:** Sadece ilk seferde modelin indirilmesi için gereklidir. Model yüklendikten sonra asistan çevrimdışı çalışabilir.

## ✨ Özellikler

*   **Tam Gizlilik:** Konuşmalarınız hiçbir sunucuya gönderilmez, her şey cihazınızda gerçekleşir.
*   **Cam Tasarım (Glassmorphism):** Modern ve premium bir kullanıcı arayüzü.
*   **Sesli Geri Bildirim:** Native ses sentezi (TTS) ile sesli yanıtlar.
*   **Dinamik Animasyonlar:** Dinleme ve işlem sırasında yaşayan bir küre animasyonu.
