import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

export const exerciseService = {
  /**
   * Get all exercises with optional filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Exercises data
   */
  async getExercises(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);
      if (params.bodyPart) queryParams.append('bodyPart', params.bodyPart);
      if (params.equipment) queryParams.append('equipment', params.equipment);
      if (params.target) queryParams.append('target', params.target);

      const response = await api.get(`/exercise/exercises?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get exercise by ID
   * @param {string} id - Exercise ID
   * @returns {Promise<Object>} Exercise data
   */
  async getExerciseById(id) {
    try {
      const response = await api.get(`/exercise/exercises/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get body parts list
   * @returns {Promise<Object>} Body parts data
   */
  async getBodyParts() {
    try {
      const response = await api.get('/exercise/bodyparts');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get equipment list
   * @returns {Promise<Object>} Equipment data
   */
  async getEquipment() {
    try {
      const response = await api.get('/exercise/equipment');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get target muscles list
   * @returns {Promise<Object>} Targets data
   */
  async getTargets() {
    try {
      const response = await api.get('/exercise/targets');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get exercises by body part
   * @param {string} bodyPart - Body part name
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Exercises data
   */
  async getExercisesByBodyPart(bodyPart, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);

      const response = await api.get(`/exercise/bodyparts/${bodyPart}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get exercises by equipment
   * @param {string} equipment - Equipment name
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Exercises data
   */
  async getExercisesByEquipment(equipment, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);

      const response = await api.get(`/exercise/equipment/${equipment}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get exercises by target muscle
   * @param {string} target - Target muscle name
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Exercises data
   */
  async getExercisesByTarget(target, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);

      const response = await api.get(`/exercise/targets/${target}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search exercises by name
   * @param {string} query - Search query
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Search results
   */
  async searchExercises(query, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      queryParams.append('q', query);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);

      const response = await api.get(`/exercise/search?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get curated exercise collections
   * @returns {Promise<Object>} Collections data
   */
  async getCollections() {
    try {
      const response = await api.get('/exercise/collections');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get exercises for a specific collection
   * @param {string} collectionId - Collection ID
   * @returns {Promise<Object>} Collection exercises
   */
  async getCollectionExercises(collectionId) {
    try {
      const response = await api.get(`/exercise/collections/${collectionId}/exercises`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download exercise video
   * @param {string} exerciseId - Exercise ID
   * @param {Object} options - Download options
   * @returns {Promise<Object>} Download information
   */
  async downloadExercise(exerciseId, options = {}) {
    try {
      const response = await api.post(`/exercise/exercises/${exerciseId}/download`, options);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get exercise statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getStatistics() {
    try {
      const response = await api.get('/exercise/statistics');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get popular exercises
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Popular exercises
   */
  async getPopularExercises(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);

      const response = await api.get(`/exercise/popular?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get recent exercises
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Recent exercises
   */
  async getRecentExercises(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);

      const response = await api.get(`/exercise/recent?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get exercise categories
   * @returns {Promise<Object>} Categories data
   */
  async getCategories() {
    try {
      const response = await api.get('/exercise/categories');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get exercises by category
   * @param {string} category - Category name
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Category exercises
   */
  async getExercisesByCategory(category, params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.offset) queryParams.append('offset', params.offset);

      const response = await api.get(`/exercise/categories/${category}?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Utility function to format exercise name
   * @param {string} name - Exercise name
   * @returns {string} Formatted name
   */
  formatExerciseName(name) {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  /**
   * Utility function to get exercise difficulty
   * @param {Object} exercise - Exercise object
   * @returns {string} Difficulty level
   */
  getExerciseDifficulty(exercise) {
    // This would be based on exercise properties
    // For now, return a default difficulty
    return 'Intermediate';
  },

  /**
   * Utility function to get exercise duration
   * @param {Object} exercise - Exercise object
   * @returns {string} Estimated duration
   */
  getExerciseDuration(exercise) {
    // This would be based on exercise properties
    // For now, return a default duration
    return '5-10 minutes';
  },

  /**
   * Utility function to get exercise calories
   * @param {Object} exercise - Exercise object
   * @returns {string} Estimated calories
   */
  getExerciseCalories(exercise) {
    // This would be based on exercise properties
    // For now, return a default calorie count
    return '50-100 calories';
  },

  /**
   * Utility function to validate exercise data
   * @param {Object} exercise - Exercise object
   * @returns {boolean} Is valid
   */
  validateExercise(exercise) {
    return exercise && 
           exercise.id && 
           exercise.name && 
           exercise.bodyPart && 
           exercise.equipment && 
           exercise.target &&
           exercise.gifUrl;
  },

  /**
   * Utility function to filter exercises
   * @param {Array} exercises - Array of exercises
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered exercises
   */
  filterExercises(exercises, filters = {}) {
    if (!exercises || !Array.isArray(exercises)) return [];

    return exercises.filter(exercise => {
      if (filters.bodyPart && exercise.bodyPart !== filters.bodyPart) return false;
      if (filters.equipment && exercise.equipment !== filters.equipment) return false;
      if (filters.target && exercise.target !== filters.target) return false;
      if (filters.search && !exercise.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  },

  /**
   * Utility function to sort exercises
   * @param {Array} exercises - Array of exercises
   * @param {string} sortBy - Sort criteria
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Array} Sorted exercises
   */
  sortExercises(exercises, sortBy = 'name', sortOrder = 'asc') {
    if (!exercises || !Array.isArray(exercises)) return [];

    return [...exercises].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  },
};

export default exerciseService;
