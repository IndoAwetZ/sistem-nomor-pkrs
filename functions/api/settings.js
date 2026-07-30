// 1. Endpoint untuk MENGAMBIL data pengaturan (GET /api/settings)
export async function onRequestGet(context) {
    const { env } = context;
    try {
        // Ambil semua data dari tabel settings
        const { results } = await env.DB.prepare("SELECT * FROM settings").all();
        
        // Ubah format data menjadi objek yang mudah dibaca Frontend
        const settingsObj = {};
        if (results) {
            results.forEach(row => {
                settingsObj[row.setting_key] = row.setting_value;
            });
        }
        
        return new Response(JSON.stringify({ sukses: true, data: settingsObj }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ sukses: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// 2. Endpoint untuk MEMPERBARUI data pengaturan (PUT /api/settings)
export async function onRequestPut(context) {
  try {
    const input = await context.request.json();
    
    // Looping semua data dari form HTML
    for (const [key, value] of Object.entries(input)) {
        // Cek apakah data (misal: instruksi_email) sudah ada di database
        const cek = await context.env.DB.prepare("SELECT setting_key FROM settings WHERE setting_key = ?").bind(key).first();
        
        if (cek) {
            // Jika sudah ada, UPDATE datanya
            await context.env.DB.prepare("UPDATE settings SET setting_value = ? WHERE setting_key = ?").bind(value, key).run();
        } else {
            // Jika belum ada (karena baru kita tambahkan hari ini), INSERT data baru
            await context.env.DB.prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)").bind(key, value).run();
        }
    }

    return Response.json({ sukses: true });
  } catch (err) { 
      return Response.json({ error: err.message }, { status: 500 }); 
  }
}