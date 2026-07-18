// 1. TAMBAHKAN INI: Fungsi untuk melayani pra-pemeriksaan (Preflight) dari FlutLab/Browser
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    }
  });
}

// 2. FUNGSI UTAMA ANDA
export async function onRequestPost(context) {
  // Variabel Header CORS yang harus selalu menempel di setiap Response
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // 1. Tangkap ketikan dari pengguna
    const input = await context.request.json();
    const usernameInput = input.username;
    const passwordInput = input.password;

    if (!usernameInput || !passwordInput) {
      return Response.json(
        { sukses: false, error: "Username dan password wajib diisi!" },
        { status: 400, headers: corsHeaders } // <-- Tumbelkan header di sini
      );
    }

    // 2. Cocokkan dengan database D1
    const cekUser = await context.env.DB.prepare(
        "SELECT * FROM admin_users WHERE username = ? AND password = ?"
    ).bind(usernameInput, passwordInput).first();

    // 3. Beri Keputusan (Izin Masuk / Tolak)
    if (cekUser) {
      return Response.json(
        { sukses: true, pesan: "Login diizinkan." },
        { status: 200, headers: corsHeaders } // <-- Tempelkan header di sini
      );
    } else {
      return Response.json(
        { sukses: false, error: "Username atau Password salah!" },
        { status: 401, headers: corsHeaders } // <-- Tempelkan header di sini
      );
    }

  } catch (error) {
    return Response.json(
      { sukses: false, error: "Terjadi gangguan pada server." },
      { status: 500, headers: corsHeaders } // <-- Tempelkan header di sini
    );
  }
}