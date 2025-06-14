import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')

    console.log('🔍 Fetching client info for subdomain:', subdomain)

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain parameter is required' },
        { status: 400 }
      )
    }

    // Check if we have all required environment variables
    if (!process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_API_KEY) {
      console.error('❌ Missing Airtable configuration')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Search for client by subdomain in Clients table
    const clientsTableId = 'tblSKxOOB2SrEPI1V' // From schema
    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${clientsTableId}`
    
    // Use filterByFormula to find client with matching subdomain
    const filterFormula = `{Client Portal Subdomain} = "${subdomain}"`
    const queryUrl = `${airtableUrl}?filterByFormula=${encodeURIComponent(filterFormula)}`
    
    console.log('🌐 Querying Airtable:', queryUrl)

    const response = await fetch(queryUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Airtable API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch client information' },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    if (!data.records || data.records.length === 0) {
      console.log('❌ No client found for subdomain:', subdomain)
      return NextResponse.json(
        { error: 'Client not found for this subdomain' },
        { status: 404 }
      )
    }

    const clientRecord = data.records[0]
    const clientId = clientRecord.id

    // Query Shoots table for upcoming shoots linked to this client
    const shootsTableId = 'tblIcLzkF1zhPU4gk' // Shoots table ID
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
    // Get ALL shoots first, then filter in JavaScript (workaround for Airtable formula issues)
    console.log('🎬 Getting ALL shoots and filtering in JavaScript...')
    
    const allShootsUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${shootsTableId}`
    
    let lastShootDate: string | null = null
    let nextScheduledShoot: string | null = null
    
    try {
      const allShootsResponse = await fetch(allShootsUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      })

      if (allShootsResponse.ok) {
        const allShootsData = await allShootsResponse.json()
        console.log(`📊 Total shoots in table: ${allShootsData.records?.length || 0}`)
        
        if (allShootsData.records && allShootsData.records.length > 0) {
          // Filter for this client's shoots in JavaScript
          interface ShootRecord {
            date: string
            status: string
            id: string
            clientLinks: string[]
          }
          
          interface AirtableRecord {
            id: string
            fields: {
              'Shoot Start'?: string
              'Status'?: string
              'Client Link'?: string[]
              [key: string]: unknown
            }
          }
          
          const clientShoots: ShootRecord[] = allShootsData.records
            .filter((record: AirtableRecord) => {
              const clientLinks = record.fields['Client Link'] || []
              const hasDate = record.fields['Shoot Start']
              const validStatus = ['Scheduled', 'Confirmed', 'Completed'].includes(record.fields['Status'] || '')
              const isLinkedToClient = clientLinks.includes(clientId)
              
              console.log(`🔍 Checking shoot ${record.id}:`)
              console.log(`  - Date: ${hasDate ? 'Yes' : 'No'} (${record.fields['Shoot Start']})`)
              console.log(`  - Status: ${validStatus ? 'Valid' : 'Invalid'} (${record.fields['Status']})`)
              console.log(`  - Linked to client: ${isLinkedToClient ? 'Yes' : 'No'} (${clientLinks})`)
              
              return hasDate && validStatus && isLinkedToClient
            })
            .map((record: AirtableRecord) => ({
              date: record.fields['Shoot Start']!,
              status: record.fields['Status']!,
              id: record.id,
              clientLinks: record.fields['Client Link'] || []
            }))
          
          console.log(`📊 Client shoots found: ${clientShoots.length}`)
          
          if (clientShoots.length > 0) {
            // Find the most recent past shoot
            const pastShoots = clientShoots.filter(shoot => shoot.date < today).sort((a, b) => b.date.localeCompare(a.date))
            if (pastShoots.length > 0) {
              lastShootDate = pastShoots[0].date
              console.log('📅 Last shoot found:', lastShootDate)
            }
            
            // Find the next upcoming shoot
            const futureShoots = clientShoots.filter(shoot => shoot.date >= today).sort((a, b) => a.date.localeCompare(b.date))
            if (futureShoots.length > 0) {
              nextScheduledShoot = futureShoots[0].date
              console.log('📅 Next shoot found:', nextScheduledShoot)
            }
            
            console.log('📊 Shoot analysis:')
            console.log('- Total client shoots:', clientShoots.length)
            console.log('- Past shoots:', pastShoots.length)
            console.log('- Future shoots:', futureShoots.length)
          }
        }
      } else {
        console.error('❌ Shoots API response not OK:', allShootsResponse.status, allShootsResponse.statusText)
        const errorText = await allShootsResponse.text()
        console.error('❌ Shoots API error text:', errorText)
      }
    } catch (error) {
      console.error('❌ Error querying all shoots:', error)
    }

    const clientInfo = {
      id: clientRecord.id,
      name: clientRecord.fields['Client Name'] || 'Unknown Client',
      services: clientRecord.fields['Services'] || [],
      status: clientRecord.fields['Status'] || 'Active',
      subdomain: clientRecord.fields['Client Portal Subdomain'] || subdomain,
      // Add scheduling information - now using date-based logic
      shootFrequency: clientRecord.fields['Shoot Frequency'] || null,
      lastShootDate: lastShootDate || null,
      nextScheduledShoot: nextScheduledShoot || 'None',
      needsScheduling: clientRecord.fields['ActionNeeded: Schedule Shoot?'] || false,
      // Add other useful fields
      notes: clientRecord.fields['Notes'] || null
    }

    console.log('✅ Client info found:', {
      name: clientInfo.name,
      services: clientInfo.services,
      subdomain: clientInfo.subdomain,
      lastShootDate: clientInfo.lastShootDate,
      nextScheduledShoot: clientInfo.nextScheduledShoot,
      needsScheduling: clientInfo.needsScheduling
    })

    console.log('🔍 Debug - Client field values:')
    console.log('- _LastShootDate from client record:', clientRecord.fields['_LastShootDate'])
    console.log('- Next shoot from Shoots table:', nextScheduledShoot)
    console.log('- Today for comparison:', today)
    
    // Check if _LastShootDate is actually a future date
    if (clientRecord.fields['_LastShootDate']) {
      const lastShootDate = clientRecord.fields['_LastShootDate']
      const isLastShootInFuture = lastShootDate >= today
      console.log('- Is _LastShootDate in the future?', isLastShootInFuture)
      
      if (isLastShootInFuture) {
        console.log('⚠️  WARNING: _LastShootDate contains a FUTURE date!')
        console.log('⚠️  This field should only contain completed shoot dates, not upcoming ones.')
        console.log('⚠️  July 1st might be incorrectly stored in _LastShootDate instead of being in Shoots table.')
      }
    }

    return NextResponse.json({
      success: true,
      client: clientInfo
    })

  } catch (error) {
    console.error('💥 Error fetching client info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client information' },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 