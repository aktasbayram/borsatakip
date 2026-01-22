# Ofis ve Ev Arasında Çalışma Senkronizasyonu

Projenizi iki farklı ortamda (Ofis ve Ev) sorunsuz geliştirmek için aşağıdaki Git akışını takip edebilirsiniz.

## 1. Çalışmaya Başlamadan Önce (Evde veya Ofiste)
Bilgisayarın başına geçtiğinizde ilk yapmanız gereken şey, diğer tarafta yaptığınız değişiklikleri almaktır.

```bash
git pull
```
Bu komut, GitHub'daki en son değişiklikleri indirir ve yerel projenizle birleştirir.

## 2. Geliştirme Süreci
Kodlarınızı yazın, testlerinizi yapın.

## 3. Çalışmayı Bitirirken
Bilgisayar başından kalkmadan önce (veya ofisten çıkmadan önce), yaptıklarınızı GitHub'a göndermelisiniz.

```bash
# Değişiklikleri ekle
git add .

# Kaydet (Commit)
git commit -m "Bugün yapılanlar: X özelliği eklendi, Y hatası düzeltildi"

# Gönder (Push)
git push
```

## Önemli Notlar
- **Çatışma (Conflict) Olursa:** Eğer "git pull" yaptığınızda hata alırsanız, yereldeki dosyalarınızla gelen dosyalar çakışmış demektir. VS Code size çakışmaları gösterir; hangisini tutmak istediğinizi seçip tekrar commit atmanız gerekir.
- **Veritabanı:** Proje artık **Bulut Veritabanı** kullandığı için her yerde verileriniz ortaktır. Ekstra bir veritabanı kurulumu yapmanıza gerek yoktur.
