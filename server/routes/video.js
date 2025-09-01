const express = require('express');
const router = express.Router();
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

// Get video information
router.post('/info', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    const filePath = req.file.path;
    
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error('FFprobe error:', err);
        return res.status(500).json({ error: 'Failed to analyze video' });
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

      const info = {
        fileName: req.file.originalname,
        filePath: req.file.path,
        size: req.file.size,
        duration: metadata.format.duration,
        format: metadata.format.format_name,
        video: videoStream ? {
          codec: videoStream.codec_name,
          width: videoStream.width,
          height: videoStream.height,
          fps: eval(videoStream.r_frame_rate),
          bitrate: videoStream.bit_rate
        } : null,
        audio: audioStream ? {
          codec: audioStream.codec_name,
          sampleRate: audioStream.sample_rate,
          channels: audioStream.channels,
          bitrate: audioStream.bit_rate
        } : null
      };

      res.json(info);
    });
  } catch (error) {
    console.error('Video info error:', error);
    res.status(500).json({ error: 'Failed to get video information' });
  }
});

// Trim video
router.post('/trim', async (req, res) => {
  try {
    const { inputPath, startTime, endTime, outputFormat = 'mp4' } = req.body;
    
    if (!inputPath || !startTime || !endTime) {
      return res.status(400).json({ error: 'Input path, start time, and end time are required' });
    }

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: 'Input video file not found' });
    }

    const outputId = uuidv4();
    const outputFileName = `trimmed_${outputId}.${outputFormat}`;
    const outputPath = path.join(__dirname, '../uploads', outputFileName);

    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(endTime - startTime)
      .outputOptions([
        '-c:v libx264',
        '-c:a aac',
        '-preset fast',
        '-crf 23'
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('Processing: ' + progress.percent + '% done');
      })
      .on('end', () => {
        console.log('Video trimming completed');
        res.json({
          success: true,
          outputPath,
          outputFileName,
          message: 'Video trimmed successfully'
        });
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).json({ error: 'Failed to trim video' });
      })
      .run();

  } catch (error) {
    console.error('Video trim error:', error);
    res.status(500).json({ error: 'Failed to trim video' });
  }
});

// Extract audio from video
router.post('/extract-audio', async (req, res) => {
  try {
    const { inputPath, outputFormat = 'mp3' } = req.body;
    
    if (!inputPath) {
      return res.status(400).json({ error: 'Input path is required' });
    }

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: 'Input video file not found' });
    }

    const outputId = uuidv4();
    const outputFileName = `audio_${outputId}.${outputFormat}`;
    const outputPath = path.join(__dirname, '../uploads', outputFileName);

    ffmpeg(inputPath)
      .outputOptions([
        '-vn', // No video
        '-acodec', outputFormat === 'mp3' ? 'libmp3lame' : 'aac',
        '-ab', '192k', // Audio bitrate
        '-ar', '44100' // Sample rate
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('Processing: ' + progress.percent + '% done');
      })
      .on('end', () => {
        console.log('Audio extraction completed');
        res.json({
          success: true,
          outputPath,
          outputFileName,
          message: 'Audio extracted successfully'
        });
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).json({ error: 'Failed to extract audio' });
      })
      .run();

  } catch (error) {
    console.error('Audio extraction error:', error);
    res.status(500).json({ error: 'Failed to extract audio' });
  }
});

// Merge video and audio
router.post('/merge', async (req, res) => {
  try {
    const { videoPath, audioPath, outputFormat = 'mp4' } = req.body;
    
    if (!videoPath || !audioPath) {
      return res.status(400).json({ error: 'Video and audio paths are required' });
    }

    if (!fs.existsSync(videoPath) || !fs.existsSync(audioPath)) {
      return res.status(404).json({ error: 'Input files not found' });
    }

    const outputId = uuidv4();
    const outputFileName = `merged_${outputId}.${outputFormat}`;
    const outputPath = path.join(__dirname, '../uploads', outputFileName);

    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions([
        '-c:v copy', // Copy video stream without re-encoding
        '-c:a aac', // Re-encode audio to AAC
        '-shortest' // End when shortest input ends
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('Processing: ' + progress.percent + '% done');
      })
      .on('end', () => {
        console.log('Video merge completed');
        res.json({
          success: true,
          outputPath,
          outputFileName,
          message: 'Video and audio merged successfully'
        });
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).json({ error: 'Failed to merge video and audio' });
      })
      .run();

  } catch (error) {
    console.error('Video merge error:', error);
    res.status(500).json({ error: 'Failed to merge video and audio' });
  }
});

// Convert video format
router.post('/convert', async (req, res) => {
  try {
    const { inputPath, outputFormat = 'mp4', quality = 'medium' } = req.body;
    
    if (!inputPath) {
      return res.status(400).json({ error: 'Input path is required' });
    }

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: 'Input video file not found' });
    }

    const outputId = uuidv4();
    const outputFileName = `converted_${outputId}.${outputFormat}`;
    const outputPath = path.join(__dirname, '../uploads', outputFileName);

    // Quality presets
    const qualitySettings = {
      low: { crf: 28, preset: 'ultrafast' },
      medium: { crf: 23, preset: 'fast' },
      high: { crf: 18, preset: 'medium' }
    };

    const settings = qualitySettings[quality] || qualitySettings.medium;

    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-c:a aac',
        `-preset ${settings.preset}`,
        `-crf ${settings.crf}`
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('Processing: ' + progress.percent + '% done');
      })
      .on('end', () => {
        console.log('Video conversion completed');
        res.json({
          success: true,
          outputPath,
          outputFileName,
          message: 'Video converted successfully'
        });
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).json({ error: 'Failed to convert video' });
      })
      .run();

  } catch (error) {
    console.error('Video conversion error:', error);
    res.status(500).json({ error: 'Failed to convert video' });
  }
});

// Optimize for live wallpaper
router.post('/optimize-wallpaper', async (req, res) => {
  try {
    const { inputPath, targetSize = 'medium' } = req.body;
    
    if (!inputPath) {
      return res.status(400).json({ error: 'Input path is required' });
    }

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: 'Input video file not found' });
    }

    const outputId = uuidv4();
    const outputFileName = `wallpaper_${outputId}.mp4`;
    const outputPath = path.join(__dirname, '../uploads', outputFileName);

    // Live wallpaper optimization settings
    const wallpaperSettings = {
      small: { width: 640, height: 360, crf: 25, fps: 24 },
      medium: { width: 1280, height: 720, crf: 23, fps: 30 },
      large: { width: 1920, height: 1080, crf: 20, fps: 30 }
    };

    const settings = wallpaperSettings[targetSize] || wallpaperSettings.medium;

    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-c:a aac',
        '-preset fast',
        `-crf ${settings.crf}`,
        `-vf scale=${settings.width}:${settings.height}`,
        `-r ${settings.fps}`,
        '-movflags +faststart', // Optimize for web playback
        '-pix_fmt yuv420p' // Ensure compatibility
      ])
      .output(outputPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('Processing: ' + progress.percent + '% done');
      })
      .on('end', () => {
        console.log('Wallpaper optimization completed');
        res.json({
          success: true,
          outputPath,
          outputFileName,
          settings,
          message: 'Video optimized for live wallpaper'
        });
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).json({ error: 'Failed to optimize video' });
      })
      .run();

  } catch (error) {
    console.error('Wallpaper optimization error:', error);
    res.status(500).json({ error: 'Failed to optimize video' });
  }
});

// Get processing status
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // This would typically check against a job queue or database
    // For now, we'll return a mock status
    res.json({
      jobId,
      status: 'completed',
      progress: 100,
      message: 'Processing completed'
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to get processing status' });
  }
});

// Clean up temporary files
router.delete('/cleanup', async (req, res) => {
  try {
    const { filePaths } = req.body;
    
    if (!Array.isArray(filePaths)) {
      return res.status(400).json({ error: 'File paths array is required' });
    }

    const cleanupResults = [];
    
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          await fs.remove(filePath);
          cleanupResults.push({ path: filePath, status: 'deleted' });
        } else {
          cleanupResults.push({ path: filePath, status: 'not_found' });
        }
      } catch (error) {
        cleanupResults.push({ path: filePath, status: 'error', error: error.message });
      }
    }

    res.json({
      success: true,
      results: cleanupResults,
      message: 'Cleanup completed'
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup files' });
  }
});

module.exports = router;
