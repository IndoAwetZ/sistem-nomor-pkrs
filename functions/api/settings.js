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
    const { request, env } = context;
    try {
        const body = await request.json();
        const statements = [];
        
        // Loop setiap pengaturan yang dikirimkan dari frontend
        for (const [key, value] of Object.entries(body)) {
            statements.push(
                env.DB.prepare(
                    "UPDATE settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?"
                ).bind(value, key)
            );
        }
        
        // Eksekusi semua query secara bersamaan (batch) agar lebih cepat
        await env.DB.batch(statements);
        
        return new Response(JSON.stringify({ sukses: true, pesan: "Pengaturan berhasil diperbarui" }), {
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