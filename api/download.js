// PROFESSIONAL YOUTUBE DOWNLOADER API
// Exact copy of ytdownloadpro.com
// Developer: WASIF ALI | Telegram: @FREEHACKS95

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET' && !req.query.url) {
    return res.status(200).json({
      name: "YouTube Downloader API",
      usage: "/api/download?url=YOUTUBE_URL",
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });
  }

  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Missing url" });

    const videoId = extractVideoId(url);
    
    // Step 1: Get video metadata
    const formDataMeta = new URLSearchParams();
    formDataMeta.append('action', 'meta');
    formDataMeta.append('videoUrl', `https://youtu.be/${videoId}`);

    const metaRes = await fetch("https://ytdownloadpro.com/youtube_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
        "Referer": "https://ytdownloadpro.com/"
      },
      body: formDataMeta
    });

    const metaData = await metaRes.json();
    
    // Step 2: Get download links for each quality
    const qualities = [];
    const qualityList = ["MP3", "140p", "360p", "480p", "720p", "1080p", "4K", "8K"];
    
    for (const quality of qualityList) {
      const formDataDownload = new URLSearchParams();
      formDataDownload.append('action', 'start');
      formDataDownload.append('id', videoId);
      formDataDownload.append('format', quality === "MP3" ? "mp3" : quality);
      
      const downloadRes = await fetch("https://ytdownloadpro.com/youtube_api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
          "Referer": "https://ytdownloadpro.com/"
        },
        body: formDataDownload
      });
      
      const downloadData = await downloadRes.json();
      
      if (downloadData.download_url || downloadData.url) {
        qualities.push({
          quality: quality,
          url: downloadData.download_url || downloadData.url,
          type: quality === "MP3" ? "audio" : "video"
        });
      }
    }

    return res.status(200).json({
      success: true,
      video: {
        title: metaData.title || "Video Title",
        thumbnail: metaData.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration_seconds: metaData.duration || 0,
        duration_formatted: formatDuration(metaData.duration),
        author: metaData.author || "YouTube Channel",
        video_id: videoId,
        watch_url: `https://youtube.com/watch?v=${videoId}`
      },
      qualities: qualities,
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });

  } catch (err) {
    console.error(err);
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
