import React from 'react';

interface ConsentModalProps {
  isOpen: boolean;
  onConsent: (consent: boolean) => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onConsent }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>🔒 Health Data Consent</h3>
        </div>
        <div className="modal-body">
          <p>
            Do you consent to share your health data with our AI health assistant? 
            This will help provide more personalized recommendations and track your progress.
          </p>
          <div className="consent-details">
            <h4>What we collect:</h4>
            <ul>
              <li>Health metrics (steps, exercise, sleep)</li>
              <li>Chat conversations about your health</li>
              <li>Progress tracking data</li>
            </ul>
            <h4>How we use it:</h4>
            <ul>
              <li>Generate personalized health recommendations</li>
              <li>Track your progress over time</li>
              <li>Improve our AI health assistant</li>
            </ul>
          </div>
        </div>
        <div className="modal-footer">
          <button 
            className="consent-btn decline" 
            onClick={() => onConsent(false)}
          >
            No, Decline
          </button>
          <button 
            className="consent-btn accept" 
            onClick={() => onConsent(true)}
          >
            Yes, I Consent
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
