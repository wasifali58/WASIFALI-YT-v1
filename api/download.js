// YOUTUBE DOWNLOADER API – USING YTDOWNLOADPRO.COM
// Developer: WASIF ALI | Telegram: @FREEHACKS95

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET' && !req.query.url) {
    return res.status(200).json({
      message: "YouTube Downloader API – Working (ytdownloadpro.com)",
      usage: "/api/download?url=YOUTUBE_URL",
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });
  }

  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({
        error: "Missing url parameter",
        developer: "WASIF ALI",
        telegram: "@FREEHACKS95"
      });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({
        error: "Invalid YouTube URL",
        developer: "WASIF ALI",
        telegram: "@FREEHACKS95"
      });
    }

    // Define qualities to fetch (as per your capture: 480p, 1080p, plus 360p and MP3)
    const formats = ["360p", "480p", "720p", "1080p", "mp3"];
    const qualities = [];

    // For each format, call ytdownloadpro.com
    for (const fmt of formats) {
      const formData = new FormData();
      formData.append("action", "start");
      formData.append("id", videoId);
      formData.append("format", fmt);

      const proxyRes = await fetch("https://ytdownloadpro.com/youtube_api.php", {
        method: "POST",
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36",
          "Origin": "https://ytdownloadpro.com",
          "Referer": "https://ytdownloadpro.com/",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: formData
      });

      const data = await proxyRes.json();
      
      // The response likely contains a download URL. Common keys: "url", "download_url", "link", "result"
      let downloadUrl = null;
      if (data.url) downloadUrl = data.url;
      else if (data.download_url) downloadUrl = data.download_url;
      else if (data.link) downloadUrl = data.link;
      else if (data.result) downloadUrl = data.result;
      
      if (downloadUrl) {
        qualities.push({
          quality: fmt === "mp3" ? "MP3 Audio" : fmt,
          url: downloadUrl,
          type: fmt === "mp3" ? "audio" : "video"
        });
      }
    }

    if (qualities.length === 0) {
      throw new Error("No download links found for this video");
    }

    // Also try to fetch video metadata (title, thumbnail) from a simple API
    let title = "Video Title";
    let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    let author = "YouTube Channel";
    let duration = 0;

    // Optional: get metadata from oembed
    try {
      const oembed = await fetch(`https://www.youtube.com/oembed?url=https://youtu.be/${videoId}&format=json`);
      const oembedData = await oembed.json();
      title = oembedData.title || title;
      author = oembedData.author_name || author;
      thumbnail = oembedData.thumbnail_url || thumbnail;
    } catch(e) {}

    return res.status(200).json({
      success: true,
      video: {
        title: title,
        thumbnail: thumbnail,
        duration_seconds: duration,
        duration_formatted: "00:00",
        author: author,
        video_id: videoId,
        watch_url: `https://youtube.com/watch?v=${videoId}`
      },
      qualities: qualities,
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });

  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch video. Please try again.",
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });
  }
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /youtube\.com\/watch\?.*v=([^&\?\/]+)/
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}
