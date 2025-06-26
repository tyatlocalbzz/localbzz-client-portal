import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const textContent = formData.get('textContent') as string
    const isUrgent = formData.get('isUrgent') === 'true'
    const subdomain = formData.get('subdomain') as string
    const voiceFile = formData.get('voiceFile') as File | null

    // Validate required fields
    if (!textContent?.trim() && !voiceFile) {
      return NextResponse.json(
        { error: 'Please provide either text or voice message' },
        { status: 400 }
      )
    }

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      )
    }

    // Handle voice file upload
    let voiceFileUrl = null
    if (voiceFile) {
      try {
        const buffer = Buffer.from(await voiceFile.arrayBuffer())
        const blob = await put(
          `voice-memos/${subdomain}/${Date.now()}-${voiceFile.name}`,
          buffer,
          {
            access: 'public',
            contentType: voiceFile.type,
          }
        )
        voiceFileUrl = blob.url
      } catch (error) {
        console.error('Error uploading voice file:', error)
        // Continue without voice file if upload fails
      }
    }

    // For now, we'll just log the submission
    // In a real implementation, you would save to your database
    console.log('Portal Submission:', {
      subdomain,
      textContent: textContent || '[Voice only]',
      isUrgent,
      voiceFileUrl,
      timestamp: new Date().toISOString()
    })

    // Here you would normally:
    // 1. Find the client by subdomain
    // 2. Save the submission to the database
    // 3. Send notifications if urgent
    // 4. Trigger voice transcription if needed

    // Mock database save
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Send notification for urgent requests
    if (isUrgent) {
      console.log(`🚨 URGENT REQUEST from ${subdomain}:`, textContent || '[Voice message]')
      // Here you would send email, Slack notification, etc.
    }

    return NextResponse.json({
      success: true,
      submissionId,
      message: 'Request submitted successfully'
    })

  } catch (error) {
    console.error('Error processing portal submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 