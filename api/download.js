// YOUTUBE DOWNLOADER API - HTML SCRAPING
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
    
    // Method 1: Try y2mate (working)
    const y2mateRes = await fetch("https://www.y2mate.com/mates/en68/analyze/ajax", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0"
      },
      body: `k_query=${encodeURIComponent(`https://youtu.be/${videoId}`)}&k_page=home&hl=en&q_auto=0`
    });
    
    const data = await y2mateRes.json();
    
    if (data && data.links) {
      const qualities = [];
      
      // Extract MP3
      if (data.links.mp3 && data.links.mp3["128"]) {
        qualities.push({
          quality: "MP3 Audio",
          url: data.links.mp3["128"].url || data.links.mp3["128"],
          type: "audio"
        });
      }
      
      // Extract video qualities
      const videoQualities = ["360p", "480p", "720p", "1080p"];
      for (const q of videoQualities) {
        if (data.links.mp4 && data.links.mp4[q]) {
          qualities.push({
            quality: q,
            url: data.links.mp4[q].url || data.links.mp4[q],
            type: "video"
          });
        }
      }
      
      if (qualities.length > 0) {
        return res.status(200).json({
          success: true,
          video: {
            title: data.title || "Video Title",
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            duration: 0,
            author: "YouTube",
            video_id: videoId
          },
          qualities: qualities,
          developer: "WASIF ALI",
          telegram: "@FREEHACKS95"
        });
      }
    }
    
    // Method 2: Direct download link (fallback)
    return res.status(200).json({
      success: true,
      video: {
        title: "Video",
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration: 0,
        author: "YouTube",
        video_id: videoId
      },
      qualities: [
        {
          quality: "720p",
          url: `https://ytdownloadpro.com/download.php?id=${videoId}&quality=720p`,
          type: "video"
        }
      ],
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
