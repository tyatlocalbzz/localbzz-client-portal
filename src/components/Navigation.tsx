'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Info } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  const [subdomain, setSubdomain] = useState<string>('')

  useEffect(() => {
    // Extract subdomain for URL parameters in development
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
  }, [])

  return (
    <nav className="bg-white border-b-2 border-gray-300 shadow-sm z-40">
      <div className="max-w-2xl mx-auto px-4">
        {/* Navigation tabs */}
        <div className="flex">
          <Link
            href={`/?client=${subdomain}`}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold transition-colors ${
              pathname === '/' 
                ? 'text-[#FCC931] border-b-4 border-[#FCC931] bg-[#FCC931]/10' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Share
          </Link>
          
          <Link
            href={`/client-info?${subdomain !== 'demo' ? `client=${subdomain}` : 'client=demo'}`}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold transition-colors ${
              pathname === '/client-info' 
                ? 'text-[#FCC931] border-b-4 border-[#FCC931] bg-[#FCC931]/10' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Info className="h-4 w-4 mr-2" />
            Client Info
          </Link>
        </div>
      </div>
    </nav>
  )
} 