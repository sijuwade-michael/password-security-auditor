# app.py
from flask import Flask, render_template, request, jsonify
from password_functions import (
    check_password_strength, 
    check_password_breach, 
    generate_password
)

# Create Flask app
app = Flask(__name__)

# Route for home page
@app.route('/')
def home():
    """Display the main page"""
    return render_template('index.html')

# Route to check password (receives data from form)
@app.route('/check_password', methods=['POST'])
def check_password():
    """Analyze password and return results"""
    
    # Get password from form
    password = request.form.get('password')
    
    if not password:
        return jsonify({'error': 'Please enter a password'})
    
    # Check strength
    strength_result = check_password_strength(password)
    
    # Check breaches
    breach_result = check_password_breach(password)
    
    # Combine results
    result = {
        'strength': strength_result['strength'],
        'score': strength_result['score'],
        'entropy': strength_result['entropy'],
        'feedback': strength_result['feedback'],
        'breached': breach_result['breached'],
        'breach_count': breach_result['count']
    }
    
    return jsonify(result)

# Route to generate password
@app.route('/generate_password', methods=['POST'])
def generate_new_password():
    """Generate a secure password"""
    
    # Get options from form
    length = int(request.form.get('length', 16))
    use_symbols = request.form.get('symbols', 'true') == 'true'
    
    # Generate password
    new_password = generate_password(length, use_symbols)
    
    # Check its strength automatically
    strength_result = check_password_strength(new_password)
    
    result = {
        'password': new_password,
        'strength': strength_result['strength'],
        'entropy': strength_result['entropy']
    }
    
    return jsonify(result)

# Run the app
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)