export async function onRequestPost(context) {
    const { env } = context;

    try {
        // 1. Hapus semua data di tabel 
        // (PENTING: Ganti 'tabel_pkrs' dengan nama tabel asli di database D1 Anda jika berbeda)
        await env.DB.prepare("DELETE FROM tabel_pkrs").run();
        
        // 2. Reset hitungan auto-increment kembali ke awal
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