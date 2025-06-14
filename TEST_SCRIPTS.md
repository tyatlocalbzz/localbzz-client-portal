# Test Scripts for Transcription Debugging

This directory contains several test scripts to help debug the transcription functionality issues between local development and production environments.

## Scripts Overview

### 1. `test-env.js` - Environment Variables Test
**Purpose**: Check if all required environment variables are properly set and formatted.

```bash
# Test locally
node test-env.js

# Test in production (via Vercel)
vercel env pull .env.production
node -r dotenv/config test-env.js dotenv_config_path=.env.production
```

**What it checks:**
- ✅ All required environment variables present
- ✅ OpenAI API key format (starts with `sk-`)
- ✅ Airtable configuration format
- ✅ Node.js version and platform info

### 2. `test-openai.js` - Direct OpenAI API Test  
**Purpose**: Test OpenAI Whisper API directly, bypassing the Next.js application.

```bash
# Test with default audio URL
node test-openai.js

# Test with custom audio URL  
node test-openai.js https://your-blob-url.vercel-storage.com/voice-memo.webm
```

**What it tests:**
- ⬇️ Downloads audio from Vercel Blob storage
- 🤖 Sends audio directly to OpenAI Whisper API
- 📝 Returns transcribed text
- 🔧 Shows detailed error messages if API fails

### 3. `test-transcription.js` - API Route Test
**Purpose**: Test the `/api/transcribe` endpoint directly.

```bash
# Test locally (requires local dev server running)
node test-transcription.js

# Test production
node test-transcription.js https://your-production-url.vercel.app
```

**What it tests:**
- 🎯 Direct POST to `/api/transcribe` endpoint
- 📡 Shows response status and headers
- 📋 Displays full response body
- ⏰ Has 30-second timeout

### 4. `test-production.js` - Complete Flow Test
**Purpose**: Test the complete submission + transcription flow in production.

```bash
node test-production.js https://your-production-url.vercel.app
```

**What it tests:**
- 📝 Submits a test form to `/api/submit`
- 🔧 Tests environment variable access
- 🌐 Simulates complete production workflow
- 📊 Provides log commands for further debugging

## Debugging Workflow

### Step 1: Check Environment Variables
```bash
node test-env.js
```
**Expected result**: All variables should show ✅ status

### Step 2: Test OpenAI API Direct Connection
```bash
node test-openai.js
```
**Expected result**: Should return transcribed text from the audio file

### Step 3: Test Local API Route
```bash
# In one terminal, start dev server
npm run dev

# In another terminal, test the route
node test-transcription.js
```
**Expected result**: Should return successful transcription response

### Step 4: Test Production API Route
```bash
node test-transcription.js https://localbzz-client-portal-ajevd2f6o-ty-walls-projects-6791d3b7.vercel.app
```
**Expected result**: Should match local behavior

### Step 5: Test Complete Production Flow
```bash
node test-production.js https://localbzz-client-portal-ajevd2f6o-ty-walls-projects-6791d3b7.vercel.app
```
**Expected result**: Should trigger transcription and show logs

## Common Issues and Solutions

### ❌ Local Development Issues

**Problem**: `ReferenceError: File is not defined`
**Solution**: 
```bash
# Clear Next.js cache and restart
rm -rf .next
npm run dev
```

**Problem**: Environment variables not loading
**Solution**: Check `.env.local` file exists and has correct format

### ❌ Production Issues

**Problem**: Transcription triggered but no completion logs
**Possible causes**:
- Function timeout (> 15 seconds)
- OpenAI API key not accessible in production
- Network issues between Vercel and OpenAI

**Problem**: Environment variables missing in production
**Solution**:
```bash
# Check production env vars
vercel env ls production

# Add missing variables
vercel env add OPENAI_API_KEY production
```

### ❌ OpenAI API Issues

**Problem**: 401 Unauthorized
**Solution**: Check API key format and validity

**Problem**: 429 Rate Limited  
**Solution**: Wait and retry, or check OpenAI usage limits

**Problem**: 413 Payload Too Large
**Solution**: Audio file might be too large (25MB limit)

## Log Commands

```bash
# View recent production logs
vercel logs https://your-production-url.vercel.app

# View logs from specific time
vercel logs --since 1h

# Follow logs in real-time (for testing)
vercel logs --follow
```

## Expected Test Results

### Working System
```
✅ Environment variables all present and correctly formatted
✅ OpenAI API responds with transcribed text
✅ Local transcription API returns success with transcription
✅ Production transcription API returns success with transcription  
✅ Complete flow creates Airtable record and updates with transcription
```

### Broken System
```
❌ Missing OPENAI_API_KEY or incorrect format
❌ OpenAI API returns error (401, 429, etc.)
❌ Local API returns 500 error with File constructor issue
❌ Production API times out or returns 500 error
❌ Flow creates record but transcription never completes
```

## Next Steps Based on Results

If tests show environment variables are correct but transcription still fails:
1. Check Vercel function timeout settings
2. Verify OpenAI API quotas and billing
3. Test with smaller audio files
4. Check network connectivity between Vercel and OpenAI

If local tests pass but production fails:
1. Compare environment variables between local and production
2. Check Vercel function logs for timeout issues
3. Verify production deployment includes latest code changes 