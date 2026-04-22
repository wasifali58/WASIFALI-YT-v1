// YOUTUBE DOWNLOADER API – PWN.SH (WORKING)
// Developer: WASIF ALI | Telegram: @FREEHACKS95

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET' && !req.query.url) {
    return res.status(200).json({
      message: "YouTube Downloader API – Working",
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

    // Use pwn.sh API (reliable, no auth)
    const pwnRes = await fetch(`https://pwn.sh/tools/ytdl/get?url=https://youtu.be/${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!pwnRes.ok) {
      throw new Error("Failed to fetch from pwn.sh");
    }

    const data = await pwnRes.json();

    // Extract qualities
    const qualities = [];

    // Audio
    if (data.audio && data.audio.url) {
      qualities.push({
        quality: "MP3 Audio",
        url: data.audio.url,
        type: "audio",
        size_mb: data.audio.size ? (data.audio.size / 1024 / 1024).toFixed(2) : null
      });
    }

    // Video qualities: filter 360p, 480p, 720p (also 1080p if available)
    const videoFormats = data.urls || [];
    const wantedQualities = ["360p", "480p", "720p", "1080p"];
    for (const fmt of videoFormats) {
      if (wantedQualities.includes(fmt.quality)) {
        qualities.push({
          quality: fmt.quality,
          url: fmt.url,
          type: "video",
          size_mb: fmt.size ? (fmt.size / 1024 / 1024).toFixed(2) : null
        });
      }
    }

    // If no matching qualities, take first video format
    if (qualities.filter(q => q.type === "video").length === 0 && videoFormats.length > 0) {
      qualities.push({
        quality: videoFormats[0].quality || "720p",
        url: videoFormats[0].url,
        type: "video",
        size_mb: videoFormats[0].size ? (videoFormats[0].size / 1024 / 1024).toFixed(2) : null
      });
    }

    // Metadata
    const title = data.title || "Video Title";
    const thumbnail = data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const duration = data.duration || 0;
    const author = data.author || "YouTube Channel";

    return res.status(200).json({
      success: true,
      video: {
        title: title,
        thumbnail: thumbnail,
        duration_seconds: duration,
        duration_formatted: formatDuration(duration),
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
      error: err.message || "Service unavailable. Please try again.",
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
