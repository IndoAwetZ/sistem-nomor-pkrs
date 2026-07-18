# Panduan Desain & Standarisasi Visual (Design System Manual)
**Proyek:** Canva Design Hub - RSU 'Aisyiyah Siti Fatimah
**Versi:** 1.0 (2026)
**Tujuan:** Panduan dokumentasi visual untuk standardisasi antarmuka (UI/UX) pada ekosistem web internal.

---

## 1. Palet Warna (Color Palette)

Sistem warna menggunakan tema higienis, profesional, dan menenangkan dengan basis warna hijau khas RSUASF.

| Kegunaan | Nama Warna | Kode Hex | Visual / Penerapan |
| :--- | :--- | :--- | :--- |
| **Warna Utama** | Primary Emerald | `#0d8a72` | Tombol utama, judul form, border aktif, ikon sukses |
| **Warna Hover** | Dark Emerald | `#0a6b58` | Efek *hover* pada tombol utama |
| **Latar Belakang** | Mint Ice / Light BG | `#f7faf9` | Background dasar halaman web |
| **Teks Utama** | Charcoal Black | `#1a202c` | Judul besar, teks penting, isi form |
| **Teks Sekunder** | Muted Grey | `#718096` | Deskripsi, teks penulis, ikon pembantu |
| **Warna Bahaya** | Crimson Red | `#e53e3e` | Tombol hapus, modal peringatan, ikon error |
| **Warna Hover Red** | Dark Crimson | `#c53030` | Efek *hover* pada tombol konfirmasi hapus |
| **Warna Badge** | Mint Soft Tint | `#e6fffa` | Latar belakang teks kategori |

---

## 2. Tipografi (Typography)

*   **Font Utama:** `Inter`, Sans-Serif (diambil dari Google Fonts).
*   **Bobot Font (Font Weight):** 
    *   `400` (Regular) untuk deskripsi dan teks biasa.
    *   `500` (Medium) untuk link navigasi dan input form.
    *   `600` (Semi-Bold) untuk label form, sub-judul, dan tombol.
    *   `700` (Bold) untuk judul utama (`h1`, `h2`).

### Hirarki Ukuran Teks:
*   **Judul Utama H1:** `1.8rem` (Halaman Utama / Desktop) & `1.5rem` (Mobile)
*   **Judul Form H2:** `1.3rem` / `1.4rem`
*   **Judul Kartu H3:** `0.9rem` (Semi-Bold)
*   **Teks Deskripsi / Body:** `0.85rem` - `0.95rem`
*   **Teks Penulis / Kecil:** `0.75rem` (Italic)

---

## 3. Komponen Kartu Konten (Content Card System)

Seluruh kartu grid harus memiliki ukuran yang **kaku dan seragam** untuk menjaga kerapian tata letak layout.

*   **Lebar Kartu:** `340px`
*   **Tinggi Kartu:** `320px` (Dikunci menggunakan `box-sizing: border-box`).
*   **Jarak Antar Kartu (Gap Grid):** `30px`
*   **Radius Sudut (Border Radius):** `14px`
*   **Shadow / Bayangan:** `0 4px 15px rgba(0,0,0,0.03)`
*   **Border:** `1px solid #e2e8f0` (Berubah menjadi `1px solid #0d8a72` saat kartu di-*hover*).
*   **Batasan Teks Judul:** Menggunakan CSS ellipsis (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`) agar teks panjang tidak merusak tinggi kartu.

---

## 4. Area Pratinjau Media (Canvas Preview Wrapper)

Komponen penampung embed gambar/video diletakkan tepat di tengah kartu.

*   **Tinggi Area:** `150px`
*   **Latar Belakang:** `#f1f5f9` (Abu-abu terang untuk efek kontras).
*   **Radius Sudut Media:** `6px` / `8px`
*   **Aturan Konten Internal:** 
    *   Elemen media di dalamnya dipaksa rata tengah secara vertikal dan horizontal (`display: flex; justify-content: center; align-items: center;`).
    *   Iframe internal dipaksa memiliki `max-height: 100%` dan `object-fit: contain` agar orientasi gambar (potret/lanskap) tidak terpotong.
    *   Tautan atau elemen jangkar luar tambahan bawaan pihak ketiga disembunyikan (`display: none !important`).

---

## 5. Komponen Aksi Responsif (Responsive Navigation & Buttons)

*   **Tombol Navigasi Admin Atas:** Menggunakan format lingkaran minimalis berdiameter `40px` dengan bayangan lembut `0 4px 10px rgba(13, 138, 114, 0.2)`. Hanya menampilkan ikon tanpa teks pada mode seluler guna mencegah tabrakan visual dengan logo instansi.
*   **Tombol Utama Bawah Kartu:** Lebar penuh (`width: 100%`), sudut melengkung `8px`, teks tebal dengan penataan otomatis ke dasar kartu menggunakan `margin-top: auto`.
*   **Tombol CRUD Cepat (Edit/Delete):** Berbentuk lingkaran kecil abu-abu (`#f1f5f9`) berdiameter `28px` yang tersusun rapi di sudut kanan atas kartu. Hanya muncul jika status otentikasi admin aktif.

---

## 6. Desain Dialog Modal Kustom (Web Modals & Preloader)

Menggantikan sistem notifikasi bawaan browser yang kaku agar selaras dengan estetika UI web.

*   **Overlay Latar Belakang:** Hitam transparan (`rgba(0,0,0,0.4)`) dengan efek transisi memudar (`transition: opacity 0.25s ease`).
*   **Kotak Dialog (Modal Box):** Putih bersih, lebar maksimal `400px` (responsif `90%` di HP), radius sudut `14px`, disertai efek meluncur lembut dari bawah saat aktif (`transform: translateY(0)`).
*   **Preloader Layar Penuh (Loading Screen):** Putih solid (`#ffffff`) dengan indeks posisi tertinggi (`z-index: 99999`). Menampilkan lingkaran animasi berputar (*spinner*) berukuran `45px` berwarna hijau utama di tengah layar yang langsung menghilang halus saat struktur DOM utama siap diakses.