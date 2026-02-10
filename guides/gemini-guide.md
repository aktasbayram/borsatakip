# 🤖 Gemini AI Çözüm ve Bakım Rehberi

Bu rehber, sitedeki AI Blog Jeneratörü ve AI Analiz özelliklerinde yaşanabilecek olası sorunları hızlıca çözmeniz için hazırlanmıştır.

---

## 🧭 Hızlı Sorun Giderme Adımları (Eğer AI Çalışmıyorsa)

Eğer bir hata alıyorsanız, sırasıyla şu adımları izleyin:

1. **Terminali Yeniden Başlatın**: `npm run dev` çalışan siyah ekranı kapatıp tekrar açın. Çoğu zaman ayarların güncellenmesi için bu gereklidir.
2. **API Anahtarını Kontrol Edin**: `.env` dosyasındaki `GEMINI_API_KEY` değerinin güncel olduğundan emin olun.
3. **Veritabanındaki "Gizli" Anahtarı Silin**: Eğer `.env` dosyasını güncellediğiniz halde hala "geçersiz key" hatası alıyorsanız, veritabanında eski bir anahtar kalmış olabilir. (Aşağıdaki detaylara bakın).

---

## 🔑 1. API Anahtarı Yönetimi

### Yeni Anahtar Alma
- **Google AI Studio**'ya gidin: [aistudio.google.com](https://aistudio.google.com/app/apikey)
- Mevcut anahtarınızı kontrol edin veya "Create API key in new project" diyerek yeni bir tane oluşturun.

### API'yi Etkinleştirme
- Google Cloud Console'da **"Generative Language API"** servisinin **ETKİN (Enabled)** olması gerekir. Aksi takdirde "API not enabled" hatası alırsınız.

---

## 💾 2. Kritik: Veritabanı Ayarları (ConfigService)

Bu sistem, ayarları önce veritabanındaki `SystemSetting` tablosundan okur, orada bulamazsa `.env` dosyasına bakar.

> [!IMPORTANT]
> **Eğer veritabanında `GEMINI_API_KEY` isimli bir kayıt varsa, `.env` dosyasındaki key ne olursa olsun geçersiz sayılır.** 

**Çözüm:** Admin panelinde "Ayarlar" veya doğrudan veritabanı üzerinden `SystemSetting` tablosundaki `GEMINI_API_KEY` kaydını silin. Bu sayede sistem otomatik olarak `.env` içindeki anahtara geri döner.

---

## 🤖 3. Model Güncelleme (Geleceğe Hazırlık)

Yapay zeka modelleri sürekli güncellenir. Eğer model adı değişirse (örneğin Gemini 3.0 çıkarsa):

1. `src/services/ai/gemini.ts` dosyasına gidin.
2. `gemini-2.5-flash` yazan yerleri yeni model adıyla değiştirin.
3. Kaydedin ve sunucuyu yeniden başlatın.

---

## 🛠️ 4. Teknik Destek Kontrol Listesi (Hata Kodları)

- **401 Unauthorized**: API Key yanlış veya kopyalanırken eksik yapıştırılmış.
- **403 Forbidden**: API anahtarı kısıtlanmış veya ülkenizde henüz erişime açılmamış.
- **404 Not Found**: Model adı yanlış yazılmış (Örn: `gemini-1.5` yerine `gemini-2.5` gerekebilir).
- **429 Too Many Requests**: Ücretsiz kota dolmuş. 1-2 dakika bekleyip tekrar deneyin.

---

*Bu dosya projenizin kök dizininde `guides/gemini-guide.md` olarak saklanmaktadır.*
