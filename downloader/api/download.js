export default async function handler(req, res) {
  const { url, filename } = req.query;
  if (!url) return res.status(400).json({ error: "URL tidak ada" });

  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(500).json({ error: "Gagal fetch file" });

    res.setHeader("Content-Disposition", `attachment; filename="${filename || 'file'}"`);
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/octet-stream");

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: "Terjadi error", detail: err.message });
  }
}