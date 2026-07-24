export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { username, password } = body;

    try {
        // 1. Hash password yang diinput user untuk dicocokkan dengan database
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 2. Cari user di tabel database
        const user = await env.DB.prepare(
            "SELECT * FROM users WHERE username = ?"
        ).bind(username).first();

        // 3. Validasi: Jika user tidak ada ATAU password salah
        if (!user || user.password_hash !== passwordHash) {
            return new Response(JSON.stringify({ sukses: false, pesan: "Username atau password salah!" }), {
                status: 401, headers: { 'Content-Type': 'application/json' }
            });
        }

        // 4. Jika sukses, kirim status user (apakah user baru atau bukan)
        return new Response(JSON.stringify({
            sukses: true,
            is_new_user: user.is_new_user,
            role: user.role,
            username: user.username
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        return new Response(JSON.stringify({ sukses: false, error: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}