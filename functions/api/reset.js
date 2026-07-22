// Contoh penambahan rute pada Cloudflare Worker Anda
if (url.pathname === '/api/pkrs/reset' && request.method === 'POST') {
    try {
        // 1. Hapus semua data di tabel (ganti 'tabel_pkrs' dengan nama tabel asli Anda)
        await env.DB.prepare("DELETE FROM tabel_pkrs").run();
        
        // 2. Reset hitungan auto-increment kembali ke 0/1
        await env.DB.prepare("DELETE FROM sqlite_sequence WHERE name='tabel_pkrs'").run();

        return new Response(JSON.stringify({ sukses: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ sukses: false, error: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}
