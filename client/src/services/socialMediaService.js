import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const socialMediaService = {
  /** Validate a Facebook URL */
  async validateFacebookUrl(url) {
    return await api.post('/social-media/facebook/validate', { url });
  },

  /** Validate an Instagram URL */
  async validateInstagramUrl(url) {
    return await api.post('/social-media/instagram/validate', { url });
  },

  /** Get Facebook video metadata */
  async getFacebookMetadata(url) {
    return await api.post('/social-media/facebook/metadata', { url });
  },

  /** Get Instagram video metadata */
  async getInstagramMetadata(url) {
    return await api.post('/social-media/instagram/metadata', { url });
  },

  /** Download Facebook video */
  async downloadFacebookVideo(url, format = 'videoandaudio', quality = 'highest') {
    return await api.post('/social-media/facebook/download', { url, format, quality });
  },

  /** Download Instagram video */
  async downloadInstagramVideo(url, format = 'videoandaudio', quality = 'highest') {
    return await api.post('/social-media/instagram/download', { url, format, quality });
  },

  /** Get download status for social media videos */
  async getDownloadStatus(platform, downloadId) {
    return await api.get(`/social-media/download/${platform}/${downloadId}/status`);
  },

  /** Utility function to detect platform from URL */
  detectPlatform(url) {
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      return 'facebook';
    } else if (url.includes('instagram.com')) {
      return 'instagram';
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    return null;
  },

  /** Utility function to validate URL format */
  validateUrlFormat(url) {
    const urlPattern = /^https?:\/\/.+/;
    return urlPattern.test(url);
  },

  /** Utility function to extract video ID from URL */
  extractVideoId(url, platform) {
    switch (platform) {
      case 'facebook':
        const fbPatterns = [
          /facebook\.com\/.*?\/videos\/(\d+)/,
          /facebook\.com\/video\.php\?v=(\d+)/,
          /fb\.watch\/([a-zA-Z0-9_-]+)/,
        ];
        for (const pattern of fbPatterns) {
          const match = url.match(pattern);
          if (match) return match[1];
        }
        break;
      
      case 'instagram':
        const igPatterns = [
          /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
          /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
          /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
        ];
        for (const pattern of igPatterns) {
          const match = url.match(pattern);
          if (match) return match[1];
        }
        break;
      
      case 'youtube':
        const ytPatterns = [
          /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
          /youtu\.be\/([a-zA-Z0-9_-]+)/,
        ];
        for (const pattern of ytPatterns) {
          const match = url.match(pattern);
          if (match) return match[1];
        }
        break;
    }
    return null;
  },

  /** Utility function to format duration */
  formatDuration(seconds) {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  /** Utility function to format file size */
  formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  /** Get platform icon */
  getPlatformIcon(platform) {
    switch (platform) {
      case 'facebook':
        return '🔵'; // Facebook blue
      case 'instagram':
        return '🌈'; // Instagram gradient
      case 'youtube':
        return '🔴'; // YouTube red
      default:
        return '📹';
    }
  },

  /** Get platform name */
  getPlatformName(platform) {
    switch (platform) {
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'youtube':
        return 'YouTube';
      default:
        return 'Unknown';
    }
  },

  /** Get platform color */
  getPlatformColor(platform) {
    switch (platform) {
      case 'facebook':
        return '#1877F2';
      case 'instagram':
        return '#E4405F';
      case 'youtube':
        return '#FF0000';
      default:
        return '#666666';
    }
  },
};

export default socialMediaService;
