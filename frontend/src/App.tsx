import React, { useState, useEffect } from 'react';
import './App.css';
import HealthForm from './components/HealthForm';
import SuggestionsArea from './components/SuggestionsArea';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import ConsentModal from './components/ConsentModal';
import BlueprintPage from './components/BlueprintPage';
import LocationFinder from './components/LocationFinder';
import ReactMarkdown from 'react-markdown';
// Profile picture - replace with your actual image
const profilePicture = '/assets/profile-picture.jpg';

interface HealthAnalysis {
  suggestions: string;
  bmi: number;
  stepGoal: string;
}

interface BlueprintData {
  content: string;
  timestamp: string;
}

interface ChatMessage {
  id: number;
  message: string;
  sender: 'user' | 'ai';
}

function App() {
  const [healthAnalysis, setHealthAnalysis] = useState<HealthAnalysis | null>(null);
  const [blueprintData, setBlueprintData] = useState<BlueprintData | null>(null);
  const [healthScore, setHealthScore] = useState(50);
  const [isTracking, setIsTracking] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      message: "Hello Rachael! I'm your AI health assistant. Tell me about your health activities and I'll help track your progress!",
      sender: 'ai'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBlueprintLoading, setIsBlueprintLoading] = useState(false);
  const [lastScoreChange, setLastScoreChange] = useState<number | null>(null);
  const [showBlueprintPage, setShowBlueprintPage] = useState(false);
  const [prefetchedBlueprint, setPrefetchedBlueprint] = useState<BlueprintData | null>(null);
  const [showLocationFinder, setShowLocationFinder] = useState(false);

  // Prefetch blueprint on app load
  useEffect(() => {
    const prefetchBlueprint = async () => {
      try {
        console.log('🔄 Starting blueprint prefetch...');
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:6549'}/api/blueprint`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatHistory: [],
            healthAnalysis: null
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const blueprintData = {
              content: data.blueprint,
              timestamp: new Date().toLocaleString()
            };
            setPrefetchedBlueprint(blueprintData);
            console.log('✅ Blueprint prefetched successfully and stored in memory');
          } else {
            console.log('❌ Prefetch failed:', data.error);
          }
        } else {
          console.log('❌ Prefetch response not ok:', response.status);
        }
      } catch (error) {
        console.log('❌ Failed to prefetch blueprint:', error);
      }
    };

    prefetchBlueprint();
  }, []);

  const clearAllData = () => {
    setHealthAnalysis(null);
    setBlueprintData(null);
    setHealthScore(50);
    setChatMessages([
      {
        id: 1,
        message: "Hello Rachael! I'm your AI health assistant. Tell me about your health activities and I'll help track your progress!",
        sender: 'ai'
      }
    ]);
  };


  const handleBlueprintClick = async () => {
    setShowBlueprintPage(true);
    
    console.log('🔍 Blueprint button clicked. Prefetched blueprint available:', !!prefetchedBlueprint);
    
    // If we have a prefetched blueprint, use it immediately
    if (prefetchedBlueprint) {
      console.log('✅ Using prefetched blueprint from memory');
      setBlueprintData(prefetchedBlueprint);
      setPrefetchedBlueprint(null); // Clear from memory
      return;
    }
    
    // Otherwise, generate a new one
    console.log('❌ No prefetched blueprint available, generating new one...');
    setIsBlueprintLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:6549'}/api/blueprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatHistory: chatMessages,
          healthAnalysis: healthAnalysis
        })
      });

      console.log('Response received:', response.status);
      const result = await response.json();
      console.log('Result:', result);
      
      if (result.success) {
        const blueprintData = {
          content: result.blueprint,
          timestamp: new Date().toLocaleString()
        };
        console.log('Setting blueprint data:', blueprintData);
        setBlueprintData(blueprintData);
      } else {
        alert('Failed to generate blueprint: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to the server. Please try again.');
    } finally {
      setIsBlueprintLoading(false);
    }
  };

  const handleCloseBlueprint = () => {
    setShowBlueprintPage(false);
  };

  const addChatMessage = (message: string, sender: 'user' | 'ai') => {
    console.log('💬 Adding chat message:', { message, sender });
    const newMessage: ChatMessage = {
      id: Date.now(),
      message,
      sender
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    // Update health score based on user input
    if (sender === 'user') {
      console.log('👤 User message detected, analyzing for health score...');
      console.log('🔍 Current health score before update:', healthScore);
      updateHealthScoreFromMessage(message);
    }
  };

  const getHealthScoreClass = (score: number) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  };

  const convertChatResponseToSuggestions = (chatResponse: string) => {
    // Parse the chat response to extract 1-3 action items
    const lines = chatResponse.split('\n').filter(line => line.trim());
    const suggestions = [];
    
    for (const line of lines) {
      // Look for numbered items (1., 2., 3.) or bullet points
      if (line.match(/^\d+\.\s*\*\*(.+?)\*\*/) || line.match(/^-\s*\*\*(.+?)\*\*/)) {
        const match = line.match(/^\d+\.\s*\*\*(.+?)\*\*|^-\s*\*\*(.+?)\*\*/);
        const title = match?.[1] || match?.[2] || '';
        const description = line.replace(/^\d+\.\s*\*\*(.+?)\*\*\s*-\s*|^-\s*\*\*(.+?)\*\*\s*-\s*/, '').trim();
        
        if (title && suggestions.length < 3) {
          suggestions.push({ title, description });
        }
      }
    }
    
    // If we found suggestions, create a new health analysis
    if (suggestions.length > 0) {
      const suggestionsText = suggestions.map((s, index) => 
        `${index + 1}. **${s.title}** - ${s.description}`
      ).join('\n');
      
      const newAnalysis: HealthAnalysis = {
        suggestions: suggestionsText,
        bmi: healthAnalysis?.bmi || 21.3,
        stepGoal: healthAnalysis?.stepGoal || '7,500 steps (target: 10,000)'
      };
      
      setHealthAnalysis(newAnalysis);
    }
  };

  const updateHealthScoreFromMessage = (message: string) => {
    console.log('🔍 Analyzing message for health score:', message);
    console.log('🔍 Current health score state:', healthScore);
    const lowerMessage = message.toLowerCase();
    console.log('🔍 Lowercase message:', lowerMessage);
    let scoreChange = 0;
    
    // Simple logic: if message contains "didn't" or "did not", decrease score; otherwise increase
    if (lowerMessage.includes('didn\'t') || lowerMessage.includes('did not')) {
      scoreChange = -5;
      console.log('🚫 Negative message detected (contains "didn\'t" or "did not"):', lowerMessage);
    } else {
      scoreChange = +5;
      console.log('✅ Positive message detected (no "didn\'t" or "did not"):', lowerMessage);
    }
    
    // Update score with bounds
    if (scoreChange !== 0) {
      console.log('📊 Final score change:', scoreChange);
      setLastScoreChange(scoreChange);
      setHealthScore(prev => {
        const newScore = Math.max(0, Math.min(100, prev + scoreChange));
        console.log('📈 New health score:', newScore);
        return newScore;
      });
      
      // Clear the score change indicator after 3 seconds
      setTimeout(() => setLastScoreChange(null), 3000);
    } else {
      console.log('❌ No score change detected');
    }
  };

  const handleConsent = (consent: boolean) => {
    setHasConsented(consent);
    setShowConsentModal(false);
    if (consent) {
      setIsTracking(true);
    } else {
      setIsTracking(false);
    }
  };

  const handleToggleChange = (checked: boolean) => {
    if (checked) {
      // Always show consent modal when turning ON
      setShowConsentModal(true);
    } else {
      // Turn off tracking immediately when toggling OFF
      setIsTracking(false);
    }
  };

  return (
    <div className="App">
      <Header
        healthScore={healthScore}
        onBlueprintClick={handleBlueprintClick}
        isBlueprintLoading={isBlueprintLoading}
        lastScoreChange={lastScoreChange}
      />

      <main className="main-content">
        <div className={`profile-section ${getHealthScoreClass(healthScore)}`}>
          <div className="user-icon">
            <img 
              src={profilePicture} 
              alt="Profile" 
              className="profile-image"
              onError={(e) => {
                console.log('Profile image failed to load, showing fallback');
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'flex';
                }
              }}
              onLoad={() => {
                console.log('Profile image loaded successfully');
              }}
            />
            <div className="profile-fallback" style={{display: 'none'}}>👤</div>
          </div>
          <div className="suggestion-label">Health Tracker User</div>
          <div className="track-toggle">
            <label className="toggle">
            <input
              type="checkbox"
              checked={isTracking}
              onChange={(e) => handleToggleChange(e.target.checked)}
            />
              <span className="slider"></span>
            </label>
            <span className="toggle-label">Track ON/OFF</span>
          </div>
          <button 
            className="location-finder-btn"
            onClick={() => setShowLocationFinder(true)}
            title="Find nearby gyms and parks"
          >
            🗺️ Find Nearby
          </button>
        </div>

        <HealthForm 
          onAnalyze={(analysis) => {
            setHealthAnalysis(analysis);
            // Calculate health score based on BMI and steps
            let score = 50;
            if (analysis.bmi >= 18.5 && analysis.bmi < 25) score += 20;
            else if (analysis.bmi < 18.5 || analysis.bmi >= 30) score -= 10;
            
            // Use demo data for step scoring
            if (analysis.stepGoal === 'Met') score += 15;
            else score -= 10;
            
            score = Math.max(0, Math.min(100, score));
            setHealthScore(score);
          }}
          onClear={clearAllData}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        <SuggestionsArea analysis={healthAnalysis} />

            <ChatInterface
              messages={chatMessages}
              onSendMessage={addChatMessage}
              onConvertToSuggestions={convertChatResponseToSuggestions}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
      </main>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Analyzing your health data...</p>
        </div>
      )}

      <ConsentModal 
        isOpen={showConsentModal}
        onConsent={handleConsent}
      />

          {showBlueprintPage && (
            <BlueprintPage
              blueprintData={blueprintData}
              isBlueprintLoading={isBlueprintLoading}
              onClose={handleCloseBlueprint}
            />
          )}

          <LocationFinder
            isOpen={showLocationFinder}
            onClose={() => setShowLocationFinder(false)}
          />
        </div>
      );
    }
    
    export default App;