# Panduan Desain & Standarisasi Visual (Design System Manual)
**Proyek:** TIM PKRS RSUASF (Pusat Manajemen Cetak & Desain)
**Versi:** 1.0 (2026)
**Tujuan:** Panduan dokumentasi visual untuk standardisasi antarmuka (UI/UX) pada ekosistem web internal dan panduan dasar untuk pengembangan aplikasi Mobile (Flutter) di masa mendatang.

---

## 1. Filosofi Desain
Sistem antarmuka ini mengusung gaya **Modern SaaS (Software as a Service)** yang memadukan kesan higienis khas instansi kesehatan (Rumah Sakit) dengan fungsionalitas aplikasi produktivitas. Desain difokuskan pada keterbacaan data (*data scannability*), navigasi yang intuitif, dan responsivitas yang mulus.

---

## 2. Palet Warna (Color Palette)
Menggunakan basis warna *Emerald* (Hijau) sebagai identitas utama RSUASF, dipadukan dengan latar belakang terang untuk mengurangi kelelahan mata admin.

| Kegunaan | Nama Warna | Kode Hex | Penerapan UI |
| :--- | :--- | :--- | :--- |
| **Warna Utama** | Primary Emerald | `#0d8a72` | Navbar, tombol utama, border aktif, ikon sukses. |
| **Warna Hover** | Dark Emerald | `#0a6b58` | Efek *hover* pada tombol utama, panel kiri login. |
| **Latar Belakang** | Mint Ice / Light BG | `#f7faf9` | Background dasar seluruh halaman web. |
| **Teks Utama** | Charcoal Black | `#1a202c` | Judul utama (`h1`), teks data tabel, isi input form. |
| **Teks Sekunder** | Muted Grey | `#718096` | Deskripsi, *placeholder*, teks tabel header. |
| **Warna Bahaya** | Crimson Red | `#e53e3e` | Tombol hapus, modal konfirmasi, teks error. |
| **Warna Hover Red** | Dark Crimson | `#c53030` | Efek *hover* pada tombol aksi bahaya (hapus). |
| **Aksen / Badge** | Mint Soft Tint | `#e6fffa` | Latar belakang lencana status "Selesai" / "Admin". |
| **Garis / Border** | Soft Slate | `#e2e8f0` | Garis batas tabel, input form, dan pembatas kartu. |

---

## 3. Tipografi (Typography)
*   **Font Utama:** `Inter` (Google Fonts), Fallback: `sans-serif`.
*   **Bobot Font (Font Weight):** 
    *   `400` (Regular): Deskripsi, isi tabel sekunder, teks biasa.
    *   `500` (Medium): Isi tabel utama, tombol navigasi, input form.
    *   `600` (Semi-Bold): Label form, teks tombol aksi, sub-judul.
    *   `700` (Bold): Judul form, header tabel, *username* peminta.
    *   `900` (Black): Angka pada *Dashboard Statistik*.

### Hirarki Ukuran Teks (Rem/Px):
*   **Judul Halaman (H1):** `1.8rem` (Desktop) / `1.5rem` (Mobile) - *Tracking tight*.
*   **Judul Dialog/Modal (H2):** `1.3rem`.
*   **Teks Dasar (Body):** `0.85rem` (Menjaga kepadatan data di layar).
*   **Teks Super Kecil (Badge/Info):** `0.75rem` / `10px` (Uppercase, Tracking wider).

---

## 4. Layout & Komponen Data (Data Presentation)
Untuk menjaga efisiensi pembacaan data antrean (CRUD), antarmuka menggunakan **pendekatan hibrida** berdasarkan ukuran layar:

1.  **Mode Desktop / PC (Layar Lebar):**
    *   Menggunakan komponen **Tabel Klasik** dengan lebar penuh (`min-w-full`).
    *   Tabel memiliki garis pembatas antar baris (`divide-y divide-[#e2e8f0]`).
    *   Baris tabel memiliki efek *hover* (`hover:bg-gray-50`) untuk melacak kursor.
2.  **Mode Mobile / Seluler (Layar Kecil):**
    *   Tabel dilebur menjadi komponen **Daftar Kartu (List Cards)**.
    *   Kartu memiliki padding `16px` (`p-4`) dengan border melengkung `14px`.
    *   Efek melayang statis: `shadow-[0_4px_15px_rgba(0,0,0,0.03)]`.
3.  **Kartu Statistik (Atas):**
    *   Memiliki garis tepi kiri tebal (`border-l-4`) yang mewakili warna status.

---

## 5. Sistem Status & Lencana (Badge System)
Setiap antrean cetak PKRS memiliki indikator warna yang konsisten di seluruh aplikasi:

*   🟡 **Menunggu:** Latar `bg-yellow-100`, Teks `text-yellow-800`.
*   🔵 **Diproses:** Latar `bg-blue-100`, Teks `text-blue-800`.
*   🟢 **Selesai:** Latar `#e6fffa` (Mint Soft), Teks `text-emerald-800`.

*Catatan: Badge menggunakan border transparan/tipis dengan padding `px-2 py-0.5` dan border-radius kecil.*

---

## 6. Desain Dialog Modal Kustom (Web Modals)
Menggantikan notifikasi bawaan browser (*alert/confirm*) agar selaras dengan estetika UI web.

*   **Overlay Latar Belakang:** Hitam transparan (`rgba(0,0,0,0.4)`) + Efek `backdrop-blur-sm` (opsional).
*   **Kotak Dialog Form:** Lebar maksimal `400px`, background `#ffffff`, radius sudut `14px`.
*   **Feedback Modal (Sukses/Error):** 
    *   Lebar maksimal `360px`, teks rata tengah.
    *   Memiliki animasi SVG *ring drawing* kustom di bagian atas.
*   **Animasi:** Menggunakan efek transisi meluncur lembut dari bawah dan *fade-in*.

---

## 7. Antarmuka Login (Split-Screen SaaS)
*   **Sisi Kiri (Branding):** Lebar 1.05fr, menggunakan latar belakang `var(--brand-bg)` dengan efek jaring gradien radial (*Mesh Gradient*) untuk kedalaman visual. Menampilkan kutipan/testimoni.
*   **Sisi Kanan (Form):** Putih bersih, padding luas (`48px`), input field dengan tinggi spesifik (`48px`) dan *border-radius* `14px`. Memiliki cincin fokus warna *Emerald* terang saat diketik.
*   **Perilaku Seluler:** Sisi kiri (branding) disembunyikan total (`display: none`), form login mengisi seluruh layar.

---

## 8. Interaksi & Animasi
*   **Preloader:** Halaman dipaksa memuat lapisan latar putih penuh dengan *spinner* *Emerald* (`45px`) berputar di tengah selama 0.5 detik untuk transisi yang elegan.
*   **Custom Scrollbar:** Lebar `8px`, track `#f7faf9`, thumb `#cbd5e1`, hover thumb `#0d8a72`.
*   **Tombol Push Effect:** Tombol *Submit* / *Login* akan sedikit mengecil saat diklik (`transform: scale(.985)`).