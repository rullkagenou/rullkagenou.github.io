export default async function handler(req, res) {
  const { url, filename = "media.mp4" } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL tidak ada!" });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: "Gagal fetch file." });
    }

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    response.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error server." });
  }
}