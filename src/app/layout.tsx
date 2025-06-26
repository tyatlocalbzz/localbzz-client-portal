import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Client Portal',
  description: 'Submit your requests and feedback',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
