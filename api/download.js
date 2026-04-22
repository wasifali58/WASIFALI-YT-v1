// PROFESSIONAL YOUTUBE DOWNLOADER API
// Based on ytdownloadpro.com - All Qualities
// Developer: WASIF ALI | Telegram: @FREEHACKS95

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET request - API info
  if (req.method === 'GET' && !req.query.url) {
    return res.status(200).json({
      name: "Professional YouTube Downloader API",
      version: "2.0.0",
      usage: "/api/download?url=YOUTUBE_URL",
      qualities: ["MP3", "140p", "360p", "480p", "720p", "1080p", "4K", "8K"],
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });
  }

  try {
    let videoUrl = req.query.url || req.body?.url;
    if (!videoUrl) {
      return res.status(400).json({
        error: "Missing url parameter",
        developer: "WASIF ALI",
        telegram: "@FREEHACKS95"
      });
    }

    const videoId = extractVideoId(videoUrl);
    
    // Step 1: Get video metadata and links
    const formData = new URLSearchParams();
    formData.append('action', 'meta');
    formData.append('videoUrl', `https://youtu.be/${videoId}`);

    const response = await fetch("https://ytdownloadpro.com/youtube_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
        "Origin": "https://ytdownloadpro.com",
        "Referer": "https://ytdownloadpro.com/"
      },
      body: formData
    });

    const data = await response.json();

    // Extract all available qualities
    const qualities = [];
    const allQualities = ["MP3", "140p", "360p", "480p", "720p", "1080p", "4K", "8K"];
    
    // Check different response structures
    if (data.links) {
      // Audio
      if (data.links.mp3) {
        qualities.push({
          quality: "MP3 Audio",
          url: data.links.mp3,
          type: "audio",
          format: "mp3"
        });
      }
      
      // Video qualities
      const mp4 = data.links.mp4 || {};
      for (const q of allQualities) {
        const qualityKey = q === "MP3" ? null : q;
        if (qualityKey && mp4[qualityKey]) {
          qualities.push({
            quality: q,
            url: mp4[qualityKey],
            type: "video",
            format: "mp4"
          });
        }
      }
    }
    else if (data.formats && Array.isArray(data.formats)) {
      for (const fmt of data.formats) {
        const quality = fmt.quality || fmt.label;
        if (allQualities.includes(quality) || quality === "MP3 Audio") {
          qualities.push({
            quality: quality === "MP3 Audio" ? "MP3" : quality,
            url: fmt.url,
            type: fmt.type || (quality === "MP3 Audio" ? "audio" : "video"),
            size_mb: fmt.size ? (fmt.size / 1024 / 1024).toFixed(2) : null
          });
        }
      }
    }

    // Sort qualities in correct order
    const qualityOrder = ["MP3", "140p", "360p", "480p", "720p", "1080p", "4K", "8K"];
    qualities.sort((a, b) => qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality));

    // Return professional JSON response
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
      total_qualities: qualities.length,
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });

  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch video",
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
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
