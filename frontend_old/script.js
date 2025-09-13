class HealthApp {
    constructor() {
        this.healthData = {};
        this.chatHistory = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Health analysis button
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeHealth();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        // Chat send button
        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendChatMessage();
        });

        // Chat input enter key
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        // Blueprint button
        document.getElementById('blueprintBtn').addEventListener('click', () => {
            this.showBlueprint();
        });

        // Track toggle
        document.getElementById('trackToggle').addEventListener('change', (e) => {
            this.toggleTracking(e.target.checked);
        });
    }

    async analyzeHealth() {
        const healthData = this.collectHealthData();
        
        if (!this.validateHealthData(healthData)) {
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/analyze-health', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(healthData)
            });

            const result = await response.json();

            if (result.success) {
                this.displaySuggestions(result.suggestions, result.bmi, result.stepGoal);
                this.updateHealthScore(result.bmi);
                this.healthData = healthData; // Store for chat context
            } else {
                this.showError('Failed to analyze health data: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('Failed to connect to the server. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();

        if (!message) return;

        // Add user message to chat
        this.addMessageToChat(message, 'user');
        chatInput.value = '';

        this.showLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    healthContext: this.healthData
                })
            });

            const result = await response.json();

            if (result.success) {
                this.addMessageToChat(result.response, 'ai');
            } else {
                this.addMessageToChat('Sorry, I encountered an error: ' + result.error, 'ai');
            }
        } catch (error) {
            console.error('Error:', error);
            this.addMessageToChat('Sorry, I cannot connect to the server right now.', 'ai');
        } finally {
            this.showLoading(false);
        }
    }

    collectHealthData() {
        return {
            height: parseFloat(document.getElementById('height').value),
            weight: parseFloat(document.getElementById('weight').value),
            steps: parseInt(document.getElementById('steps').value),
            age: parseInt(document.getElementById('age').value) || null,
            gender: document.getElementById('gender').value || null,
            activityLevel: document.getElementById('activityLevel').value || null
        };
    }

    validateHealthData(data) {
        if (!data.height || data.height < 100 || data.height > 250) {
            this.showError('Please enter a valid height between 100-250 cm');
            return false;
        }

        if (!data.weight || data.weight < 30 || data.weight > 300) {
            this.showError('Please enter a valid weight between 30-300 kg');
            return false;
        }

        if (!data.steps || data.steps < 0 || data.steps > 50000) {
            this.showError('Please enter a valid number of steps (0-50000)');
            return false;
        }

        return true;
    }

    displaySuggestions(suggestions, bmi, stepGoal) {
        const suggestionsContent = document.getElementById('suggestionsContent');
        suggestionsContent.innerHTML = `
            <div class="suggestion-header">
                <h4>📊 Your Health Analysis</h4>
                <div class="metrics">
                    <span class="metric">BMI: ${bmi}</span>
                    <span class="metric">Step Goal: ${stepGoal}</span>
                </div>
            </div>
            <div class="suggestion-text">
                ${suggestions.replace(/\n/g, '<br>')}
            </div>
        `;
    }

    addMessageToChat(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    updateHealthScore(bmi) {
        const healthScore = document.getElementById('healthScore');
        let score = 50; // Base score

        // Adjust score based on BMI
        if (bmi < 18.5) {
            score -= 10; // Underweight
        } else if (bmi >= 18.5 && bmi < 25) {
            score += 20; // Normal weight
        } else if (bmi >= 25 && bmi < 30) {
            score -= 5; // Overweight
        } else {
            score -= 15; // Obese
        }

        // Adjust score based on steps
        const steps = parseInt(document.getElementById('steps').value);
        if (steps >= 10000) {
            score += 15;
        } else if (steps >= 5000) {
            score += 5;
        } else {
            score -= 10;
        }

        // Ensure score stays within reasonable bounds
        score = Math.max(0, Math.min(100, score));
        
        healthScore.textContent = `+${score}`;
        
        // Update color based on score
        const metricCircle = document.querySelector('.metric-circle');
        if (score >= 70) {
            metricCircle.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        } else if (score >= 50) {
            metricCircle.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
        } else {
            metricCircle.style.background = 'linear-gradient(135deg, #F44336, #D32F2F)';
        }
    }

    clearAllData() {
        // Clear all input fields
        document.getElementById('height').value = '';
        document.getElementById('weight').value = '';
        document.getElementById('steps').value = '';
        document.getElementById('age').value = '';
        document.getElementById('gender').value = '';
        document.getElementById('activityLevel').value = '';

        // Clear suggestions
        document.getElementById('suggestionsContent').innerHTML = 
            '<p>Enter your health data above and click "Get Health Suggestions" to receive personalized recommendations from our AI health assistant.</p>';

        // Reset health score
        document.getElementById('healthScore').textContent = '+50';
        document.querySelector('.metric-circle').style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';

        // Clear chat
        document.getElementById('chatMessages').innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    Hello! I'm your AI health assistant. Ask me anything about your health data or get personalized advice.
                </div>
            </div>
        `;

        // Clear stored data
        this.healthData = {};
        this.chatHistory = [];
    }

    showBlueprint() {
        alert('Blueprint feature coming soon! This will show your health journey and progress over time.');
    }

    toggleTracking(enabled) {
        if (enabled) {
            console.log('Health tracking enabled');
        } else {
            console.log('Health tracking disabled');
        }
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        alert(message);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HealthApp();
});
