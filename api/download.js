// YOUTUBE DOWNLOADER API - FINAL WORKING VERSION
// Developer: WASIF ALI | Telegram: @FREEHACKS95

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET' && !req.query.url) {
    return res.status(200).json({
      message: "YouTube Downloader API - Working",
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

    // Use the reliable ytdlp_web API
    const apiUrl = "https://ytdlp-web-6f3h.onrender.com/download";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url })
    });

    if (!response.ok) throw new Error("Download request failed");
    
    const data = await response.json();

    // Extract video info
    const title = data.originalTitle || "Video Title";
    const thumbnail = data.thumbnail || "";
    const duration = data.duration || 0;
    const uploader = data.uploader || "YouTube Channel";
    const videoId = extractVideoId(url);

    // Prepare qualities
    const qualities = [];
    if (data.direct_link) {
      qualities.push({
        quality: "Default",
        url: data.direct_link,
        type: "video"
      });
    }

    return res.status(200).json({
      success: true,
      video: {
        title: title,
        thumbnail: thumbnail,
        duration_seconds: duration,
        duration_formatted: formatDuration(duration),
        author: uploader,
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
      error: "Service temporarily unavailable. Please try again.",
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

function formatDuration(sec) {
  if (!sec || sec <= 0) return "00:00";
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
