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
  auth: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
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
    
    // Try to get metadata from YouTube API first (more reliable)
    let metadata = {
      videoId,
      title: 'Video Title',
      description: 'Video description not available',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 0,
      author: 'Unknown Author',
      viewCount: 0,
      formats: {
        videoAndAudio: [],
        videoOnly: [],
        audioOnly: []
      }
    };

    // Try YouTube API first
    if (process.env.NEXT_PUBLIC_YOUTUBE_API_KEY) {
      try {
        const response = await youtube.videos.list({
          part: 'snippet,statistics,contentDetails',
          id: videoId
        });
        
        if (response.data.items && response.data.items.length > 0) {
          const item = response.data.items[0];
          metadata = {
            ...metadata,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || metadata.thumbnail,
            duration: item.contentDetails.duration,
            author: item.snippet.channelTitle,
            viewCount: item.statistics.viewCount,
            likeCount: item.statistics.likeCount,
            commentCount: item.statistics.commentCount,
            tags: item.snippet.tags || [],
            categoryId: item.snippet.categoryId
          };
        }
      } catch (apiError) {
        console.warn('YouTube API error:', apiError.message);
      }
    }

    // Try ytdl-core as fallback (but handle errors gracefully)
    try {
      const info = await ytdl.getInfo(url);
      const videoDetails = info.videoDetails;
      
      // Update metadata with ytdl-core data if available
      metadata = {
        ...metadata,
        title: videoDetails.title || metadata.title,
        description: videoDetails.description || metadata.description,
        thumbnail: videoDetails.thumbnails?.[videoDetails.thumbnails.length - 1]?.url || metadata.thumbnail,
        duration: videoDetails.lengthSeconds || metadata.duration,
        author: videoDetails.author?.name || metadata.author,
        viewCount: videoDetails.viewCount || metadata.viewCount
      };

      // Get available formats
      try {
        const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
        const videoFormats = ytdl.filterFormats(info.formats, 'videoonly');
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

        metadata.formats = {
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
        };
      } catch (formatError) {
        console.warn('Format extraction error:', formatError.message);
        // Keep default empty formats
      }
    } catch (ytdlError) {
      console.warn('ytdl-core error:', ytdlError.message);
      // Continue with API metadata only
    }

    res.json(metadata);
  } catch (error) {
    console.error('YouTube metadata error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch video metadata',
      message: 'YouTube download functionality may be temporarily unavailable. Try Facebook or Instagram videos instead.',
      fallback: true
    });
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

    try {
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

    } catch (ytdlError) {
      console.error('ytdl-core download error:', ytdlError);
      res.status(500).json({ 
        error: 'YouTube download currently unavailable',
        message: 'YouTube download functionality is temporarily unavailable due to recent changes. Try Facebook or Instagram videos instead.',
        fallback: true
      });
    }

  } catch (error) {
    console.error('YouTube download error:', error);
    res.status(500).json({ 
      error: 'Failed to start download',
      message: 'Try Facebook or Instagram videos instead.',
      fallback: true
    });
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
