// Header CORS terpusat
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// Helper function untuk hash SHA-256
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Handling Preflight (OPTIONS)
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            ...corsHeaders,
            "Access-Control-Max-Age": "86400",
        }
    });
}

// Endpoint LOGIN ADMIN (POST /api/auth/login)
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return Response.json(
                { sukses: false, pesan: "Username dan password wajib diisi!" },
                { status: 400, headers: corsHeaders }
            );
        }

        // 1. Hash password input untuk dicocokkan dengan database
        const passwordHash = await hashPassword(password);

        // 2. Cari user di tabel 'users'
        const user = await env.DB.prepare(
            "SELECT * FROM users WHERE username = ?"
        ).bind(username.trim()).first();

        // 3. Validasi: Jika user tidak ada ATAU password_hash tidak cocok
        if (!user || user.password_hash !== passwordHash) {
            return Response.json(
                { sukses: false, pesan: "Username atau password salah!" },
                { status: 401, headers: corsHeaders }
            );
        }

        // 4. Jika sukses, kirim response
        return Response.json({
            sukses: true,
            is_new_user: user.is_new_user,
            role: user.role,
            username: user.username
        }, { status: 200, headers: corsHeaders });

    } catch (error) {
        return Response.json(
            { sukses: false, error: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}