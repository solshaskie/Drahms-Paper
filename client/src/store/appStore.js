import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // UI State
      isDarkMode: true,
      sidebarOpen: false,
      loading: false,
      notifications: [],

      // Video State
      currentVideo: null,
      videoMetadata: null,
      videoFormats: null,
      downloadProgress: 0,
      downloadStatus: 'idle', // 'idle', 'downloading', 'completed', 'error'

      // Editor State
      editorState: {
        timeline: [],
        selectedClip: null,
        currentTime: 0,
        duration: 0,
        zoom: 1,
        isPlaying: false,
        volume: 1,
        muted: false,
      },

      // Exercise Library State
      exerciseLibrary: {
        exercises: [],
        collections: [],
        filters: {
          bodyPart: '',
          equipment: '',
          target: '',
        },
        searchQuery: '',
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
        },
      },

      // User Preferences
      preferences: {
        autoSave: true,
        quality: 'medium', // 'low', 'medium', 'high'
        outputFormat: 'mp4',
        defaultDuration: 30,
        theme: 'dark',
      },

      // Actions
      setDarkMode: (isDark) => set({ isDarkMode: isDark }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setLoading: (loading) => set({ loading }),
      
      // Video Actions
      setCurrentVideo: (video) => set({ currentVideo: video }),
      setVideoMetadata: (metadata) => set({ videoMetadata: metadata }),
      setVideoFormats: (formats) => set({ videoFormats: formats }),
      setDownloadProgress: (progress) => set({ downloadProgress: progress }),
      setDownloadStatus: (status) => set({ downloadStatus: status }),
      
      // Editor Actions
      updateEditorState: (updates) => 
        set((state) => ({
          editorState: { ...state.editorState, ...updates }
        })),
      
      addClipToTimeline: (clip) =>
        set((state) => ({
          editorState: {
            ...state.editorState,
            timeline: [...state.editorState.timeline, clip]
          }
        })),
      
      removeClipFromTimeline: (clipId) =>
        set((state) => ({
          editorState: {
            ...state.editorState,
            timeline: state.editorState.timeline.filter(clip => clip.id !== clipId)
          }
        })),
      
      updateClipInTimeline: (clipId, updates) =>
        set((state) => ({
          editorState: {
            ...state.editorState,
            timeline: state.editorState.timeline.map(clip =>
              clip.id === clipId ? { ...clip, ...updates } : clip
            )
          }
        })),
      
      selectClip: (clipId) =>
        set((state) => ({
          editorState: {
            ...state.editorState,
            selectedClip: clipId
          }
        })),
      
      setCurrentTime: (time) =>
        set((state) => ({
          editorState: {
            ...state.editorState,
            currentTime: time
          }
        })),
      
      setDuration: (duration) =>
        set((state) => ({
          editorState: {
            ...state.editorState,
            duration
          }
        })),
      
      setZoom: (zoom) =>
        set((state) => ({
          editorState: {
            ...state.editorState,
            zoom
          }
        })),
      
      togglePlayback: () =>
        set((state) => ({
          editorState: {
            ...state.editorState,
            isPlaying: !state.editorState.isPlaying
          }
        })),
      
      setVolume: (volume) =>
        set((state) => ({
          editorState: {
            ...state.editorState,
            volume
          }
        })),
      
      toggleMute: () =>
        set((state) => ({
          editorState: {
            ...state.editorState,
            muted: !state.editorState.muted
          }
        })),

      // Exercise Library Actions
      setExercises: (exercises) =>
        set((state) => ({
          exerciseLibrary: {
            ...state.exerciseLibrary,
            exercises
          }
        })),
      
      setCollections: (collections) =>
        set((state) => ({
          exerciseLibrary: {
            ...state.exerciseLibrary,
            collections
          }
        })),
      
      setFilters: (filters) =>
        set((state) => ({
          exerciseLibrary: {
            ...state.exerciseLibrary,
            filters: { ...state.exerciseLibrary.filters, ...filters }
          }
        })),
      
      setSearchQuery: (query) =>
        set((state) => ({
          exerciseLibrary: {
            ...state.exerciseLibrary,
            searchQuery: query
          }
        })),
      
      setPagination: (pagination) =>
        set((state) => ({
          exerciseLibrary: {
            ...state.exerciseLibrary,
            pagination: { ...state.exerciseLibrary.pagination, ...pagination }
          }
        })),

      // Preferences Actions
      updatePreferences: (updates) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates }
        })),

      // Notification Actions
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id: Date.now() }]
        })),
      
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
      
      clearNotifications: () => set({ notifications: [] }),

      // Reset Actions
      resetEditor: () =>
        set((state) => ({
          editorState: {
            timeline: [],
            selectedClip: null,
            currentTime: 0,
            duration: 0,
            zoom: 1,
            isPlaying: false,
            volume: 1,
            muted: false,
          }
        })),
      
      resetVideo: () =>
        set({
          currentVideo: null,
          videoMetadata: null,
          videoFormats: null,
          downloadProgress: 0,
          downloadStatus: 'idle',
        }),

      // Utility Actions
      getSelectedClip: () => {
        const state = get();
        return state.editorState.timeline.find(
          clip => clip.id === state.editorState.selectedClip
        );
      },
      
      getTimelineDuration: () => {
        const state = get();
        return state.editorState.timeline.reduce(
          (total, clip) => total + (clip.duration || 0), 0
        );
      },
    }),
    {
      name: 'live-wallpaper-creator-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        preferences: state.preferences,
        exerciseLibrary: {
          filters: state.exerciseLibrary.filters,
          searchQuery: state.exerciseLibrary.searchQuery,
          pagination: state.exerciseLibrary.pagination,
        },
      }),
    }
  )
);
