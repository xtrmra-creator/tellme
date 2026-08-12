# tellme (WWtellme) - Küresel Tahmin Platformu

Distopik, kışkırtıcı ve "Dünya Ne Düşünüyor?" odaklı bir küresel oylama/tahmin platformu.

## 🌍 Özellikler

- **Çoklu Dil Desteği**: 7 farklı dilde (TR, EN, DE, FR, ES, IT, RU)
- **Adımsal Kullanıcı Deneyimi**: 
  1. Uyruk/Ülke Seçimi
  2. Tahmin & Tarih Girişi  
  3. Sonuç Gizleme ve Email Kapısı
- **Responsive Tasarım**: Mobil ve masaüstü için optimize edilmiş
- **Gerçek Zamanlı İstatistikler**: Küresel tahmin verileri
- **Supabase Backend**: Ölçeklenebilir veritabanı

## 🚀 Teknoloji Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Database**: PostgreSQL with Row Level Security

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı
- Vercel hesabı (deployment için)

### Yerel Geliştirme

1. **Repository'yi klonlayın**
```bash
git clone <repository-url>
cd tellme
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**
```bash
cp .env.local.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Supabase veritabanını kurun**
```bash
# Supabase CLI ile migration çalıştırın
supabase db push
```

5. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

## 🗄️ Veritabanı Şeması

### Predictions Tablosu
- `id`: UUID (Primary Key)
- `nationality`: Ülke kodu (TR, US, DE, vb.)
- `locale`: Dil kodu
- `predicted_date`: Tahmin edilen tarih
- `is_never`: "Hiç olmaz" seçeneği
- `bunker_id`: Otomatik oluşturulan bunker ID
- `role`: Kullanıcı rolü
- `threat_level`: Tehdit seviyesi
- `rarity`: Nadir seviye

### Emails Tablosu
- `id`: UUID (Primary Key)
- `email`: Email adresi
- `prediction_id`: İlişkili tahmin ID'si
- `nationality`: Ülke kodu
- `locale`: Dil kodu
- `is_verified`: Email doğrulama durumu

## 🌐 Deployment

### Vercel'e Deploy

1. **Vercel CLI kurulumu**
```bash
npm i -g vercel
```

2. **Vercel'e login**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

4. **Environment Variables ayarlayın**
Vercel dashboard'da aşağıdaki değişkenleri ekleyin:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Domain Ayarları

1. Vercel dashboard'da domain ekleyin
2. DNS ayarlarını güncelleyin:
   - A record: Vercel IP'si
   - CNAME record: vercel-dns.com

## 🎨 Bileşen Yapısı

### Ana Bileşenler
- `WTFDynamicApp`: Ana konu / tahmin akışı
- `LanguageGate`: Dil seçim ekranı
- `IntroSequence`: Giriş animasyonu
- `NationalitySelector`: Ülke seçim bileşeni
- `DatePredictionPicker`: Tarih tahmin bileşeni
- `BlurredResultsGate`: Email kapısı ile sonuç ekranı
- `ResponsiveStepper`: Adım gösterge bileşeni

### Yardımcı Bileşenler
- `BunkerCard`: Kullanıcı kartı
- `LiveStats`: Canlı istatistikler
- `ShareBar`: Paylaşım butonları

## 🔧 API Endpoints

### POST /api/predictions
Yeni tahmin oluşturur
```json
{
  "nationality": "TR",
  "locale": "tr", 
  "isNever": false,
  "date": "2025-12-31"
}
```

### GET /api/predictions
Tahmin istatistiklerini getirir

### POST /api/email
Email kaydı oluşturur
```json
{
  "email": "user@example.com",
  "predictionId": "uuid",
  "nationality": "TR",
  "locale": "tr"
}
```

## 🎯 Kullanıcı Akışı

1. **Dil Seçimi**: Kullanıcı tercih ettiği dili seçer
2. **Giriş Animasyonu**: Distopik intro sekansı
3. **Ülke Seçimi**: Kullanıcı uyruğunu belirler
4. **Tahmin Girişi**: Tarih seçer veya "hiç olmaz" der
5. **Email Kapısı**: Sonuçları görmek için email girer
6. **Sonuçlar**: Küresel istatistikler ve kişisel kart

## 🌍 Çoklu Dil Desteği

Desteklenen diller:
- 🇹🇷 Türkçe (tr)
- 🇺🇸 English (en)
- 🇩🇪 Deutsch (de)
- 🇫🇷 Français (fr)
- 🇪🇸 Español (es)
- 🇮🇹 Italiano (it)
- 🇷🇺 Русский (ru)

## 📱 Responsive Tasarım

- **Mobil**: Dikey stepper, kart tabanlı layout
- **Tablet**: Hibrit layout
- **Desktop**: Yatay stepper, grid layout

## 🔒 Güvenlik

- Row Level Security (RLS) politikaları
- IP adresi ve User-Agent takibi
- Email doğrulama sistemi
- Rate limiting (Vercel seviyesinde)

## 📊 Analytics & Monitoring

- Supabase Dashboard ile veritabanı monitoring
- Vercel Analytics ile performans takibi
- Real-time istatistikler

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Sorularınız için:
- GitHub Issues
- Email: support@wwtellme.com

---

**Not**: Bu platform eğlence amaçlıdır. Gerçek bir tahmin, tehdit veya tavsiye değildir.
