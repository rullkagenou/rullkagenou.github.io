export default async function handler(req, res) {
  const { url, filename } = req.query;
  if (!url) return res.status(400).json({ error: "URL tidak ada" });

  try {
    // fetch dengan follow redirect
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
        "Referer": "https://www.tiktok.com/",
        "Range": "bytes=0-"
      },
      redirect: "follow"
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Gagal fetch file" });
    }

    // cek konten type
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      return res.status(500).json({ error: "Bukan link file langsung", url });
    }

    // ambil buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", contentType || "application/octet-stream");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename || "file"}"`
    );

    res.end(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi error", detail: err.message, url });
  }
}
