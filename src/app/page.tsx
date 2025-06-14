'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mic, Send, CheckCircle, AlertCircle, AlertTriangle, Upload, X, FileText, Image, Film, Square, Play, Pause } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: '900',
  variable: '--font-montserrat'
})

interface SubmissionState {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message?: string
}

interface ClientInfo {
  id: string
  name: string
  services: string[]
  status: string
  subdomain: string
}

export default function IdeaSubmissionPage() {
  const [subdomain, setSubdomain] = useState<string>('')
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
  const [requestText, setRequestText] = useState<string>('')
  const [isPriorityRequest, setIsPriorityRequest] = useState<boolean>(false)
  const [submission, setSubmission] = useState<SubmissionState>({ status: 'idle' })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [recordingDuration, setRecordingDuration] = useState<number>(0)
  const [voiceRecording, setVoiceRecording] = useState<Blob | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Extract subdomain and determine client
    const hostname = window.location.hostname
    const parts = hostname.split('.')
    
    let extractedSubdomain = 'demo'
    
    if (parts.length >= 3 && !hostname.includes('localhost') && !hostname.includes('vercel.app')) {
      // Production subdomain e.g., "acme.localbzz.com" -> "acme"
      extractedSubdomain = parts[0]
    } else if (hostname.includes('localhost') || hostname.includes('vercel.app')) {
      // Development - check for query parameter or default to demo
      const urlParams = new URLSearchParams(window.location.search)
      const clientParam = urlParams.get('client')
      if (clientParam) {
        extractedSubdomain = clientParam
      } else {
        extractedSubdomain = 'demo'
      }
    }
    
    setSubdomain(extractedSubdomain)
    
    // Fetch client info
    fetchClientInfo(extractedSubdomain)

    // Set CSS custom property for accurate viewport height on mobile
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial value
    setViewportHeight();

    // Update on resize (when mobile browser UI changes)
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, [])

  const fetchClientInfo = async (subdomainToFetch: string) => {
    try {
      const response = await fetch(`/api/client-info?subdomain=${encodeURIComponent(subdomainToFetch)}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setClientInfo(data.client)
      } else {
        // Still continue with demo/default experience
        setClientInfo(null)
      }
    } catch (error) {
      console.error('💥 Error fetching client info:', error)
      setClientInfo(null)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files).filter(file => {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Maximum size is 10MB.`)
          return false
        }
        return true
      })
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    const files = event.dataTransfer.files
    if (files) {
      const newFiles = Array.from(files).filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Maximum size is 10MB.`)
          return false
        }
        return true
      })
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!requestText.trim() && !voiceRecording) {
      setSubmission({ 
        status: 'error', 
        message: 'Please share your thoughts, ideas, insights, or record a voice memo!' 
      })
      return
    }

    setSubmission({ status: 'submitting' })

    // Stop recording if still active
    if (isRecording) {
      stopRecording()
      // Wait a bit for the recording to finalize
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    try {
      // Create FormData to handle both text and file uploads
      const formData = new FormData()
      
      // Add text content (or placeholder for voice-only)
      formData.append('content', requestText.trim() || `[Voice memo recorded - ${formatDuration(recordingDuration)}]`)
      formData.append('subdomain', subdomain)
      formData.append('deviceType', /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop')
      formData.append('isPriorityRequest', isPriorityRequest.toString())
      
      // Add voice recording if it exists
      if (voiceRecording) {
        // Determine file extension based on MIME type
        let extension = 'webm'
        if (voiceRecording.type.includes('mp4')) {
          extension = 'mp4'
        } else if (voiceRecording.type.includes('wav')) {
          extension = 'wav'
        } else if (voiceRecording.type.includes('ogg')) {
          extension = 'ogg'
        }
        
        formData.append('voiceMemo', voiceRecording, `voice-memo-${Date.now()}.${extension}`)
      }
      
      // Add other files
      selectedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file)
      })

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData, // Send FormData instead of JSON
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const messageType = isPriorityRequest 
          ? 'Your request has been submitted! We\'ll use this to create amazing content together.'
          : 'Thanks for sharing your insights! We\'ll use this to create amazing content together.'
        
        setSubmission({ 
          status: 'success', 
          message: messageType 
        })
        setRequestText('')
        setIsPriorityRequest(false)
        setSelectedFiles([])
        deleteRecording() // Clear voice recording
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmission({ status: 'idle' })
        }, 5000)
      } else {
        throw new Error(result.error || 'Failed to submit')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setSubmission({ 
        status: 'error', 
        message: 'Sorry, there was an issue sharing your insights. Please try again!' 
      })
      
      // Reset error message after 5 seconds
      setTimeout(() => {
        setSubmission({ status: 'idle' })
      }, 5000)
    }
  }

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      // Try different mime types in order of preference for OpenAI Whisper compatibility
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/wav'
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = '' // Let browser choose
            }
          }
        }
      }
      
      console.log('🎤 Using audio format:', mimeType || 'browser default')
      
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      
      const chunks: BlobPart[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        // Use explicit MIME type for better OpenAI compatibility
        const audioType = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunks, { type: audioType })
        
        console.log('📼 Recording finished:', {
          size: blob.size,
          type: blob.type,
          duration: recordingDuration
        })
        
        setVoiceRecording(blob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setIsPaused(false)
      setRecordingDuration(0)
      
      // Start timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
      setRecordingTimer(timer)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      setSubmission({
        status: 'error',
        message: 'Could not start recording. Please check microphone permissions.'
      })
      setTimeout(() => setSubmission({ status: 'idle' }), 3000)
    }
  }

  const pauseResumeRecording = () => {
    if (!mediaRecorder) return
    
    if (isPaused) {
      mediaRecorder.resume()
      setIsPaused(false)
      // Resume timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
      setRecordingTimer(timer)
    } else {
      mediaRecorder.pause()
      setIsPaused(true)
      // Pause timer
      if (recordingTimer) {
        clearInterval(recordingTimer)
        setRecordingTimer(null)
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (recordingTimer) {
        clearInterval(recordingTimer)
        setRecordingTimer(null)
      }
    }
  }

  const deleteRecording = () => {
    stopRecording()
    setVoiceRecording(null)
    setRecordingDuration(0)
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden" style={{ 
      height: '100dvh', 
      minHeight: 'calc(var(--vh, 1vh) * 100)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {/* Header */}
      <header className="bg-gray-900 text-white py-3 px-4 flex-shrink-0 z-40">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center space-x-2">
            <h1 className={`${montserrat.className} text-lg font-black`}>
              LOCAL BZZ
            </h1>
            {clientInfo?.name && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-sm font-medium text-gray-300">{clientInfo.name}</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Navigation - Under header */}
      <Navigation />

      {/* Main Content - Account for bottom elements height: nav (64px) + powered by (48px) = 112px */}
      <div className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-6 flex flex-col overflow-hidden" style={{ 
        paddingBottom: 'max(112px, calc(112px + env(safe-area-inset-bottom)))'
      }}>
        {/* Main Form - Fills available space */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Text Input - Expands to fill available space */}
          <div className="flex-1 flex flex-col min-h-0">
            <Textarea
              id="idea-input"
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="Your input, ideas, insights, and feedback are invaluable for creating content that represents you, connects with your audience, and humanizes your brand. Please share them here."
              className="flex-1 resize-none text-base leading-relaxed border-2 border-gray-200 focus:border-[#FCC931] focus:ring-0 rounded-xl bg-white"
              disabled={submission.status === 'submitting'}
            />
          </div>

          {/* Voice Recording and File Upload - Fixed height */}
          <div className={`gap-3 flex-shrink-0 ${isRecording ? 'space-y-3' : 'grid grid-cols-2'}`}>
            {/* Voice Recording Section */}
            <div className={isRecording ? 'col-span-2' : ''}>
              {!voiceRecording ? (
                <div className={`flex flex-col items-center bg-gray-50 rounded-xl transition-all ${
                  isRecording 
                    ? 'py-6 px-6 space-y-4' 
                    : 'py-3 space-y-2 h-24 justify-center'
                }`}>
                  {/* Main recording button and controls */}
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      type="button"
                      onClick={isRecording ? pauseResumeRecording : startRecording}
                      className={`${isRecording ? 'w-12 h-12' : 'w-10 h-10'} rounded-full p-0 transition-all shadow-lg ${
                        isRecording && !isPaused
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                          : isRecording && isPaused
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-[#FCC931] hover:bg-[#e6b52a]'
                      }`}
                      disabled={submission.status === 'submitting'}
                    >
                      {isRecording && !isPaused ? (
                        <Pause className="h-5 w-5 text-white" />
                      ) : isRecording && isPaused ? (
                        <Play className="h-5 w-5 text-white" />
                      ) : (
                        <Mic className="h-4 w-4 text-gray-800" />
                      )}
                    </Button>
                    
                    {isRecording && (
                      <>
                        {/* Timer */}
                        <div className="text-2xl font-mono text-red-600 font-bold min-w-[80px] text-center">
                          {formatDuration(recordingDuration)}
                        </div>
                        
                        {/* Stop button */}
                        <Button
                          type="button"
                          onClick={stopRecording}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 px-4 py-2"
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {/* Status text */}
                  <p className={`text-gray-600 text-center ${isRecording ? 'text-base' : 'text-sm px-4'}`}>
                    {isRecording && !isPaused
                      ? 'Recording...'
                      : isRecording && isPaused
                      ? 'Paused - Tap to resume'
                      : 'Tap to record'
                    }
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 rounded-full p-2">
                        <Mic className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-green-800">
                          Recorded • {formatDuration(recordingDuration)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={deleteRecording}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* File Upload Section - Hidden when recording */}
            {!isRecording && (
              <div>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center hover:border-[#FCC931] hover:bg-[#FCC931]/5 transition-all cursor-pointer group h-24 flex flex-col justify-center"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="h-5 w-5 text-gray-400 group-hover:text-[#FCC931] mx-auto mb-1 transition-colors" />
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Click or drag files
                  </p>
                  <p className="text-xs text-gray-500">
                    Max 10MB each
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt,.rtf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-900 mb-1">
                      {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {selectedFiles.map((file, index) => {
                        const getFileIcon = () => {
                          if (file.type.startsWith('image/')) return <Image className="h-3 w-3 text-blue-500" />
                          if (file.type.startsWith('video/')) return <Film className="h-3 w-3 text-purple-500" />
                          return <FileText className="h-3 w-3 text-gray-500" />
                        }

                        return (
                          <div key={index} className="flex items-center justify-between p-1 bg-gray-50 rounded text-xs">
                            <div className="flex items-center space-x-1 flex-1 min-w-0">
                              {getFileIcon()}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-gray-400 hover:text-red-500 p-0 h-4 w-4"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Request Type Selection and Submit Button - Fixed at bottom */}
          <div className="space-y-4 flex-shrink-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-xl border border-blue-200">
                <input
                  id="priority-checkbox"
                  type="checkbox"
                  checked={isPriorityRequest}
                  onChange={(e) => setIsPriorityRequest(e.target.checked)}
                  className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="priority-checkbox"
                  className="text-sm font-medium text-blue-700 cursor-pointer select-none flex-1"
                >
                  This is a priority request
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className={`w-full h-[50px] text-base font-bold transition-all rounded-xl border-0 shadow-lg ${
                isPriorityRequest
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                  : 'bg-gradient-to-r from-[#FCC931] to-[#e6b52a] hover:from-[#e6b52a] hover:to-[#d4a428] text-gray-800'
              }`}
              disabled={submission.status === 'submitting' || (!requestText.trim() && !voiceRecording)}
            >
              {submission.status === 'submitting' ? (
                <>
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-current mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  {isPriorityRequest ? (
                    <AlertTriangle className="h-7 w-7 mr-2" />
                  ) : (
                    <Send className="h-7 w-7 mr-2" />
                  )}
                  {isPriorityRequest ? 'Submit Request' : 'Share With Local Bzz'}
                </>
              )}
            </Button>
          </div>

          {/* Status Messages */}
          {submission.status === 'success' && (
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">{submission.message}</p>
            </div>
          )}

          {submission.status === 'error' && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{submission.message}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
