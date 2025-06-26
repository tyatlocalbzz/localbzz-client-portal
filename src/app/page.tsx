'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Extract subdomain or use demo as default
    const hostname = window.location.hostname
    const parts = hostname.split('.')
    
    let subdomain = 'demo'
    
    if (parts.length >= 3 && !hostname.includes('localhost') && !hostname.includes('vercel.app')) {
      // Production subdomain e.g., "acme.localbzz.com" -> "acme"
      subdomain = parts[0]
    } else if (hostname.includes('localhost') || hostname.includes('vercel.app')) {
      // Development - check for query parameter or default to demo
      const urlParams = new URLSearchParams(window.location.search)
      const clientParam = urlParams.get('client')
      if (clientParam) {
        subdomain = clientParam
      }
    }
    
    // Redirect to the portal
    router.push(`/portal/${subdomain}`)
  }, [router])

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>
          Redirecting to Portal...
        </h1>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
