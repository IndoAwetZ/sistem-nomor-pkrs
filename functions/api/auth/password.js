export async function onRequestPut(context) {
    const { request, env } = context;
    const body = await request.json();
    const { username, password } = body;

    try {
        // 1. Hash password baru
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 2. Simpan ke database dan ubah status is_new_user menjadi 0 (bukan user baru lagi)
        await env.DB.prepare(
            "UPDATE users SET password_hash = ?, is_new_user = 0 WHERE username = ?"
        ).bind(passwordHash, username).run();

        return new Response(JSON.stringify({ sukses: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ sukses: false, error: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}