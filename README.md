# 🚀 Web Shortlink Engine (100% Custom Ad Impression)

Aplikasi web shortlink & safelink mandiri dengan tampilan **Dark Mode** modern persis seperti dashboard shortlink profesional, tempat di mana 100% hasil iklan (Adsterra, Monetag, HilltopAds, PopAds, Google AdSense, dll.) masuk ke akun Anda sendiri tanpa potongan komisi!

---

## 📌 Fitur Utama

- 🎨 **Tampilan UI Modern Dark Slate** (Single URL & Bulk URL Generator).
- 🌐 **Domain Selector Dropdown** (Bisa mendaftarkan banyak domain/subdomain pilihan Anda seperti `cdn2.slicedrve.in`, `videy.at`, `aceimg.in`, atau domain pribadi).
- 💰 **Pengaturan Kode Iklan Langsung (Adsterra / Monetag)**: Pasang Banner 728x90, Banner 300x250, Popunder, Native Ads tanpa ubah kodingan.
- ⏱️ **Countdown Timer Safelink**: Mengunci video/file selama 5 detik (bisa diatur) sampai pengunjung melihat iklan Anda sebelum link terbuka.
- 📊 **Riwayat & Statistik Klik Link**: Menampilkan riwayat link yang telah di-shorten beserta jumlah kliknya.
- 📂 **Tanpa Database Rumit**: Menggunakan sistem JSON File DB internal yang ringan dan siap jalan tanpa perlu install MySQL/MongoDB.

---

## 🏃 Cara Menjalankan di Lokal / Server

1. **Masuk ke folder `web-shortlink`**:
   ```bash
   cd web-shortlink
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Jalankan Aplikasi**:
   ```bash
   npm start
   ```

4. Buka browser dan kunjungi:
   👉 **`http://localhost:4000`**

---

## ⚙️ Cara Memasang Kode Iklan Anda Sendiri

1. Kunjungi dashboard di `http://localhost:4000`.
2. Klik tombol **`Setting Kode Iklan`** di pojok kanan atas.
3. Tempelkan script iklan milik Anda dari Adsterra / Monetag / provider iklan lainnya.
4. Klik **Simpan Setting Iklan**.
5. Setiap pengunjung yang membuka shortlink Anda akan melihat iklan milik Anda sendiri!
