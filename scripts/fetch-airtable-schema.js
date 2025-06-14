#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../env.local') });

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('- AIRTABLE_BASE_ID:', !!AIRTABLE_BASE_ID);
  console.error('- AIRTABLE_API_KEY:', !!AIRTABLE_API_KEY);
  process.exit(1);
}

async function fetchAirtableSchema() {
  try {
    console.log('🔍 Fetching Airtable schema...');
    console.log('📊 Base ID:', AIRTABLE_BASE_ID);
    
    // Fetch base schema using Airtable Meta API
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Airtable API Error:', response.status, response.statusText);
      console.error('Response:', errorText);
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const schema = await response.json();
    
    console.log('✅ Schema fetched successfully');
    console.log(`📋 Found ${schema.tables.length} tables`);
    
    // Create a formatted schema document
    const formattedSchema = {
      baseId: AIRTABLE_BASE_ID,
      fetchedAt: new Date().toISOString(),
      tablesCount: schema.tables.length,
      tables: schema.tables.map(table => ({
        id: table.id,
        name: table.name,
        description: table.description || null,
        fieldsCount: table.fields.length,
        fields: table.fields.map(field => ({
          id: field.id,
          name: field.name,
          type: field.type,
          description: field.description || null,
          options: field.options || null,
          // Include computed field info if available
          ...(field.isComputed && { isComputed: true }),
          ...(field.isReadOnly && { isReadOnly: true })
        }))
      }))
    };

    // Save to JSON file
    const outputPath = path.join(__dirname, '../airtable-schema.json');
    fs.writeFileSync(outputPath, JSON.stringify(formattedSchema, null, 2));
    console.log('💾 Schema saved to:', outputPath);

    // Create a markdown documentation file
    const markdownPath = path.join(__dirname, '../AIRTABLE_SCHEMA.md');
    const markdown = generateMarkdownDocs(formattedSchema);
    fs.writeFileSync(markdownPath, markdown);
    console.log('📝 Documentation saved to:', markdownPath);

    // Print summary
    console.log('\n📊 SCHEMA SUMMARY:');
    formattedSchema.tables.forEach(table => {
      console.log(`\n🗂️  ${table.name} (${table.id})`);
      console.log(`   📝 ${table.fieldsCount} fields`);
      table.fields.forEach(field => {
        const computed = field.isComputed ? ' [COMPUTED]' : '';
        const readOnly = field.isReadOnly ? ' [READ-ONLY]' : '';
        console.log(`   - ${field.name}: ${field.type}${computed}${readOnly}`);
      });
    });

    console.log('\n✅ Airtable schema fetch completed!');
    
  } catch (error) {
    console.error('💥 Error fetching schema:', error.message);
    process.exit(1);
  }
}

function generateMarkdownDocs(schema) {
  const timestamp = new Date(schema.fetchedAt).toLocaleString();
  
  let markdown = `# Airtable Base Schema\n\n`;
  markdown += `**Base ID:** ${schema.baseId}\n`;
  markdown += `**Last Updated:** ${timestamp}\n`;
  markdown += `**Tables Count:** ${schema.tablesCount}\n\n`;
  
  schema.tables.forEach(table => {
    markdown += `## ${table.name}\n\n`;
    markdown += `**Table ID:** \`${table.id}\`\n`;
    if (table.description) {
      markdown += `**Description:** ${table.description}\n`;
    }
    markdown += `**Fields:** ${table.fieldsCount}\n\n`;
    
    markdown += `| Field Name | Type | ID | Notes |\n`;
    markdown += `|------------|------|-------|-------|\n`;
    
    table.fields.forEach(field => {
      const notes = [];
      if (field.isComputed) notes.push('Computed');
      if (field.isReadOnly) notes.push('Read-only');
      if (field.description) notes.push(field.description);
      
      const notesText = notes.length > 0 ? notes.join(', ') : '-';
      markdown += `| ${field.name} | ${field.type} | \`${field.id}\` | ${notesText} |\n`;
    });
    
    markdown += `\n`;
  });
  
  return markdown;
}

// Run the script
fetchAirtableSchema(); 