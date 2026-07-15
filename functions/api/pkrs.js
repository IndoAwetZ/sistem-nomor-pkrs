export async function onRequest(context) {
  // Mengambil semua data dari tabel nomor_pkrs, diurutkan dari yang terbaru
  const { results } = await context.env.DB.prepare(
    "SELECT * FROM nomor_pkrs ORDER BY id DESC"
  ).all();
  
  return Response.json(results);
}