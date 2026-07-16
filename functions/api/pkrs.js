// --- 1. FUNGSI UNTUK MEMBACA DATA (Tampil di Tabel Web) ---
export async function onRequestGet(context) {
  try {
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
    const input = await context.request.json();
    
    const cekIdTerakhir = await context.env.DB.prepare("SELECT MAX(id) as lastId FROM nomor_pkrs").first();
    const idTerakhir = cekIdTerakhir.lastId || 0; 
    const nomorUrut = idTerakhir + 1;

    const tanggal = new Date();
    const bulan = angkaKeRomawi(tanggal.getMonth() + 1); 
    const tahun = tanggal.getFullYear(); 
    
    const nomorPKRSFinal = `TIM PKRS/RSASF/${nomorUrut}/${bulan}/${tahun}`;

    await context.env.DB.prepare(
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

      const desainEmail = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #2563eb;">Permintaan PKRS Berhasil Diproses!</h2>
              <p>Halo, <strong>${input.nama_peminta}</strong>,</p>
              <p>Terima kasih. Permintaan cetak <strong>${input.jenis_cetak}</strong> untuk <strong>"${input.judul_keperluan}"</strong> telah kami catat di sistem.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #4b5563; text-transform: uppercase;">Nomor PKRS Anda:</p>
                  <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #1e3a8a;">${nomorPKRSFinal}</p>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Email ini dikirim otomatis oleh Sistem PKRS Hub.</p>
          </div>
      `;

      // Eksekusi Resend (Dengan Pelacak Error)
      const kirimEmail = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              from: "TIM PKRS <no-reply@hnm.my.id>", 
              to: [input.email],
              subject: `[PKRS Hub] Nomor Anda Telah Terbit - ${nomorPKRSFinal}`,
              html: desainEmail
          })
      });

      // Mencegah Silent Failure!
      if (!kirimEmail.ok) {
          const responError = await kirimEmail.json();
          throw new Error("Ditolak Resend: " + JSON.stringify(responError));
      }

    return Response.json({ 
        sukses: true, 
        pesan: "Data berhasil disimpan!",
        nomor_pkrs: nomorPKRSFinal 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// --- 4. FUNGSI UNTUK MENGHAPUS DATA ---
export async function onRequestDelete(context) {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");

    if (!id) return Response.json({ error: "ID data tidak diberikan!" }, { status: 400 });

    await context.env.DB.prepare("DELETE FROM nomor_pkrs WHERE id = ?").bind(id).run();

    return Response.json({ sukses: true, pesan: `Data ID #${id} berhasil dihapus.` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// --- 5. FUNGSI UNTUK MENGUBAH DATA (EDIT) & KIRIM EMAIL REVISI ---
export async function onRequestPut(context) {
  try {
    const input = await context.request.json();
    
    if (!input.id) return Response.json({ error: "ID data tidak diberikan!" }, { status: 400 });

    await context.env.DB.prepare(
        "UPDATE nomor_pkrs SET nama_peminta = ?, tanggal_permintaan = ?, jenis_cetak = ?, judul_keperluan = ?, email = ? WHERE id = ?"
    ).bind(
        input.nama_peminta,
        input.tanggal_permintaan,
        input.jenis_cetak,
        input.judul_keperluan,
        input.email,
        input.id
    ).run();

    const dataTerupdate = await context.env.DB.prepare("SELECT nomor_pkrs_final FROM nomor_pkrs WHERE id = ?").bind(input.id).first();
    const nomorPKRSFinal = dataTerupdate.nomor_pkrs_final;

    const desainEmail = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #f59e0b;">Perubahan Data Berhasil Disimpan!</h2>
            <p>Halo, <strong>${input.nama_peminta}</strong>,</p>
            <p>Sesuai permintaan, kami telah <strong>memperbarui</strong> detail antrean Anda. Permintaan cetak <strong>${input.jenis_cetak}</strong> untuk <strong>"${input.judul_keperluan}"</strong> sekarang telah tercatat dengan data terbaru di sistem kami.</p>
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e; text-transform: uppercase;">Nomor PKRS Anda (Tetap):</p>
                <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #b45309;">${nomorPKRSFinal}</p>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Email notifikasi revisi ini dikirim otomatis oleh Sistem PKRS Hub.</p>
        </div>
    `;

    // Eksekusi Resend (Dengan Pelacak Error)
    const kirimResend = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: "TIM PKRS <no-reply@hnm.my.id>", 
            to: [input.email],
            subject: `[Update PKRS Hub] Detail Antrean Diperbarui - ${nomorPKRSFinal}`,
            html: desainEmail
        })
    });

    // Mencegah Silent Failure!
    if (!kirimResend.ok) {
        const responError = await kirimResend.json();
        throw new Error("Ditolak Resend: " + JSON.stringify(responError));
    }

    return Response.json({ 
        sukses: true, 
        pesan: `Data ID #${input.id} berhasil diperbarui dan email telah dikirim.` 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}