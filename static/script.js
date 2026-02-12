// static/script.js

// Password visibility toggle
const passwordInput = document.getElementById('passwordInput');
const toggleButton = document.getElementById('togglePassword');

if (toggleButton) {
    toggleButton.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.textContent = '🙈 Hide';
        } else {
            passwordInput.type = 'password';
            toggleButton.textContent = '👁️ Show';
        }
    });
}

// Check password form submission
const checkForm = document.getElementById('checkForm');
if (checkForm) {
    checkForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent page reload
        
        const password = passwordInput.value;
        const resultsDiv = document.getElementById('results');
        
        // Show loading state
        resultsDiv.classList.remove('hidden');
        resultsDiv.innerHTML = '<p>Analyzing password...</p>';
        
        try {
            // Create FormData object
            const formData = new FormData();
            formData.append('password', password);
            
            // Send POST request to Flask backend
            const response = await fetch('/check_password', {
                method: 'POST',
                body: formData
            });
            
            console.log('Response status:', response.status); // Debug
            
            const data = await response.json();
            console.log('Response data:', data); // Debug
            
            if (data.error) {
                resultsDiv.innerHTML = `<p style="color: red;">${data.error}</p>`;
                return;
            }
            
            // Display results
            displayResults(data);
            
        } catch (error) {
            console.error('Error details:', error); // Debug
            resultsDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    });
}

// Display results function
function displayResults(data) {
    console.log('Displaying results:', data); // Debug
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');
    
    // Build HTML for results
    let html = `
        <div class="strength-badge strength-${data.strength}">
            ${data.strength}
        </div>
        
        <div class="result-item">
            <strong>Score:</strong> <span>${data.score}/6</span>
        </div>
        
        <div class="result-item">
            <strong>Entropy:</strong> <span>${data.entropy} bits</span>
        </div>
        
        <div class="result-item">
            <strong>Feedback:</strong>
            <ul id="feedback">
    `;
    
    // Add feedback items
    data.feedback.forEach(item => {
        html += `<li>${item}</li>`;
    });
    
    html += `</ul></div>`;
    
    // Add breach info
    if (data.breached) {
        html += `
            <div class="breach-info breach-warning">
                ⚠️ WARNING: This password has been seen 
                <strong>${data.breach_count.toLocaleString()}</strong> 
                times in data breaches!<br>
                NEVER use this password!
            </div>
        `;
    } else if (data.breached === false) {
        html += `
            <div class="breach-info breach-safe">
                ✓ This password has not been found in known breaches
            </div>
        `;
    } else {
        html += `
            <div class="breach-info">
                ⚠️ Could not check breach database
            </div>
        `;
    }
    
    resultsDiv.innerHTML = html;
}

// Length slider update
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');

if (lengthSlider) {
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });
}

// Generate password form
const generateForm = document.getElementById('generateForm');
if (generateForm) {
    generateForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const length = lengthSlider.value;
        const symbols = document.getElementById('symbolsCheck').checked;
        
        try {
            const formData = new FormData();
            formData.append('length', length);
            formData.append('symbols', symbols);
            
            const response = await fetch('/generate_password', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            console.log('Generated password data:', data); // Debug
            
            // Display generated password
            const genDiv = document.getElementById('generatedPassword');
            const passwordDisplay = document.getElementById('passwordDisplay');
            const genInfo = document.getElementById('genInfo');
            
            passwordDisplay.textContent = data.password;
            genInfo.innerHTML = `
                Strength: <strong>${data.strength}</strong> | 
                Entropy: <strong>${data.entropy} bits</strong>
            `;
            
            genDiv.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating password: ' + error.message);
        }
    });
}

// Copy password to clipboard
const copyButton = document.getElementById('copyButton');
if (copyButton) {
    copyButton.addEventListener('click', function() {
        const password = document.getElementById('passwordDisplay').textContent;
        
        navigator.clipboard.writeText(password).then(function() {
            const originalText = copyButton.textContent;
            copyButton.textContent = '✓ Copied!';
            copyButton.style.background = '#28a745';
            
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.style.background = '';
            }, 2000);
        }).catch(function(err) {
            console.error('Copy failed:', err);
            alert('Could not copy password');
        });
    });
}
// ```

// ---

// ## **Key Changes I Made:**

// 1. **Changed from URL encoding to FormData** - More reliable for Flask
// 2. **Added console.log statements** - So you can see what's happening
// 3. **Better error handling** - Shows actual error messages
// 4. **Fixed the displayResults function** - Builds HTML correctly
// 5. **Added null checks** - Prevents errors if elements don't exist

// ---

// ## **Now Test It:**

// 1. **Save the updated `script.js`**
// 2. **Refresh your browser** (or press Ctrl+Shift+R for hard refresh)
// 3. **Open browser console** (F12 → Console tab)
// 4. **Enter a password and click Analyze**
// 5. **Look at the console** - you should see:
// ```
//    Response status: 200
//    Response data: {strength: "WEAK", score: 2, ...}
//    Displaying results: {strength: "WEAK", score: 2, ...}
// ```

// ---

// ## **If It Still Shows "Error analyzing password":**

// Check the browser console and tell me:
// 1. What does `Response status:` show?
// 2. What does `Response data:` show?
// 3. Are there any red error messages?

// The console will tell us exactly what's failing!

// ---

// ## **Quick Alternative Test:**

// If you want to verify the backend is 100% working, open this URL in your browser while Flask is running:
// ```
// http://127.0.0.1:5000/