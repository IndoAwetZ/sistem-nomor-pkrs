# 📋 Master Plan Pengembangan Sistem TIM PKRS RSUASF

Dokumen ini berisi peta jalan (*roadmap*) dan target pengembangan fitur untuk meningkatkan aplikasi internal TIM PKRS menjadi sistem manajemen (*SaaS/White-Label*) yang dinamis, aman, dan dapat disesuaikan untuk berbagai kebutuhan instansi.

## 🚀 Status Implementasi Fitur

- [x] **1. Manajemen Akun Multi-Admin**
  - [x] Sistem penambahan admin baru (hanya dapat diakses oleh Super Admin).
  - [x] Otomatisasi pengiriman *password* acak sementara via *email* menggunakan Resend API.
  - [x] Kewajiban ganti *password* pada *login* pertama (status *Pending* $\rightarrow$ *Aktif*).
  - [x] Pencabutan hak akses (hapus akun) terintegrasi dengan database Cloudflare D1.
  - [x] Pengamanan berlapis dengan *hashing* SHA-256.

- [ ] **2. Pengaturan Identitas RS & Format Nomor**
  - [x] Pembuatan tabel `settings` terpusat di database D1.
  - [ ] Antarmuka Super Admin untuk mengubah Nama instansi (misal: "SIMRS RSUD Kota").
  - [ ] Kustomisasi format *prefix* nomor antrean/dokumen (misal: `CETAK-RSX/01/VII/2026`).
  - [ ] Pembaruan teks dinamis pada *navbar* dan format cetak dokumen/struk.

- [ ] **3. Kustomisasi Template Email (Resend API)**
  - [ ] Form *textarea* pada pengaturan untuk mengustomisasi isi pesan *email* notifikasi.
  - [ ] Fleksibilitas merangkai sapaan, instruksi pengambilan barang, dan catatan kaki secara dinamis.

- [ ] **4. Laporan & Rekapitulasi Data**
  - [ ] *Dashboard* khusus untuk memantau statistik permintaan.
  - [ ] Implementasi grafik visual yang ringan (misal menggunakan Chart.js).
  - [ ] Rekapitulasi data bulanan/tahunan (jumlah cetakan, filter berdasarkan departemen peminta).

- [ ] **5. Restrukturisasi Arsitektur Backend**
  - [ ] Pemisahan fungsi-fungsi API ke dalam modul (*file*) independen agar tidak menumpuk dalam satu skrip.
  - [ ] Standardisasi format *response* JSON API.
  - [ ] Optimasi *query* dan penanganan *error* pada *database* Cloudflare D1.

- [ ] **6. Penyempurnaan UI/UX Akses**
  - [ ] Optimasi komponen interaktif (seperti *pop-up dialog* dan *dropdown*) tanpa membebani memori peramban.
  - [ ] Peningkatan konsistensi desain menggunakan Tailwind CSS.
  - [ ] Penyederhanaan alur navigasi agar operasional harian semakin cepat.

---
*Dokumen ini akan diperbarui secara berkala seiring dengan berjalannya proses pengembangan (development).*