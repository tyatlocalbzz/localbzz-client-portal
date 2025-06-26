# Simple Client Portal Integration Guide

## Overview
This is a streamlined client portal consisting of a single page form with four main components:
1. Text entry area
2. Voice entry area
3. Urgent need checkbox
4. Submission button

## Database Schema

### Tables
- **clients**: Basic client information with subdomain for portal access
- **portal_submissions**: Form submissions with text, voice, and urgency data

### Key Features
- UUID primary keys
- Automatic timestamps
- Voice transcription support
- Status tracking
- Urgency flagging

## API Endpoints

### Client Portal Access
```
GET  /portal/:subdomain
POST /portal/:subdomain/submit
```

### Admin Endpoints
```
GET  /api/submissions
GET  /api/submissions/urgent
GET  /api/submissions/:id
PUT  /api/submissions/:id/status
```

## Frontend Requirements

### Single Page Portal (`/portal/:subdomain`)

#### HTML Structure
```html
<!DOCTYPE html>
<html>
<head>
    <title>Client Portal</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div class="portal-container">
        <h1>Submit Your Request</h1>
        
        <!-- Text Entry Area -->
        <div class="text-section">
            <label for="textContent">Describe your request:</label>
            <textarea id="textContent" placeholder="Type your message here..."></textarea>
        </div>
        
        <!-- Voice Entry Area -->
        <div class="voice-section">
            <label>Or record a voice message:</label>
            <button id="recordBtn">🎤 Start Recording</button>
            <button id="stopBtn" disabled>⏹️ Stop Recording</button>
            <audio id="audioPlayback" controls style="display: none;"></audio>
        </div>
        
        <!-- Urgent Checkbox -->
        <div class="urgent-section">
            <label>
                <input type="checkbox" id="isUrgent">
                This is urgent
            </label>
        </div>
        
        <!-- Submit Button -->
        <button id="submitBtn">Submit Request</button>
        
        <!-- Status Messages -->
        <div id="statusMessage"></div>
    </div>
</body>
</html>
```

#### CSS Styling
```css
.portal-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.text-section textarea {
    width: 100%;
    height: 200px;
    padding: 15px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    resize: vertical;
}

.voice-section {
    margin: 20px 0;
    text-align: center;
}

.voice-section button {
    margin: 10px;
    padding: 15px 30px;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

#recordBtn {
    background-color: #ff4444;
    color: white;
}

#stopBtn {
    background-color: #666;
    color: white;
}

.urgent-section {
    margin: 20px 0;
}

.urgent-section input[type="checkbox"] {
    transform: scale(1.5);
    margin-right: 10px;
}

#submitBtn {
    padding: 20px;
    font-size: 18px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: auto;
}

#submitBtn:hover {
    background-color: #0056b3;
}

#statusMessage {
    margin-top: 20px;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
}

.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
```

#### JavaScript Functionality
```javascript
class PortalApp {
    constructor() {
        this.mediaRecorder = null;
        this.audioBlob = null;
        this.subdomain = window.location.pathname.split('/')[2];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('recordBtn').addEventListener('click', () => this.startRecording());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopRecording());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitForm());
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioBlob = event.data;
                const audioUrl = URL.createObjectURL(this.audioBlob);
                const audioElement = document.getElementById('audioPlayback');
                audioElement.src = audioUrl;
                audioElement.style.display = 'block';
            };

            this.mediaRecorder.start();
            document.getElementById('recordBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
        } catch (error) {
            this.showStatus('Error accessing microphone', 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            document.getElementById('recordBtn').disabled = false;
            document.getElementById('stopBtn').disabled = true;
        }
    }

    async submitForm() {
        const textContent = document.getElementById('textContent').value.trim();
        const isUrgent = document.getElementById('isUrgent').checked;

        if (!textContent && !this.audioBlob) {
            this.showStatus('Please provide either text or voice message', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('textContent', textContent);
        formData.append('isUrgent', isUrgent);
        
        if (this.audioBlob) {
            formData.append('voiceFile', this.audioBlob, 'voice-message.webm');
        }

        try {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('submitBtn').textContent = 'Submitting...';

            const response = await fetch(`/portal/${this.subdomain}/submit`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                this.showStatus('Request submitted successfully!', 'success');
                this.resetForm();
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            this.showStatus('Error submitting request. Please try again.', 'error');
        } finally {
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('submitBtn').textContent = 'Submit Request';
        }
    }

    resetForm() {
        document.getElementById('textContent').value = '';
        document.getElementById('isUrgent').checked = false;
        document.getElementById('audioPlayback').style.display = 'none';
        this.audioBlob = null;
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('statusMessage');
        statusDiv.textContent = message;
        statusDiv.className = type;
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = '';
        }, 5000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PortalApp();
});
```

## Backend API Implementation

### Portal Submission Endpoint
```javascript
// POST /portal/:subdomain/submit
app.post('/portal/:subdomain/submit', upload.single('voiceFile'), async (req, res) => {
    try {
        const { subdomain } = req.params;
        const { textContent, isUrgent } = req.body;
        
        // Find client by subdomain
        const client = await db.query(
            'SELECT id FROM clients WHERE subdomain = $1 AND is_active = true',
            [subdomain]
        );
        
        if (!client.rows.length) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        let voiceFileUrl = null;
        if (req.file) {
            // Upload to cloud storage and get URL
            voiceFileUrl = await uploadToCloudStorage(req.file);
        }
        
        // Insert submission
        const result = await db.query(`
            INSERT INTO portal_submissions 
            (client_id, text_content, voice_file_url, is_urgent) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id
        `, [client.rows[0].id, textContent, voiceFileUrl, isUrgent === 'true']);
        
        // Trigger transcription if voice file exists
        if (voiceFileUrl) {
            await triggerTranscription(result.rows[0].id, voiceFileUrl);
        }
        
        // Send notification if urgent
        if (isUrgent === 'true') {
            await sendUrgentNotification(client.rows[0].id, result.rows[0].id);
        }
        
        res.json({ success: true, submissionId: result.rows[0].id });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
```

## Deployment Requirements

### Environment Variables
```
DATABASE_URL=postgresql://...
CLOUD_STORAGE_BUCKET=your-bucket-name
TRANSCRIPTION_API_KEY=your-api-key
NOTIFICATION_WEBHOOK_URL=your-webhook-url
```

### File Structure
```
/
├── public/
│   ├── portal.html
│   ├── portal.css
│   └── portal.js
├── server.js
├── database.js
└── package.json
```

This simplified approach gives you exactly what you need: a single-page portal that clients can access via their subdomain, with the ability to submit text or voice messages and mark them as urgent. 