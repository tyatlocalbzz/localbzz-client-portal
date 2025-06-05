'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Mic, Send, CheckCircle, AlertCircle, AlertTriangle, Upload, X, FileText, Image, Film } from 'lucide-react'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: '900', // Black weight
  variable: '--font-montserrat'
})

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any
  }
}

interface SpeechRecognitionEvent extends Event {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SubmissionState {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message?: string
}

export default function IdeaSubmissionPage() {
  const [subdomain, setSubdomain] = useState<string>('')
  const [requestText, setRequestText] = useState<string>('')
  const [isUrgent, setIsUrgent] = useState<boolean>(false)
  const [submission, setSubmission] = useState<SubmissionState>({ status: 'idle' })
  const [isVoiceSupported, setIsVoiceSupported] = useState<boolean>(false)
  const [isListening, setIsListening] = useState<boolean>(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

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

    // Check for voice input support
    setIsVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!requestText.trim()) {
      setSubmission({ 
        status: 'error', 
        message: 'Please enter your request before submitting.' 
      })
      return
    }

    setSubmission({ status: 'submitting' })

    try {
      // For now, we'll just include file info in the request
      // Later we can implement actual file upload to cloud storage
      const fileInfo = selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: requestText.trim(),
          subdomain,
          deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          isUrgent,
          attachments: fileInfo
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmission({ 
          status: 'success', 
          message: `Your${isUrgent ? ' urgent' : ''} request has been submitted successfully! We'll review it shortly.` 
        })
        setRequestText('')
        setIsUrgent(false)
        setSelectedFiles([])
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmission({ status: 'idle' })
        }, 5000)
      } else {
        throw new Error(result.error || 'Failed to submit request')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setSubmission({ 
        status: 'error', 
        message: 'Sorry, there was an error submitting your request. Please try again.' 
      })
      
      // Reset error message after 5 seconds
      setTimeout(() => {
        setSubmission({ status: 'idle' })
      }, 5000)
    }
  }

  const startVoiceInput = () => {
    if (!isVoiceSupported) {
      alert('Voice input is not supported on this device. Please type your request manually.')
      return
    }

    // Implement Web Speech API for desktop browsers
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    
    // Configure speech recognition
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    // Handle speech recognition start
    recognition.onstart = () => {
      setIsListening(true)
      console.log('Speech recognition started')
    }

    // Handle speech recognition results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setRequestText(prevText => {
        const newText = prevText ? `${prevText} ${transcript}` : transcript
        return newText
      })
      setIsListening(false)
    }

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      
      let errorMessage = 'Speech recognition failed. Please try again.'
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.'
          break
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.'
          break
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.'
          break
        case 'network':
          errorMessage = 'Network error. Please check your connection.'
          break
      }
      
      setSubmission({ 
        status: 'error', 
        message: errorMessage 
      })
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setSubmission({ status: 'idle' })
      }, 3000)
    }

    // Handle successful completion
    recognition.onend = () => {
      setIsListening(false)
      console.log('Speech recognition ended')
    }

    // Start recognition
    try {
      recognition.start()
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      setIsListening(false)
      alert('Failed to start voice input. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-800 text-white py-4 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center">
            <h1 className={`text-xl font-bold tracking-wider ${montserrat.className}`}>
              LOCAL BZZ
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto pt-8 pb-16 p-4">
        {/* Main Form */}
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Input */}
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-3">
                  Share content requests, shoot needs, context updates, feedback, or any other communications
                </div>
                <div className="relative">
                  <Textarea
                    id="idea-input"
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="Example: 'We need a video for our product launch next month' or 'Here's some context about our upcoming event that might help with content planning...'"
                    className="min-h-[200px] resize-none text-base leading-relaxed border-2 border-gray-200 focus:border-[#FCC931] focus:ring-[#FCC931] rounded-lg"
                    disabled={submission.status === 'submitting'}
                  />
                  {isVoiceSupported && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`absolute top-3 right-3 h-8 w-8 p-0 ${
                        isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#FCC931]'
                      }`}
                      onClick={startVoiceInput}
                      disabled={submission.status === 'submitting' || isListening}
                      title={isListening ? 'Listening...' : 'Click to start voice input'}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Character count: {requestText.length}
                </div>
              </div>

              {/* File Upload Section - Compact */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  Attachments (optional)
                </label>
                
                {/* Upload Area - Smaller */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-[#FCC931] transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-[#FCC931]">Click to upload</span> or drag files here
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
                    {selectedFiles.map((file, index) => {
                      const getFileIcon = () => {
                        if (file.type.startsWith('image/')) return <Image className="h-3 w-3 text-blue-500" />
                        if (file.type.startsWith('video/')) return <Film className="h-3 w-3 text-purple-500" />
                        return <FileText className="h-3 w-3 text-gray-500" />
                      }

                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            {getFileIcon()}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-700 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Urgency Checkbox - Compact */}
              <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Checkbox
                  id="urgent-checkbox"
                  checked={isUrgent}
                  onCheckedChange={(checked: boolean) => setIsUrgent(checked)}
                  className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <label
                  htmlFor="urgent-checkbox"
                  className="text-xs font-medium text-orange-700 cursor-pointer select-none"
                >
                  Mark as urgent - requires immediate attention
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full py-4 text-base font-bold transition-colors rounded-lg ${
                  isUrgent 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-0' 
                    : 'bg-[#FCC931] hover:bg-[#e6b52a] text-gray-800 border-0'
                } ${montserrat.className}`}
                disabled={submission.status === 'submitting' || !requestText.trim()}
              >
                {submission.status === 'submitting' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    {isUrgent ? (
                      <AlertTriangle className="h-4 w-4 mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Submit
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {submission.status === 'success' && (
                <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700">{submission.message}</p>
                </div>
              )}

              {submission.status === 'error' && (
                <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{submission.message}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Powered by <span className={`font-bold ${montserrat.className}`}>Local Bzz</span> Creative Portal
          </p>
        </div>
      </div>
    </div>
  )
}
