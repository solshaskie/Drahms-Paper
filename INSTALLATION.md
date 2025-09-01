# Live Wallpaper Creator - Installation Guide

This guide will help you set up the Live Wallpaper Creator project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **FFmpeg** - [Download here](https://ffmpeg.org/download.html)
- **Git** - [Download here](https://git-scm.com/)

### FFmpeg Installation

#### Windows
1. Download FFmpeg from the official website
2. Extract the archive to a folder (e.g., `C:\ffmpeg`)
3. Add the `bin` folder to your system PATH
4. Verify installation: `ffmpeg -version`

#### macOS
```bash
# Using Homebrew
brew install ffmpeg

# Verify installation
ffmpeg -version
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/live-wallpaper-creator.git
cd live-wallpaper-creator
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Return to root directory
cd ..
```

### 3. Environment Configuration

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Edit the `.env` file and add your API keys:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key_here

# RapidAPI (for ExerciseDB)
RAPIDAPI_KEY=your_rapidapi_key_here

# File Upload Configuration
MAX_FILE_SIZE=500000000
UPLOAD_PATH=./server/uploads

# FFmpeg Configuration
FFMPEG_PATH=/usr/bin/ffmpeg
FFPROBE_PATH=/usr/bin/ffprobe

# Security
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
```

### 4. API Keys Setup

#### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Add the API key to your `.env` file

#### RapidAPI (ExerciseDB)
1. Go to [RapidAPI](https://rapidapi.com/)
2. Sign up for an account
3. Subscribe to the [ExerciseDB API](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb/)
4. Copy your API key and add it to your `.env` file

### 5. Create Upload Directory

```bash
mkdir -p server/uploads
```

### 6. Start the Application

#### Development Mode
```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

## Project Structure

```
live-wallpaper-creator/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   ├── theme/         # Material-UI theme
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── uploads/           # File uploads
│   └── package.json
├── package.json           # Root package.json
├── .env                   # Environment variables
└── README.md
```

## Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm start` - Start the production server
- `npm run install-all` - Install dependencies for all packages

### Backend (server/)
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### Frontend (client/)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Troubleshooting

### Common Issues

#### 1. FFmpeg Not Found
**Error**: `FFmpeg not found`
**Solution**: Ensure FFmpeg is installed and added to your system PATH

#### 2. Port Already in Use
**Error**: `EADDRINUSE`
**Solution**: Change the port in your `.env` file or kill the process using the port

#### 3. API Key Issues
**Error**: `Invalid API key`
**Solution**: Verify your API keys are correct and have the necessary permissions

#### 4. File Upload Issues
**Error**: `Upload directory not found`
**Solution**: Ensure the `server/uploads` directory exists

#### 5. CORS Issues
**Error**: `CORS policy blocked`
**Solution**: Check that the `CLIENT_URL` in your `.env` file matches your frontend URL

### Performance Optimization

#### For Development
- Use `npm run dev` for hot reloading
- Monitor the console for any warnings or errors
- Use browser developer tools for debugging

#### For Production
- Set `NODE_ENV=production` in your `.env` file
- Use a process manager like PM2
- Set up proper logging and monitoring
- Configure a reverse proxy (nginx) for better performance

## Security Considerations

1. **Environment Variables**: Never commit your `.env` file to version control
2. **API Keys**: Keep your API keys secure and rotate them regularly
3. **File Uploads**: Implement proper file validation and virus scanning
4. **Rate Limiting**: The backend includes rate limiting to prevent abuse
5. **CORS**: Configure CORS properly for your deployment environment

## Deployment

### Heroku
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
```bash
heroku git:remote -a your-app-name
git push heroku main
```

### Docker
1. Build the Docker image:
```bash
docker build -t live-wallpaper-creator .
```

2. Run the container:
```bash
docker run -p 5000:5000 live-wallpaper-creator
```

### VPS/Cloud Server
1. Set up your server with Node.js and FFmpeg
2. Clone the repository
3. Install dependencies
4. Set up environment variables
5. Use PM2 or similar process manager
6. Configure nginx as reverse proxy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information
4. Contact the development team

## License

This project is licensed under the MIT License - see the LICENSE file for details.
