import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Star as StarIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const AboutPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <VideoIcon />,
      title: 'YouTube Integration',
      description: 'Seamlessly import videos from YouTube with automatic metadata extraction and format detection.',
      color: '#FF0000',
    },
    {
      icon: <EditIcon />,
      title: 'Advanced Video Editor',
      description: 'Professional timeline-based editor with trimming, cropping, and frame-by-frame controls.',
      color: '#925FF0',
    },
    {
      icon: <DownloadIcon />,
      title: 'High-Quality Export',
      description: 'Optimized MP4 output specifically designed for live wallpaper performance.',
      color: '#4CAF50',
    },
    {
      icon: <SettingsIcon />,
      title: 'Customizable Settings',
      description: 'Fine-tune quality, format, and performance settings to match your needs.',
      color: '#FF9800',
    },
  ];

  const technologies = [
    { name: 'React.js', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'Material-UI', category: 'UI' },
    { name: 'FFmpeg', category: 'Video Processing' },
    { name: 'YouTube Data API', category: 'API' },
    { name: 'ExerciseDB API', category: 'API' },
    { name: 'Zustand', category: 'State Management' },
    { name: 'React Query', category: 'Data Fetching' },
    { name: 'Framer Motion', category: 'Animations' },
  ];

  const stats = [
    { label: 'Videos Processed', value: '10,000+', icon: <VideoIcon /> },
    { label: 'Users Worldwide', value: '5,000+', icon: <StarIcon /> },
    { label: 'Countries', value: '50+', icon: <CodeIcon /> },
    { label: 'Uptime', value: '99.9%', icon: <SpeedIcon /> },
  ];

  return (
    <>
      <Helmet>
        <title>About - Live Wallpaper Creator</title>
        <meta name="description" content="Learn about the Live Wallpaper Creator project, its features, and the team behind it" />
      </Helmet>

      <Box sx={{ py: 4 }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h2"
              fontWeight={700}
              sx={{ mb: 2 }}
            >
              About Live Wallpaper Creator
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
            >
              A state-of-the-art web application that transforms any YouTube video into stunning live wallpapers with professional-grade editing capabilities.
            </Typography>
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                size="large"
                startIcon={<GitHubIcon />}
                href="https://github.com/your-username/live-wallpaper-creator"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<EmailIcon />}
                href="mailto:contact@live-wallpaper-creator.com"
              >
                Contact Us
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card sx={{ mb: 6 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" fontWeight={600} mb={3} textAlign="center">
                Our Mission
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, textAlign: 'center' }}>
                We believe that everyone deserves access to high-quality, personalized digital content. 
                Our mission is to bridge the gap between creativity and technology by providing a free, 
                powerful, and user-friendly platform for creating unique live wallpapers from any YouTube video. 
                Whether you're a content creator, fitness enthusiast, or simply someone who loves beautiful visuals, 
                our advanced video editor empowers you to transform your ideas into stunning live wallpapers.
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Typography variant="h3" fontWeight={600} textAlign="center" mb={4}>
            Key Features
          </Typography>
          <Grid container spacing={4} mb={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: `${feature.color}20`,
                        color: feature.color,
                        mb: 2,
                      }}
                    >
                      {React.cloneElement(feature.icon, { sx: { fontSize: 32 } })}
                    </Box>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card sx={{ mb: 6 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" fontWeight={600} textAlign="center" mb={4}>
                Project Statistics
              </Typography>
              <Grid container spacing={4}>
                {stats.map((stat, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Box textAlign="center">
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          backgroundColor: `${theme.palette.primary.main}20`,
                          color: theme.palette.primary.main,
                          mb: 2,
                        }}
                      >
                        {React.cloneElement(stat.icon, { sx: { fontSize: 24 } })}
                      </Box>
                      <Typography variant="h4" fontWeight={700} color="primary" mb={1}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Typography variant="h3" fontWeight={600} textAlign="center" mb={4}>
            Technology Stack
          </Typography>
          <Card sx={{ mb: 6 }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={2}>
                {technologies.map((tech, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Chip
                      label={tech.name}
                      variant="outlined"
                      sx={{
                        width: '100%',
                        height: 40,
                        '& .MuiChip-label': {
                          fontSize: '0.875rem',
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Typography variant="h3" fontWeight={600} textAlign="center" mb={4}>
            Why Choose Live Wallpaper Creator?
          </Typography>
          <Grid container spacing={4} mb={6}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <SecurityIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Free & Open Source
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completely free to use with no hidden costs or subscriptions. 
                    Open source code ensures transparency and community-driven development.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <SpeedIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    High Performance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Optimized for speed and efficiency. Fast video processing and 
                    smooth playback even on lower-end devices.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <CodeIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Professional Quality
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Industry-standard video processing with FFmpeg. 
                    Professional-grade editing tools and export options.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Typography variant="h3" fontWeight={600} textAlign="center" mb={4}>
            Meet the Team
          </Typography>
          <Card sx={{ mb: 6 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="body1" textAlign="center" sx={{ mb: 4 }}>
                Live Wallpaper Creator is developed by a passionate team of developers, 
                designers, and content creators who believe in the power of accessible technology.
              </Typography>
              
              <Box display="flex" justifyContent="center" gap={3} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  href="https://github.com/your-username"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TwitterIcon />}
                  href="https://twitter.com/livewallpaperapp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LinkedInIcon />}
                  href="https://linkedin.com/company/live-wallpaper-creator"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={600} mb={2}>
                Get in Touch
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Have questions, suggestions, or want to contribute? We'd love to hear from you!
              </Typography>
              <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<EmailIcon />}
                  href="mailto:contact@live-wallpaper-creator.com"
                >
                  Contact Us
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<GitHubIcon />}
                  href="https://github.com/your-username/live-wallpaper-creator/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Report Issue
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </>
  );
};

export default AboutPage;
