import React from 'react';

interface HeaderProps {
  healthScore: number;
  onBlueprintClick: () => void;
  isBlueprintLoading: boolean;
  lastScoreChange: number | null;
}

const Header: React.FC<HeaderProps> = ({ healthScore, onBlueprintClick, isBlueprintLoading, lastScoreChange }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'linear-gradient(135deg, #2E7D32, #1B5E20)'; // Dark green
    if (score >= 70) return 'linear-gradient(135deg, #4CAF50, #2E7D32)'; // Medium green
    if (score >= 60) return 'linear-gradient(135deg, #8BC34A, #4CAF50)'; // Light green
    if (score >= 50) return 'linear-gradient(135deg, #FFC107, #FF9800)'; // Yellow
    if (score >= 40) return 'linear-gradient(135deg, #FF9800, #F57C00)'; // Orange
    if (score >= 30) return 'linear-gradient(135deg, #FF5722, #F44336)'; // Light red
    return 'linear-gradient(135deg, #D32F2F, #B71C1C)'; // Dark red
  };

  const getHealthScoreClass = (score: number) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  };

  const getAssessment = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Keep completing suggestions!';
    return 'Poor';
  };

  return (
    <div className="header">
      <div className={`hai-container ${getHealthScoreClass(healthScore)}`}>
        <div className="hai-icon">💓</div>
        <div
          className="hai-circle"
          style={{ '--score': healthScore } as React.CSSProperties}
        >
          <div className="hai-score">{healthScore}</div>
          {lastScoreChange && (
            <div className={`score-change ${lastScoreChange > 0 ? 'positive' : 'negative'}`}>
              {lastScoreChange > 0 ? '+' : ''}{lastScoreChange}
            </div>
          )}
        </div>
        <div className="hai-text">
          <div className="hai-title">Health AI Index</div>
          <div className="hai-assessment">{getAssessment(healthScore)}</div>
        </div>
      </div>
      <div className="blueprint-btn">
        <button
          onClick={onBlueprintClick}
          disabled={isBlueprintLoading}
        >
          {isBlueprintLoading ? 'GENERATING...' : 'BLUEPRINT'}
        </button>
      </div>
    </div>
  );
};

export default Header;
