import React from 'react';
import axios from 'axios';

interface HealthAnalysis {
  suggestions: string;
  bmi: number;
  stepGoal: string;
}

interface HealthFormProps {
  onAnalyze: (analysis: HealthAnalysis) => void;
  onClear: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const HealthForm: React.FC<HealthFormProps> = ({
  onAnalyze,
  onClear,
  isLoading,
  setIsLoading
}) => {
  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:6549'}/api/analyze-health`);
      if (response.data.success) {
        onAnalyze(response.data);
      } else {
        alert('Failed to analyze health data: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="action-buttons">
        <button 
          className="primary-btn" 
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Get AI Health Suggestions'}
        </button>
        <button className="secondary-btn" onClick={onClear}>
          Clear Results
        </button>
      </div>
    </div>
  );
};

export default HealthForm;
