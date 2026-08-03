// Header CORS terpusat
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PUT, OPTIONS",
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

// Endpoint GANTI PASSWORD USER (PUT /api/auth/password)
export async function onRequestPut(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return Response.json(
                { sukses: false, pesan: "Username dan password baru wajib diisi!" },
                { status: 400, headers: corsHeaders }
            );
        }

        // 1. Hash password baru
        const passwordHash = await hashPassword(password);

        // 2. Simpan ke database 'users' dan ubah status is_new_user menjadi 0
        const result = await env.DB.prepare(
            "UPDATE users SET password_hash = ?, is_new_user = 0 WHERE username = ?"
        ).bind(passwordHash, username.trim()).run();

        if (result.meta.changes === 0) {
            return Response.json(
                { sukses: false, pesan: "Username tidak ditemukan!" },
                { status: 404, headers: corsHeaders }
            );
        }

        return Response.json(
            { sukses: true },
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        return Response.json(
            { sukses: false, error: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}