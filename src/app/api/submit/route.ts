import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    // Comprehensive environment debugging
    console.log('🔧 DETAILED Environment Check:')
    console.log('- NODE_ENV:', process.env.NODE_ENV)
    console.log('- AIRTABLE_BASE_ID exists:', !!process.env.AIRTABLE_BASE_ID)
    console.log('- AIRTABLE_BASE_ID value:', process.env.AIRTABLE_BASE_ID)
    console.log('- AIRTABLE_BASE_ID starts with "app":', process.env.AIRTABLE_BASE_ID?.startsWith('app'))
    console.log('- AIRTABLE_TABLE_NAME exists:', !!process.env.AIRTABLE_TABLE_NAME)
    console.log('- AIRTABLE_TABLE_NAME value:', process.env.AIRTABLE_TABLE_NAME)
    console.log('- AIRTABLE_TABLE_NAME starts with "tbl":', process.env.AIRTABLE_TABLE_NAME?.startsWith('tbl'))
    console.log('- AIRTABLE_API_KEY exists:', !!process.env.AIRTABLE_API_KEY)
    console.log('- AIRTABLE_API_KEY first 10 chars:', process.env.AIRTABLE_API_KEY?.substring(0, 10))
    console.log('- AIRTABLE_API_KEY starts with "pat" or "key":', 
      process.env.AIRTABLE_API_KEY?.startsWith('pat') || process.env.AIRTABLE_API_KEY?.startsWith('key'))

    // Check if we have all required environment variables
    if (!process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_NAME || !process.env.AIRTABLE_API_KEY) {
      console.error('❌ Missing required environment variables')
      console.error('- Base ID missing:', !process.env.AIRTABLE_BASE_ID)
      console.error('- Table Name missing:', !process.env.AIRTABLE_TABLE_NAME)
      console.error('- API Key missing:', !process.env.AIRTABLE_API_KEY)
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Parse FormData
    const formData = await request.formData()
    const content = formData.get('content') as string
    const subdomain = formData.get('subdomain') as string
    const deviceType = formData.get('deviceType') as string
    const isPriorityRequest = formData.get('isPriorityRequest') === 'true'
    const voiceMemo = formData.get('voiceMemo') as File | null

    console.log('📝 Request Data:')
    console.log('- Subdomain:', subdomain)
    console.log('- Content length:', content?.length)
    console.log('- Device type:', deviceType)
    console.log('- Is Priority Request:', isPriorityRequest)
    console.log('- Voice Memo:', voiceMemo ? `${voiceMemo.name} (${voiceMemo.size} bytes)` : 'None')

    if (!content?.trim()) {
      console.log('❌ Validation failed: Content is empty')
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Get resolved subdomain with better localhost handling
    let resolvedSubdomain = subdomain
    if (!resolvedSubdomain || resolvedSubdomain === '') {
      resolvedSubdomain = 'demo'
      console.log('🔄 Using default subdomain: demo')
    }
    
    console.log('🌐 Using subdomain for Airtable lookup:', resolvedSubdomain)

    // Categorize the request based on keywords
    const contentLower = content.toLowerCase()
    let topic = 'General'
    
    if (contentLower.includes('content') || contentLower.includes('post') || contentLower.includes('social') || contentLower.includes('shoot') || contentLower.includes('photo') || contentLower.includes('video')) {
      topic = 'Content'
    } else if (contentLower.includes('strategy') || contentLower.includes('plan') || contentLower.includes('campaign')) {
      topic = 'Strategy'
    } else if (contentLower.includes('update') || contentLower.includes('business') || contentLower.includes('news')) {
      topic = 'Business Update'
    }

    console.log('🏷️ Categorized as:', topic)

    // Handle voice memo upload to Vercel Blob
    let voiceMemoUrl = null
    if (voiceMemo) {
      try {
        console.log('🎤 Uploading voice memo to Vercel Blob:', voiceMemo.name, voiceMemo.size, 'bytes')
        
        // Upload to Vercel Blob
        const blob = await put(`voice-memos/${Date.now()}-${voiceMemo.name}`, voiceMemo, {
          access: 'public',
        })
        
        voiceMemoUrl = blob.url
        console.log('✅ Voice memo uploaded successfully:', voiceMemoUrl)
        
      } catch (error) {
        console.error('❌ Error uploading voice memo:', error)
        // Continue with submission even if upload fails
      }
    }

    // Create content with voice memo indication
    let finalContent = content
    if (voiceMemo) {
      finalContent = voiceMemoUrl 
        ? `${content}\n\n🎤 Voice memo: ${voiceMemo.name} (${(voiceMemo.size / 1024).toFixed(1)}KB)`
        : `${content}\n\n🎤 Voice memo recorded: ${voiceMemo.name} (upload failed)`
    }

    // Create the record for the new table structure
    const airtableRecord = {
      fields: {
        'Content': finalContent,
        'Client Portal Subdomain': resolvedSubdomain, // Let Airtable lookup the client
        'Type': isPriorityRequest ? 'Request' : 'Insight',
        'Topic': topic,
        'Priority': isPriorityRequest ? 'Urgent' : 'Normal',
        'Status': 'New',
        // Add voice memo attachment if uploaded successfully
        ...(voiceMemoUrl && { 
          'Voice Memo': [{ 
            url: voiceMemoUrl,
            filename: voiceMemo?.name || 'voice-memo.webm'
          }] 
        })
      }
    }

    console.log(' Airtable Record to submit:')
    console.log(JSON.stringify(airtableRecord, null, 2))

    // Build URL with explicit environment variable logging
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableName = process.env.AIRTABLE_TABLE_NAME
    const apiKey = process.env.AIRTABLE_API_KEY
    
    console.log('🔗 URL Components:')
    console.log('- Base ID for URL:', baseId)
    console.log('- Table Name for URL:', tableName)
    console.log('- API Key for URL (first 10):', apiKey?.substring(0, 10))

    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`
    console.log('🌐 Final Airtable URL:', airtableUrl)

    // Verify the URL matches expected format
    if (!airtableUrl.includes('tblSasZtTICsNl4GU')) {
      console.error('⚠️ WARNING: URL does not contain expected table ID tblSasZtTICsNl4GU')
      console.error('Current URL:', airtableUrl)
      console.error('Expected table ID: tblSasZtTICsNl4GU')
      console.error('Environment file may not be loaded correctly')
    }

    console.log('🚀 Submitting to Airtable...')
    const airtableResponse = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtableRecord),
    })

    console.log('📡 Airtable Response:')
    console.log('- Status:', airtableResponse.status)
    console.log('- Status Text:', airtableResponse.statusText)
    console.log('- Headers:', Object.fromEntries(airtableResponse.headers.entries()))

    if (!airtableResponse.ok) {
      const errorData = await airtableResponse.text()
      console.log('❌ Airtable API Error Details:')
      console.log('- Status:', airtableResponse.status)
      console.log('- Response:', errorData)
      console.log('- URL used:', airtableUrl)
      console.log('- Base ID used:', baseId)
      console.log('- Table Name used:', tableName)
      console.log('- Expected table ID: tblSasZtTICsNl4GU')
      console.log('- Request body size:', JSON.stringify(airtableRecord).length)
      
      // Try to parse the error for more details
      try {
        const errorJson = JSON.parse(errorData)
        console.log('- Parsed error type:', errorJson.error?.type)
        console.log('- Parsed error message:', errorJson.error?.message)
        
        if (errorJson.error?.type === 'INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND') {
          console.log('🔍 Diagnosis: This error usually means:')
          console.log('  1. The table ID is incorrect or the table was deleted')
          console.log('  2. The API token does not have permission to access this table')
          console.log('  3. The base ID is incorrect')
          console.log('  4. The table is in a different workspace than the API token')
        }
      } catch {
        console.log('- Could not parse error as JSON')
      }
      
      throw new Error(`Airtable API error: ${airtableResponse.status} - ${errorData}`)
    }

    const airtableResult = await airtableResponse.json()
    console.log('✅ Request submitted successfully:')
    console.log({
      subdomain: resolvedSubdomain,
      contentLength: content.length,
      type: isPriorityRequest ? 'Request' : 'Insight',
      priority: isPriorityRequest ? 'Urgent' : 'Normal',
      deviceType: deviceType || 'unknown',
      recordId: airtableResult.id
    })

    // Trigger transcription if voice memo was uploaded successfully
    console.log('🔍 Environment check (before if condition):')
    console.log('- Voice memo URL:', voiceMemoUrl ? 'Present' : 'Missing')
    console.log('- OpenAI API key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing')
    console.log('- VERCEL_URL:', process.env.VERCEL_URL || 'Not set')
    
    if (voiceMemoUrl && process.env.OPENAI_API_KEY) {
      console.log('🎯 Triggering automatic transcription...')
      console.log('🔍 Environment check:')
      console.log('- Voice memo URL:', voiceMemoUrl ? 'Present' : 'Missing')
      console.log('- OpenAI API key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing')
      console.log('- VERCEL_URL:', process.env.VERCEL_URL || 'Not set')
      
      try {
        // Dynamically determine the transcription URL from the current request
        let transcribeUrl: string
        
        // In production, use the host from the request or Vercel URL environment variables
        const host = request.headers.get('host')
        const protocol = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
        
        if (host) {
          transcribeUrl = `${protocol}://${host}/api/transcribe`
        } else {
          // Fallback to VERCEL_URL if host header is not available
          const vercelUrl = process.env.VERCEL_URL || 'localhost:3000'
          transcribeUrl = `https://${vercelUrl}/api/transcribe`
        }
        
        console.log('🔗 Transcription URL:', transcribeUrl)
        
        const transcriptionPromise = fetch(transcribeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recordId: airtableResult.id,
            voiceMemoDLUrl: voiceMemoUrl
          })
        }).then(async (response) => {
          console.log('📡 Transcription request response status:', response.status)
          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Transcription request failed:', response.status, errorText)
            throw new Error(`Transcription failed: ${response.status} - ${errorText}`)
          }
          const result = await response.json()
          console.log('✅ Transcription request successful:', result)
          return result
        }).catch(error => {
          console.error('❌ Background transcription failed:', error)
          console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            transcribeUrl,
            recordId: airtableResult.id,
            voiceMemoUrl
          })
          // Don't fail the main request if transcription fails
        })
        
        // Don't await - let it run in background
        void transcriptionPromise
        console.log('🚀 Transcription triggered in background')
      } catch (error) {
        console.error('❌ Failed to trigger transcription:', error)
        // Don't fail the main request if transcription trigger fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Submission successful',
      subdomain: resolvedSubdomain,
      recordId: airtableResult.id,
      type: isPriorityRequest ? 'Request' : 'Insight',
      priority: isPriorityRequest ? 'Urgent' : 'Normal',
      transcriptionTriggered: !!(voiceMemoUrl && process.env.OPENAI_API_KEY)
    })

  } catch (error) {
    console.error('💥 Submission error:', error)
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS (if needed)
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