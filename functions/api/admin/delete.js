export async function onRequestDelete(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { username } = body;

        if (!username) {
            return new Response(JSON.stringify({ sukses: false, pesan: "Username tidak valid." }), { status: 400 });
        }

        // Hapus user dari database D1
        await env.DB.prepare("DELETE FROM users WHERE username = ?").bind(username).run();

        return new Response(JSON.stringify({ sukses: true, pesan: "Admin berhasil dihapus." }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ sukses: false, error: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}