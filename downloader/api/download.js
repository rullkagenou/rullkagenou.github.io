
import { Readable } from "stream";

export default async function handler(req, res) {
  const { url, filename } = req.query;
  if (!url) return res.status(400).json({ error: "URL tidak ada" });

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Gagal fetch file" });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename ? filename.replace(/[^\w.-]/g, "_") : "file"}"`
    );
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );


    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body);
      nodeStream.pipe(res);
    } else {
      res.status(500).json({ error: "Response body kosong" });
    }
  } catch (err) {
    res.status(500).json({ error: "Terjadi error", detail: err.message });
  }
}
