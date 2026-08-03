// Header CORS terpusat
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// Handling Preflight (OPTIONS)
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: { ...corsHeaders, "Access-Control-Max-Age": "86400" }
    });
}

// Endpoint VERIFIKASI SESI (POST /api/auth/verify)
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { username } = body;

        if (!username) {
            return Response.json(
                { sukses: false, valid: false }, 
                { status: 400, headers: corsHeaders }
            );
        }

        // Cek apakah user masih ada di database
        const user = await env.DB.prepare(
            "SELECT id, role FROM users WHERE username = ?"
        ).bind(username.trim()).first();

        // Jika user tidak ditemukan (sudah dihapus), kembalikan valid: false
        if (!user) {
            return Response.json(
                { sukses: true, valid: false }, 
                { status: 200, headers: corsHeaders }
            );
        }

        // Jika user ada, kembalikan valid: true beserta role terbarunya
        return Response.json(
            { sukses: true, valid: true, role: user.role }, 
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        return Response.json(
            { sukses: false, error: error.message }, 
            { status: 500, headers: corsHeaders }
        );
    }
}