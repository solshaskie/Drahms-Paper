import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  YouTube as YouTubeIcon,
  VideoLibrary as VideoIcon,
  Audiotrack as AudioIcon,
  Settings as SettingsIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/appStore';
import { youtubeService } from '../services/youtubeService';
import { socialMediaService } from '../services/socialMediaService';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const {
    currentVideo,
    videoMetadata,
    downloadProgress,
    downloadStatus,
    setCurrentVideo,
    setVideoMetadata,
    setDownloadProgress,
    setDownloadStatus,
  } = useAppStore();

  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('videoandaudio');
  const [selectedQuality, setSelectedQuality] = useState('highest');
  const [detectedPlatform, setDetectedPlatform] = useState(null);

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a video URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Detect platform
      const platform = socialMediaService.detectPlatform(url);
      setDetectedPlatform(platform);

      if (!platform) {
        setError('Unsupported platform. Please enter a YouTube, Facebook, or Instagram URL');
        return;
      }

      let validation, metadata;

      // Validate URL based on platform
      switch (platform) {
        case 'youtube':
          validation = await youtubeService.validateUrl(url);
          if (!validation.valid) {
            setError('Invalid YouTube URL');
            return;
          }
          metadata = await youtubeService.getMetadata(url);
          break;
        
        case 'facebook':
          validation = await socialMediaService.validateFacebookUrl(url);
          if (!validation.valid) {
            setError('Invalid Facebook URL');
            return;
          }
          metadata = await socialMediaService.getFacebookMetadata(url);
          break;
        
        case 'instagram':
          validation = await socialMediaService.validateInstagramUrl(url);
          if (!validation.valid) {
            setError('Invalid Instagram URL');
            return;
          }
          metadata = await socialMediaService.getInstagramMetadata(url);
          break;
        
        default:
          setError('Unsupported platform');
          return;
      }

      setVideoMetadata(metadata);
      setCurrentVideo({ url, platform, ...metadata });
      
      toast.success(`${socialMediaService.getPlatformName(platform)} video loaded successfully!`);
    } catch (err) {
      setError(err.message || 'Failed to load video');
      toast.error('Failed to load video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!currentVideo) return;

    setDownloadStatus('downloading');
    setShowDownloadDialog(false);

    try {
      let download;

      // Download based on platform
      switch (currentVideo.platform) {
        case 'youtube':
          download = await youtubeService.downloadVideo(url, selectedFormat, selectedQuality);
          break;
        
        case 'facebook':
          download = await socialMediaService.downloadFacebookVideo(url, selectedFormat, selectedQuality);
          break;
        
        case 'instagram':
          download = await socialMediaService.downloadInstagramVideo(url, selectedFormat, selectedQuality);
          break;
        
        default:
          throw new Error('Unsupported platform');
      }
      
      // Poll for download status
      const pollStatus = async () => {
        let status;
        
        if (currentVideo.platform === 'youtube') {
          status = await youtubeService.getDownloadStatus(download.downloadId);
        } else {
          status = await socialMediaService.getDownloadStatus(currentVideo.platform, download.downloadId);
        }
        
        setDownloadProgress(status.progress || 0);
        
        if (status.status === 'completed') {
          setDownloadStatus('completed');
          toast.success('Download completed!');
          navigate('/editor');
        } else if (status.status === 'error') {
          setDownloadStatus('error');
          toast.error('Download failed');
        } else {
          setTimeout(pollStatus, 1000);
        }
      };

      pollStatus();
    } catch (err) {
      setDownloadStatus('error');
      toast.error('Download failed');
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <Helmet>
        <title>Live Wallpaper Creator - Create Stunning Live Wallpapers</title>
        <meta name="description" content="Transform any YouTube video into a beautiful live wallpaper with our advanced video editor. Free, powerful, and easy to use." />
      </Helmet>

      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                background: 'linear-gradient(135deg, #925FF0 0%, #B07DFF 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Live Wallpaper Creator
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
            >
              Transform any YouTube, Facebook, or Instagram video into a stunning live wallpaper with our advanced video editor
            </Typography>
          </Box>
        </motion.div>

        {/* URL Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                {detectedPlatform ? (
                  <>
                    {detectedPlatform === 'youtube' && <YouTubeIcon sx={{ fontSize: 32, color: '#FF0000', mr: 2 }} />}
                    {detectedPlatform === 'facebook' && <FacebookIcon sx={{ fontSize: 32, color: '#1877F2', mr: 2 }} />}
                    {detectedPlatform === 'instagram' && <InstagramIcon sx={{ fontSize: 32, color: '#E4405F', mr: 2 }} />}
                    <Typography variant="h5" fontWeight={600}>
                      {detectedPlatform === 'youtube' && 'Enter YouTube URL'}
                      {detectedPlatform === 'facebook' && 'Enter Facebook URL'}
                      {detectedPlatform === 'instagram' && 'Enter Instagram URL'}
                    </Typography>
                  </>
                ) : (
                  <>
                    <VideoIcon sx={{ fontSize: 32, color: '#925FF0', mr: 2 }} />
                    <Typography variant="h5" fontWeight={600}>
                      Enter Video URL
                    </Typography>
                  </>
                )}
              </Box>

              <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder={
                          detectedPlatform === 'youtube' ? "https://www.youtube.com/watch?v=..." :
                          detectedPlatform === 'facebook' ? "https://www.facebook.com/.../videos/..." :
                          detectedPlatform === 'instagram' ? "https://www.instagram.com/p/..." :
                          "https://www.youtube.com/watch?v=... or https://www.facebook.com/.../videos/... or https://www.instagram.com/p/..."
                        }
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        error={!!error}
                        helperText={error}
                        disabled={isLoading}
                        sx={{ flexGrow: 1 }}
                      />
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleUrlSubmit}
                  disabled={isLoading || !url.trim()}
                                          startIcon={
                          isLoading ? <LinearProgress /> :
                          detectedPlatform === 'youtube' ? <YouTubeIcon /> :
                          detectedPlatform === 'facebook' ? <FacebookIcon /> :
                          detectedPlatform === 'instagram' ? <InstagramIcon /> :
                          <VideoIcon />
                        }
                  sx={{ minWidth: 120 }}
                >
                  {isLoading ? 'Loading...' : 'Load Video'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Video Preview */}
        {videoMetadata && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card sx={{ maxWidth: 1000, mx: 'auto', mb: 4 }}>
              <CardContent sx={{ p: 0 }}>
                {/* Video Thumbnail */}
                <CardMedia
                  component="img"
                  height="400"
                  image={videoMetadata.thumbnail}
                  alt={videoMetadata.title}
                  sx={{ objectFit: 'cover' }}
                />
                
                <Box sx={{ p: 3 }}>
                  {/* Platform Info */}
                  <Box display="flex" alignItems="center" mb={2}>
                    {currentVideo.platform === 'youtube' && <YouTubeIcon sx={{ color: '#FF0000', mr: 1 }} />}
                    {currentVideo.platform === 'facebook' && <FacebookIcon sx={{ color: '#1877F2', mr: 1 }} />}
                    {currentVideo.platform === 'instagram' && <InstagramIcon sx={{ color: '#E4405F', mr: 1 }} />}
                    <Chip
                      label={socialMediaService.getPlatformName(currentVideo.platform)}
                      size="small"
                      sx={{
                        backgroundColor: socialMediaService.getPlatformColor(currentVideo.platform),
                        color: 'white',
                        mr: 2
                      }}
                    />
                  </Box>
                  
                  {/* Video Info */}
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    {videoMetadata.title}
                  </Typography>
                  
                  <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                    <Chip
                      icon={<InfoIcon />}
                      label={`Duration: ${formatDuration(videoMetadata.duration)}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      icon={<YouTubeIcon />}
                      label={`Views: ${parseInt(videoMetadata.viewCount).toLocaleString()}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      icon={<VideoIcon />}
                      label={`Author: ${videoMetadata.author}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  {/* Action Buttons */}
                  <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<DownloadIcon />}
                      onClick={() => setShowDownloadDialog(true)}
                      sx={{ flexGrow: 1 }}
                    >
                      Download & Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<EditIcon />}
                      onClick={() => navigate('/editor')}
                      sx={{ flexGrow: 1 }}
                    >
                      Open Editor
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Download Progress */}
        {downloadStatus === 'downloading' && (
          <Card sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Downloading Video...
              </Typography>
              <LinearProgress
                variant="determinate"
                value={downloadProgress}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" mt={1}>
                {downloadProgress}% complete
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Grid container spacing={4} sx={{ mt: 8 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <VideoIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Advanced Video Editor
                  </Typography>
                  <Typography color="text.secondary">
                    Professional timeline-based editor with trimming, cropping, and frame-by-frame controls
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <AudioIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Audio Manipulation
                  </Typography>
                  <Typography color="text.secondary">
                    Waveform visualization, looping, and audio-video synchronization
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <SettingsIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Optimized Export
                  </Typography>
                  <Typography color="text.secondary">
                    High-efficiency encoding optimized for live wallpaper performance
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Download Dialog */}
        <Dialog
          open={showDownloadDialog}
          onClose={() => setShowDownloadDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Download Options</Typography>
              <IconButton onClick={() => setShowDownloadDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Download Format</InputLabel>
              <Select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                label="Download Format"
              >
                <MenuItem value="videoandaudio">Video & Audio</MenuItem>
                <MenuItem value="video">Video Only</MenuItem>
                <MenuItem value="audio">Audio Only</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Quality</InputLabel>
              <Select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                label="Quality"
              >
                <MenuItem value="highest">Highest</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setShowDownloadDialog(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleDownload}>
              Download
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default HomePage;
