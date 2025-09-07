export default async function handler(req, res) {
  const { url, filename } = req.query;
  if (!url) return res.status(400).json({ error: "URL tidak ada" });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: "Gagal fetch file" });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename || 'file'}"`
    );
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );

    // ✅ Convert ReadableStream ke Node.js readable
    const reader = response.body.getReader();
    const encoder = new TextEncoder();

    // Stream chunk demi chunk
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi error", detail: err.message });
  }
}
