import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Slider,
  Paper,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  useTheme,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  SkipPrevious as PrevIcon,
  SkipNext as NextIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ContentCut as TrimIcon,
  Crop as CropIcon,
  Audiotrack as AudioIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  GridOn as GridIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  CropFree as CropFreeIcon,
  AspectRatio as AspectRatioIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/appStore';
import { youtubeService } from '../services/youtubeService';

const EditorPage = () => {
  const theme = useTheme();
  const playerRef = useRef(null);
  const timelineRef = useRef(null);
  
  const {
    currentVideo,
    editorState,
    updateEditorState,
    addClipToTimeline,
    removeClipFromTimeline,
    updateClipInTimeline,
    selectClip,
    setCurrentTime,
    setDuration,
    setZoom,
    togglePlayback,
    setVolume,
    toggleMute,
  } = useAppStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showTrimDialog, setShowTrimDialog] = useState(false);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const [selectedQuality, setSelectedQuality] = useState('medium');

  // Video player state
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMutedState] = useState(false);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDurationState] = useState(0);
  const [seeking, setSeeking] = useState(false);

  // Time input state
  const [startTimeInput, setStartTimeInput] = useState('0:00');
  const [endTimeInput, setEndTimeInput] = useState('0:30');
  const [currentTimeInput, setCurrentTimeInput] = useState('0:00');

  // Crop state
  const [cropSettings, setCropSettings] = useState({
    enabled: false,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    aspectRatio: '16:9',
    lockAspectRatio: true,
  });

  // Timeline selection state
  const [timelineSelection, setTimelineSelection] = useState({
    start: 0,
    end: 0,
    isSelecting: false,
  });

  useEffect(() => {
    if (currentVideo) {
      setDurationState(currentVideo.duration || 0);
      setTrimEnd(currentVideo.duration || 30);
      setEndTimeInput(formatTime(currentVideo.duration || 30));
    }
  }, [currentVideo]);

  useEffect(() => {
    setCurrentTimeInput(formatTime(played * duration));
  }, [played, duration]);

  const handlePlayPause = () => {
    setPlaying(!playing);
    togglePlayback();
  };

  const handleStop = () => {
    setPlaying(false);
    setPlayed(0);
    setCurrentTime(0);
    togglePlayback();
  };

  const handleSeek = (value) => {
    setSeeking(true);
    setPlayed(value);
    setCurrentTime(value * duration);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = (value) => {
    setSeeking(false);
    playerRef.current?.seekTo(value);
  };

  const handleProgress = (state) => {
    if (!seeking) {
      setPlayed(state.played);
      setLoaded(state.loaded);
      setCurrentTime(state.playedSeconds);
    }
  };

  const handleDuration = (duration) => {
    setDurationState(duration);
    setDuration(duration);
  };

  const handleVolumeChange = (event, newValue) => {
    setVolumeState(newValue);
    setVolume(newValue);
  };

  const handleMuteToggle = () => {
    setMutedState(!muted);
    toggleMute();
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(editorState.zoom * 1.2, 5);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(editorState.zoom / 1.2, 0.1);
    setZoom(newZoom);
  };

  // Time input handlers
  const parseTimeInput = (timeString) => {
    const parts = timeString.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  };

  const handleStartTimeChange = (value) => {
    setStartTimeInput(value);
    const seconds = parseTimeInput(value);
    setTrimStart(seconds);
    if (seconds >= trimEnd) {
      setTrimEnd(seconds + 30);
      setEndTimeInput(formatTime(seconds + 30));
    }
  };

  const handleEndTimeChange = (value) => {
    setEndTimeInput(value);
    const seconds = parseTimeInput(value);
    setTrimEnd(seconds);
  };

  const handleCurrentTimeChange = (value) => {
    setCurrentTimeInput(value);
    const seconds = parseTimeInput(value);
    const newPlayed = seconds / duration;
    setPlayed(newPlayed);
    setCurrentTime(seconds);
    playerRef.current?.seekTo(newPlayed);
  };

  const handleJumpToStart = () => {
    const newPlayed = trimStart / duration;
    setPlayed(newPlayed);
    setCurrentTime(trimStart);
    playerRef.current?.seekTo(newPlayed);
  };

  const handleJumpToEnd = () => {
    const newPlayed = trimEnd / duration;
    setPlayed(newPlayed);
    setCurrentTime(trimEnd);
    playerRef.current?.seekTo(newPlayed);
  };

  // Timeline selection handlers
  const handleTimelineMouseDown = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    
    setTimelineSelection({
      start: time,
      end: time,
      isSelecting: true,
    });
  };

  const handleTimelineMouseMove = (event) => {
    if (!timelineSelection.isSelecting) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    
    setTimelineSelection(prev => ({
      ...prev,
      end: Math.max(prev.start, time),
    }));
  };

  const handleTimelineMouseUp = () => {
    if (timelineSelection.isSelecting) {
      setTimelineSelection(prev => ({
        ...prev,
        isSelecting: false,
      }));
      
      // Apply selection to trim times
      setTrimStart(timelineSelection.start);
      setTrimEnd(timelineSelection.end);
      setStartTimeInput(formatTime(timelineSelection.start));
      setEndTimeInput(formatTime(timelineSelection.end));
    }
  };

  const handleTrim = () => {
    if (!currentVideo) return;

    const clip = {
      id: Date.now().toString(),
      type: 'video',
      source: currentVideo.url,
      startTime: trimStart,
      endTime: trimEnd,
      duration: trimEnd - trimStart,
      name: `Clip ${editorState.timeline.length + 1}`,
      cropSettings: cropSettings.enabled ? cropSettings : null,
    };

    addClipToTimeline(clip);
    setShowTrimDialog(false);
    toast.success('Clip added to timeline');
  };

  const handleCropApply = () => {
    setShowCropDialog(false);
    toast.success('Crop settings applied');
  };

  const handleExport = async () => {
    if (editorState.timeline.length === 0) {
      toast.error('No clips in timeline');
      return;
    }

    try {
      toast.loading('Exporting video...');
      
      // This would integrate with the backend export functionality
      // For now, we'll simulate the export process
      setTimeout(() => {
        toast.dismiss();
        toast.success('Video exported successfully!');
      }, 3000);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimelineSelectionStyle = () => {
    if (!timelineSelection.isSelecting && timelineSelection.start === timelineSelection.end) {
      return {};
    }
    
    const startPercent = (timelineSelection.start / duration) * 100;
    const endPercent = (timelineSelection.end / duration) * 100;
    
    return {
      position: 'absolute',
      left: `${startPercent}%`,
      width: `${endPercent - startPercent}%`,
      height: '100%',
      backgroundColor: 'rgba(146, 95, 240, 0.3)',
      border: '2px solid #925FF0',
      borderRadius: 4,
      pointerEvents: 'none',
    };
  };

  return (
    <>
      <Helmet>
        <title>Video Editor - Live Wallpaper Creator</title>
        <meta name="description" content="Advanced video editor with timeline-based editing, trimming, and audio manipulation" />
      </Helmet>

      <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight={600}>
              Video Editor
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => setShowSettings(true)}
              >
                Settings
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={editorState.timeline.length === 0}
              >
                Export
              </Button>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Main Editor Area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Video Preview */}
            <Box sx={{ p: 2, flex: '0 0 auto' }}>
              <Card>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      backgroundColor: '#000',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    {currentVideo ? (
                      <ReactPlayer
                        ref={playerRef}
                        url={currentVideo.url}
                        playing={playing}
                        volume={volume}
                        muted={muted}
                        onProgress={handleProgress}
                        onDuration={handleDuration}
                        onSeek={handleSeek}
                        width="100%"
                        height="400px"
                        controls={false}
                        style={{ backgroundColor: '#000' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: 400,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#1A1E26',
                          color: 'text.secondary',
                        }}
                      >
                        <Typography variant="h6">
                          No video loaded. Please select a video from the home page.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Enhanced Video Controls */}
            <Box sx={{ p: 2, flex: '0 0 auto' }}>
              <Card>
                <CardContent>
                  {/* Time Input Controls */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} mb={2}>
                      Time Controls
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Current Time"
                          value={currentTimeInput}
                          onChange={(e) => setCurrentTimeInput(e.target.value)}
                          onBlur={(e) => handleCurrentTimeChange(e.target.value)}
                          InputProps={{
                            startAdornment: <TimeIcon sx={{ mr: 1, fontSize: 16 }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Start Time"
                          value={startTimeInput}
                          onChange={(e) => handleStartTimeChange(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TrimIcon sx={{ fontSize: 16 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label="End Time"
                          value={endTimeInput}
                          onChange={(e) => handleEndTimeChange(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TrimIcon sx={{ fontSize: 16 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleJumpToStart}
                            disabled={!currentVideo}
                          >
                            Jump to Start
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleJumpToEnd}
                            disabled={!currentVideo}
                          >
                            Jump to End
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Enhanced Timeline Slider */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} mb={2}>
                      Timeline Selection
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        height: 60,
                        backgroundColor: '#1A1E26',
                        borderRadius: 1,
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        cursor: 'crosshair',
                        overflow: 'hidden',
                      }}
                      onMouseDown={handleTimelineMouseDown}
                      onMouseMove={handleTimelineMouseMove}
                      onMouseUp={handleTimelineMouseUp}
                      ref={timelineRef}
                    >
                      {/* Background grid */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: `
                            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)
                          `,
                          backgroundSize: '20px 20px',
                        }}
                      />
                      
                      {/* Time markers */}
                      {Array.from({ length: Math.floor(duration / 10) + 1 }).map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            position: 'absolute',
                            left: `${(i * 10 / duration) * 100}%`,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          }}
                        />
                      ))}

                      {/* Selection highlight */}
                      <Box sx={getTimelineSelectionStyle()} />

                      {/* Playhead */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `${played * 100}%`,
                          top: 0,
                          bottom: 0,
                          width: 2,
                          backgroundColor: '#925FF0',
                          zIndex: 2,
                        }}
                      />

                      {/* Time labels */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 20,
                          display: 'flex',
                          justifyContent: 'space-between',
                          px: 1,
                          fontSize: '10px',
                          color: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        {Array.from({ length: Math.floor(duration / 30) + 1 }).map((_, i) => (
                          <span key={i}>{formatTime(i * 30)}</span>
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  {/* Playback Controls */}
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton onClick={handlePlayPause} color="primary">
                          {playing ? <PauseIcon /> : <PlayIcon />}
                        </IconButton>
                        <IconButton onClick={handleStop}>
                          <StopIcon />
                        </IconButton>
                        <IconButton>
                          <PrevIcon />
                        </IconButton>
                        <IconButton>
                          <NextIcon />
                        </IconButton>
                      </Box>
                    </Grid>

                    {/* Volume Controls */}
                    <Grid item xs={12} md={3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton onClick={handleMuteToggle}>
                          {muted ? <MuteIcon /> : <VolumeIcon />}
                        </IconButton>
                        <Slider
                          value={volume}
                          onChange={handleVolumeChange}
                          min={0}
                          max={1}
                          step={0.1}
                          sx={{ width: 100 }}
                        />
                      </Box>
                    </Grid>

                    {/* Zoom Controls */}
                    <Grid item xs={12} md={3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton onClick={handleZoomOut}>
                          <ZoomOutIcon />
                        </IconButton>
                        <Typography variant="body2" sx={{ minWidth: 50 }}>
                          {Math.round(editorState.zoom * 100)}%
                        </Typography>
                        <IconButton onClick={handleZoomIn}>
                          <ZoomInIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Timeline Panel */}
          <Box sx={{ width: 400, borderLeft: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Timeline
              </Typography>
              
              <Box display="flex" gap={1} mb={2}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TrimIcon />}
                  onClick={() => setShowTrimDialog(true)}
                  disabled={!currentVideo}
                >
                  Trim
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CropIcon />}
                  onClick={() => setShowCropDialog(true)}
                  disabled={!currentVideo}
                >
                  Crop
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AudioIcon />}
                  disabled={!currentVideo}
                >
                  Audio
                </Button>
              </Box>
            </Box>

            {/* Timeline Clips */}
            <Box sx={{ p: 2, height: 'calc(100% - 120px)', overflow: 'auto' }}>
              {editorState.timeline.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary',
                  }}
                >
                  <TimelineIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body2" textAlign="center">
                    No clips in timeline
                  </Typography>
                  <Typography variant="caption" textAlign="center">
                    Add clips using the trim tool
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {editorState.timeline.map((clip, index) => (
                    <Card
                      key={clip.id}
                      sx={{
                        mb: 2,
                        cursor: 'pointer',
                        border: editorState.selectedClip === clip.id ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      }}
                      onClick={() => selectClip(clip.id)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {clip.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeClipFromTimeline(clip.id);
                            }}
                          >
                            <StopIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Box display="flex" gap={1} mb={1}>
                          <Chip
                            label={clip.type}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={formatTime(clip.duration)}
                            size="small"
                            variant="outlined"
                          />
                          {clip.cropSettings && (
                            <Chip
                              label="Cropped"
                              size="small"
                              variant="outlined"
                              color="secondary"
                            />
                          )}
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Enhanced Trim Dialog */}
        <Dialog
          open={showTrimDialog}
          onClose={() => setShowTrimDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Trim Video</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" mb={3}>
                Select start and end times for the clip. You can also use the timeline above to visually select the range.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Time (MM:SS)"
                    value={startTimeInput}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    helperText="Format: MM:SS (e.g., 1:30)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Time (MM:SS)"
                    value={endTimeInput}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    helperText="Format: MM:SS (e.g., 2:45)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: '#1A1E26', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Duration: {formatTime(trimEnd - trimStart)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start: {formatTime(trimStart)} | End: {formatTime(trimEnd)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowTrimDialog(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleTrim}>
              Add to Timeline
            </Button>
          </DialogActions>
        </Dialog>

        {/* Crop Dialog */}
        <Dialog
          open={showCropDialog}
          onClose={() => setShowCropDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Crop Video</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" mb={3}>
                Configure crop settings for the video. You can set the crop area and aspect ratio.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={cropSettings.enabled}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      />
                    }
                    label="Enable Cropping"
                  />
                </Grid>
                
                {cropSettings.enabled && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Aspect Ratio</InputLabel>
                        <Select
                          value={cropSettings.aspectRatio}
                          onChange={(e) => setCropSettings(prev => ({ ...prev, aspectRatio: e.target.value }))}
                          label="Aspect Ratio"
                        >
                          <MenuItem value="16:9">16:9 (Widescreen)</MenuItem>
                          <MenuItem value="4:3">4:3 (Standard)</MenuItem>
                          <MenuItem value="1:1">1:1 (Square)</MenuItem>
                          <MenuItem value="9:16">9:16 (Portrait)</MenuItem>
                          <MenuItem value="custom">Custom</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={cropSettings.lockAspectRatio}
                            onChange={(e) => setCropSettings(prev => ({ ...prev, lockAspectRatio: e.target.checked }))}
                          />
                        }
                        label="Lock Aspect Ratio"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="X Position (%)"
                        type="number"
                        value={cropSettings.x}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, x: parseFloat(e.target.value) || 0 }))}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Y Position (%)"
                        type="number"
                        value={cropSettings.y}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, y: parseFloat(e.target.value) || 0 }))}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Width (%)"
                        type="number"
                        value={cropSettings.width}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, width: parseFloat(e.target.value) || 100 }))}
                        inputProps={{ min: 1, max: 100, step: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Height (%)"
                        type="number"
                        value={cropSettings.height}
                        onChange={(e) => setCropSettings(prev => ({ ...prev, height: parseFloat(e.target.value) || 100 }))}
                        inputProps={{ min: 1, max: 100, step: 1 }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCropDialog(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleCropApply}>
              Apply Crop
            </Button>
          </DialogActions>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog
          open={showSettings}
          onClose={() => setShowSettings(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Export Settings</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Quality</InputLabel>
                  <Select
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    label="Quality"
                  >
                    <MenuItem value="low">Low (Small file size)</MenuItem>
                    <MenuItem value="medium">Medium (Balanced)</MenuItem>
                    <MenuItem value="high">High (Large file size)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Output Format</InputLabel>
                  <Select
                    value="mp4"
                    label="Output Format"
                    disabled
                  >
                    <MenuItem value="mp4">MP4 (Recommended)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettings(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default EditorPage;
