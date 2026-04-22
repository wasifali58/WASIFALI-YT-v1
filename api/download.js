// YOUTUBE DOWNLOADER API - EXACT MATCH TO YOUR CAPTURE
// Developer: WASIF ALI | Telegram: @FREEHACKS95

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET' && !req.query.url) {
    return res.status(200).json({
      message: "YouTube Downloader API - Working",
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

    // Step 1: Call the proxy EXACTLY as in your capture
    const formData = new URLSearchParams();
    formData.append('url', url);

    const proxyRes = await fetch("https://app.ytdown.to/proxy.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://app.ytdown.to/en25/",
        "Origin": "https://app.ytdown.to",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36"
      },
      body: formData
    });

    if (!proxyRes.ok) {
      throw new Error(`Proxy returned ${proxyRes.status}`);
    }

    // The proxy returns HTML/JSON with download links
    const text = await proxyRes.text();
    
    // Try to parse as JSON first
    let data = {};
    try {
      data = JSON.parse(text);
    } catch(e) {
      // If not JSON, it might be HTML - extract links from HTML
      console.log("Response is HTML, extracting links...");
      
      // Extract video ID
      const videoId = extractVideoId(url);
      
      // Look for direct download links in HTML
      const linkMatches = text.match(/https?:\/\/[^\s"']+\.(mp4|mp3)[^\s"']*/gi);
      const directLinks = linkMatches || [];
      
      // Extract title from HTML
      const titleMatch = text.match(/<title>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1].replace(' - ytdown', '') : "Video Title";
      
      // Extract thumbnail
      const thumbMatch = text.match(/https?:\/\/i\.ytimg\.com\/vi\/[^\/]+\/hqdefault\.jpg/i);
      const thumbnail = thumbMatch ? thumbMatch[0] : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      
      // Build qualities from found links
      const qualities = [];
      for (const link of directLinks) {
        if (link.includes('.mp4')) {
          qualities.push({
            quality: "720p",
            url: link,
            type: "video"
          });
        } else if (link.includes('.mp3')) {
          qualities.push({
            quality: "MP3 Audio",
            url: link,
            type: "audio"
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        video: {
          title: title,
          thumbnail: thumbnail,
          duration_seconds: 0,
          duration_formatted: "00:00",
          author: "YouTube",
          video_id: videoId,
          watch_url: `https://youtube.com/watch?v=${videoId}`
        },
        qualities: qualities,
        developer: "WASIF ALI",
        telegram: "@FREEHACKS95"
      });
    }

    // If JSON response, parse it
    const videoId = extractVideoId(url);
    const title = data.title || "Video Title";
    const thumbnail = data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const duration = data.duration || 0;
    const author = data.author || "Channel";

    // Build qualities from JSON
    const qualities = [];
    
    if (data.links) {
      if (data.links.mp3) {
        qualities.push({
          quality: "MP3 Audio",
          url: data.links.mp3,
          type: "audio"
        });
      }
      
      const mp4 = data.links.mp4 || {};
      if (mp4["360p"]) qualities.push({ quality: "360p", url: mp4["360p"], type: "video" });
      if (mp4["480p"]) qualities.push({ quality: "480p", url: mp4["480p"], type: "video" });
      if (mp4["720p"]) qualities.push({ quality: "720p", url: mp4["720p"], type: "video" });
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
