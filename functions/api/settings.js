// Header CORS Terpusat
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// 1. Handling Preflight (OPTIONS) - Wajib agar browser tidak memblokir metode PUT
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            ...corsHeaders,
            "Access-Control-Max-Age": "86400",
        }
    });
}

// 2. Endpoint MENGAMBIL data pengaturan (GET /api/settings)
export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare("SELECT * FROM settings").all();
        
        const settingsObj = {};
        if (results) {
            results.forEach(row => {
                settingsObj[row.setting_key] = row.setting_value;
            });
        }
        
        return Response.json(
            { sukses: true, data: settingsObj }, 
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        return Response.json(
            { sukses: false, error: error.message }, 
            { status: 500, headers: corsHeaders }
        );
    }
}

// 3. Endpoint MEMPERBARUI data pengaturan (PUT /api/settings)
export async function onRequestPut(context) {
    try {
        const input = await context.request.json();
        
        for (const [key, value] of Object.entries(input)) {
            const cek = await context.env.DB.prepare("SELECT setting_key FROM settings WHERE setting_key = ?").bind(key).first();
            
            if (cek) {
                await context.env.DB.prepare("UPDATE settings SET setting_value = ? WHERE setting_key = ?").bind(value, key).run();
            } else {
                await context.env.DB.prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)").bind(key, value).run();
            }
        }

        return Response.json({ sukses: true }, { status: 200, headers: corsHeaders });
    } catch (err) { 
        return Response.json({ error: err.message }, { status: 500, headers: corsHeaders }); 
    }
}