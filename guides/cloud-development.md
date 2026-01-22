# ☁️ Bulut Geliştirme Ortamı Kurulum Rehberi (GitHub Codespaces)

Bu proje, herhangi bir bilgisayara (ev, iş, internet kafe) veya kuruluma ihtiyaç duymadan **GitHub Codespaces** üzerinden geliştirilmeye tamamen uygundur.

## 1. Hazırlık: Neden Hazırız?
Projeniz şu özelliklere sahip olduğu için buluta geçiş sadece 1 dakikanızı alacak:
*   ✅ **Kodlar GitHub'da:** Son sürüm kodlarınız bulutta.
*   ✅ **Veritabanı Bulutta:** Veritabanınız Neon Tech (PostgreSQL) üzerinde çalıştığı için yerel bilgisayara bağlı değil.

## 2. GitHub Codespaces Nasıl Açılır?

1.  Projenizin GitHub sayfasına gidin (GitHub hesabınızla giriş yapın).
2.  Yeşil **<> Code** butonuna tıklayın.
3.  Üstteki sekmelerden **Codespaces**'i seçin.
4.  **Create codespace on main** butonuna basın.

🎉 Tebrikler! Tarayıcınızda (Chrome, Edge, Safari vb.) VS Code açılacak. Bu, evdeki bilgisayarınızdaki VS Code ile neredeyse aynıdır.

## 3. İlk Kurulum Ayarları (Sadece bir kez)

Codespace açıldığında sol taraftaki dosya gezgininde `.env` dosyasının olmadığını göreceksiniz (çünkü güvenlik gereği Git'e yüklenmedi).

1.  Codespace içinde sol taraftaki dosya gezginine sağ tıklayıp **New File** deyin.
2.  Adını `.env` koyun.
3.  Aşağıdaki bilgileri (kendi bilgisayarınızdaki `.env` dosyanızdan) kopyalayıp buraya yapıştırın:

```env
# Database (Neon Tech - Aynen kullanın)
DATABASE_URL="postgresql://neondb_owner:npg_7qla5koDHJdS@ep-mute-violet-agncy88j-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth (Codespace için URL ayarı otomatiktir ama bunu ekleyin)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change_me_in_production_random_string_123"
AUTH_SECRET="change_me_in_production_random_string_123"
AUTH_TRUST_HOST=true

# Market Data
FINNHUB_API_KEY="d5ka6kpr01qjaedu0oo0d5ka6kpr01qjaedu0oog"

# KAP API
KAP_API_URL="https://apigwdev.mkk.com.tr/api/vyk"
KAP_API_USERNAME="aktasbayram19@gmail.com"
KAP_API_PASSWORD="Byrm*/1934"

# AI
GEMINI_API_KEY="AIzaSyDpK5mWRXMDVRWdmO7yfxoC_283Bq_eziw"
```

## 4. Projeyi Çalıştırma

Codespace terminalinde (Ctrl+` ile açılır) sırasıyla şunları yapın:

1.  Paketleri yükleyin:
    ```bash
    npm install
    ```
2.  Veritabanını eşitleyin:
    ```bash
    npx prisma generate
    ```
3.  Uygulamayı başlatın:
    ```bash
    npm run dev
    ```

Sağ altta "Open in Browser" butonu çıkacak. Tıkladığınızda siteniz yeni sekmede açılacak!

## 5. İpucu: Kalıcı Env Ayarı (Opsiyonel)

Her yeni Codespace açtığınızda `.env` oluşturmak istemiyorsanız:
1.  GitHub Repo > **Settings** > **Secrets and variables** > **Codespaces** menüsüne gidin.
2.  **New repository secret** butonuna basın.
3.  `GEMINI_API_KEY`, `DATABASE_URL` vb. değişkenleri buraya ekleyin.
4.  Artık Codespace açtığınızda bu değişkenler otomatik yüklü gelecek.

## Sık Sorulan Sorular

*   **Tabletten kod yazabilir miyim?** Evet, iPad veya Android tablet tarayıcısından girebilirsiniz.
*   **İnternet koparsa ne olur?** Kodlarınız otomatik kaydedilir, tekrar bağlandığınızda kaldığınız yerden devam edersiniz.
*   **Ücretli mi?** GitHub kişisel kullanıcılar için aylık 60 saat ücretsiz Codespace kullanımı sunar. Bu çoğu hobi projesi için yeterlidir.
