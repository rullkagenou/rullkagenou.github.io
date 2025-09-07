export default async function handler(req, res) {
  try {
    const { url, filename = "file" } = req.query;
    if (!url) return res.status(400).json({ error: "url wajib diisi" });

    // ambil direct mp4 dari API pihak ketiga
    const api = await fetch(`https://api.finix-id.my.id/download/aio?url=${encodeURIComponent(url)}`);
    const data = await api.json();
    if (!data || !data.data || !data.data.play) {
      return res.status(500).json({ error: "Gagal ambil link video" });
    }
    const videoUrl = data.data.play;

    // fetch video langsung
    const response = await fetch(videoUrl);
    if (!response.ok) return res.status(500).json({ error: "Gagal ambil file" });

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.mp4"`);

    response.body.pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Terjadi error server" });
  }
}