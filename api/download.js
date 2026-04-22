// YOUTUBE DOWNLOADER API - EXACT MATCH TO ytdownloadpro.com
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
    if (!url) return res.status(400).json({ error: "Missing url" });

    const videoId = extractVideoId(url);
    
    // First request: Get video info
    const formData = new URLSearchParams();
    formData.append('action', 'meta');
    formData.append('videoUrl', `https://youtu.be/${videoId}`);

    const metaResponse = await fetch("https://ytdownloadpro.com/youtube_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
        "Referer": "https://ytdownloadpro.com/",
        "Origin": "https://ytdownloadpro.com"
      },
      body: formData
    });

    const data = await metaResponse.json();
    
    // Build qualities array from response
    const qualities = [];
    
    if (data.links) {
      // MP3
      if (data.links.mp3) {
        qualities.push({ quality: "MP3", url: data.links.mp3, type: "audio" });
      }
      
      // Video qualities
      const mp4 = data.links.mp4 || {};
      const qualityMap = {
        "140p": mp4["140p"],
        "360p": mp4["360p"],
        "480p": mp4["480p"],
        "720p": mp4["720p"],
        "1080p": mp4["1080p"]
      };
      
      for (const [q, url] of Object.entries(qualityMap)) {
        if (url) qualities.push({ quality: q, url: url, type: "video" });
      }
    }

    return res.status(200).json({
      success: true,
      video: {
        title: data.title || "Video Title",
        thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration: data.duration || 0,
        author: data.author || "YouTube",
        video_id: videoId
      },
      qualities: qualities,
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });
  }
}

function extractVideoId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&\?\/]+)/);
  return match ? match[1] : null;
}
