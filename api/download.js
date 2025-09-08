export default async function handler(req, res) {
  try {
    const { url, filename = "file" } = req.query;
    if (!url) {
      return res.status(400).json({ error: "url wajib diisi" });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: "Gagal ambil file" });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // set header biar langsung unduh
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader("Content-Length", buffer.length);

    res.status(200).send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Terjadi error server" });
  }
}