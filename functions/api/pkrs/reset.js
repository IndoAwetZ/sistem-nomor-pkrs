// Header CORS terpusat
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// 1. Handling Preflight (OPTIONS) - Wajib agar browser tidak memblokir POST
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            ...corsHeaders,
            "Access-Control-Max-Age": "86400",
        }
    });
}

// 2. Endpoint MENGHAPUS SEMUA DATA (POST /api/pkrs/reset)
export async function onRequestPost(context) {
    try {
        // 1. Hapus semua baris data dari tabel utama antrean
        await context.env.DB.prepare("DELETE FROM nomor_pkrs").run();
        
        // 2. Reset hitungan ID (Auto-Increment) agar saat input baru, ID kembali dari urutan 1
        await context.env.DB.prepare("DELETE FROM sqlite_sequence WHERE name='nomor_pkrs'").run();

        return Response.json(
            { sukses: true, pesan: "Database berhasil dikosongkan dan direset." },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        return Response.json(
            { sukses: false, error: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}