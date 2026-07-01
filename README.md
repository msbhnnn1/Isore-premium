# 🍎 iStore Premium - Platform Jual Beli iPhone

Platform e-commerce modern untuk menjual iPhone dengan fitur lengkap untuk user dan admin yang sepenuhnya terpisah.

## ✨ Fitur Utama

### 👥 User Storefront
- 📱 **Katalog Produk Lengkap** - iPhone seri 11-17 dengan detail lengkap
- 🔍 **Filter & Search** - Cari berdasarkan seri, storage, kategori, harga
- 💬 **Live Chat** - Tanya langsung dengan admin via web
- 📲 **WhatsApp Integration** - Chat langsung di WhatsApp
- 💳 **Pembayaran Bank** - Tampilan rekening admin yang dapat disalin
- 📱 **Fully Responsive** - Sempurna di mobile, tablet, desktop
- 🌙 **Dark Mode** - Design elegan dengan tema gelap

### 👨‍💼 Admin Dashboard
- 🔐 **Secure Login** - PIN 4 digit untuk keamanan
- 📊 **Real-time Dashboard** - Statistik penjualan, stok, pesan
- 🛍️ **Product Management**
  - Tambah/edit/hapus produk
  - Upload multiple foto produk
  - Atur harga, stok, battery health, kategori
  - Set produk unggulan/featured
- 💬 **Chat Management** - Lihat dan balas pesan pelanggan
- 💰 **Transaction Tracking** - Catat semua transaksi penjualan
- 📈 **Analytics** - Laporan penjualan, produk terlaris, profit
- ⚙️ **Settings**
  - Edit nama toko, deskripsi, alamat
  - Kelola rekening bank
  - Sosial media links
  - Ubah PIN admin

## 🛠️ Tech Stack

- **HTML5** - Struktur markup
- **CSS3** - Styling responsive dengan custom design system
- **Vanilla JavaScript** - Semua logic tanpa framework
- **JSON** - Data storage lokal di localStorage

## 📂 Struktur Project

```
iphone-store/
├── index.html                 # User storefront
├── admin/
│   └── index.html            # Admin dashboard
├── assets/
│   ├── css/
│   │   ├── global.css        # Design system & global styles
│   │   ├── user.css          # User page styles
│   │   └── admin.css         # Admin panel styles
│   ├── js/
│   │   ├── core.js           # Shared utilities, storage, toast
│   │   ├── user.js           # User page logic
│   │   └── admin.js          # Admin panel logic
├── data/
│   └── store.json            # Default data (backup)
└── README.md
```

## 🚀 Quick Start

### Local Development
1. Clone/download project ke folder lokal
2. Buka `index.html` di browser untuk user storefront
3. Buka `admin/index.html` untuk login admin (PIN: 1234)
4. Semua data otomatis tersimpan di localStorage browser

### Data Persistence
- Semua data (produk, chat, transaksi, settings) tersimpan otomatis
- Data tidak hilang ketika menutup browser
- Tekan F12 → Application → Local Storage untuk melihat data

## 📱 User Storefront Features

### Navigation
- Header dengan logo, menu, tombol WhatsApp
- Mobile hamburger menu
- Sidebar cart (untuk pengembangan selanjutnya)

### Product Showcase
- Hero section dengan tagline toko
- Grid produk dengan filter/search real-time
- Detail modal dengan galeri foto multi-image
- Quick action: Chat atau WhatsApp langsung

### Communication
- Live chat web dengan auto-reply
- WhatsApp direct message button
- Nomor admin bisa dikonfigurasi

### Payment Info
- Tampilan rekening bank dengan copy-paste
- Langkah-langkah pembayaran
- Method pembayaran bisa ditambah di admin

## 👨‍💼 Admin Dashboard Features

### Dashboard
- Stats cards: total produk, terjual, pendapatan, stok rendah
- List stok rendah, pesan terbaru, produk unggulan
- Recent transactions

### Product Management
- Tabel semua produk dengan foto, harga, stok
- Tambah produk baru dengan foto multiple (JPG/PNG)
- Edit produk: ubah semua detail, harga, stok, battery health
- Delete produk
- Search & filter berdasarkan seri/status
- Auto upload foto dengan preview

**Input Fields Product:**
- Seri iPhone (11-17) & tipe (iPhone 15 Pro Max, dll)
- Storage internal (64GB - 1TB)
- Warna
- Kategori: iBox / Inter Beacukai / Refurbish
- Battery Health (%)
- Harga & harga coret (diskon)
- Stok & unit terjual
- Deskripsi detail
- Multiple foto produk
- Status tampil (aktif/non-aktif)
- Produk unggulan (featured)

### Chat Management
- List sesi chat dari pelanggan
- Real-time conversation view
- Reply langsung dari admin
- Mark as read
- Notifikasi pesan baru

### Transactions
- Catat transaksi penjualan
- Edit/delete transaksi
- Filter by status (Lunas, DP, Pending, Batal)
- Track pembayaran

### Analytics
- Total transaksi & average order
- Estimated profit
- Penjualan per kategori (chart)
- Top 5 produk terlaris
- Stock summary & battery health average
- Visitor count

### Settings
- **Store Info**: Nama, deskripsi, alamat, hero tagline
- **Contact**: WhatsApp, Instagram, TikTok, Facebook
- **Bank Accounts**: Kelola multiple rekening (bank, nomor, nama)
- **Security**: Ubah PIN admin (4 digit)
- **Danger Zone**: Reset semua data (tidak bisa dibatalkan)

## 🔐 Security

- PIN 4 digit untuk login admin (default: 1234)
- Session storage untuk keep-alive session
- Data tersimpan lokal (tidak ke server)
- PIN bisa diubah di settings

## 📊 Data Structure

### Product Schema
```javascript
{
  id: "p_xxx",
  type: "iPhone 15 Pro Max",
  series: "15",
  internal: "256GB",
  color: "Natural Titanium",
  category: "iBox", // iBox | Inter Beacukai | Refurbish
  batteryHealth: 100,
  price: 22500000,
  priceOld: 24000000, // optional
  stock: 3,
  sold: 12,
  description: "...",
  featured: true,
  active: true,
  photos: [{data: "base64..."}, ...],
  createdAt: "ISO string",
  updatedAt: "ISO string"
}
```

### Chat Schema
```javascript
{
  id: "msg_xxx",
  sessionId: "chat_xxx",
  sender: "user|admin",
  message: "...",
  timestamp: "ISO string",
  read: false
}
```

### Transaction Schema
```javascript
{
  id: "tx_xxx",
  product: "iPhone 15 Pro",
  buyer: "Nama Pembeli",
  phone: "08xx...",
  price: 22500000,
  method: "Transfer|Cash|COD",
  status: "Lunas|DP|Pending|Batal",
  notes: "...",
  date: "ISO string"
}
```

## 🎨 Design System

Warna utama:
- **Primary**: Gold (#c9a84c) dengan gradient
- **Dark BG**: #0a0a0f (primary), #111118 (secondary)
- **Text**: #f0f0f5 (primary), #9090a8 (secondary)
- **Status**: Green (success), Red (danger), Yellow (warning), Blue (info)

Radius:
- `--radius-sm`: 8px
- `--radius-md`: 14px
- `--radius-lg`: 20px
- `--radius-xl`: 28px
- `--radius-full`: 9999px

## 💾 Export Data

Data otomatis disimpan di localStorage. Untuk backup:
1. Buka DevTools (F12)
2. Go to Application → Local Storage
3. Cari `istore_data`
4. Copy value dan save ke file .json

Untuk restore:
1. Paste data ke localStorage key `istore_data`
2. Refresh page

## 🚀 Deployment

### GitHub
```bash
# Initialize git
git init

# Add remote
git remote add origin https://github.com/username/iphone-store.git

# Commit & push
git add .
git commit -m "Initial commit: iStore Premium"
git push -u origin main
```

### Vercel (Recommended)
1. Push project ke GitHub
2. Buka https://vercel.com
3. Klik "New Project"
4. Select GitHub repository
5. Klik Deploy
6. Beres! Site live di `https://yourname.vercel.app`

**Note**: localStorage data akan unique per browser/device. Untuk production, consider database backend.

## 📝 Customization

### Edit Store Name
Admin Panel → Settings → Informasi Toko → Ubah "Nama Toko"

### Change Admin PIN
Admin Panel → Settings → Keamanan → Ubah PIN (min 4 digit)

### Add Products
Admin Panel → Produk → Tambah Produk → Isi form

### Manage Banks
Admin Panel → Settings → Rekening Bank → Tambah/Hapus

### Social Media
Admin Panel → Settings → Kontak & Sosial Media → Edit link

## 🐛 Troubleshooting

**Data hilang saat refresh?**
- Cek localStorage di DevTools → Application
- Pastikan tidak ada private browsing
- Clear cache dan cookies

**Foto tidak muncul?**
- Pastikan ukuran < 3MB per foto
- Format JPG/PNG
- Reload halaman

**Login admin stuck?**
- Clear localStorage: 
  ```javascript
  localStorage.clear()
  sessionStorage.clear()
  ```
- Refresh halaman

**WhatsApp link tidak bekerja?**
- Pastikan nomor WhatsApp benar (dengan kode negara 62)
- Format: 6281234567890

## 📱 Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

## 🎯 Fitur Bonus yang Bisa Ditambah

- [ ] Database backend (Firebase, MongoDB)
- [ ] Authentication sistem user
- [ ] Wishlist/Favorit produk
- [ ] Review & rating dari pembeli
- [ ] Email notification
- [ ] SMS notification
- [ ] Payment gateway integration
- [ ] Invoice PDF generator
- [ ] QR Code untuk share produk
- [ ] Analytics export to Excel
- [ ] Multi-bahasa (ID/EN)

## 📄 License

Open source - bebas digunakan dan dimodifikasi.

## 👤 Support

Untuk pertanyaan atau saran, hubungi admin via WhatsApp link di toko.

---

**Made with ❤️ for iPhone sellers in Indonesia**
