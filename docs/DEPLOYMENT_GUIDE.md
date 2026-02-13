# Borsa Takip Projesi İçin Dağıtım (Deployment) Rehberi

Bu proje, **Next.js (SSR)** ve sürekli çalışan bir **Arka Plan İşçisi (Worker)** kullandığı için standart bir web sitesinden farklı gereksinimlere sahiptir.

## 1. Hosting Seçimi: cPanel mi, VPS mi?

### ❌ Paylaşımlı Hosting (Standart cPanel) - ÖNERİLMEZ
Genellikle PHP tabanlı siteler (WordPress vb.) içindir. Bu projede **sorun yaşama ihtimaliniz çok yüksek**:
- **Worker Sorunu:** `alert-worker.ts` dosyasının 7/24 çalışması gerekir. Paylaşımlı sunucular, arka planda sürekli çalışan işlemleri (PM2 vb.) genellikle *otomatik olarak öldürür*. Fiyat alarmları çalışmayabilir.
- **Next.js Desteği:** Çoğu standart hostingde Node.js desteği sınırlıdır veya eski sürümlerdedir.
- **Port Erişimi:** Uygulamanız belirli bir portta (örneğin 3000) çalışır, paylaşımlı hostinglerde bu portlara erişim kısıtlıdır.

### ✅ Sanal Sunucu (VPS / VDS) - TAVSİYE EDİLEN 🚀
Bu proje için en sağlıklı yöntem bir **Linux Sunucu (Ubuntu 20.04 veya 22.04)** kiralamaktır.
- **Tam Kontrol:** Sunucuya (root) tam erişiminiz olur.
- **Kesintisiz Çalışma:** PM2 ile worker'ı kurup sonsuza kadar çalıştırabilirsiniz.
- **Performans:** Kaynaklar (CPU/RAM) sadece size aittir.

**Önerilen VPS Özellikleri:**
- **İşletim Sistemi:** Ubuntu 22.04 LTS
- **CPU:** 1 veya 2 Çekirdek
- **RAM:** Minimum 2GB (Build işlemi için önemli), 4GB daha iyi.
- **Disk:** 20GB+ SSD

**Örnek Sağlayıcılar:**
- DigitalOcean (Droplet)
- Hetzner Cloud (Fiyat/Performans çok iyidir)
- Vultr
- AWS Lightsail
- Yerli firmalardan "VDS / Sanal Sunucu" hizmeti (Ubuntu destekli)

## 2. Alan Adı (Domain) Alma
Domaini herhangi bir firmadan (GoDaddy, Namecheap, Google Domains, Natro, Turhost vb.) alabilirsiniz.
- Sadece **A Kaydı (A Record)** yönlendirmesi yapacaksınız.
- Domain panelinden, VPS sağlayıcınızın size vereceği **IP Adresi**ne yönlendirme yapmanız yeterlidir.

## 3. Kurulum Adımları (VPS İçin Özet)

Sunucuyu satın aldıktan sonra yapmanız gerekenler sırasıyla şunlardır:

1.  **Sunucuya Bağlan:** Terminal veya Putty ile SSH bağlantısı.
    ```bash
    ssh root@sunucu_ip_adresi
    ```
2.  **Node.js Kur:**
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```
3.  **Proje Dosyalarınızı Çekin:**
    ```bash
    git clone https://github.com/KULLANICI_ADI/REPO_ADI.git
    cd REPO_ADI
    npm install
    ```
4.  **Ortam Değişkenleri (.env):**
    - Yerel `.env` dosyanızdaki `DATABASE_URL` (NeonDB) ve diğer ayarları sunucuya kopyalayın.
5.  **Build Alın:**
    ```bash
    npm run build
    ```
6.  **PM2 ile Başlatın:**
    ```bash
    npm install -g pm2
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    ```
7.  **Domaini Bağlayın (Nginx Reverse Proxy):**
    - 3000 portunu dış dünyaya 80/443 (HTTP/HTTPS) portu üzerinden açmak için Nginx kurulur.
    - SSL sertifikası (HTTPS) için `certbot` kullanılır (Ücretsiz).

## Özet Tavsiye
Eğer teknik bilginiz sunucu yönetimi (Linux komutları) için yeterli değilse, cPanel destekli **"Managed VPS"** veya **"Cloud Panel"** (RunCloud, Ploi.io, CyberPanel gibi) hizmetler kullanabilirsiniz. Ancak en temiz ve sorunsuz yöntem, **saf bir Ubuntu sunucusu** kiralamaktır.

**cPanel'de Israrcıysanız:** "Node.js Selector" özelliği olan ve "Terminal/SSH" erişimi veren bir paket bulmalısınız. Ancak Worker process'in kapanmayacağının garantisi yoktur.
