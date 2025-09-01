import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#925FF0',
      light: '#B07DFF',
      dark: '#7B4FD9',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4CAF50',
      light: '#66BB6A',
      dark: '#388E3C',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0A0D18',
      paper: '#1A1E26',
      gradient: 'linear-gradient(135deg, #0A0D18 0%, #1A1E26 100%)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B8C1',
      disabled: '#6C757D',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    action: {
      active: '#925FF0',
      hover: 'rgba(146, 95, 240, 0.08)',
      selected: 'rgba(146, 95, 240, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    error: {
      main: '#F44336',
      light: '#E57373',
      dark: '#D32F2F',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Poppins", "Inter", sans-serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Poppins", "Inter", sans-serif',
      fontWeight: 600,
      fontSize: '2.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Poppins", "Inter", sans-serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Poppins", "Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: '"Poppins", "Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontFamily: '"Poppins", "Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
    caption: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.02em',
    },
    overline: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.2)',
    '0px 4px 8px rgba(0, 0, 0, 0.2)',
    '0px 8px 16px rgba(0, 0, 0, 0.2)',
    '0px 16px 32px rgba(0, 0, 0, 0.2)',
    '0px 32px 64px rgba(0, 0, 0, 0.2)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(146, 95, 240, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #925FF0 0%, #7B4FD9 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #B07DFF 0%, #925FF0 100%)',
          },
        },
        outlined: {
          borderColor: '#925FF0',
          color: '#925FF0',
          '&:hover': {
            borderColor: '#B07DFF',
            backgroundColor: 'rgba(146, 95, 240, 0.08)',
          },
        },
        text: {
          color: '#925FF0',
          '&:hover': {
            backgroundColor: 'rgba(146, 95, 240, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1E26',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 12,
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1E26',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: '#925FF0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#925FF0',
            },
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#925FF0',
          '& .MuiSlider-thumb': {
            backgroundColor: '#925FF0',
            '&:hover': {
              backgroundColor: '#B07DFF',
            },
          },
          '& .MuiSlider-track': {
            backgroundColor: '#925FF0',
          },
          '& .MuiSlider-rail': {
            backgroundColor: 'rgba(255, 255, 255, 0.23)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(26, 30, 38, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A1E26',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A1E26',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1A1E26',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 8,
          fontSize: '0.875rem',
        },
        arrow: {
          color: '#1A1E26',
        },
      },
    },
  },
});
