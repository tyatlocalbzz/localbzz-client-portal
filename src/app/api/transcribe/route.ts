import { NextRequest, NextResponse } from 'next/server'

// Set maximum duration for this function to 60 seconds
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Transcription request received')
    
    // Check if we have required environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Missing OpenAI API key')
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    console.log('✅ OpenAI API key found:', process.env.OPENAI_API_KEY ? 'Yes' : 'No')

    if (!process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_NAME || !process.env.AIRTABLE_API_KEY) {
      console.error('❌ Missing Airtable configuration')
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const { recordId, voiceMemoDLUrl } = await request.json()
    
    if (!recordId || !voiceMemoDLUrl) {
      console.error('❌ Missing required parameters')
      return NextResponse.json(
        { error: 'Record ID and voice memo URL are required' },
        { status: 400 }
      )
    }

    console.log('🎙️ Transcribing voice memo:', { recordId, voiceMemoDLUrl })

    // Download the audio file from Vercel Blob
    console.log('⬇️ Downloading audio file...')
    const audioResponse = await fetch(voiceMemoDLUrl)
    
    if (!audioResponse.ok) {
      console.error('❌ Failed to download audio file:', audioResponse.statusText)
      return NextResponse.json(
        { error: 'Failed to download audio file' },
        { status: 500 }
      )
    }

    const audioBuffer = await audioResponse.arrayBuffer()
    const audioUint8Array = new Uint8Array(audioBuffer)
    
    console.log('🤖 Sending to OpenAI Whisper for transcription...')
    
    // Create FormData with the audio file for OpenAI (Node.js compatible)
    const formData = new FormData()
    
    // Create a Blob from the buffer (this works in both Node.js and browser environments)
    const audioBlob = new Blob([audioUint8Array], { type: 'audio/webm' })
    
    // Append the blob as a file to FormData
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'en')
    formData.append('response_format', 'text')
    
    // Transcribe using OpenAI Whisper with direct fetch
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text()
      console.error('❌ OpenAI API error:', transcriptionResponse.status, errorText)
      throw new Error(`OpenAI API error: ${transcriptionResponse.status}`)
    }

    const transcription = await transcriptionResponse.text()

    console.log('✅ Transcription completed:', transcription.substring(0, 100) + '...')

    // Get the current record from Airtable to preserve existing content
    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}/${recordId}`
    
    console.log('📖 Fetching current record from Airtable...')
    const getCurrentRecord = await fetch(airtableUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    })

    if (!getCurrentRecord.ok) {
      console.error('❌ Failed to fetch current record:', getCurrentRecord.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch current record' },
        { status: 500 }
      )
    }

    const currentRecordData = await getCurrentRecord.json()
    const currentContent = currentRecordData.fields.Content || ''

    // Update the content by replacing voice memo indication with transcription
    const updatedContent = currentContent.replace(
      /🎤 Voice memo: [^\n]+/g,
      `🎤 Voice memo transcription: "${transcription.trim()}"`
    )

    console.log('📝 Updating Airtable record with transcription...')
    
    // Update the record with transcription
    const updateResponse = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Content: updatedContent,
          'Transcription Status': 'Completed'
        }
      }),
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text()
      console.error('❌ Failed to update Airtable record:', errorData)
      return NextResponse.json(
        { error: 'Failed to update record with transcription' },
        { status: 500 }
      )
    }

    await updateResponse.json() // Consume response but don't store
    
    console.log('✅ Record updated successfully with transcription')
    
    return NextResponse.json({
      success: true,
      message: 'Transcription completed and record updated',
      recordId: recordId,
      transcription: transcription,
      updatedContent: updatedContent
    })

  } catch (error) {
    console.error('💥 Transcription error:', error)
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to transcribe voice memo' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS
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