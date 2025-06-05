'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Send, CheckCircle, AlertCircle, AlertTriangle, Upload, X, FileText, Image, Film, Square, Play, Pause } from 'lucide-react'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: '900', // Black weight
  variable: '--font-montserrat'
})

interface SubmissionState {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message?: string
}

export default function IdeaSubmissionPage() {
  const [subdomain, setSubdomain] = useState<string>('')
  const [requestText, setRequestText] = useState<string>('')
  const [isRequest, setIsRequest] = useState<boolean>(false)
  const [isUrgent, setIsUrgent] = useState<boolean>(false)
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
    
    console.log('🌐 Frontend subdomain extraction:')
    console.log('- Hostname:', hostname)
    console.log('- Parts:', parts)
    
    if (parts.length >= 3 && !hostname.includes('localhost') && !hostname.includes('vercel.app')) {
      // Production subdomain e.g., "acme.localbzz.com" -> "acme"
      extractedSubdomain = parts[0]
      console.log('- Production subdomain detected:', extractedSubdomain)
    } else if (hostname.includes('localhost') || hostname.includes('vercel.app')) {
      // Development - check for query parameter or default to demo
      const urlParams = new URLSearchParams(window.location.search)
      const clientParam = urlParams.get('client')
      if (clientParam) {
        extractedSubdomain = clientParam
        console.log('- Using client from URL parameter:', extractedSubdomain)
      } else {
        extractedSubdomain = 'demo'
        console.log('- Using default subdomain for localhost:', extractedSubdomain)
      }
    }
    
    console.log('- Final subdomain:', extractedSubdomain)
    setSubdomain(extractedSubdomain)
  }, [])

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
      // For now, we'll just include file info in the request
      // Later we can implement actual file upload to cloud storage
      const fileInfo = selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))

      // Add voice recording as a "file" if it exists
      if (voiceRecording) {
        fileInfo.push({
          name: `voice-memo-${Date.now()}.webm`,
          size: voiceRecording.size,
          type: voiceRecording.type
        })
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: requestText.trim() || `[Voice memo recorded - ${formatDuration(recordingDuration)}]`,
          subdomain,
          deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          isRequest,
          isUrgent: isRequest && isUrgent, // Only urgent if it's actually a request
          attachments: fileInfo
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const messageType = isRequest 
          ? `Your${isUrgent ? ' urgent' : ''} request has been submitted!`
          : 'Thanks for sharing your insights!'
        
        setSubmission({ 
          status: 'success', 
          message: `${messageType} We'll use this to create amazing content together.` 
        })
        setRequestText('')
        setIsRequest(false)
        setIsUrgent(false)
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
      
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      })
      
      const chunks: BlobPart[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType })
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
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      {/* Header - Compact for mobile */}
      <header className="bg-gray-900 text-white py-3 px-4 shadow-lg flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center">
            <h1 className={`text-lg font-bold tracking-wider ${montserrat.className}`}>
              LOCAL BZZ
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content - Flexible height */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-3 sm:p-4 overflow-hidden">
        {/* Main Form - Takes remaining space */}
        <Card className="flex-1 flex flex-col shadow-xl border-0 bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden">
          <CardContent className="flex-1 flex flex-col p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-hidden">
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-3 sm:space-y-4 overflow-hidden">
              {/* Request Input - Flexible */}
              <div className="flex flex-col space-y-2 flex-shrink-0">
                <div className="text-xs sm:text-sm text-gray-600">
                  Share your insights, ideas, and industry knowledge with us! Your expertise helps us create content that truly connects with your audience and drives results.
                </div>
                <div className="relative flex-1">
                  <Textarea
                    id="idea-input"
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="Example: 'Here's what's happening in our industry right now...' or 'Our customers have been asking about...' or 'We just learned something interesting that might make great content...'"
                    className="min-h-[120px] max-h-[200px] resize-none text-sm leading-relaxed border-2 border-gray-200 focus:border-[#FCC931] focus:ring-[#FCC931] rounded-xl bg-white/80"
                    disabled={submission.status === 'submitting'}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {requestText.length} characters
                </div>
              </div>

              {/* Voice Recording Section - Compact */}
              <div className="space-y-2 flex-shrink-0">
                <label className="text-xs font-medium text-gray-700">
                  Voice Memo
                </label>
                
                {!voiceRecording ? (
                  // Recording Controls - Compact
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center bg-white/60">
                    <div className="flex flex-col items-center space-y-2">
                      <Button
                        type="button"
                        onClick={isRecording ? pauseResumeRecording : startRecording}
                        className={`w-12 h-12 rounded-full p-0 transition-all shadow-lg ${
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
                          <Mic className="h-5 w-5 text-gray-800" />
                        )}
                      </Button>
                      
                      {isRecording && (
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-mono text-red-600 font-bold">
                            {formatDuration(recordingDuration)}
                          </div>
                          <Button
                            type="button"
                            onClick={stopRecording}
                            variant="outline"
                            size="sm"
                            className="h-6 border-red-300 text-red-600 hover:bg-red-50 text-xs"
                          >
                            <Square className="h-2 w-2 mr-1" />
                            Stop
                          </Button>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-600">
                        {isRecording && !isPaused
                          ? 'Recording...'
                          : isRecording && isPaused
                          ? 'Paused'
                          : 'Tap to record'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  // Recorded Voice Memo - Compact
                  <div className="border border-green-200 bg-green-50/80 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="bg-green-500 rounded-full p-1.5">
                          <Mic className="h-3 w-3 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-green-800">
                            Voice Memo • {formatDuration(recordingDuration)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={deleteRecording}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* File Upload Section - Compact */}
              <div className="space-y-2 flex-shrink-0">
                <label className="text-xs font-medium text-gray-600">
                  Files
                </label>
                
                {/* Upload Area - Smaller */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-2 text-center hover:border-[#FCC931] transition-colors cursor-pointer bg-white/60"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-[#FCC931]">Tap to add</span> files
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

                {/* Selected Files List - Compact */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}:
                    </p>
                    <div className="max-h-16 overflow-y-auto space-y-1">
                      {selectedFiles.map((file, index) => {
                        const getFileIcon = () => {
                          if (file.type.startsWith('image/')) return <Image className="h-3 w-3 text-blue-500" />
                          if (file.type.startsWith('video/')) return <Film className="h-3 w-3 text-purple-500" />
                          return <FileText className="h-3 w-3 text-gray-500" />
                        }

                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50/80 rounded-lg">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              {getFileIcon()}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-700 truncate">
                                  {file.name}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
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

              {/* Request Type Selection - Compact */}
              <div className="space-y-2 flex-shrink-0">
                <div className="flex items-center space-x-2 p-2 bg-blue-50/80 border border-blue-200 rounded-xl">
                  <input
                    id="request-checkbox"
                    type="checkbox"
                    checked={isRequest}
                    onChange={(e) => {
                      setIsRequest(e.target.checked)
                      if (!e.target.checked) setIsUrgent(false) // Clear urgent if not a request
                    }}
                    className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="request-checkbox"
                    className="text-xs font-medium text-blue-700 cursor-pointer select-none flex-1"
                  >
                    This is a request that needs action
                  </label>
                </div>

                {/* Urgency Checkbox - Only show when isRequest is true */}
                {isRequest && (
                  <div className="flex items-center space-x-2 p-2 bg-orange-50/80 border border-orange-200 rounded-xl">
                    <input
                      id="urgent-checkbox"
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="h-4 w-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <AlertTriangle className="h-3 w-3 text-orange-600" />
                    <label
                      htmlFor="urgent-checkbox"
                      className="text-xs font-medium text-orange-700 cursor-pointer select-none flex-1"
                    >
                      Time-sensitive - prioritize this!
                    </label>
                  </div>
                )}
              </div>

              {/* Submit Button - Fixed at bottom */}
              <div className="flex-shrink-0 pt-2">
                <Button
                  type="submit"
                  className={`w-full py-3 text-sm font-bold transition-all rounded-xl border-0 shadow-lg ${
                    isRequest && isUrgent 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' 
                      : isRequest
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                      : 'bg-gradient-to-r from-[#FCC931] to-[#e6b52a] hover:from-[#e6b52a] hover:to-[#d4a428] text-gray-800'
                  } ${montserrat.className}`}
                  disabled={submission.status === 'submitting' || (!requestText.trim() && !voiceRecording)}
                >
                  {submission.status === 'submitting' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      {isRequest && isUrgent ? (
                        <AlertTriangle className="h-4 w-4 mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {isRequest ? 'Submit Request' : 'Share Insights'}
                    </>
                  )}
                </Button>
              </div>

              {/* Status Messages */}
              {submission.status === 'success' && (
                <div className="flex items-center space-x-2 p-3 bg-green-50/80 border border-green-200 rounded-xl flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-700">{submission.message}</p>
                </div>
              )}

              {submission.status === 'error' && (
                <div className="flex items-center space-x-2 p-3 bg-red-50/80 border border-red-200 rounded-xl flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <p className="text-xs text-red-700">{submission.message}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Footer - Compact */}
        <div className="text-center py-2 flex-shrink-0">
          <p className="text-xs text-gray-400">
            <span className={`font-bold ${montserrat.className}`}>Local Bzz</span> Portal
          </p>
        </div>
      </div>
    </div>
  )
}
