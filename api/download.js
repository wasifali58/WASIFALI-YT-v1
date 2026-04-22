// PROFESSIONAL YOUTUBE DOWNLOADER API
// Exact implementation of ytdownloadpro.com
// Developer: WASIF ALI | Telegram: @FREEHACKS95

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET request - API documentation
  if (req.method === 'GET' && !req.query.url) {
    return res.status(200).json({
      name: "Professional YouTube Downloader API",
      version: "3.0.0",
      description: "Download YouTube videos in multiple qualities",
      endpoints: {
        download: {
          method: "GET",
          url: "/api/download?url=YOUTUBE_URL",
          example: "/api/download?url=https://youtu.be/UYW-Rjnv_U0"
        }
      },
      qualities: ["MP3", "140p", "360p", "480p", "720p", "1080p", "4K", "8K"],
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });
  }

  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Missing 'url' parameter",
        developer: "WASIF ALI",
        telegram: "@FREEHACKS95"
      });
    }

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: "Invalid YouTube URL",
        developer: "WASIF ALI",
        telegram: "@FREEHACKS95"
      });
    }

    // ========== STEP 1: Get video metadata (action=meta) ==========
    const metaFormData = new URLSearchParams();
    metaFormData.append('action', 'meta');
    metaFormData.append('videoUrl', `https://youtu.be/${videoId}`);

    const metaResponse = await fetch("https://ytdownloadpro.com/youtube_api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
        "Referer": "https://ytdownloadpro.com/",
        "Origin": "https://ytdownloadpro.com"
      },
      body: metaFormData
    });

    if (!metaResponse.ok) {
      throw new Error(`Metadata fetch failed: ${metaResponse.status}`);
    }

    const metaData = await metaResponse.json();

    // ========== STEP 2: Get download links for each quality ==========
    // List of all qualities (as per site)
    const qualityList = ["MP3", "140p", "360p", "480p", "720p", "1080p", "4K", "8K"];
    const qualities = [];

    for (const quality of qualityList) {
      // Map quality to format parameter
      let formatParam = quality;
      if (quality === "MP3") formatParam = "mp3";
      else if (quality === "140p") formatParam = "140p";
      else if (quality === "360p") formatParam = "360p";
      else if (quality === "480p") formatParam = "480p";
      else if (quality === "720p") formatParam = "720p";
      else if (quality === "1080p") formatParam = "1080p";
      else if (quality === "4K") formatParam = "4k";
      else if (quality === "8K") formatParam = "8k";

      const downloadFormData = new URLSearchParams();
      downloadFormData.append('action', 'start');
      downloadFormData.append('id', videoId);
      downloadFormData.append('format', formatParam);

      try {
        const downloadResponse = await fetch("https://ytdownloadpro.com/youtube_api.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
            "Referer": "https://ytdownloadpro.com/",
            "Origin": "https://ytdownloadpro.com"
          },
          body: downloadFormData
        });

        if (downloadResponse.ok) {
          const downloadData = await downloadResponse.json();
          if (downloadData.download_url || downloadData.url) {
            qualities.push({
              quality: quality,
              url: downloadData.download_url || downloadData.url,
              type: quality === "MP3" ? "audio" : "video"
            });
          }
        }
      } catch (err) {
        console.log(`Failed to get ${quality}: ${err.message}`);
      }
    }

    // ========== STEP 3: Return complete response ==========
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
      total_qualities: qualities.length,
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
      developer: "WASIF ALI",
      telegram: "@FREEHACKS95"
    });
  }
}

// Helper: Extract YouTube video ID from any URL
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /youtube\.com\/watch\?.*v=([^&\?\/]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Helper: Format duration (seconds to MM:SS or HH:MM:SS)
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "00:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
