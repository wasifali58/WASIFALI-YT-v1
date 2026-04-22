// PROFESSIONAL YOUTUBE DOWNLOADER API - WORKING
// Developer: WASIF ALI | Telegram: @FREEHACKS95

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET request without URL - API info
  if (req.method === 'GET' && !req.query.url) {
    return res.status(200).json({
      message: "YouTube Downloader API - Professional",
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

    // ========== METHOD 1: YT5s.com API (Working) ==========
    const yt5sResponse = await fetch("https://yt5s.com/api/ajaxSearch", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://yt5s.com/",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"
      },
      body: `q=${encodeURIComponent(url)}&vt=home`
    });

    let data = await yt5sResponse.json();

    // Check if YT5s worked
    if (data && data.links) {
      // Extract video metadata
      const videoId = extractVideoId(url);
      const title = data.title || "Unknown Title";
      const thumbnail = data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const duration = data.duration || 0;
      const author = data.author || "Unknown Channel";
      
      // Build qualities array
      const qualities = [];
      
      // MP3 Audio
      if (data.links.mp3) {
        qualities.push({
          quality: "MP3 Audio",
          url: data.links.mp3,
          type: "audio",
          size_mb: data.mp3_size || null
        });
      }
      
      // Video qualities
      const videoQualities = ["360p", "480p", "720p", "1080p"];
      for (const q of videoQualities) {
        if (data.links[q]) {
          qualities.push({
            quality: q,
            url: data.links[q],
            type: "video",
            size_mb: data[`${q}_size`] || null
          });
        }
      }

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
    }

    // ========== METHOD 2: Fallback API ==========
    const fallbackResponse = await fetch(`https://pwn.sh/tools/ytdl/get?url=${encodeURIComponent(url)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      
      if (fallbackData && fallbackData.urls) {
        const qualities = [];
        
        // Add MP3 if available
        if (fallbackData.audio && fallbackData.audio.url) {
          qualities.push({
            quality: "MP3 Audio",
            url: fallbackData.audio.url,
            type: "audio",
            size_mb: fallbackData.audio.size || null
          });
        }
        
        // Add video qualities
        const videoFormats = fallbackData.urls || [];
        const wanted = ["360p", "480p", "720p"];
        for (const fmt of videoFormats) {
          if (wanted.includes(fmt.quality) || fmt.quality === "MP3 Audio") {
            qualities.push({
              quality: fmt.quality,
              url: fmt.url,
              type: fmt.type || "video",
              size_mb: fmt.size || null
            });
          }
        }
        
        if (qualities.length > 0) {
          return res.status(200).json({
            success: true,
            video: {
              title: fallbackData.title || "Video Title",
              thumbnail: fallbackData.thumbnail || "",
              duration_seconds: fallbackData.duration || 0,
              duration_formatted: formatDuration(fallbackData.duration),
              author: fallbackData.author || "Unknown",
              video_id: extractVideoId(url),
              watch_url: url
            },
            qualities: qualities,
            developer: "WASIF ALI",
            telegram: "@FREEHACKS95"
          });
        }
      }
    }

    // ========== METHOD 3: Direct Proxy (Last Resort) ==========
    const directResponse = await fetch("https://app.ytdown.to/proxy.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://app.ytdown.to/en25/"
      },
      body: `url=${encodeURIComponent(url)}`
    });

    if (directResponse.ok) {
      const directData = await directResponse.json();
      
      if (directData && (directData.links || directData.download_url)) {
        const qualities = [];
        const mp4 = directData.links?.mp4 || {};
        
        if (directData.links?.mp3) {
          qualities.push({ quality: "MP3 Audio", url: directData.links.mp3, type: "audio" });
        }
        
        qualities.push({ quality: "360p", url: mp4["360p"] || mp4["360"], type: "video" });
        qualities.push({ quality: "480p", url: mp4["480p"] || mp4["480"], type: "video" });
        qualities.push({ quality: "720p", url: mp4["720p"] || mp4["720"], type: "video" });
        
        return res.status(200).json({
          success: true,
          video: {
            title: directData.title || "Video Title",
            thumbnail: directData.thumbnail || "",
            duration_seconds: directData.duration || 0,
            duration_formatted: formatDuration(directData.duration),
            author: directData.author || "Unknown",
            video_id: extractVideoId(url),
            watch_url: url
          },
          qualities: qualities.filter(q => q.url),
          developer: "WASIF ALI",
          telegram: "@FREEHACKS95"
        });
      }
    }

    // If all methods fail
    throw new Error("No working API available at this time");

  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch video data. Please try again.",
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });
  }
}

// Helper: Extract YouTube video ID
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

// Helper: Format duration
function formatDuration(sec) {
  if (!sec || sec <= 0) return "00:00";
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
