const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { spawn } = require('child_process');
const ytdlpPath = path.join(__dirname, '..', 'yt-dlp.exe');

// Helper function to run yt-dlp
const runYtdlp = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const args = [];
    
    // Add options
    if (options.dumpJson) args.push('--dump-json');
    if (options.noWarnings) args.push('--no-warnings');
    if (options.noCheckCertificate) args.push('--no-check-certificate');
    if (options.preferFreeFormats) args.push('--prefer-free-formats');
    if (options.output) args.push('-o', options.output);
    if (options.format) args.push('-f', options.format);
    if (options.extractAudio) args.push('-x');
    if (options.audioFormat) args.push('--audio-format', options.audioFormat);
    
    // Add URL
    args.push(url);
    
    const process = spawn(ytdlpPath, args);
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        try {
          const result = options.dumpJson ? JSON.parse(stdout) : stdout;
          resolve(result);
        } catch (error) {
          resolve(stdout);
        }
      } else {
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
};

// Helper function to extract video ID from Facebook URL
const extractFacebookVideoId = (url) => {
  const patterns = [
    /facebook\.com\/.*?\/videos\/(\d+)/,
    /facebook\.com\/video\.php\?v=(\d+)/,
    /fb\.watch\/([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Helper function to extract video ID from Instagram URL
const extractInstagramVideoId = (url) => {
  const patterns = [
    /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Validate Facebook URL
router.post('/facebook/validate', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Facebook URL is required' });
    }

    const videoId = extractFacebookVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid Facebook video URL' });
    }

    res.json({ 
      valid: true, 
      videoId,
      platform: 'facebook',
      message: 'Valid Facebook video URL'
    });
  } catch (error) {
    console.error('Facebook URL validation error:', error);
    res.status(500).json({ error: 'Failed to validate Facebook URL' });
  }
});

// Validate Instagram URL
router.post('/instagram/validate', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Instagram URL is required' });
    }

    const videoId = extractInstagramVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid Instagram video URL' });
    }

    res.json({ 
      valid: true, 
      videoId,
      platform: 'instagram',
      message: 'Valid Instagram video URL'
    });
  } catch (error) {
    console.error('Instagram URL validation error:', error);
    res.status(500).json({ error: 'Failed to validate Instagram URL' });
  }
});

// Get Facebook video metadata
router.post('/facebook/metadata', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Facebook URL is required' });
    }

    const videoId = extractFacebookVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid Facebook video URL' });
    }

    // Use yt-dlp to get accurate metadata
    try {
      const metadata = await runYtdlp(url, {
        dumpJson: true,
        noWarnings: true,
        noCheckCertificate: true,
        preferFreeFormats: true,
      });

      const result = {
        videoId,
        platform: 'facebook',
        title: metadata.title || `Facebook Video ${videoId}`,
        description: metadata.description || 'Facebook video content',
        thumbnail: metadata.thumbnail || null,
        duration: metadata.duration || null,
        author: metadata.uploader || metadata.channel || 'Facebook User',
        viewCount: metadata.view_count || null,
        videoUrl: url,
        formats: {
          videoAndAudio: metadata.formats ? metadata.formats
            .filter(f => f.vcodec !== 'none' && f.acodec !== 'none')
            .map(f => ({
              quality: f.format_note || f.height ? `${f.height}p` : 'Unknown',
              container: f.ext || 'mp4',
              size: f.filesize || null,
              url: f.url
            })) : [{
              quality: 'HD',
              container: 'mp4',
              size: null
            }]
        }
      };

      res.json(result);
    } catch (ytdlpError) {
      console.warn('yt-dlp metadata failed, using Puppeteer fallback:', ytdlpError.message);
      
      // Fallback to Puppeteer scraping
      let browser;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Navigate to the Facebook video page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait for video content to load
        await page.waitForSelector('video', { timeout: 10000 }).catch(() => {});
        
        // Extract metadata
        const metadata = await page.evaluate(() => {
          const video = document.querySelector('video');
          const titleElement = document.querySelector('h1, h2, [data-testid="post_message"]');
          const authorElement = document.querySelector('[data-testid="post_actor_name"]');
          
          return {
            title: titleElement ? titleElement.textContent.trim() : 'Facebook Video',
            description: document.querySelector('[data-testid="post_message"]')?.textContent?.trim() || '',
            duration: video ? video.duration : null,
            author: authorElement ? authorElement.textContent.trim() : 'Facebook User',
            thumbnail: video ? video.poster : null,
            videoUrl: video ? video.src : null
          };
        });
        
        const result = {
          videoId,
          platform: 'facebook',
          title: metadata.title,
          description: metadata.description,
          thumbnail: metadata.thumbnail,
          duration: metadata.duration,
          author: metadata.author,
          viewCount: null,
          videoUrl: metadata.videoUrl,
          formats: {
            videoAndAudio: [
              {
                quality: 'HD',
                container: 'mp4',
                size: null
              }
            ]
          }
        };

        res.json(result);
      } catch (scrapingError) {
        console.warn('Facebook scraping also failed, using basic fallback:', scrapingError.message);
        
        // Final fallback metadata
        const metadata = {
          videoId,
          platform: 'facebook',
          title: `Facebook Video ${videoId}`,
          description: 'Facebook video content',
          thumbnail: null,
          duration: null,
          author: 'Facebook User',
          viewCount: null,
          formats: {
            videoAndAudio: [
              {
                quality: 'HD',
                container: 'mp4',
                size: null
              }
            ]
          }
        };

        res.json(metadata);
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }
  } catch (error) {
    console.error('Facebook metadata error:', error);
    res.status(500).json({ error: 'Failed to get Facebook video metadata' });
  }
});

// Get Instagram video metadata
router.post('/instagram/metadata', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Instagram URL is required' });
    }

    const videoId = extractInstagramVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid Instagram video URL' });
    }

    // Use yt-dlp to get accurate metadata
    try {
      const metadata = await runYtdlp(url, {
        dumpJson: true,
        noWarnings: true,
        noCheckCertificate: true,
        preferFreeFormats: true,
      });

      const result = {
        videoId,
        platform: 'instagram',
        title: metadata.title || `Instagram Video ${videoId}`,
        description: metadata.description || 'Instagram video content',
        thumbnail: metadata.thumbnail || null,
        duration: metadata.duration || null,
        author: metadata.uploader || metadata.channel || 'Instagram User',
        viewCount: metadata.view_count || null,
        videoUrl: url,
        formats: {
          videoAndAudio: metadata.formats ? metadata.formats
            .filter(f => f.vcodec !== 'none' && f.acodec !== 'none')
            .map(f => ({
              quality: f.format_note || f.height ? `${f.height}p` : 'Unknown',
              container: f.ext || 'mp4',
              size: f.filesize || null,
              url: f.url
            })) : [{
              quality: 'HD',
              container: 'mp4',
              size: null
            }]
        }
      };

      res.json(result);
    } catch (ytdlpError) {
      console.warn('yt-dlp metadata failed, using Puppeteer fallback:', ytdlpError.message);
      
      // Fallback to Puppeteer scraping
      let browser;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Navigate to the Instagram post page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait for video content to load
        await page.waitForSelector('video', { timeout: 10000 }).catch(() => {});
        
        // Extract metadata
        const metadata = await page.evaluate(() => {
          const video = document.querySelector('video');
          const titleElement = document.querySelector('h1, h2, [data-testid="post_message"]');
          const authorElement = document.querySelector('[data-testid="post_actor_name"], a[role="link"]');
          const captionElement = document.querySelector('[data-testid="post_caption"]');
          
          return {
            title: titleElement ? titleElement.textContent.trim() : 'Instagram Video',
            description: captionElement ? captionElement.textContent.trim() : '',
            duration: video ? video.duration : null,
            author: authorElement ? authorElement.textContent.trim() : 'Instagram User',
            thumbnail: video ? video.poster : null,
            videoUrl: video ? video.src : null
          };
        });
        
        const result = {
          videoId,
          platform: 'instagram',
          title: metadata.title,
          description: metadata.description,
          thumbnail: metadata.thumbnail,
          duration: metadata.duration,
          author: metadata.author,
          viewCount: null,
          videoUrl: metadata.videoUrl,
          formats: {
            videoAndAudio: [
              {
                quality: 'HD',
                container: 'mp4',
                size: null
              }
            ]
          }
        };

        res.json(result);
      } catch (scrapingError) {
        console.warn('Instagram scraping also failed, using basic fallback:', scrapingError.message);
        
        // Final fallback metadata
        const metadata = {
          videoId,
          platform: 'instagram',
          title: `Instagram Video ${videoId}`,
          description: 'Instagram video content',
          thumbnail: null,
          duration: null,
          author: 'Instagram User',
          viewCount: null,
          formats: {
            videoAndAudio: [
              {
                quality: 'HD',
                container: 'mp4',
                size: null
              }
            ]
          }
        };

        res.json(metadata);
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }
  } catch (error) {
    console.error('Instagram metadata error:', error);
    res.status(500).json({ error: 'Failed to get Instagram video metadata' });
  }
});

// Download Facebook video (real download with yt-dlp)
router.post('/facebook/download', async (req, res) => {
  try {
    const { url, format = 'videoandaudio', quality = 'highest' } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Facebook URL is required' });
    }

    const videoId = extractFacebookVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid Facebook video URL' });
    }

    const downloadId = uuidv4();
    const uploadDir = path.join(__dirname, '..', 'uploads');
    const outputTemplate = path.join(uploadDir, `facebook_${videoId}_${downloadId}.%(ext)s`);

    // Ensure upload directory exists
    await fs.ensureDir(uploadDir);

    // Configure yt-dlp options based on format and quality
    let ytdlpOptions = {
      o: outputTemplate,
      noWarnings: true,
      noCheckCertificate: true,
    };

    // Set format based on user selection
    switch (format) {
      case 'video':
        ytdlpOptions.f = 'best[height<=1080]/best';
        break;
      case 'audio':
        ytdlpOptions.f = 'bestaudio/best';
        ytdlpOptions.x = true; // Extract audio
        ytdlpOptions.audioFormat = 'mp3';
        break;
      default: // videoandaudio
        ytdlpOptions.f = 'best[height<=1080]/best';
        break;
    }

    // Set quality preference
    switch (quality) {
      case 'low':
        ytdlpOptions.f = format === 'audio' ? 'worstaudio' : 'worst[height>=360]/worst';
        break;
      case 'medium':
        ytdlpOptions.f = format === 'audio' ? 'bestaudio[abr<=128]' : 'best[height<=720]/best';
        break;
      case 'high':
        ytdlpOptions.f = format === 'audio' ? 'bestaudio[abr<=256]' : 'best[height<=1080]/best';
        break;
      // 'highest' uses default settings
    }

    // Start download asynchronously
    runYtdlp(url, ytdlpOptions).then(() => {
      console.log(`[yt-dlp] Facebook download complete for ${videoId}`);
    }).catch((err) => {
      console.error('[yt-dlp] Facebook download error:', err.message);
    });

    res.json({
      downloadId,
      status: 'queued',
      message: 'Facebook video download started',
      platform: 'facebook',
      videoId,
      format,
      quality
    });

  } catch (error) {
    console.error('Facebook download error:', error);
    res.status(500).json({ error: 'Failed to download Facebook video' });
  }
});

// Download Instagram video (real download with yt-dlp)
router.post('/instagram/download', async (req, res) => {
  try {
    const { url, format = 'videoandaudio', quality = 'highest' } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Instagram URL is required' });
    }

    const videoId = extractInstagramVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid Instagram video URL' });
    }

    const downloadId = uuidv4();
    const uploadDir = path.join(__dirname, '..', 'uploads');
    const outputTemplate = path.join(uploadDir, `instagram_${videoId}_${downloadId}.%(ext)s`);

    // Ensure upload directory exists
    await fs.ensureDir(uploadDir);

    // Configure yt-dlp options based on format and quality
    let ytdlpOptions = {
      o: outputTemplate,
      noWarnings: true,
      noCheckCertificate: true,
    };

    // Set format based on user selection
    switch (format) {
      case 'video':
        ytdlpOptions.f = 'best[height<=1080]/best';
        break;
      case 'audio':
        ytdlpOptions.f = 'bestaudio/best';
        ytdlpOptions.x = true; // Extract audio
        ytdlpOptions.audioFormat = 'mp3';
        break;
      default: // videoandaudio
        ytdlpOptions.f = 'best[height<=1080]/best';
        break;
    }

    // Set quality preference
    switch (quality) {
      case 'low':
        ytdlpOptions.f = format === 'audio' ? 'worstaudio' : 'worst[height>=360]/worst';
        break;
      case 'medium':
        ytdlpOptions.f = format === 'audio' ? 'bestaudio[abr<=128]' : 'best[height<=720]/best';
        break;
      case 'high':
        ytdlpOptions.f = format === 'audio' ? 'bestaudio[abr<=256]' : 'best[height<=1080]/best';
        break;
      // 'highest' uses default settings
    }

    // Start download asynchronously
    runYtdlp(url, ytdlpOptions).then(() => {
      console.log(`[yt-dlp] Instagram download complete for ${videoId}`);
    }).catch((err) => {
      console.error('[yt-dlp] Instagram download error:', err.message);
    });

    res.json({
      downloadId,
      status: 'queued',
      message: 'Instagram video download started',
      platform: 'instagram',
      videoId,
      format,
      quality
    });

  } catch (error) {
    console.error('Instagram download error:', error);
    res.status(500).json({ error: 'Failed to download Instagram video' });
  }
});

// Get download status for social media videos
router.get('/download/:platform/:downloadId/status', async (req, res) => {
  try {
    const { platform, downloadId } = req.params;
    
    if (!['facebook', 'instagram'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    // Determine if a corresponding file exists
    const uploadDir = path.join(__dirname, '..', 'uploads');
    const files = await fs.readdir(uploadDir);
    const prefix = `${platform}_`;
    const match = files.find(f => f.includes(downloadId));

    if (match) {
      const filePath = path.join(uploadDir, match);
      const stats = await fs.stat(filePath);
      return res.json({
        downloadId,
        platform,
        status: 'completed',
        progress: 100,
        fileName: match,
        size: stats.size,
        downloadUrl: `/uploads/${match}`
      });
    }

    // Not found yet, still processing
    return res.json({
      downloadId,
      platform,
      status: 'processing',
      progress: 0,
      message: 'Download in progress'
    });

  } catch (error) {
    console.error('Social media download status error:', error);
    res.status(500).json({ error: 'Failed to get download status' });
  }
});

module.exports = router;
