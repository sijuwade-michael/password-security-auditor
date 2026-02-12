import re
import math
import hashlib  
import requests
import secrets
import string

def check_password_strength(password):
    """Analyze password strength"""
    
    score = 0
    feedback = []
    
    # Length check
    length = len(password)
    if length < 8:
        feedback.append("❌ Too short (minimum 8 characters)")
    elif length < 12:
        score += 1
        feedback.append("⚠️ Could be longer (12+ recommended)")
    else:
        score += 2
        feedback.append("✓ Good length")
    
    # Character variety checks
    if re.search(r'[a-z]', password):
        score += 1
    else:
        feedback.append("❌ Add lowercase letters")
    
    if re.search(r'[A-Z]', password):
        score += 1
    else:
        feedback.append("❌ Add uppercase letters")
    
    if re.search(r'\d', password):
        score += 1
    else:
        feedback.append("❌ Add numbers")
    
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 1
    else:
        feedback.append("❌ Add special characters")
    
    # Calculate entropy (randomness)
    entropy = calculate_entropy(password)
    
    # Determine strength level
    if score <= 2:
        strength = "WEAK"
    elif score <= 4:
        strength = "MODERATE"
    else:
        strength = "STRONG"
    
    return {
        'strength': strength,
        'score': score,
        'entropy': entropy,
        'feedback': feedback
    }

def calculate_entropy(password):
    """Calculate password entropy in bits"""
    
    charset_size = 0
    
    if re.search(r'[a-z]', password):
        charset_size += 26
    if re.search(r'[A-Z]', password):
        charset_size += 26
    if re.search(r'\d', password):
        charset_size += 10
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        charset_size += 32
    
    if charset_size == 0:
        return 0
    
    entropy = len(password) * math.log2(charset_size)
    return round(entropy, 2)

def check_password_breach(password):
    """Check if password appears in known data breaches"""
    
    # Hash the password using SHA-1
    sha1_password = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    
    # Use k-anonymity: send only first 5 characters
    prefix = sha1_password[:5]
    suffix = sha1_password[5:]
    
    # Query the API
    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    
    try:
        response = requests.get(url)
        
        if response.status_code == 200:
            # Check if our suffix appears in results
            hashes = response.text.splitlines()
            
            for hash_line in hashes:
                hash_suffix, count = hash_line.split(':')
                if hash_suffix == suffix:
                    return {
                        'breached': True,
                        'count': int(count)
                    }
            
            return {'breached': False, 'count': 0}
        else:
            return {'breached': None, 'count': 0}  # API error
    
    except Exception as e:
        print(f"Error checking breach database: {e}")
        return {'breached': None, 'count': 0}
    

def generate_password(length=16, use_symbols=True):
    """Generate a cryptographically secure password"""
    
    # Character sets
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    # Build character pool
    characters = lowercase + uppercase + digits
    if use_symbols:
        characters += symbols
    
    # Ensure at least one of each type
    password = [
        secrets.choice(lowercase),
        secrets.choice(uppercase),
        secrets.choice(digits),
    ]
    
    if use_symbols:
        password.append(secrets.choice(symbols))
    
    # Fill the rest randomly
    for _ in range(length - len(password)):
        password.append(secrets.choice(characters))
    
    # Shuffle to randomize positions
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)

# Test it
if __name__ == "__main__":
    print("=== Password Security Auditor ===\n")
    
    password = input("Enter password to test: ")
    
    # Check strength
    result = check_password_strength(password)
    
    print(f"\nStrength: {result['strength']}")
    print(f"Score: {result['score']}/6")
    print(f"Entropy: {result['entropy']} bits")
    print("\nFeedback:")
    for item in result['feedback']:
        print(f"  {item}")
    
    # Check breaches
    print("\nChecking breach database...")
    breach_result = check_password_breach(password)
    
    if breach_result['breached']:
        print(f"⚠️ WARNING: This password has been seen {breach_result['count']:,} times in data breaches!")
        print("   NEVER use this password!")
    elif breach_result['breached'] == False:
        print("✓ This password has not been found in known breaches")
    else:
        print("⚠️ Could not check breach database")