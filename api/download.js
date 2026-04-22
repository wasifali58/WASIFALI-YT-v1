// YOUTUBE DOWNLOADER API - USING YOUR PROXY ONLY
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

    console.log("Fetching video:", url);

    // EXACT capture from HTTP Canary - same headers, same everything
    const proxyRes = await fetch("https://app.ytdown.to/proxy.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://app.ytdown.to/en25/",
        "Origin": "https://app.ytdown.to",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "DNT": "1"
      },
      body: `url=${encodeURIComponent(url)}`
    });

    console.log("Proxy response status:", proxyRes.status);

    if (!proxyRes.ok) {
      throw new Error(`Proxy returned ${proxyRes.status}`);
    }

    const data = await proxyRes.json();
    console.log("Proxy response data:", JSON.stringify(data, null, 2));

    // Extract video metadata
    const videoId = extractVideoId(url);
    const title = data.title || "Video Title";
    const thumbnail = data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const duration = data.duration || 0;
    const author = data.author || data.channel || "Channel Name";
    const views = data.viewCount || data.views || 0;

    // Build qualities - exactly as per your proxy response
    const qualities = [];
    
    // Check different possible response structures
    if (data.links) {
      // Structure 1: { links: { mp4: { "360p": "url" }, mp3: "url" } }
      if (data.links.mp3) {
        qualities.push({
          quality: "MP3 Audio",
          url: data.links.mp3,
          type: "audio"
        });
      }
      
      if (data.links.mp4) {
        const mp4 = data.links.mp4;
        if (mp4["360p"] || mp4["360"]) {
          qualities.push({
            quality: "360p",
            url: mp4["360p"] || mp4["360"],
            type: "video"
          });
        }
        if (mp4["480p"] || mp4["480"]) {
          qualities.push({
            quality: "480p",
            url: mp4["480p"] || mp4["480"],
            type: "video"
          });
        }
        if (mp4["720p"] || mp4["720"]) {
          qualities.push({
            quality: "720p",
            url: mp4["720p"] || mp4["720"],
            type: "video"
          });
        }
      }
    } 
    else if (data.formats && Array.isArray(data.formats)) {
      // Structure 2: { formats: [{ quality: "360p", url: "..." }] }
      const formatMap = {};
      for (const fmt of data.formats) {
        const q = fmt.quality || fmt.label;
        if (q && fmt.url) formatMap[q] = fmt.url;
      }
      
      if (formatMap["mp3"] || data.mp3) {
        qualities.push({ quality: "MP3 Audio", url: formatMap["mp3"] || data.mp3, type: "audio" });
      }
      if (formatMap["360p"] || formatMap["360"]) {
        qualities.push({ quality: "360p", url: formatMap["360p"] || formatMap["360"], type: "video" });
      }
      if (formatMap["480p"] || formatMap["480"]) {
        qualities.push({ quality: "480p", url: formatMap["480p"] || formatMap["480"], type: "video" });
      }
      if (formatMap["720p"] || formatMap["720"]) {
        qualities.push({ quality: "720p", url: formatMap["720p"] || formatMap["720"], type: "video" });
      }
    }
    else if (data.download_url) {
      // Structure 3: Single download link
      qualities.push({
        quality: data.quality || "720p",
        url: data.download_url,
        type: "video"
      });
    }

    // Clean response - no expiry, no backend info
    return res.status(200).json({
      success: true,
      video: {
        title: title,
        thumbnail: thumbnail,
        duration_seconds: duration,
        duration_formatted: formatDuration(duration),
        author: author,
        view_count: views,
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
      error: err.message,
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
