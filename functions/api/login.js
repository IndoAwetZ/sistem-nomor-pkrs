export async function onRequestPost(context) {
  try {
    // 1. Tangkap ketikan dari pengguna
    const input = await context.request.json();
    const usernameInput = input.username;
    const passwordInput = input.password;

    if (!usernameInput || !passwordInput) {
      return Response.json({ sukses: false, error: "Username dan password wajib diisi!" }, { status: 400 });
    }

    // 2. Cocokkan dengan database D1
    const cekUser = await context.env.DB.prepare(
        "SELECT * FROM admin_users WHERE username = ? AND password = ?"
    ).bind(usernameInput, passwordInput).first();

    // 3. Beri Keputusan (Izin Masuk / Tolak)
    if (cekUser) {
      return Response.json({ sukses: true, pesan: "Login diizinkan." });
    } else {
      return Response.json({ sukses: false, error: "Username atau Password salah!" }, { status: 401 });
    }

  } catch (error) {
    return Response.json({ sukses: false, error: "Terjadi gangguan pada server." }, { status: 500 });
  }
}