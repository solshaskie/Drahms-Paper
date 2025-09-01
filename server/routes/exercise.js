const express = require('express');
const router = express.Router();
const axios = require('axios');

// ExerciseDB API base URL
const EXERCISEDB_API_BASE = 'https://exercisedb.p.rapidapi.com';

// Configure axios for ExerciseDB API
const exerciseApi = axios.create({
  baseURL: EXERCISEDB_API_BASE,
  headers: {
    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
  }
});

// Debug: Log API key status
console.log('RapidAPI Key Status:', process.env.NEXT_PUBLIC_RAPIDAPI_KEY ? 'SET' : 'NOT SET');

// Fallback data for when API is unavailable
const fallbackData = {
  bodyParts: ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'],
  equipment: ['assisted', 'band', 'barbell', 'body weight', 'bosu ball', 'cable', 'dumbbell', 'elliptical machine', 'ez barbell', 'hammer', 'kettlebell', 'leverage machine', 'medicine ball', 'olympic barbell', 'resistance band', 'roller', 'rope', 'skierg machine', 'sled machine', 'smith machine', 'stability ball', 'stationary bike', 'stepmill machine', 'tire', 'trap bar', 'upper body ergometer', 'weighted', 'wheel roller'],
  targets: ['abductors', 'abs', 'adductors', 'biceps', 'calves', 'cardiovascular system', 'delts', 'forearms', 'glutes', 'hamstrings', 'lats', 'levator scapulae', 'pectorals', 'quads', 'serratus anterior', 'spine', 'traps', 'triceps', 'upper back'],
  exercises: [
    {
      id: '0001',
      name: 'Push-up',
      bodyPart: 'chest',
      equipment: 'body weight',
      target: 'pectorals',
      gifUrl: 'https://example.com/pushup.gif'
    },
    {
      id: '0002', 
      name: 'Squat',
      bodyPart: 'upper legs',
      equipment: 'body weight',
      target: 'quads',
      gifUrl: 'https://example.com/squat.gif'
    },
    {
      id: '0003',
      name: 'Pull-up',
      bodyPart: 'back',
      equipment: 'body weight', 
      target: 'lats',
      gifUrl: 'https://example.com/pullup.gif'
    }
  ]
};

// Get all exercises
router.get('/exercises', async (req, res) => {
  try {
    const { limit = 20, offset = 0, bodyPart, equipment, target } = req.query;
    
    let url = '/exercises';
    const params = new URLSearchParams();
    
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);
    if (bodyPart) params.append('bodyPart', bodyPart);
    if (equipment) params.append('equipment', equipment);
    if (target) params.append('target', target);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await exerciseApi.get(url);
    
    res.json({
      exercises: response.data,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: response.data.length
      }
    });
  } catch (error) {
    console.error('Exercise fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Get exercise by ID
router.get('/exercises/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await exerciseApi.get(`/exercises/exercise/${id}`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Exercise fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
});

// Get body parts
router.get('/bodyparts', async (req, res) => {
  try {
    const response = await exerciseApi.get('/exercises/bodyPartList');
    
    res.json({
      bodyParts: response.data
    });
  } catch (error) {
    console.error('Body parts fetch error:', error);
    console.log('Using fallback data for body parts');
    res.json({
      bodyParts: fallbackData.bodyParts
    });
  }
});

// Get equipment types
router.get('/equipment', async (req, res) => {
  try {
    const response = await exerciseApi.get('/exercises/equipmentList');
    
    res.json({
      equipment: response.data
    });
  } catch (error) {
    console.error('Equipment fetch error:', error);
    console.log('Using fallback data for equipment');
    res.json({
      equipment: fallbackData.equipment
    });
  }
});

// Get target muscles
router.get('/targets', async (req, res) => {
  try {
    const response = await exerciseApi.get('/exercises/targetList');
    
    res.json({
      targets: response.data
    });
  } catch (error) {
    console.error('Targets fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch targets' });
  }
});

// Get exercises by body part
router.get('/bodyparts/:bodyPart', async (req, res) => {
  try {
    const { bodyPart } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    let url = `/exercises/bodyPart/${bodyPart}`;
    const params = new URLSearchParams();
    
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await exerciseApi.get(url);
    
    res.json({
      exercises: response.data,
      bodyPart,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: response.data.length
      }
    });
  } catch (error) {
    console.error('Body part exercises fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch exercises for body part' });
  }
});

// Get exercises by equipment
router.get('/equipment/:equipment', async (req, res) => {
  try {
    const { equipment } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    let url = `/exercises/equipment/${equipment}`;
    const params = new URLSearchParams();
    
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await exerciseApi.get(url);
    
    res.json({
      exercises: response.data,
      equipment,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: response.data.length
      }
    });
  } catch (error) {
    console.error('Equipment exercises fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch exercises for equipment' });
  }
});

// Get exercises by target muscle
router.get('/targets/:target', async (req, res) => {
  try {
    const { target } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    let url = `/exercises/target/${target}`;
    const params = new URLSearchParams();
    
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await exerciseApi.get(url);
    
    res.json({
      exercises: response.data,
      target,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: response.data.length
      }
    });
  } catch (error) {
    console.error('Target exercises fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch exercises for target' });
  }
});

// Search exercises
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    let url = `/exercises/name/${q}`;
    const params = new URLSearchParams();
    
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await exerciseApi.get(url);
    
    res.json({
      exercises: response.data,
      query: q,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: response.data.length
      }
    });
  } catch (error) {
    console.error('Exercise search error:', error);
    res.status(500).json({ error: 'Failed to search exercises' });
  }
});

// Get curated exercise collections
router.get('/collections', async (req, res) => {
  try {
    // Define curated collections
    const collections = [
      {
        id: 'cardio',
        name: 'Cardio Workouts',
        description: 'High-intensity cardio exercises for heart health',
        bodyParts: ['cardio'],
        exercises: []
      },
      {
        id: 'strength',
        name: 'Strength Training',
        description: 'Build muscle and increase strength',
        bodyParts: ['upper arms', 'lower arms', 'chest', 'back', 'shoulders'],
        exercises: []
      },
      {
        id: 'flexibility',
        name: 'Flexibility & Stretching',
        description: 'Improve flexibility and range of motion',
        bodyParts: ['waist', 'hips', 'upper legs', 'lower legs'],
        exercises: []
      },
      {
        id: 'core',
        name: 'Core Workouts',
        description: 'Strengthen your core muscles',
        bodyParts: ['waist', 'back'],
        exercises: []
      }
    ];

    // Fetch exercises for each collection
    for (let collection of collections) {
      try {
        const response = await exerciseApi.get(`/exercises/bodyPart/${collection.bodyParts[0]}?limit=10`);
        collection.exercises = response.data.slice(0, 10);
      } catch (error) {
        console.warn(`Failed to fetch exercises for ${collection.name}:`, error.message);
        collection.exercises = [];
      }
    }

    res.json({ collections });
  } catch (error) {
    console.error('Collections fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch exercise collections' });
  }
});

module.exports = router;
