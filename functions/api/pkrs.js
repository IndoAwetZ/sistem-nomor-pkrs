export async function onRequest(context) {
  try {
    // 1. Memanggil database menggunakan nama binding 'DB' dan perintah .all()
    const result = await context.env.DB.prepare(
        "SELECT id, timestamp, nama_peminta, tanggal_permintaan, jenis_cetak, judul_keperluan, email FROM nomor_pkrs ORDER BY id DESC"
    ).all();
    
    // 2. result.results berisi array data dari database. Kita kembalikan sebagai JSON.
    return Response.json(result.results);

  } catch (error) {
    // 3. (Opsional) Menambahkan penangkap error agar mudah diperbaiki jika salah
    return Response.json({ error: error.message }, { status: 500 });
  }
}