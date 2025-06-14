'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Package, AlertCircle, CheckCircle } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: '900',
  variable: '--font-montserrat'
})

// Master list of all services offered by Local Bzz
const ALL_AVAILABLE_SERVICES = [
  'Content',
  'Social Management', 
  'Website',
  'Email',
  'Paid Ads',
  'Social Events'
] as const

interface ClientInfo {
  id: string
  name: string
  services: string[]
  subdomain: string
  shootFrequency?: string
  lastShootDate?: string
  nextScheduledShoot?: string
  needsScheduling?: boolean | string
}

interface SchedulingRequest {
  preferredDates: string[]
  preferredTimes: string[]
  additionalNotes: string
}

export default function ClientInfoPage() {
  const [subdomain, setSubdomain] = useState<string>('')
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
  const [clientLoading, setClientLoading] = useState<boolean>(true)
  const [showSchedulingModal, setShowSchedulingModal] = useState<boolean>(false)
  const [schedulingRequest, setSchedulingRequest] = useState<SchedulingRequest>({
    preferredDates: ['', '', ''],
    preferredTimes: ['', '', ''],
    additionalNotes: ''
  })
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  useEffect(() => {
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

    // Extract subdomain and fetch client info
    const hostname = window.location.hostname
    const parts = hostname.split('.')
    
    let extractedSubdomain = 'demo'
    
    if (parts.length >= 3 && !hostname.includes('localhost') && !hostname.includes('vercel.app')) {
      extractedSubdomain = parts[0]
    } else if (hostname.includes('localhost') || hostname.includes('vercel.app')) {
      const urlParams = new URLSearchParams(window.location.search)
      const clientParam = urlParams.get('client')
      if (clientParam) {
        extractedSubdomain = clientParam
      } else {
        extractedSubdomain = 'demo'
      }
    }
    
    setSubdomain(extractedSubdomain)
    fetchClientInfo(extractedSubdomain)

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, [])

  const fetchClientInfo = async (subdomainToFetch: string) => {
    try {
      setClientLoading(true)
      
      const response = await fetch(`/api/client-info?subdomain=${encodeURIComponent(subdomainToFetch)}`)
      const data = await response.json()
      
      if (response.ok && data.success) {
        setClientInfo(data.client)
      } else {
        setClientInfo(null)
      }
    } catch (error) {
      console.error('Error fetching client info:', error)
      setClientInfo(null)
    } finally {
      setClientLoading(false)
    }
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === 'None') return 'Not scheduled'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return 'Invalid date'
    }
  }

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === 'None') return 'Not scheduled'
    try {
      const date = new Date(dateString)
      const dateFormat = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      const timeFormat = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      })
      return `${dateFormat} at ${timeFormat}`
    } catch {
      return 'Invalid date'
    }
  }

  const handleSchedulingSubmit = async () => {
    try {
      setSubmissionStatus('submitting')

      // Create FormData for scheduling request
      const formData = new FormData()
      const schedulingMessage = `SCHEDULING REQUEST

Preferred dates:
1. ${schedulingRequest.preferredDates[0] || 'Not specified'}
2. ${schedulingRequest.preferredDates[1] || 'Not specified'}  
3. ${schedulingRequest.preferredDates[2] || 'Not specified'}

Preferred times:
1. ${schedulingRequest.preferredTimes[0] || 'Not specified'}
2. ${schedulingRequest.preferredTimes[1] || 'Not specified'}
3. ${schedulingRequest.preferredTimes[2] || 'Not specified'}

Additional notes:
${schedulingRequest.additionalNotes || 'None'}

Client: ${clientInfo?.name}
Shoot Frequency: ${clientInfo?.shootFrequency || 'Not set'}`
      
      formData.append('content', schedulingMessage)
      formData.append('subdomain', subdomain)
      formData.append('deviceType', /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop')
      formData.append('isRequest', 'true')
      formData.append('isUrgent', 'false')
      
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmissionStatus('success')
        
        // Reset form and close modal
        setSchedulingRequest({
          preferredDates: ['', '', ''],
          preferredTimes: ['', '', ''],
          additionalNotes: ''
        })
        setShowSchedulingModal(false)
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setSubmissionStatus('idle')
        }, 3000)
      } else {
        throw new Error(result.error || 'Failed to submit scheduling request')
      }
    } catch (error) {
      console.error('Scheduling submission error:', error)
      setSubmissionStatus('error')
      
      // Reset error message after 3 seconds
      setTimeout(() => {
        setSubmissionStatus('idle')
      }, 3000)
    }
  }

  if (clientLoading) {
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

        {/* Navigation */}
        <Navigation />

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading client information...</p>
          </div>
        </div>
      </div>
    )
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

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {clientInfo?.name || 'Client Information'}
            </h1>
            <p className="text-gray-600">
              Your account details, upcoming shoots, and service information
            </p>
          </div>

          {/* Status Messages */}
          {submissionStatus === 'success' && (
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">Your scheduling request has been submitted successfully!</p>
            </div>
          )}

          {submissionStatus === 'error' && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">There was an issue submitting your scheduling request. Please try again.</p>
            </div>
          )}

          {clientInfo ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scheduling Information */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-600" />
                    Shoot Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Frequency</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {clientInfo.shootFrequency || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Next Scheduled Shoot</p>
                      <p className="text-gray-900">
                        {formatDateTime(clientInfo.nextScheduledShoot)}
                      </p>
                    </div>
                  </div>

                  {clientInfo.lastShootDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Last Shoot</p>
                      <p className="text-gray-900">
                        {formatDate(clientInfo.lastShootDate)}
                      </p>
                    </div>
                  )}

                  {(clientInfo.needsScheduling === true || clientInfo.needsScheduling === "Schedule Needed" || clientInfo.needsScheduling === "✅ Schedule Needed") && (
                    <Button
                      onClick={() => setShowSchedulingModal(true)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      disabled={submissionStatus === 'submitting'}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Request Shoot Scheduling
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Services */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Services
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Your current services and available add-ons
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Services */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Services</h4>
                    {clientInfo.services && clientInfo.services.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {clientInfo.services.map((service, index) => (
                          <span
                            key={`current-${index}`}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-green-100 text-green-800 rounded-full border border-green-200"
                          >
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            {service}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No services configured</p>
                    )}
                  </div>

                  {/* Available Services */}
                  {(() => {
                    const currentServices = clientInfo.services || []
                    const availableServices = ALL_AVAILABLE_SERVICES.filter(
                      service => !currentServices.includes(service)
                    )
                    
                    if (availableServices.length > 0) {
                      return (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Services</h4>
                          <div className="flex flex-wrap gap-2">
                            {availableServices.map((service, index) => (
                              <span
                                key={`available-${index}`}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                                title={`Click to inquire about ${service}`}
                              >
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                {service}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            💡 Interested in any of these? Let us know!
                          </p>
                        </div>
                      )
                    }
                    return null
                  })()}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="shadow-lg">
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Client Information Not Available
                </h3>
                <p className="text-gray-600 mb-6">
                  We couldn&apos;t load your account information. This might be a temporary issue.
                </p>
                <Button
                  onClick={() => fetchClientInfo(subdomain)}
                  className="bg-[#FCC931] hover:bg-[#e6b52a] text-gray-800"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Scheduling Modal */}
      {showSchedulingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Request Shoot Scheduling</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSchedulingModal(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Preferred Dates (Top 3)
                  </label>
                  <div className="space-y-2">
                    {schedulingRequest.preferredDates.map((date, index) => (
                      <input
                        key={index}
                        type="date"
                        value={date}
                        onChange={(e) => {
                          const newDates = [...schedulingRequest.preferredDates]
                          newDates[index] = e.target.value
                          setSchedulingRequest(prev => ({ ...prev, preferredDates: newDates }))
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FCC931] focus:border-[#FCC931] text-sm"
                        placeholder={`Option ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Preferred Times (Top 3)
                  </label>
                  <div className="space-y-2">
                    {schedulingRequest.preferredTimes.map((time, index) => (
                      <input
                        key={index}
                        type="text"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...schedulingRequest.preferredTimes]
                          newTimes[index] = e.target.value
                          setSchedulingRequest(prev => ({ ...prev, preferredTimes: newTimes }))
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FCC931] focus:border-[#FCC931] text-sm"
                        placeholder={`e.g., "Morning 9-11am", "Afternoon 2-4pm"`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={schedulingRequest.additionalNotes}
                    onChange={(e) => setSchedulingRequest(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    placeholder="Any specific requirements, locations, or other details..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FCC931] focus:border-[#FCC931] text-sm min-h-[80px]"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSchedulingModal(false)}
                    className="flex-1"
                    disabled={submissionStatus === 'submitting'}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSchedulingSubmit}
                    className="flex-1 bg-[#FCC931] hover:bg-[#e6b52a] text-gray-800"
                    disabled={submissionStatus === 'submitting'}
                  >
                    {submissionStatus === 'submitting' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 