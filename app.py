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
        # Demo health data for Rachael with comprehensive health metrics
        demo_data = {
            'height': 165,  # 5'5"
            'weight': 58,   # ~128 lbs
            'steps': 7500,  # Below 10k goal
            'age': 22,
            'gender': 'female',
            'activity_level': 'moderately_active',
            'health_metrics': {
                'sleep': {'hours': 7.5, 'quality': 'good', 'weight': 20},
                'bmi': {'value': 21.3, 'weight': 10},
                'nutrition': {'score': 75, 'weight': 15},
                'blood_pressure': {'systolic': 115, 'diastolic': 75, 'weight': 15},
                'sunlight_exposure': {'hours': 2.5, 'weight': 5},
                'bio_fluids': {'glucose': 85, 'cholesterol': 180, 'weight': 15},
                'stress_level': {'score': 6, 'weight': 10},
                'air_quality': {'aqi': 45, 'weight': 10}
            }
        }
        
        height = demo_data['height']
        weight = demo_data['weight']
        steps = demo_data['steps']
        age = demo_data['age']
        gender = demo_data['gender']
        activity_level = demo_data['activity_level']
        
        # Calculate BMI
        bmi = calculate_bmi(weight, height)
        
        # Create Gemini prompt with comprehensive health metrics
        prompt = f"""
        As a health and fitness expert, provide exactly 3 short, actionable health suggestions for Rachael, a 22-year-old female:

        Rachael's Health Data: {height}cm (5'5"), {weight}kg (~128 lbs), BMI {bmi:.1f}, {steps} steps/day, {activity_level}

        Comprehensive Health Metrics (Weighted):
        - Sleep: {demo_data['health_metrics']['sleep']['hours']} hours, Quality: {demo_data['health_metrics']['sleep']['quality']} (Weight: {demo_data['health_metrics']['sleep']['weight']}%)
        - BMI: {demo_data['health_metrics']['bmi']['value']} (Weight: {demo_data['health_metrics']['bmi']['weight']}%)
        - Nutrition Score: {demo_data['health_metrics']['nutrition']['score']}/100 (Weight: {demo_data['health_metrics']['nutrition']['weight']}%)
        - Blood Pressure: {demo_data['health_metrics']['blood_pressure']['systolic']}/{demo_data['health_metrics']['blood_pressure']['diastolic']} mmHg (Weight: {demo_data['health_metrics']['blood_pressure']['weight']}%)
        - Sunlight Exposure: {demo_data['health_metrics']['sunlight_exposure']['hours']} hours/day (Weight: {demo_data['health_metrics']['sunlight_exposure']['weight']}%)
        - Bio-fluids: Glucose {demo_data['health_metrics']['bio_fluids']['glucose']} mg/dL, Cholesterol {demo_data['health_metrics']['bio_fluids']['cholesterol']} mg/dL (Weight: {demo_data['health_metrics']['bio_fluids']['weight']}%)
        - Stress Level: {demo_data['health_metrics']['stress_level']['score']}/10 (Weight: {demo_data['health_metrics']['stress_level']['weight']}%)
        - Air Quality: AQI {demo_data['health_metrics']['air_quality']['aqi']} (Weight: {demo_data['health_metrics']['air_quality']['weight']}%)

        Create 3 suggestions that are:
        - Maximum 2 lines each
        - Specific and actionable for a young woman
        - Focus on immediate improvements
        - Age-appropriate and motivating
        - Consider the weighted health metrics above
        - Include priority indicators (blood pressure = high priority, nutrition = medium priority, steps = low priority)

        Format exactly like this:
        1. **Schedule blood pressure check** - Your last reading was 2 days ago and monitoring is crucial
        2. **Reduce sodium intake to under 2300mg daily** - To support cardiovascular health
        3. **Walk 10,000 steps today** - To maintain your current fitness level

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
        
        # Demo health data for Rachael with comprehensive health metrics
        demo_data = {
            'height': 165,  # 5'5"
            'weight': 58,   # ~128 lbs
            'steps': 7500,  # Below 10k goal
            'age': 22,
            'gender': 'female',
            'activity_level': 'moderately_active',
            'health_metrics': {
                'sleep': {
                    'hours': 7.5,
                    'quality': 'good',
                    'weight': 20
                },
                'bmi': {
                    'value': 21.3,
                    'weight': 10
                },
                'nutrition': {
                    'score': 75,
                    'weight': 15
                },
                'blood_pressure': {
                    'systolic': 115,
                    'diastolic': 75,
                    'weight': 15
                },
                'sunlight_exposure': {
                    'hours': 2.5,
                    'weight': 5
                },
                'bio_fluids': {
                    'glucose': 85,
                    'cholesterol': 180,
                    'weight': 15
                },
                'stress_level': {
                    'score': 6,
                    'weight': 10
                },
                'air_quality': {
                    'aqi': 45,
                    'weight': 10
                }
            }
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
        - Height: {demo_data['height']} cm (5'5")
        - Weight: {demo_data['weight']} kg (~128 lbs)
        - Daily Steps: {demo_data['steps']}
        - Age: {demo_data['age']} years old
        - Gender: {demo_data['gender']}
        - Activity Level: {demo_data['activity_level']}
        
        Comprehensive Health Metrics (Weighted):
        - Sleep: {demo_data['health_metrics']['sleep']['hours']} hours, Quality: {demo_data['health_metrics']['sleep']['quality']} (Weight: {demo_data['health_metrics']['sleep']['weight']}%)
        - BMI: {demo_data['health_metrics']['bmi']['value']} (Weight: {demo_data['health_metrics']['bmi']['weight']}%)
        - Nutrition Score: {demo_data['health_metrics']['nutrition']['score']}/100 (Weight: {demo_data['health_metrics']['nutrition']['weight']}%)
        - Blood Pressure: {demo_data['health_metrics']['blood_pressure']['systolic']}/{demo_data['health_metrics']['blood_pressure']['diastolic']} mmHg (Weight: {demo_data['health_metrics']['blood_pressure']['weight']}%)
        - Sunlight Exposure: {demo_data['health_metrics']['sunlight_exposure']['hours']} hours/day (Weight: {demo_data['health_metrics']['sunlight_exposure']['weight']}%)
        - Bio-fluids: Glucose {demo_data['health_metrics']['bio_fluids']['glucose']} mg/dL, Cholesterol {demo_data['health_metrics']['bio_fluids']['cholesterol']} mg/dL (Weight: {demo_data['health_metrics']['bio_fluids']['weight']}%)
        - Stress Level: {demo_data['health_metrics']['stress_level']['score']}/10 (Weight: {demo_data['health_metrics']['stress_level']['weight']}%)
        - Air Quality: AQI {demo_data['health_metrics']['air_quality']['aqi']} (Weight: {demo_data['health_metrics']['air_quality']['weight']}%)
        
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
        print("Generating blueprint with Gemini...")
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            
            if not response or not response.text:
                print("Error: Empty response from Gemini")
                return jsonify({'error': 'Empty response from AI'}), 500
                
            print("Blueprint generated successfully")
            return jsonify({
                'success': True,
                'blueprint': response.text
            })
        except Exception as gemini_error:
            if "quota" in str(gemini_error).lower() or "429" in str(gemini_error):
                print("Gemini API quota exceeded, using fallback blueprint")
                # Fallback blueprint when API quota is exceeded
                fallback_blueprint = f"""# Health Blueprint for Rachael

## Current Health Status Summary
- **Age**: 22 years old
- **Height**: 165cm (5'5")
- **Weight**: 58kg (~128 lbs)
- **Daily Steps**: 7,500 (target: 10,000)
- **Activity Level**: Moderately Active

## Comprehensive Health Metrics (Weighted)
- **Sleep**: 7.5 hours, Quality: Good (Weight: 20%)
- **BMI**: 21.3 (Weight: 10%)
- **Nutrition Score**: 75/100 (Weight: 15%)
- **Blood Pressure**: 115/75 mmHg (Weight: 15%)
- **Sunlight Exposure**: 2.5 hours/day (Weight: 5%)
- **Bio-fluids**: Glucose 85 mg/dL, Cholesterol 180 mg/dL (Weight: 15%)
- **Stress Level**: 6/10 (Weight: 10%)
- **Air Quality**: AQI 45 (Weight: 10%)

## Personalized Goals & Targets

### Short-term Goals (3 months)
1. **Increase daily steps to 10,000** - Add 2,500 more steps through walking breaks
2. **Improve sleep consistency** - Maintain 7-8 hours nightly
3. **Enhance hydration** - Drink 8 glasses of water daily

### Long-term Goals (1 year)
1. **Achieve optimal fitness level** - Regular exercise routine
2. **Maintain healthy weight** - Balanced nutrition and activity
3. **Build sustainable habits** - Long-term lifestyle improvements

## Action Plan

### Week 1-2: Foundation Building
- Start with 20-minute daily walks
- Set up hydration reminders
- Establish consistent sleep schedule

### Week 3-4: Habit Reinforcement
- Increase walk duration to 30 minutes
- Add strength training 2x per week
- Track progress daily

## Nutrition Recommendations
- **Breakfast**: Oatmeal with fruits and nuts
- **Lunch**: Lean protein with vegetables
- **Dinner**: Balanced portions with whole grains
- **Snacks**: Fresh fruits and vegetables

## Exercise Strategy
- **Cardio**: 30 minutes daily (walking, cycling, dancing)
- **Strength**: 2-3 times per week
- **Flexibility**: Daily stretching routine

## Lifestyle Modifications
- Take stairs instead of elevators
- Walk during phone calls
- Stand up every hour
- Limit screen time before bed

## Progress Tracking Methods
- Daily step counting
- Weekly weight check-ins
- Monthly fitness assessments
- Journal mood and energy levels

## Risk Factors & Prevention
- Monitor stress levels
- Maintain social connections
- Regular health check-ups
- Stay hydrated and well-rested

## Timeline & Milestones
- **Month 1**: Establish routines
- **Month 2**: Increase intensity
- **Month 3**: Evaluate and adjust
- **Month 6**: Long-term assessment

## Resources & Next Steps
1. Download a fitness tracking app
2. Find a workout buddy
3. Set up a home exercise space
4. Plan healthy meal prep

*This blueprint is personalized for Rachael's current health profile and goals.*"""
                
                return jsonify({
                    'success': True,
                    'blueprint': fallback_blueprint
                })
            else:
                raise gemini_error
        
    except Exception as e:
        print(f"Error generating blueprint: {str(e)}")
        return jsonify({'error': f'Failed to generate blueprint: {str(e)}'}), 500

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
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            
            return jsonify({
                'success': True,
                'response': response.text
            })
        except Exception as gemini_error:
            if "quota" in str(gemini_error).lower() or "429" in str(gemini_error):
                print("Gemini API quota exceeded, using fallback chat response")
                # Fallback response based on message content
                lower_message = message.lower()
                if "exercise" in lower_message or "worked out" in lower_message:
                    fallback_response = "Great job on exercising today! That's fantastic for your health. Keep up the good work and remember to stay hydrated. Your health score will improve with consistent exercise!"
                elif "sleep" in lower_message:
                    fallback_response = "Sleep is crucial for your health! Aim for 7-8 hours of quality sleep each night. Good sleep helps with recovery, mood, and overall well-being."
                elif "steps" in lower_message or "walk" in lower_message:
                    fallback_response = "Walking is excellent for your health! Try to reach 10,000 steps daily. Every step counts towards better cardiovascular health and fitness."
                elif "water" in lower_message or "hydrat" in lower_message:
                    fallback_response = "Staying hydrated is so important! Aim for 8 glasses of water daily. Proper hydration helps with energy, skin health, and overall body function."
                else:
                    fallback_response = "Thanks for sharing that with me! I'm here to help you with your health journey. Keep up the great work and feel free to ask me any health-related questions!"
                
                return jsonify({
                    'success': True,
                    'response': fallback_response
                })
            else:
                raise gemini_error
        
    except Exception as e:
        print(f"Error processing chat: {str(e)}")
        return jsonify({'error': 'Failed to process chat message'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 6549))
    print(f"Server running on http://localhost:{port}")
    print("Make sure to set your GEMINI_API_KEY in the .env file")
    app.run(host='0.0.0.0', port=port, debug=True)
