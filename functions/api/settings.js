// Contoh Endpoint: GET /api/settings
async function getSettings(env) {
    try {
        // Ambil semua data dari tabel settings
        const { results } = await env.DB.prepare("SELECT * FROM settings").all();
        
        // Ubah array [{'setting_key': 'nama_instansi', 'setting_value': 'TIM PKRS RSUASF'}, ...] 
        // Menjadi format objek yang rapi: { "nama_instansi": "TIM PKRS RSUASF", "prefix_nomor": "..." }
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

// Contoh Endpoint: PUT (atau POST) /api/settings
async function updateSettings(request, env) {
    try {
        const body = await request.json();
        
        // Siapkan array query untuk update massal
        const statements = [];
        
        // Loop setiap pengaturan yang dikirimkan
        for (const [key, value] of Object.entries(body)) {
            statements.push(
                env.DB.prepare(
                    "UPDATE settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?"
                ).bind(value, key)
            );
        }
        
        // Eksekusi semua query secara bersamaan (batch)
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