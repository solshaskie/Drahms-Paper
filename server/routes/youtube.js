const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const ytdl = require('ytdl-core');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize YouTube API
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Validate YouTube URL
router.post('/validate', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const videoId = ytdl.getVideoID(url);
    
    res.json({ 
      valid: true, 
      videoId,
      message: 'Valid YouTube URL'
    });
  } catch (error) {
    console.error('YouTube URL validation error:', error);
    res.status(500).json({ error: 'Failed to validate YouTube URL' });
  }
});

// Get video metadata
router.post('/metadata', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Valid YouTube URL is required' });
    }

    const videoId = ytdl.getVideoID(url);
    
    // Get video info using ytdl-core
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;
    
    // Get additional metadata from YouTube API if available
    let apiMetadata = {};
    if (process.env.YOUTUBE_API_KEY) {
      try {
        const response = await youtube.videos.list({
          part: 'snippet,statistics,contentDetails',
          id: videoId
        });
        
        if (response.data.items && response.data.items.length > 0) {
          const item = response.data.items[0];
          apiMetadata = {
            viewCount: item.statistics.viewCount,
            likeCount: item.statistics.likeCount,
            commentCount: item.statistics.commentCount,
            duration: item.contentDetails.duration,
            tags: item.snippet.tags || [],
            categoryId: item.snippet.categoryId
          };
        }
      } catch (apiError) {
        console.warn('YouTube API error:', apiError.message);
      }
    }

    // Get available formats
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
    const videoFormats = ytdl.filterFormats(info.formats, 'videoonly');
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

    const metadata = {
      videoId,
      title: videoDetails.title,
      description: videoDetails.description,
      thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url,
      duration: videoDetails.lengthSeconds,
      author: videoDetails.author.name,
      viewCount: videoDetails.viewCount,
      ...apiMetadata,
      formats: {
        videoAndAudio: formats.map(f => ({
          itag: f.itag,
          quality: f.qualityLabel,
          container: f.container,
          size: f.contentLength
        })),
        videoOnly: videoFormats.map(f => ({
          itag: f.itag,
          quality: f.qualityLabel,
          container: f.container,
          size: f.contentLength
        })),
        audioOnly: audioFormats.map(f => ({
          itag: f.itag,
          quality: f.audioBitrate + 'kbps',
          container: f.container,
          size: f.contentLength
        }))
      }
    };

    res.json(metadata);
  } catch (error) {
    console.error('YouTube metadata error:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata' });
  }
});

// Download video
router.post('/download', async (req, res) => {
  try {
    const { url, format, itag } = req.body;
    
    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Valid YouTube URL is required' });
    }

    if (!format || !['video', 'audio', 'videoandaudio'].includes(format)) {
      return res.status(400).json({ error: 'Valid format is required' });
    }

    const videoId = ytdl.getVideoID(url);
    const downloadId = uuidv4();
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Ensure uploads directory exists
    await fs.ensureDir(uploadsDir);
    
    const fileName = `${downloadId}_${videoId}.${format === 'audio' ? 'mp3' : 'mp4'}`;
    const filePath = path.join(uploadsDir, fileName);

    // Configure download options
    const options = {
      quality: itag || (format === 'audio' ? 'highestaudio' : 'highest'),
      filter: format === 'audio' ? 'audioonly' : format === 'video' ? 'videoonly' : 'videoandaudio'
    };

    // Start download
    const stream = ytdl(url, options);
    const writeStream = fs.createWriteStream(filePath);

    stream.pipe(writeStream);

    // Track download progress
    let downloadedBytes = 0;
    let totalBytes = 0;

    stream.on('info', (info, format) => {
      totalBytes = parseInt(format.contentLength);
      console.log(`Starting download: ${fileName}`);
    });

    stream.on('data', (chunk) => {
      downloadedBytes += chunk.length;
    });

    stream.on('end', () => {
      console.log(`Download completed: ${fileName}`);
    });

    stream.on('error', (error) => {
      console.error('Download error:', error);
      fs.remove(filePath).catch(console.error);
    });

    writeStream.on('finish', () => {
      console.log(`File saved: ${fileName}`);
    });

    res.json({
      downloadId,
      fileName,
      format,
      status: 'downloading',
      message: 'Download started successfully'
    });

  } catch (error) {
    console.error('YouTube download error:', error);
    res.status(500).json({ error: 'Failed to start download' });
  }
});

// Get download status
router.get('/download/:downloadId/status', async (req, res) => {
  try {
    const { downloadId } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Check if file exists
    const files = await fs.readdir(uploadsDir);
    const file = files.find(f => f.startsWith(downloadId));
    
    if (!file) {
      return res.status(404).json({ error: 'Download not found' });
    }

    const filePath = path.join(uploadsDir, file);
    const stats = await fs.stat(filePath);
    
    res.json({
      downloadId,
      fileName: file,
      status: 'completed',
      size: stats.size,
      downloadUrl: `/uploads/${file}`
    });

  } catch (error) {
    console.error('Download status error:', error);
    res.status(500).json({ error: 'Failed to get download status' });
  }
});

module.exports = router;
