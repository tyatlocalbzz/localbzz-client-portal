// Simple Airtable Connection Test
// Before running: Set your environment variables below
// Then run with: node debug-airtable.js

const AIRTABLE_BASE_ID = 'appovPmfaZS6JKOCr';  // User's Base ID
const AIRTABLE_TABLE_NAME = 'tbl4TyoxqfQpl1NSF';  // User's Table ID  
const AIRTABLE_API_KEY = 'patgJ6ePPnxeRz9QR.967a41cd2a29e285bf6dd1ecafcc517600d443f7452a04875fad5a330a10f03d';  // User's API Key

async function testAirtableConnection() {
  console.log('🔧 Testing Airtable Connection...\n');
  
  // Check environment variables
  console.log('Configuration:');
  console.log('- AIRTABLE_BASE_ID:', AIRTABLE_BASE_ID);
  console.log('- AIRTABLE_TABLE_NAME:', AIRTABLE_TABLE_NAME);
  console.log('- AIRTABLE_API_KEY exists:', !!AIRTABLE_API_KEY);
  console.log('- AIRTABLE_API_KEY prefix:', AIRTABLE_API_KEY?.substring(0, 4) || 'NOT SET');
  console.log('');

  if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME || !AIRTABLE_API_KEY || 
      AIRTABLE_BASE_ID === 'your_base_id_here') {
    console.log('❌ Please update the variables at the top of this file with your Airtable credentials');
    return;
  }

  // Test URL construction
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
  console.log('🌐 Testing URL:', url);
  console.log('');

  try {
    // Test GET request first (less destructive)
    console.log('🚀 Testing GET request...');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 Response:');
    console.log('- Status:', response.status);
    console.log('- Status Text:', response.statusText);
    console.log('- Headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log('');

    const responseText = await response.text();
    
    if (response.ok) {
      console.log('✅ Success! Connection working.');
      console.log('📋 Response preview (first 500 chars):');
      console.log(responseText.substring(0, 500));
    } else {
      console.log('❌ Error Response:');
      console.log(responseText);
      
      // Common error explanations
      if (response.status === 404) {
        console.log('\n🔍 404 Error Solutions:');
        console.log('1. Check your Base ID - should start with "app"');
        console.log('2. Check your Table ID - should start with "tbl"');
        console.log('3. Make sure the table exists in the base');
        console.log('4. Verify you have access to this base');
      } else if (response.status === 401) {
        console.log('\n🔍 401 Error Solutions:');
        console.log('1. Check your API key is correct');
        console.log('2. Make sure the API key has access to this base');
        console.log('3. Try creating a new Personal Access Token');
      } else if (response.status === 403) {
        console.log('\n🔍 403 Error Solutions:');
        console.log('1. Your API key doesn\'t have permission to this base');
        console.log('2. Check base sharing settings');
        console.log('3. Make sure you\'re a collaborator on the base');
      }
    }

  } catch (error) {
    console.log('💥 Network Error:', error.message);
  }
}

testAirtableConnection(); 