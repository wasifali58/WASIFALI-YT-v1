// PROFESSIONAL YOUTUBE DOWNLOADER API
// Developer: WASIF ALI | Telegram: @FREEHACKS95

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET request without URL – API info
  if (req.method === 'GET' && !req.query.url) {
    return res.status(200).json({
      message: "YouTube Downloader API – Professional",
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

    // Call the proxy
    const proxyRes = await fetch("https://app.ytdown.to/proxy.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://app.ytdown.to/en25/",
        "Origin": "https://app.ytdown.to",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"
      },
      body: `url=${encodeURIComponent(url)}`
    });

    if (!proxyRes.ok) throw new Error(`Proxy error: ${proxyRes.status}`);
    const data = await proxyRes.json();

    // Extract metadata
    const videoId = extractVideoId(url);
    const title = data.title || "Unknown Title";
    const thumbnail = data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const duration = data.duration || 0;
    const durationFormatted = formatDuration(duration);
    const author = data.author || data.channel || "Unknown Channel";
    const viewCount = data.viewCount || data.views || 0;
    const description = data.description || "";

    // Build qualities (MP3, 360p, 480p, 720p)
    const qualities = [];
    const mp4 = data.links?.mp4 || {};
    const mp3 = data.links?.mp3;

    const addQuality = (quality, url, type) => {
      if (!url) return;
      let sizeBytes = null;
      let sizeMB = null;
      if (data.sizes && data.sizes[quality]) {
        sizeBytes = data.sizes[quality];
        sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
      } else if (type === 'audio' && data.audio_size) {
        sizeBytes = data.audio_size;
        sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
      }
      qualities.push({ quality, url, type, size_bytes: sizeBytes, size_mb: sizeMB });
    };

    if (mp3) addQuality("MP3 Audio", mp3, "audio");
    addQuality("360p", mp4["360p"] || mp4["360"], "video");
    addQuality("480p", mp4["480p"] || mp4["480"], "video");
    addQuality("720p", mp4["720p"] || mp4["720"], "video");

    // Final response – developer info at the end
    return res.status(200).json({
      success: true,
      video: {
        title,
        thumbnail,
        duration_seconds: duration,
        duration_formatted: durationFormatted,
        author,
        view_count: viewCount,
        description: description.substring(0, 500),
        video_id: videoId,
        watch_url: `https://youtube.com/watch?v=${videoId}`
      },
      qualities,
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message || "Internal server error",
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
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
