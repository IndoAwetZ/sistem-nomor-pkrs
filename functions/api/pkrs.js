// --- 1. FUNGSI UNTUK MEMBACA DATA (Tampil di Tabel Web) ---
export async function onRequestGet(context) {
  try {
    // Menambahkan kolom nomor_pkrs_final agar bisa ditampilkan di tabel
    const result = await context.env.DB.prepare(
        "SELECT id, timestamp, nama_peminta, tanggal_permintaan, jenis_cetak, judul_keperluan, email, nomor_pkrs_final FROM nomor_pkrs ORDER BY id DESC"
    ).all();
    
    return Response.json(result.results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// --- 2. FUNGSI PEMBANTU (Konversi Bulan Romawi) ---
function angkaKeRomawi(num) {
    const romawi = {X:10, IX:9, V:5, IV:4, I:1};
    let hasil = '';
    for (let i of Object.keys(romawi)) {
        let q = Math.floor(num / romawi[i]);
        num -= q * romawi[i];
        hasil += i.repeat(q);
    }
    return hasil;
}

// --- 3. FUNGSI UNTUK MENYIMPAN DATA BARU & GENERATE NOMOR ---
export async function onRequestPost(context) {
  try {
    // Menangkap data JSON yang dikirim dari form HTML
    const input = await context.request.json();
    
    // A. Cari ID terakhir di database untuk dijadikan nomor urut
    const cekIdTerakhir = await context.env.DB.prepare("SELECT MAX(id) as lastId FROM nomor_pkrs").first();
    const idTerakhir = cekIdTerakhir.lastId || 0; // Jika database kosong, mulai dari 0
    const nomorUrut = idTerakhir + 1;

    // B. Generate Nomor PKRS
    const tanggal = new Date();
    const bulan = angkaKeRomawi(tanggal.getMonth() + 1); 
    const tahun = tanggal.getFullYear(); 
    
    const nomorPKRSFinal = `TIM PKRS/RSASF/${nomorUrut}/${bulan}/${tahun}`;

    // C. Simpan semua data ke database D1
    const simpanData = await context.env.DB.prepare(
        "INSERT INTO nomor_pkrs (timestamp, nama_peminta, tanggal_permintaan, jenis_cetak, judul_keperluan, email, nomor_pkrs_final) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(
        new Date().toISOString(),
        input.nama_peminta,
        input.tanggal_permintaan,
        input.jenis_cetak,
        input.judul_keperluan,
        input.email,
        nomorPKRSFinal
    ).run();

    // -- TEMPAT UNTUK KODE KIRIM EMAIL (RESEND) NANTINYA --

    // D. Beri respon sukses ke Frontend
    return Response.json({ 
        sukses: true, 
        pesan: "Data berhasil disimpan!",
        nomor_pkrs: nomorPKRSFinal 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// --- 4. FUNGSI UNTUK MENGHAPUS DATA (Hanya untuk Admin) ---
export async function onRequestDelete(context) {
  try {
    // Menangkap ID dari URL (contoh URL: /api/pkrs?id=5)
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return Response.json({ error: "ID data tidak diberikan!" }, { status: 400 });
    }

    // Mengeksekusi perintah hapus di database D1
    await context.env.DB.prepare("DELETE FROM nomor_pkrs WHERE id = ?").bind(id).run();

    return Response.json({ 
        sukses: true, 
        pesan: `Data ID #${id} berhasil dihapus dari sistem.` 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}