// YOUTUBE DOWNLOADER API - DIRECT VIDEO LINK FETCH
// Developer: WASIF ALI | Telegram: @FREEHACKS95

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET' && !req.query.url) {
    return res.status(200).json({
      message: "YouTube Downloader API - Direct Fetch",
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
    
    // === METHOD 1: Direct pwn.sh API (Working 100%) ===
    const pwnRes = await fetch(`https://pwn.sh/tools/ytdl/get?url=https://youtu.be/${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    
    if (pwnRes.ok) {
      const data = await pwnRes.json();
      
      if (data && data.urls && data.urls.length > 0) {
        const qualities = [];
        
        // Add MP3 if available
        if (data.audio && data.audio.url) {
          qualities.push({
            quality: "MP3 Audio",
            url: data.audio.url,
            type: "audio"
          });
        }
        
        // Add video qualities: 360p, 480p, 720p
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
        
        // If specific qualities missing, add best available
        if (qualities.filter(q => q.type === "video").length === 0 && videoUrls.length > 0) {
          qualities.push({
            quality: "720p",
            url: videoUrls[0].url,
            type: "video"
          });
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
    }
    
    // === METHOD 2: yt1s.com API (Fallback) ===
    const yt1sRes = await fetch("https://yt1s.com/api/ajaxSearch", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: `q=https://youtu.be/${videoId}&vt=home`
    });
    
    const yt1sData = await yt1sRes.json();
    
    if (yt1sData && yt1sData.links) {
