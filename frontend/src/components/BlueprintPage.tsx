import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface BlueprintData {
  content: string;
  timestamp: string;
}

interface BlueprintPageProps {
  blueprintData: BlueprintData | null;
  isBlueprintLoading: boolean;
  onClose: () => void;
}

interface BlueprintCard {
  title: string;
  content: string;
  category: string;
  icon: string;
}

const BlueprintPage: React.FC<BlueprintPageProps> = ({ 
  blueprintData, 
  isBlueprintLoading, 
  onClose 
}) => {
  // Parse blueprint content into categorized cards
  const parseBlueprintContent = (content: string): BlueprintCard[] => {
    const cards: BlueprintCard[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    let currentCard: Partial<BlueprintCard> = {};
    let currentContent: string[] = [];
    
    for (const line of lines) {
      // Check for main headings (##)
      if (line.startsWith('## ')) {
        // Save previous card if exists
        if (currentCard.title && currentContent.length > 0) {
          cards.push({
            title: currentCard.title,
            content: currentContent.join('\n'),
            category: currentCard.category || 'General',
            icon: currentCard.icon || '📋'
          });
        }
        
        // Start new card
        const title = line.replace('## ', '').trim();
        currentCard = { title, category: 'General', icon: '📋' };
        currentContent = [];
        
        // Determine category and icon based on title
        if (title.toLowerCase().includes('health status') || title.toLowerCase().includes('summary')) {
          currentCard.category = 'Status';
          currentCard.icon = '📊';
        } else if (title.toLowerCase().includes('goal') || title.toLowerCase().includes('target')) {
          currentCard.category = 'Goals';
          currentCard.icon = '🎯';
        } else if (title.toLowerCase().includes('action') || title.toLowerCase().includes('plan')) {
          // Skip Action Plan cards
          continue;
        } else if (title.toLowerCase().includes('nutrition') || title.toLowerCase().includes('diet')) {
          currentCard.category = 'Nutrition';
          currentCard.icon = '🍎';
        } else if (title.toLowerCase().includes('exercise') || title.toLowerCase().includes('fitness')) {
          currentCard.category = 'Exercise';
          currentCard.icon = '💪';
        } else if (title.toLowerCase().includes('lifestyle') || title.toLowerCase().includes('habit')) {
          currentCard.category = 'Lifestyle';
          currentCard.icon = '🌟';
        } else if (title.toLowerCase().includes('track') || title.toLowerCase().includes('monitor')) {
          currentCard.category = 'Tracking';
          currentCard.icon = '📈';
        } else if (title.toLowerCase().includes('risk') || title.toLowerCase().includes('prevention')) {
          currentCard.category = 'Health Risks';
          currentCard.icon = '⚠️';
        } else if (title.toLowerCase().includes('timeline') || title.toLowerCase().includes('milestone')) {
          currentCard.category = 'Timeline';
          currentCard.icon = '⏰';
        } else if (title.toLowerCase().includes('resource') || title.toLowerCase().includes('next step')) {
          currentCard.category = 'Resources';
          currentCard.icon = '🔗';
        }
      }
      // Check for subheadings (###)
      else if (line.startsWith('### ')) {
        currentContent.push(`**${line.replace('### ', '').trim()}**`);
      }
      // Regular content
      else if (line.trim()) {
        currentContent.push(line.trim());
      }
    }
    
    // Add the last card
    if (currentCard.title && currentContent.length > 0) {
      cards.push({
        title: currentCard.title,
        content: currentContent.join('\n'),
        category: currentCard.category || 'General',
        icon: currentCard.icon || '📋'
      });
    }
    
    return cards;
  };
  // Add escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  if (!blueprintData && !isBlueprintLoading) {
    return null;
  }

  return (
    <div 
      className="blueprint-page-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          console.log('Overlay clicked, closing blueprint');
          onClose();
        }
      }}
    >
      <div className="blueprint-page-content">
        <div className="blueprint-page-header">
          <h2>📋 Health Blueprint</h2>
          <button 
            className="close-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close blueprint"
          >
            ✕
          </button>
        </div>
        
             <div className="blueprint-page-body">
               {isBlueprintLoading ? (
                 <div className="blueprint-loading">
                   <div className="loading-spinner"></div>
                   <p>Generating your personalized health blueprint...</p>
                   <p className="loading-subtitle">This may take a few moments</p>
                 </div>
               ) : blueprintData ? (
                 <div className="blueprint-content">
                   <div className="blueprint-timestamp">
                     Generated: {blueprintData.timestamp}
                   </div>
                   <div className="blueprint-cards">
                     {parseBlueprintContent(blueprintData.content).map((card, index) => (
                       <div key={index} className="blueprint-card">
                         <div className="blueprint-card-header">
                           <div className="blueprint-card-icon">{card.icon}</div>
                           <div className="blueprint-card-title-section">
                             <h3 className="blueprint-card-title">{card.title}</h3>
                             <span className="blueprint-card-category">{card.category}</span>
                           </div>
                         </div>
                         <div className="blueprint-card-content">
                           <ReactMarkdown>{card.content}</ReactMarkdown>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               ) : null}
             </div>
      </div>
    </div>
  );
};

export default BlueprintPage;
