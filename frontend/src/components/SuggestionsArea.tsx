import React from 'react';
import ReactMarkdown from 'react-markdown';

interface HealthAnalysis {
  suggestions: string;
  bmi: number;
  stepGoal: string;
}

interface SuggestionsAreaProps {
  analysis: HealthAnalysis | null;
}

const SuggestionsArea: React.FC<SuggestionsAreaProps> = ({ analysis }) => {
  // Parse the suggestions to extract individual items
  const parseSuggestions = (suggestions: string) => {
    const lines = suggestions.split('\n').filter(line => line.trim());
    const items = [];
    
    for (const line of lines) {
      // Look for numbered items (1., 2., 3.) or bullet points
      if (line.match(/^\d+\.\s*\*\*(.+?)\*\*/) || line.match(/^-\s*\*\*(.+?)\*\*/)) {
        const match = line.match(/^\d+\.\s*\*\*(.+?)\*\*|^-\s*\*\*(.+?)\*\*/);
        const title = match?.[1] || match?.[2] || '';
        const description = line.replace(/^\d+\.\s*\*\*(.+?)\*\*\s*-\s*|^-\s*\*\*(.+?)\*\*\s*-\s*/, '').trim();
        
        // Determine category and icon based on title
        let category = 'HEALTH';
        let icon = '💡';
        
        if (title.toLowerCase().includes('walk') || title.toLowerCase().includes('step') || title.toLowerCase().includes('exercise')) {
          category = 'EXERCISE';
          icon = '🏃';
        } else if (title.toLowerCase().includes('water') || title.toLowerCase().includes('drink') || title.toLowerCase().includes('hydrat')) {
          category = 'HYDRATION';
          icon = '💧';
        } else if (title.toLowerCase().includes('sleep') || title.toLowerCase().includes('bed')) {
          category = 'SLEEP';
          icon = '😴';
        } else if (title.toLowerCase().includes('eat') || title.toLowerCase().includes('food') || title.toLowerCase().includes('nutrition') || title.toLowerCase().includes('dinner') || title.toLowerCase().includes('greens')) {
          category = 'NUTRITION';
          icon = '🍎';
        }
        
        items.push({ category, icon, title, description });
      }
    }
    
    return items;
  };

  // Generate priority-based action items
  const generateActionItems = () => {
    if (!analysis) return [];

    const suggestionItems = parseSuggestions(analysis.suggestions);
    
    // Map suggestions to priority levels based on content
    return suggestionItems.map((item, index) => {
      let priority = 'LOW';
      let priorityColor = '#FFFFFF'; // White bullet
      let bgColor = '#4CAF50'; // Green background
      
      // Determine priority based on content
      if (item.title.toLowerCase().includes('blood pressure') || 
          item.title.toLowerCase().includes('urgent') ||
          item.title.toLowerCase().includes('critical')) {
        priority = 'HIGH';
        priorityColor = '#FFFFFF'; // White bullet
        bgColor = '#F44336'; // Red background
        console.log('HIGH priority detected:', item.title, bgColor);
      } else if (item.title.toLowerCase().includes('sodium') || 
                 item.title.toLowerCase().includes('reduce') ||
                 item.title.toLowerCase().includes('important')) {
        priority = 'MEDIUM';
        priorityColor = '#FFFFFF'; // White bullet
        bgColor = '#FFC107'; // Yellow background
        console.log('MEDIUM priority detected:', item.title, bgColor);
      } else {
        console.log('LOW priority detected:', item.title, bgColor);
      }

      return {
        ...item,
        priority,
        priorityColor,
        bgColor
      };
    });
  };

  return (
    <div className="suggestions-area">
      <h3>💓 Action Items</h3>
      <p className="suggestions-subtitle">Do or Die</p>

      <div className="suggestions-content">
        {analysis ? (
          <>
            <div className="action-items">
              {generateActionItems().map((item, index) => (
                <div 
                  key={index} 
                  className="action-item"
                  style={{ backgroundColor: item.bgColor }}
                >
                  <div 
                    className="priority-bullet"
                    style={{ backgroundColor: item.priorityColor }}
                  ></div>
                  <div className="action-content">
                    <div className="action-text">
                      <strong>{item.title}</strong> - {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all-link">
              <a href="#" onClick={(e) => e.preventDefault()}>View All Sug</a>
            </div>
          </>
        ) : (
          <p>
            Enter your health data above and click "Get Health Suggestions" to receive
            personalized recommendations from our AI health assistant.
          </p>
        )}
      </div>
    </div>
  );
};

export default SuggestionsArea;
