// 1. Fungsi untuk melayani pra-pemeriksaan (Preflight)
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", 
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    }
  });
}

// Variabel bantuan agar Anda tidak capek mengetik ulang
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// =====================================================================
// FUNGSI PEMBANTU: Tarik Pengaturan (Prefix & Nama Instansi) dari D1
// =====================================================================
async function getSettings(db) {
    // Tambahkan default instruksi_email di sini
    let settings = { 
        prefix_nomor: "TIM PKRS/RSASF/", 
        nama_instansi: "TIM PKRS",
        instruksi_email: "Jika ada kendala atau pertanyaan terkait antrean ini, silakan hubungi tim kami."
    }; 
    try {
        // Tambahkan 'instruksi_email' ke dalam kueri SELECT
        const { results } = await db.prepare("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('prefix_nomor', 'nama_instansi', 'instruksi_email')").all();
        if (results) {
            results.forEach(row => {
                // Memastikan teks kosong ("") tetap ditarik dari database
                if (row.setting_value !== null && row.setting_value !== undefined) {
                    settings[row.setting_key] = row.setting_value;
                }
            });
        }
    } catch (err) {
        console.log("Gagal mengambil settings, menggunakan default.", err);
    }
    return settings;
}

// --- FUNGSI PEMBANTU (Konversi Bulan Romawi) ---
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

// --- 1. FUNGSI UNTUK MEMBACA DATA (GET) ---
export async function onRequestGet(context) {
  try {
    const result = await context.env.DB.prepare(
        "SELECT id, timestamp, nama_peminta, tanggal_permintaan, jenis_cetak, judul_keperluan, email, nomor_pkrs_final, status FROM nomor_pkrs ORDER BY id DESC"
    ).all();
    
    return Response.json(result.results, { 
        status: 200, 
        headers: corsHeaders 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { 
        status: 500, 
        headers: corsHeaders 
    });
  }
}

// --- 2. FUNGSI UNTUK MENYIMPAN DATA BARU (POST) ---
export async function onRequestPost(context) {
  try {
    const input = await context.request.json();
    
    // 1. Ambil pengaturan dinamis dari database (Pemanggilan DB harus DI DALAM fungsi)
    const settings = await getSettings(context.env.DB);
    
    // 2. Generate Nomor PKRS
    const cekIdTerakhir = await context.env.DB.prepare("SELECT MAX(id) as lastId FROM nomor_pkrs").first();
    const idTerakhir = cekIdTerakhir.lastId || 0; 
    const nomorUrut = idTerakhir + 1;

    const tanggal = new Date();
    const bulan = angkaKeRomawi(tanggal.getMonth() + 1); 
    const tahun = tanggal.getFullYear(); 
    
    // RANGKAI NOMOR BERDASARKAN PREFIX SETTINGS (Sesuai dengan gambar UI Anda)
    const nomorPKRSFinal = `${settings.prefix_nomor}${nomorUrut}/${bulan}/${tahun}`;

    // 3. Simpan ke Database
    await context.env.DB.prepare(
        "INSERT INTO nomor_pkrs (timestamp, nama_peminta, tanggal_permintaan, jenis_cetak, judul_keperluan, email, nomor_pkrs_final, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
        new Date().toISOString(),
        input.nama_peminta,
        input.tanggal_permintaan,
        input.jenis_cetak,
        input.judul_keperluan,
        input.email,
        nomorPKRSFinal,
        'Menunggu'
    ).run();

    // Cek apakah instruksi diisi. Jika kosong, hilangkan kotaknya. 
    // Jika diisi, buat kotaknya (sekaligus mengubah Enter menjadi <br> agar rapi)
    const kotakInstruksi = settings.instruksi_email && settings.instruksi_email.trim() !== "" 
        ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
                <strong>Catatan / Instruksi:</strong><br>
                ${settings.instruksi_email.replace(/\n/g, '<br>')}
            </p>
        </div>
        `
        : "";
        
        // 4. Kustomisasi Email menggunakan Nama Instansi (Dinamic Sender Name)
        const desainEmail = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #2563eb;">Permintaan Cetak Berhasil Diproses!</h2>
                <p>Halo, <strong>${input.nama_peminta}</strong>,</p>
                <p>Terima kasih. Permintaan cetak <strong>${input.jenis_cetak}</strong> untuk <strong>"${input.judul_keperluan}"</strong> telah kami catat di sistem.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #4b5563; text-transform: uppercase;">Nomor Antrean Anda:</p>
                    <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #1e3a8a;">${nomorPKRSFinal}</p>
                </div>
            
                ${kotakInstruksi}

                <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Email ini dikirim otomatis oleh Sistem ${settings.nama_instansi}.</p>
            </div>
        `;

        const kirimEmail = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: `${settings.nama_instansi} <no-reply@hnm.my.id>`, // NAMA PENGIRIM BERUBAH MENJADI "IT RSUASF"
                to: [input.email],
                subject: `[${settings.nama_instansi}] Nomor Anda Telah Terbit - ${nomorPKRSFinal}`,
                html: desainEmail
            })
        });

        if (!kirimEmail.ok) {
            const responError = await kirimEmail.json();
            throw new Error("Ditolak Resend: " + JSON.stringify(responError));
        }

    // Sukses
    return Response.json(
        { sukses: true, pesan: "Data berhasil disimpan!", nomor_pkrs: nomorPKRSFinal },
        { status: 200, headers: corsHeaders }
    );
  } catch (error) { 
      // Error
      return Response.json(
          { error: error.message }, 
          { status: 500, headers: corsHeaders }
      ); 
  }
}

// --- 3. FUNGSI UNTUK MENGHAPUS DATA (DELETE) ---
export async function onRequestDelete(context) {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
        return Response.json({ error: "ID data tidak diberikan!" }, { status: 400, headers: corsHeaders });
    }

    await context.env.DB.prepare("DELETE FROM nomor_pkrs WHERE id = ?").bind(id).run();
    
    return Response.json({ sukses: true, pesan: `Data ID #${id} berhasil dihapus.` }, { status: 200, headers: corsHeaders });
  } catch (error) { 
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders }); 
  }
}

// --- 4. FUNGSI UNTUK MENGUBAH DATA (PUT) ---
export async function onRequestPut(context) {
  try {
    const input = await context.request.json();
    if (!input.id) {
        return Response.json({ error: "ID data tidak diberikan!" }, { status: 400, headers: corsHeaders });
    }

    // Ambil settings untuk footer & subject email
    const settings = await getSettings(context.env.DB);

    // Update Database D1
    await context.env.DB.prepare(
        "UPDATE nomor_pkrs SET nama_peminta = ?, tanggal_permintaan = ?, jenis_cetak = ?, judul_keperluan = ?, email = ?, status = ? WHERE id = ?"
    ).bind(
        input.nama_peminta,
        input.tanggal_permintaan,
        input.jenis_cetak,
        input.judul_keperluan,
        input.email,
        input.status,
        input.id
    ).run();

    // PERBAIKAN BUG: Ambil nomor PKRS final yang sudah ada di database, jangan dirangkai ulang
    const dataTerupdate = await context.env.DB.prepare("SELECT nomor_pkrs_final FROM nomor_pkrs WHERE id = ?").bind(input.id).first();
    const nomorPKRSFinal = dataTerupdate.nomor_pkrs_final;

    // 1. Proses pengecekan: Jika kosong, jadikan string kosong (""). Jika ada, buatkan kotak HTML-nya.
    const isiInstruksi = settings.instruksi_email ? settings.instruksi_email.trim() : "";
    
    const kotakInstruksi = isiInstruksi !== "" 
        ? `
          <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
                  <strong>Catatan / Instruksi:</strong><br>
                  ${isiInstruksi.replace(/\n/g, '<br>')}
              </p>
          </div>
          `
        : "";

    // 2. Suntikkan variabel kotakInstruksi langsung ke dalam desain Email (KHUSUS UPDATE STATUS)
    const desainEmail = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #f59e0b;">Perubahan Status Antrean!</h2>
            <p>Halo, <strong>${input.nama_peminta}</strong>,</p>
            <p>Kami telah memperbarui detail antrean Anda untuk keperluan <strong>"${input.judul_keperluan}"</strong>.</p>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #92400e; text-transform: uppercase;">Nomor Antrean Anda:</p>
                <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #b45309;">${nomorPKRSFinal}</p>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #d97706;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">Status Pengerjaan Saat Ini:</p>
                    <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #b45309;">${input.status.toUpperCase()}</p>
                </div>
            </div>
            
            ${kotakInstruksi}

            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Email ini dikirim otomatis oleh Sistem ${settings.nama_instansi}.</p>
        </div>
    `;

    const kirimResend = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${context.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: `${settings.nama_instansi} <no-reply@hnm.my.id>`, // NAMA PENGIRIM BERUBAH MENJADI "IT RSUASF"
            to: [input.email],
            subject: `[Update ${settings.nama_instansi}] Status Antrean Diperbarui - ${nomorPKRSFinal}`,
            html: desainEmail
        })
    });

    if (!kirimResend.ok) {
        const responError = await kirimResend.json();
        throw new Error("Ditolak Resend: " + JSON.stringify(responError));
    }

    return Response.json({ sukses: true, pesan: `Data ID #${input.id} berhasil diperbarui.` }, { status: 200, headers: corsHeaders });
  } catch (error) { 
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders }); 
  }
}