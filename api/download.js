export default async function handler(req, res) {
  try {
    const { url, filename = "file" } = req.query;
    if (!url) return res.status(400).json({ error: "url wajib diisi" });

    // ambil file dari sumber
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: "Gagal ambil file" });
    }

    // deteksi mime type (fallback: octet-stream)
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    response.body.pipe(res); // stream langsung ke user
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Terjadi error server" });
  }
}