export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { username, email, role } = body;

    try {
        // 1. Generate Password Random (Misal: Pkrs892X)
        const randomPassword = Math.random().toString(36).slice(-8) + "X";
        
        // 2. Hash Password menggunakan Web Crypto API
        const msgBuffer = new TextEncoder().encode(randomPassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // 3. Simpan ke Database D1
        await env.DB.prepare(
            "INSERT INTO users (username, email, password_hash, role, is_new_user) VALUES (?, ?, ?, ?, 1)"
        ).bind(username, email, passwordHash, role || 'admin').run();

        // 4. Kirim Email Notifikasi via Resend API
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Sistem PKRS <noreply@domain-anda.com>',
                to: email,
                subject: 'Akses Akun Admin TIM PKRS RSUASF',
                html: `
                    <h2>Halo, ${username}!</h2>
                    <p>Akun Anda telah berhasil dibuat. Berikut adalah kredensial sementara Anda:</p>
                    <p><strong>Username:</strong> ${username}</p>
                    <p><strong>Password:</strong> ${randomPassword}</p>
                    <br>
                    <p><em>Catatan: Anda akan diminta untuk mengganti password ini pada saat pertama kali melakukan login demi alasan keamanan.</em></p>
                `
            })
        });

        return new Response(JSON.stringify({ sukses: true, pesan: "User dibuat dan email terkirim." }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ sukses: false, error: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}