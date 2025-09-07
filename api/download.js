export default async function handler(req, res) {
  try {
    const { url, filename = "file" } = req.query;
    if (!url) return res.status(400).json({ error: "url wajib diisi" });

    // ambil file dari direct link
    const response = await fetch(url);
    if (!response.ok) return res.status(500).json({ error: "Gagal ambil file" });

    // set header biar browser langsung unduh
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    response.body.pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Terjadi error server" });
  }
}