# 🌍 Her Yerden Geliştirme Rehberi

Projenizi evden, işten veya herhangi bir yerden geliştirmek için iki harika seçeneğiniz var.

## 🌟 SEÇENEK 1: Antigravity ile Tam Güç (Önerilen) 🤖
**"Ben evde de seninle (Yapay Zeka) çalışmak istiyorum"** diyorsanız bunu yapın.

### 1. Hazırlık (Evdeki Bilgisayarınıza)
1.  Mevcut kullandığınız bu editörü (Cursor) evdeki bilgisayarınıza indirin ve kurun.
2.  Hesabınızla giriş yapın.

### 2. Projeyi İndirme (Clone)
1.  Evdeki editörde terminali açın.
2.  Şu komutu yazarak projeyi indirin:
    ```bash
    git clone https://github.com/aktasbayram/borsatakip.git
    ```
3.  `borsatakip` klasörünü editörde açın.
    ```bash
    cd borsatakip
    code . (veya File > Open Folder)
    ```

### 3. Ayarlar
1.  Projeyi açtığınızda sol tarafta `.env` dosyası olmadığını göreceksiniz.
2.  Yeni bir `.env` dosyası oluşturun.
3.  Aşağıdaki ayarları (veya işteki bilgisayarınızdaki `.env` içeriğinin aynısını) içine yapıştırın:

```env
# Database (Neon Tech - Ortak Veritabanı)
DATABASE_URL="postgresql://neondb_owner:npg_7qla5koDHJdS@ep-mute-violet-agncy88j-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth
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

## 👁️ 4. Önizleme (Preview) ve Düzenleme Mantığı

Burası çok önemli! Değişiklikleri tarayıcıda değil, **editörde** yaparsınız.

1.  **Önizlemeyi Aç:** Terminale `npm run dev` yazın. Tarayıcıda siteniz açılır.
2.  **Kodu Değiştir:** Editörde (`page.tsx` vb.) bir yazıyı veya rengi değiştirip kaydedin.
3.  **Sonucu Gör:** Tarayıcıya baktığınızda değişikliğin **anında** yansıdığını görürsünüz.

Yani: **Editörde YAZ -> Tarayıcıda GÖR -> Beğenirsen GitHub'a GÖNDER.**

---

## ☁️ SEÇENEK 2: Bulut (Codespaces) - Acil Durumlar İçin
Eğer arkadaşınızın bilgisayarındaysanız veya kurulum yapmak istemiyorsanız:

1.  **github.com**'da projenize gidin.
2.  **<> Code > Codespaces** butonuna basarak tarayıcıda açın.
3.  Orada da terminale `npm run dev` yazınca sağ altta "Open in Browser" kutucuğu çıkar. Ona basarak önizleme yapabilirsiniz.

---

## 🔄 Çalışma Döngüsü (Kuralımız)

Nerede çalışırsanız çalışın, kuralımız şudur:

1.  **İşe Başlarken:** Önce güncel kodları çekin.
    👉 Komut: `git pull`

2.  **Geliştirme:** Kodunuzu yazın, `npm run dev` ile önizleyin.

3.  **İşi Bitirirken:** Yaptıklarınızı merkeze (GitHub) gönderin.
    👉 Komut: `git add .` -> `git commit -m "mesaj"` -> `git push`

Böylece evdeki ve işteki bilgisayarınız hep senkronize kalır.
