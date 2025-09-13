# Health Care One - AI Health Assistant

A single-page health tracking application that uses Google's Gemini AI to provide personalized health suggestions based on your health data (height, weight, steps, etc.) and includes a chat interface for additional health-related questions.

## Features

- **Health Data Analysis**: Input your height, weight, steps, age, gender, and activity level
- **AI-Powered Suggestions**: Get personalized health recommendations from Gemini AI
- **Real-time Health Score**: Dynamic health score based on your data
- **Chat Interface**: Ask additional questions about your health data
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface inspired by your sketch

## Prerequisites

- Python 3.8 or higher
- Node.js (version 14 or higher)
- A Google Gemini API key

## Setup Instructions

1. **Clone or download this project**
   ```bash
   cd health_care_one
   ```

2. **Set up Python backend**
   ```bash
   # Create a virtual environment (recommended)
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

3. **Set up React frontend**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Get a Gemini API key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

5. **Set up environment variables**
   - Copy `env.example` to `.env`
   - Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=6549
   ```

6. **Start the application**

   **Option A: Development mode (recommended)**
   ```bash
   # Terminal 1: Start Python backend
   python app.py
   
   # Terminal 2: Start React frontend
   cd frontend
   npm start
   ```
   - Backend: `http://localhost:6549`
   - Frontend: `http://localhost:3459` (with hot reload)

   **Option B: Production mode**
   ```bash
   # Build React app
   cd frontend
   npm run build
   cd ..
   
   # Start Python backend (serves React build)
   python app.py
   ```
   - Application: `http://localhost:6549`

## Usage

### Health Data Input
1. Enter your height in centimeters
2. Enter your weight in kilograms  
3. Enter your daily steps
4. Optionally add your age, gender, and activity level
5. Click "Get Health Suggestions" to receive AI-powered recommendations

### Chat Interface
- Use the chat box at the bottom to ask additional questions
- The AI will have context from your health data
- Ask about specific health concerns, exercise recommendations, or nutrition advice

### Features Overview
- **Health Score**: Your HAI@ score updates based on BMI and step count
- **Track Toggle**: Enable/disable health tracking
- **Blueprint Button**: Future feature for health journey visualization
- **Clear All**: Reset all data and start fresh

## API Endpoints

- `POST /api/analyze-health` - Analyze health data and get suggestions
- `POST /api/chat` - Send chat messages to AI assistant

## Technology Stack

- **Backend**: Python, Flask
- **AI Integration**: Google Gemini AI
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Styling**: Custom CSS with modern design principles

## Development

To run in development mode with auto-restart:
```bash
python app.py
```

## Troubleshooting

- **API Key Issues**: Make sure your Gemini API key is correctly set in the `.env` file
- **Port Issues**: If port 6549 is busy, change the PORT in your `.env` file
- **CORS Issues**: The app is configured to handle CORS for local development

## Future Enhancements

- Health data persistence
- Historical tracking and trends
- Integration with fitness trackers
- More detailed health metrics
- User authentication
- Data export functionality

## License

MIT License - feel free to use this project for personal or commercial purposes.
