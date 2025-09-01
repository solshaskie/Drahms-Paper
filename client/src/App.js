import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Components
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import AboutPage from './pages/AboutPage';

// Theme
import { darkTheme } from './theme/theme';

// Store
import { useAppStore } from './store/appStore';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { isDarkMode } = useAppStore();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <Box
            sx={{
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #0A0D18 0%, #1A1E26 100%)',
              color: 'text.primary',
            }}
          >
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/editor" element={<EditorPage />} />
                  <Route path="/exercise-library" element={<ExerciseLibraryPage />} />
                  <Route path="/about" element={<AboutPage />} />
                </Routes>
              </Layout>
            </Router>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1A1E26',
                  color: '#FFFFFF',
                  border: '1px solid #925FF0',
                },
                success: {
                  iconTheme: {
                    primary: '#4CAF50',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#F44336',
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />
          </Box>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
