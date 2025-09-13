from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='frontend/build', static_url_path='')
CORS(app, origins=['http://localhost:3459', 'http://127.0.0.1:3459'])

# Configure Gemini AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def calculate_bmi(weight, height):
    """Calculate BMI given weight in kg and height in cm"""
    height_in_meters = height / 100
    return round(weight / (height_in_meters * height_in_meters), 1)

@app.route('/')
def serve_frontend():
    """Serve the main frontend page"""
    return send_from_directory('frontend/build', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from frontend build directory"""
    return send_from_directory('frontend/build', path)

@app.route('/api/analyze-health', methods=['POST'])
def analyze_health():
    """Analyze health data and provide AI suggestions using demo data"""
    try:
        # Demo health data for testing
        demo_data = {
            'height': 175,  # 5'9"
            'weight': 70,   # ~154 lbs
            'steps': 8500,  # Below 10k goal
            'age': 30,
            'gender': 'male',
            'activity_level': 'moderately_active'
        }
        
        height = demo_data['height']
        weight = demo_data['weight']
        steps = demo_data['steps']
        age = demo_data['age']
        gender = demo_data['gender']
        activity_level = demo_data['activity_level']
        
        # Calculate BMI
        bmi = calculate_bmi(weight, height)
        
        # Create Gemini prompt
        prompt = f"""
        As a health and fitness expert, provide exactly 3 short, actionable health suggestions for Rachael, a 22-year-old female:

        Rachael's Health Data: {height}cm (5'5"), {weight}kg (~128 lbs), BMI {bmi:.1f}, {steps} steps/day, {activity_level}

        Create 3 suggestions that are:
        - Maximum 2 lines each
        - Specific and actionable for a young woman
        - Focus on immediate improvements
        - Age-appropriate and motivating

        Format exactly like this:
        1. **Walk 2,500 more steps today** - Take stairs and a 25-min lunch walk
        2. **Drink 8 glasses of water** - Set hourly reminders to stay hydrated  
        3. **Get 7-8 hours of sleep** - Go to bed 30 minutes earlier tonight

        Keep it short, clear, and motivating for Rachael!
        """
        
        # Generate AI response
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Determine step goal status
        step_goal = 'Met' if steps >= 10000 else 'Not met'
        
        return jsonify({
            'success': True,
            'suggestions': response.text,
            'bmi': bmi,
            'stepGoal': step_goal,
            'demoData': demo_data  # Include demo data info
        })
        
    except Exception as e:
        print(f"Error analyzing health data: {str(e)}")
        return jsonify({'error': 'Failed to analyze health data'}), 500

@app.route('/api/blueprint', methods=['POST'])
def generate_blueprint():
    """Generate a comprehensive health blueprint using demo data and chat history"""
    try:
        data = request.get_json()
        chat_history = data.get('chatHistory', [])
        health_analysis = data.get('healthAnalysis')
        
        # Demo health data for Rachael
        demo_data = {
            'height': 165,  # 5'5"
            'weight': 58,   # ~128 lbs
            'steps': 7500,  # Below 10k goal
            'age': 22,
            'gender': 'female',
            'activity_level': 'moderately_active'
        }
        
        # Build chat context
        chat_context = ""
        if chat_history:
            chat_context = "\n\nRecent conversation:\n"
            for msg in chat_history[-5:]:  # Last 5 messages
                chat_context += f"{msg.get('sender', 'user').upper()}: {msg.get('message', '')}\n"
        
        # Build health analysis context
        analysis_context = ""
        if health_analysis:
            analysis_context = f"""
            Previous health analysis:
            - BMI: {health_analysis.get('bmi', 'N/A')}
            - Step Goal: {health_analysis.get('stepGoal', 'N/A')}
            - Suggestions: {health_analysis.get('suggestions', 'N/A')[:200]}...
            """
        
        prompt = f"""
        As a comprehensive health and fitness expert, create a detailed health blueprint based on the following information:
        
        Current Health Profile:
        - Height: {demo_data['height']} cm (5'9")
        - Weight: {demo_data['weight']} kg (~154 lbs)
        - Daily Steps: {demo_data['steps']}
        - Age: {demo_data['age']} years old
        - Gender: {demo_data['gender']}
        - Activity Level: {demo_data['activity_level']}
        
        {analysis_context}
        {chat_context}
        
        Please create a comprehensive health blueprint in MARKDOWN format that includes:
        
        ## Current Health Status Summary
        ## Personalized Goals & Targets
        ### Short-term Goals (3 months)
        ### Long-term Goals (1 year)
        ## Action Plan
        ## Nutrition Recommendations
        ## Exercise Strategy
        ## Lifestyle Modifications
        ## Progress Tracking Methods
        ## Risk Factors & Prevention
        ## Timeline & Milestones
        ## Resources & Next Steps
        
        Use proper markdown formatting with:
        - # for main headers
        - ## for section headers
        - ### for sub-headers
        - **bold text** for emphasis
        - *italic text* for highlights
        - - bullet points for lists
        - 1. numbered lists
        - > blockquotes for important notes
        
        Make this blueprint practical, actionable, and personalized. Use the conversation history to address any specific concerns or questions raised.
        """
        
        # Generate AI response
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        return jsonify({
            'success': True,
            'blueprint': response.text
        })
        
    except Exception as e:
        print(f"Error generating blueprint: {str(e)}")
        return jsonify({'error': 'Failed to generate blueprint'}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages with AI assistant"""
    try:
        data = request.get_json()
        message = data.get('message')
        health_context = data.get('healthContext')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Create context-aware prompt
        context_str = ""
        if health_context:
            context_str = f"""
            The user has provided the following health context:
            {json.dumps(health_context, indent=2)}
            """
        
        prompt = f"""
        You are a health and fitness assistant. {context_str}
        
        User's question/message: {message}
        
        Please provide a helpful, personalized response based on their health data and question.
        """
        
        # Generate AI response
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        return jsonify({
            'success': True,
            'response': response.text
        })
        
    except Exception as e:
        print(f"Error processing chat: {str(e)}")
        return jsonify({'error': 'Failed to process chat message'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 6549))
    print(f"Server running on http://localhost:{port}")
    print("Make sure to set your GEMINI_API_KEY in the .env file")
    app.run(host='0.0.0.0', port=port, debug=True)
