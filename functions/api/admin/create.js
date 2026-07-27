export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { username, email, role } = body;

    try {
        // 1. Validasi: Pastikan Username belum dipakai
        const cekUser = await env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(username).first();
        if (cekUser) {
            return new Response(JSON.stringify({ sukses: false, pesan: "Username sudah digunakan." }), { status: 400 });
        }

        // 2. Buat Password Acak (6 Karakter kombinasi huruf dan angka)
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let plainPassword = '';
        for (let i = 0; i < 6; i++) {
            plainPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // 3. Hash Password untuk disimpan di DB
        const msgBuffer = new TextEncoder().encode(plainPassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 4. Simpan ke Database D1
        await env.DB.prepare(
            "INSERT INTO users (username, email, password_hash, role, is_new_user) VALUES (?, ?, ?, ?, 1)"
        ).bind(username, email, role).run();

        // 5. Kirim Email via Resend API
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #059669; margin-top: 0;">Akses Admin Diberikan</h2>
                <p>Halo,</p>
                <p>Anda telah didaftarkan sebagai <strong>${role === 'super_admin' ? 'Super Admin' : 'Admin'}</strong> untuk sistem TIM PKRS RSUASF.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Username:</strong> ${username}</p>
                    <p style="margin: 0;"><strong>Password Sementara:</strong> <span style="font-family: monospace; font-size: 1.1em; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${plainPassword}</span></p>
                </div>
                <p style="font-size: 13px; color: #64748b;"><em>Catatan: Saat login pertama kali, sistem akan memaksa Anda untuk mengganti password ini demi keamanan.</em></p>
            </div>
        `;

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'TIM PKRS RSUASF <onboarding@resend.dev>', // Ganti dengan domain Anda jika sudah verifikasi di Resend
                to: email,
                subject: 'Akses Admin Sistem TIM PKRS',
                html: emailHtml
            })
        });

        if (!resendResponse.ok) {
            console.error("Gagal kirim email:", await resendResponse.text());
            // Tetap anggap sukses karena DB sudah masuk, hanya email yang gagal
            return new Response(JSON.stringify({ sukses: true, pesan: "Akun terbuat, tapi gagal mengirim email." }));
        }

        return new Response(JSON.stringify({ sukses: true }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ sukses: false, error: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}