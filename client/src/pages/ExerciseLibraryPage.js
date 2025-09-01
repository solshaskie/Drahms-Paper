import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  FitnessCenter as FitnessIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/appStore';
import { exerciseService } from '../services/exerciseService';

const ExerciseLibraryPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    exerciseLibrary,
    setExercises,
    setCollections,
    setFilters,
    setSearchQuery,
    setPagination,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');

  // Fetch exercises
  const {
    data: exercisesData,
    isLoading: exercisesLoading,
    error: exercisesError,
    refetch: refetchExercises,
  } = useQuery(
    ['exercises', exerciseLibrary.filters, exerciseLibrary.pagination],
    () => exerciseService.getExercises({
      ...exerciseLibrary.filters,
      limit: exerciseLibrary.pagination.limit,
      offset: (exerciseLibrary.pagination.page - 1) * exerciseLibrary.pagination.limit,
    }),
    {
      keepPreviousData: true,
    }
  );

  // Fetch collections
  const {
    data: collectionsData,
    isLoading: collectionsLoading,
    error: collectionsError,
  } = useQuery(
    ['collections'],
    () => exerciseService.getCollections(),
    {
      keepPreviousData: true,
    }
  );

  // Fetch filters
  const {
    data: filtersData,
    isLoading: filtersLoading,
  } = useQuery(
    ['filters'],
    () => Promise.all([
      exerciseService.getBodyParts(),
      exerciseService.getEquipment(),
      exerciseService.getTargets(),
    ]),
    {
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (exercisesData) {
      setExercises(exercisesData.exercises);
      setPagination({
        ...exerciseLibrary.pagination,
        total: exercisesData.pagination.total,
      });
    }
  }, [exercisesData, setExercises, setPagination, exerciseLibrary.pagination]);

  useEffect(() => {
    if (collectionsData) {
      setCollections(collectionsData.collections);
    }
  }, [collectionsData, setCollections]);

  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setPagination({ ...exerciseLibrary.pagination, page: 1 });
    refetchExercises();
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...exerciseLibrary.filters };
    newFilters[filterType] = value;
    setFilters(newFilters);
    setPagination({ ...exerciseLibrary.pagination, page: 1 });
  };

  const handlePageChange = (event, page) => {
    setPagination({ ...exerciseLibrary.pagination, page });
  };

  const handleDownload = (exercise) => {
    // This would integrate with the video download functionality
    toast.success(`Downloading ${exercise.name}...`);
  };

  const handleFavorite = (exercise) => {
    toast.success(`${exercise.name} added to favorites`);
  };

  const handleShare = (exercise) => {
    // This would implement sharing functionality
    toast.success(`Sharing ${exercise.name}...`);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderExerciseCard = (exercise) => (
    <motion.div
      key={exercise.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="200"
          image={exercise.gifUrl}
          alt={exercise.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" fontWeight={600} mb={1} sx={{ lineHeight: 1.2 }}>
            {exercise.name}
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            <Chip
              label={exercise.bodyPart}
              size="small"
              variant="outlined"
              color="primary"
            />
            <Chip
              label={exercise.equipment}
              size="small"
              variant="outlined"
            />
            <Chip
              label={exercise.target}
              size="small"
              variant="outlined"
            />
          </Box>

          <Box sx={{ mt: 'auto' }}>
            <Box display="flex" gap={1} mb={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<PlayIcon />}
                fullWidth
                onClick={() => handleDownload(exercise)}
              >
                Download
              </Button>
            </Box>
            
            <Box display="flex" gap={1}>
              <IconButton
                size="small"
                onClick={() => handleFavorite(exercise)}
                sx={{ flex: 1 }}
              >
                <FavoriteIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleShare(exercise)}
                sx={{ flex: 1 }}
              >
                <ShareIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderCollectionCard = (collection) => (
    <motion.div
      key={collection.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%', cursor: 'pointer' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FitnessIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mr: 2 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {collection.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {collection.description}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" mb={2}>
            {collection.exercises.length} exercises
          </Typography>
          
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setActiveTab(0);
              setFilters({ bodyPart: collection.bodyParts[0] });
            }}
          >
            View Collection
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <>
      <Helmet>
        <title>Exercise Library - Live Wallpaper Creator</title>
        <meta name="description" content="Browse our curated collection of fitness videos and exercise routines" />
      </Helmet>

      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{ mb: 2 }}
          >
            Exercise Library
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Discover curated fitness videos and exercise routines to create dynamic live wallpapers
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
          >
            <Tab label="All Exercises" />
            <Tab label="Collections" />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <>
            {/* Search and Filters */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Grid container spacing={3}>
                  {/* Search */}
                  <Grid item xs={12} md={6}>
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        placeholder="Search exercises..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSearch}
                        startIcon={<SearchIcon />}
                      >
                        Search
                      </Button>
                    </Box>
                  </Grid>

                  {/* Filters */}
                  <Grid item xs={12} md={6}>
                    <Box display="flex" gap={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Body Part</InputLabel>
                        <Select
                          value={selectedBodyPart}
                          onChange={(e) => {
                            setSelectedBodyPart(e.target.value);
                            handleFilterChange('bodyPart', e.target.value);
                          }}
                          label="Body Part"
                        >
                          <MenuItem value="">All</MenuItem>
                          {filtersData?.[0]?.bodyParts?.map((part) => (
                            <MenuItem key={part} value={part}>
                              {part}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel>Equipment</InputLabel>
                        <Select
                          value={selectedEquipment}
                          onChange={(e) => {
                            setSelectedEquipment(e.target.value);
                            handleFilterChange('equipment', e.target.value);
                          }}
                          label="Equipment"
                        >
                          <MenuItem value="">All</MenuItem>
                          {filtersData?.[1]?.equipment?.map((equipment) => (
                            <MenuItem key={equipment} value={equipment}>
                              {equipment}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel>Target</InputLabel>
                        <Select
                          value={selectedTarget}
                          onChange={(e) => {
                            setSelectedTarget(e.target.value);
                            handleFilterChange('target', e.target.value);
                          }}
                          label="Target"
                        >
                          <MenuItem value="">All</MenuItem>
                          {filtersData?.[2]?.targets?.map((target) => (
                            <MenuItem key={target} value={target}>
                              {target}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Exercises Grid */}
            {exercisesLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            ) : exercisesError ? (
              <Alert severity="error" sx={{ mb: 4 }}>
                Failed to load exercises. Please try again.
              </Alert>
            ) : (
              <>
                <Grid container spacing={3} mb={4}>
                  {exerciseLibrary.exercises.map((exercise) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={exercise.id}>
                      {renderExerciseCard(exercise)}
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {exerciseLibrary.pagination.total > exerciseLibrary.pagination.limit && (
                  <Box display="flex" justifyContent="center">
                    <Pagination
                      count={Math.ceil(exerciseLibrary.pagination.total / exerciseLibrary.pagination.limit)}
                      page={exerciseLibrary.pagination.page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 1 && (
          <>
            {/* Collections */}
            {collectionsLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress />
              </Box>
            ) : collectionsError ? (
              <Alert severity="error" sx={{ mb: 4 }}>
                Failed to load collections. Please try again.
              </Alert>
            ) : (
              <Grid container spacing={4}>
                {exerciseLibrary.collections.map((collection) => (
                  <Grid item xs={12} sm={6} md={4} key={collection.id}>
                    {renderCollectionCard(collection)}
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>
    </>
  );
};

export default ExerciseLibraryPage;
