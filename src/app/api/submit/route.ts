import { NextRequest, NextResponse } from 'next/server'
import { getClientName } from '@/lib/clients'

interface AttachmentInfo {
  name: string
  size: number
  type: string
}

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

    const body = await request.json()
    const { content, subdomain, deviceType, isRequest, isUrgent, attachments } = body

    console.log('📝 Request Data:')
    console.log('- Subdomain:', subdomain)
    console.log('- Content length:', content?.length)
    console.log('- Device type:', deviceType)
    console.log('- Is Request:', isRequest)
    console.log('- Is Urgent:', isUrgent)
    console.log('- Attachments:', attachments?.length || 0, 'files')
    console.log('- Raw body keys:', Object.keys(body))

    if (!content?.trim()) {
      console.log('❌ Validation failed: Content is empty')
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Get client information with better localhost handling
    let resolvedSubdomain = subdomain
    if (!resolvedSubdomain || resolvedSubdomain === '') {
      resolvedSubdomain = 'demo'
      console.log('🔄 Using default subdomain: demo')
    }
    
    const clientName = getClientName(resolvedSubdomain)
    console.log('👤 Client resolved:', clientName, 'from subdomain:', resolvedSubdomain)

    // Categorize the request based on keywords
    const contentLower = content.toLowerCase()
    let category = 'General Request'
    
    if (contentLower.includes('shoot') || contentLower.includes('photo') || contentLower.includes('video')) {
      category = 'Content Shoot'
    } else if (contentLower.includes('content') || contentLower.includes('post') || contentLower.includes('social')) {
      category = 'Content Creation'
    } else if (contentLower.includes('strategy') || contentLower.includes('plan') || contentLower.includes('campaign')) {
      category = 'Strategy & Planning'
    } else if (contentLower.includes('update') || contentLower.includes('business') || contentLower.includes('news')) {
      category = 'Business Update'
    } else if (contentLower.includes('feedback') || contentLower.includes('review') || contentLower.includes('thoughts')) {
      category = 'Feedback & Review'
    }

    console.log('🏷️ Categorized as:', category)

    // Generate a title from the first 60 characters
    const requestTitle = content.length > 60 ? content.substring(0, 60) + '...' : content
    console.log('📝 Generated title:', requestTitle)

    // Format attachments for Airtable
    const attachmentsList = attachments && attachments.length > 0 
      ? attachments.map((file: AttachmentInfo) => `${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)}KB)`).join('\n')
      : null

    // Create the record for the new table structure
    const airtableRecord = {
      fields: {
        'Request Title': requestTitle,
        'Full Request': content,
        'Client Name': clientName,
        'Request Category': category,
        'Urgent?': isRequest && isUrgent || false,
        'Subdomain': resolvedSubdomain,
        'Submission Source': isRequest ? 'Client Portal - Request' : 'Client Portal - Insights',
        'AI Processing Status': 'Pending',
        'Status': isRequest ? 'New' : 'Information',
        ...(attachmentsList && { 'Internal Notes': `Attachments:\n${attachmentsList}` })
      }
    }

    console.log('�� Airtable Record to submit:')
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
      client: clientName,
      subdomain: resolvedSubdomain,
      contentLength: content.length,
      deviceType: deviceType || 'unknown',
      isUrgent: isUrgent || false,
      category,
      recordId: airtableResult.id
    })

    return NextResponse.json({
      success: true,
      message: 'Request submitted successfully',
      client: clientName,
      recordId: airtableResult.id,
      category,
      urgent: isUrgent || false
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