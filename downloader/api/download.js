export default async function handler(req, res) {
  const { url, filename } = req.query;
  if (!url) return res.status(400).json({ error: "URL tidak ada" });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: "Gagal fetch file" });
    }

    // Ambil data sebagai buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    // Ambil content-type asli
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    // Set header supaya browser download
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename || 'file'}"`
    );

    res.end(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi error", detail: err.message });
  }
}