// YOUTUBE DOWNLOADER API - OPTIMIZED
// Developer: WASIF ALI | Telegram: @FREEHACKS95

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET' && !req.query.url) {
    return res.status(200).json({
      message: "YouTube Downloader API",
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
    
    // Use faster API - pwn.sh (usually responds in 2-3 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const pwnRes = await fetch(`https://pwn.sh/tools/ytdl/get?url=https://youtu.be/${videoId}`, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    
    clearTimeout(timeoutId);
    
    if (pwnRes.ok) {
      const data = await pwnRes.json();
      const qualities = [];
      
      // Audio
      if (data.audio?.url) {
        qualities.push({
          quality: "MP3 Audio",
          url: data.audio.url,
          type: "audio"
        });
      }
      
      // Video qualities
      const videoUrls = data.urls || [];
      for (const fmt of videoUrls) {
        if (fmt.quality === "360p" || fmt.quality === "480p" || fmt.quality === "720p") {
          qualities.push({
            quality: fmt.quality,
            url: fmt.url,
            type: "video"
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        video: {
          title: data.title || "Video Title",
          thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          duration_seconds: data.duration || 0,
          duration_formatted: formatDuration(data.duration),
          author: data.author || "YouTube Channel",
          video_id: videoId,
          watch_url: `https://youtube.com/watch?v=${videoId}`
        },
        qualities: qualities,
        developer: "WASIF ALI",
        telegram: "@FREEHACKS95"
      });
    }
    
    throw new Error("API failed");

  } catch (err) {
    console.error("Error:", err.message);
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
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/
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
