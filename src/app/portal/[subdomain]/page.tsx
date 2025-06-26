'use client'

import { useState, useRef } from 'react'

interface SubmissionState {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message?: string
}

export default function SimplePortalPage({ params }: { params: { subdomain: string } }) {
  const [textContent, setTextContent] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [submission, setSubmission] = useState<SubmissionState>({ status: 'idle' })
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        
        // Create audio URL for playback
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob)
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setSubmission({ 
        status: 'error', 
        message: 'Could not access microphone. Please check permissions.' 
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const submitForm = async () => {
    if (!textContent.trim() && !audioBlob) {
      setSubmission({
        status: 'error',
        message: 'Please provide either text or voice message'
      })
      return
    }

    setSubmission({ status: 'submitting' })

    try {
      const formData = new FormData()
      formData.append('textContent', textContent)
      formData.append('isUrgent', isUrgent.toString())
      formData.append('subdomain', params.subdomain)
      
      if (audioBlob) {
        formData.append('voiceFile', audioBlob, 'voice-message.webm')
      }

      const response = await fetch('/api/portal/submit', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setSubmission({ 
          status: 'success', 
          message: 'Request submitted successfully!' 
        })
        
        // Reset form
        setTextContent('')
        setIsUrgent(false)
        setAudioBlob(null)
        if (audioRef.current) {
          audioRef.current.src = ''
        }
      } else {
        throw new Error('Submission failed')
      }
    } catch {
      setSubmission({
        status: 'error',
        message: 'Error submitting request. Please try again.'
      })
    }
  }

  return (
    <div className="portal-container">
      <h1>Submit Your Request</h1>
      
      {/* Text Entry Area */}
      <div className="text-section">
        <label htmlFor="textContent">Describe your request:</label>
        <textarea
          id="textContent"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Share your thoughts, ideas, or requests here... What's on your mind today?"
          disabled={submission.status === 'submitting'}
        />
      </div>
      
      {/* Voice Entry Area */}
      <div className="voice-section">
        <label>Or record a voice message:</label>
        <div className="voice-controls">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={submission.status === 'submitting'}
            className={isRecording ? 'recording' : 'record'}
          >
            {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
          </button>
          
          {audioBlob && (
            <audio
              ref={audioRef}
              controls
              className="audio-playback"
            />
          )}
        </div>
      </div>
      
      {/* Urgent Checkbox */}
      <div className="urgent-section">
        <label className="urgent-label">
          <input
            type="checkbox"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
            disabled={submission.status === 'submitting'}
          />
          This is urgent
        </label>
      </div>
      
      {/* Submit Button */}
      <button
        onClick={submitForm}
        disabled={submission.status === 'submitting'}
        className="submit-btn"
      >
        {submission.status === 'submitting' ? 'Submitting...' : 'Submit Request'}
      </button>
      
      {/* Status Messages */}
      {submission.message && (
        <div className={`status-message ${submission.status}`}>
          {submission.message}
        </div>
      )}

      <style jsx>{`
        .portal-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          position: relative;
        }

        h1 {
          text-align: center;
          color: #212529;
          margin-bottom: 30px;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .text-section {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .text-section label {
          margin-bottom: 12px;
          font-weight: 600;
          color: #495057;
          font-size: 16px;
        }

        .text-section textarea {
          flex: 1;
          min-height: 200px;
          padding: 20px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          line-height: 1.5;
          -webkit-appearance: none;
          -webkit-tap-highlight-color: transparent;
        }

        .text-section textarea:focus {
          border-color: #FCC931;
          box-shadow: 0 0 0 4px rgba(252, 201, 49, 0.1);
          background: rgba(255, 255, 255, 1);
        }

        .text-section textarea::placeholder {
          color: #6c757d;
          font-style: italic;
        }

        .voice-section {
          text-align: center;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .voice-section label {
          display: block;
          margin-bottom: 20px;
          font-weight: 600;
          color: #495057;
          font-size: 16px;
        }

        .voice-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .voice-controls button {
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 8px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .record {
          background: linear-gradient(135deg, #FCC931 0%, #e6b52a 100%);
          color: #212529;
        }

        .record:hover:not(:disabled) {
          background: linear-gradient(135deg, #e6b52a 0%, #d4a428 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(252, 201, 49, 0.4);
        }

        .recording {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          animation: pulse 1.5s infinite;
        }

        .recording:hover:not(:disabled) {
          background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
        }

        @keyframes pulse {
          0% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.05);
          }
          100% { 
            opacity: 1; 
            transform: scale(1);
          }
        }

        .audio-playback {
          width: 100%;
          max-width: 320px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.9);
        }

        .urgent-section {
          text-align: center;
          background: rgba(255, 248, 220, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 20px;
          border: 2px solid #FCC931;
        }

        .urgent-label {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          font-weight: 600;
          color: #856404;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .urgent-label:hover {
          color: #533f03;
        }

        .urgent-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #FCC931;
        }

        .submit-btn {
          padding: 20px 40px;
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, #FCC931 0%, #e6b52a 100%);
          color: #212529;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(252, 201, 49, 0.3);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #e6b52a 0%, #d4a428 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(252, 201, 49, 0.4);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .status-message {
          padding: 16px 20px;
          border-radius: 12px;
          text-align: center;
          font-weight: 600;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .status-message.success {
          background: rgba(212, 237, 218, 0.9);
          color: #155724;
          border-color: #c3e6cb;
        }

        .status-message.error {
          background: rgba(248, 215, 218, 0.9);
          color: #721c24;
          border-color: #f5c6cb;
        }

        @media (max-width: 768px) {
          .portal-container {
            padding: 24px 20px 32px 20px;
            gap: 28px;
            min-height: 100vh;
            min-height: 100dvh;
            max-width: 100%;
          }
          
          h1 {
            font-size: 26px;
            margin-bottom: 32px;
            line-height: 1.2;
            font-weight: 800;
          }
          
          .text-section {
            flex: 1;
            min-height: 0;
          }
          
          .text-section label {
            font-size: 17px;
            margin-bottom: 16px;
            font-weight: 700;
          }
          
          .text-section textarea {
            min-height: 180px;
            padding: 20px;
            font-size: 17px;
            border-radius: 16px;
            border-width: 1px;
            line-height: 1.6;
          }
          
          .voice-section {
            padding: 24px 20px;
            border-radius: 20px;
            margin: 0 -4px;
          }
          
          .voice-section label {
            font-size: 17px;
            margin-bottom: 24px;
            font-weight: 700;
          }
          
          .voice-controls button {
            padding: 18px 40px;
            font-size: 17px;
            min-width: 200px;
            font-weight: 700;
          }
          
          .urgent-section {
            padding: 20px;
            border-radius: 16px;
            margin: 0 -4px;
            border-width: 1px;
          }
          
          .urgent-label {
            font-size: 17px;
            gap: 16px;
            font-weight: 700;
          }
          
          .urgent-label input[type="checkbox"] {
            width: 24px;
            height: 24px;
          }
          
          .submit-btn {
            padding: 20px 40px;
            font-size: 17px;
            font-weight: 800;
            margin-top: 8px;
            min-height: 60px;
          }
          
          .status-message {
            padding: 20px;
            font-size: 16px;
            border-radius: 16px;
            margin: 0 -4px;
          }
        }
      `}</style>
    </div>
  )
} 