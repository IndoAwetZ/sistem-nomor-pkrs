export async function onRequestGet(context) {
    const { env } = context;

    try {
        // Ambil semua user dari database, kecuali password_hash (demi keamanan)
        // Urutkan berdasarkan siapa yang paling baru dibuat
        const { results } = await env.DB.prepare(
            "SELECT id, username, email, role, is_new_user FROM users ORDER BY id DESC"
        ).all();

        return new Response(JSON.stringify({ sukses: true, data: results }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ sukses: false, error: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}