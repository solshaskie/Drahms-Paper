import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred.');
    }
  }
);

export const youtubeService = {
  /**
   * Validate a YouTube URL
   * @param {string} url - YouTube URL to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateUrl(url) {
    try {
      const response = await api.post('/youtube/validate', { url });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get video metadata from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {Promise<Object>} Video metadata
   */
  async getMetadata(url) {
    try {
      const response = await api.post('/youtube/metadata', { url });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download video from YouTube
   * @param {string} url - YouTube URL
   * @param {string} format - Download format (video, audio, videoandaudio)
   * @param {string} quality - Quality setting
   * @returns {Promise<Object>} Download information
   */
  async downloadVideo(url, format = 'videoandaudio', quality = 'highest') {
    try {
      const response = await api.post('/youtube/download', {
        url,
        format,
        quality,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get download status
   * @param {string} downloadId - Download ID
   * @returns {Promise<Object>} Download status
   */
  async getDownloadStatus(downloadId) {
    try {
      const response = await api.get(`/youtube/download/${downloadId}/status`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get video information from uploaded file
   * @param {File} videoFile - Video file to analyze
   * @returns {Promise<Object>} Video information
   */
  async getVideoInfo(videoFile) {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const response = await api.post('/video/info', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Trim video
   * @param {string} inputPath - Input video path
   * @param {number} startTime - Start time in seconds
   * @param {number} endTime - End time in seconds
   * @param {string} outputFormat - Output format
   * @returns {Promise<Object>} Trim result
   */
  async trimVideo(inputPath, startTime, endTime, outputFormat = 'mp4') {
    try {
      const response = await api.post('/video/trim', {
        inputPath,
        startTime,
        endTime,
        outputFormat,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Extract audio from video
   * @param {string} inputPath - Input video path
   * @param {string} outputFormat - Output audio format
   * @returns {Promise<Object>} Audio extraction result
   */
  async extractAudio(inputPath, outputFormat = 'mp3') {
    try {
      const response = await api.post('/video/extract-audio', {
        inputPath,
        outputFormat,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Merge video and audio
   * @param {string} videoPath - Video file path
   * @param {string} audioPath - Audio file path
   * @param {string} outputFormat - Output format
   * @returns {Promise<Object>} Merge result
   */
  async mergeVideoAudio(videoPath, audioPath, outputFormat = 'mp4') {
    try {
      const response = await api.post('/video/merge', {
        videoPath,
        audioPath,
        outputFormat,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Convert video format
   * @param {string} inputPath - Input video path
   * @param {string} outputFormat - Output format
   * @param {string} quality - Quality setting
   * @returns {Promise<Object>} Conversion result
   */
  async convertVideo(inputPath, outputFormat = 'mp4', quality = 'medium') {
    try {
      const response = await api.post('/video/convert', {
        inputPath,
        outputFormat,
        quality,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Optimize video for live wallpaper
   * @param {string} inputPath - Input video path
   * @param {string} targetSize - Target size (small, medium, large)
   * @returns {Promise<Object>} Optimization result
   */
  async optimizeWallpaper(inputPath, targetSize = 'medium') {
    try {
      const response = await api.post('/video/optimize-wallpaper', {
        inputPath,
        targetSize,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get processing status
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} Processing status
   */
  async getProcessingStatus(jobId) {
    try {
      const response = await api.get(`/video/status/${jobId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Clean up temporary files
   * @param {string[]} filePaths - Array of file paths to clean up
   * @returns {Promise<Object>} Cleanup result
   */
  async cleanupFiles(filePaths) {
    try {
      const response = await api.delete('/video/cleanup', {
        data: { filePaths },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Utility function to format duration
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    if (!seconds) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Utility function to format file size
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Utility function to extract video ID from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {string} Video ID
   */
  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  },

  /**
   * Utility function to generate thumbnail URL
   * @param {string} videoId - YouTube video ID
   * @param {string} quality - Thumbnail quality (default, medium, high, standard, maxres)
   * @returns {string} Thumbnail URL
   */
  getThumbnailUrl(videoId, quality = 'maxres') {
    if (!videoId) return null;
    
    const qualities = {
      default: 'default.jpg',
      medium: 'mqdefault.jpg',
      high: 'hqdefault.jpg',
      standard: 'sddefault.jpg',
      maxres: 'maxresdefault.jpg',
    };
    
    return `https://img.youtube.com/vi/${videoId}/${qualities[quality] || qualities.maxres}`;
  },
};

export default youtubeService;
