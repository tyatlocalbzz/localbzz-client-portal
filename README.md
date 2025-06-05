# 🎯 Client Communication Portal

**A voice-optimized communication hub for clients to share content requests, shoot needs, and business context - designed for AI-powered client insight generation.**

## 🌟 **System Overview**

Transform client communication into actionable business intelligence with this comprehensive portal that captures:

- 📹 **Content shoot requests** 
- 💡 **Creative ideas & suggestions**
- 📋 **Business context & updates**
- 🔄 **Feedback & reviews**  
- 📈 **Strategy discussions**

All submissions are automatically categorized, prioritized, and prepared for AI analysis to optimize content planning and client relationships.

## ✨ **Key Features**

### **🎤 Voice-Optimized Input**
- **Desktop**: Web Speech API with real-time transcription
- **Mobile**: Native voice input integration
- **Fallback**: Manual typing for all devices
- **Smart Detection**: Auto-categorizes content based on keywords

### **🎯 Intelligent Processing**
- **Auto-Categorization**: Content Shoot, Strategy, Business Updates, etc.
- **Urgency Detection**: Keyword-based priority scoring
- **Client Resolution**: Automatic client identification from subdomains
- **AI-Ready**: Structured data optimized for AI processing

### **🏗️ Multi-Tenant Architecture**  
- **Single Codebase**: Serves unlimited clients
- **Subdomain Routing**: `acme.localbzz.com`, `techstart.localbzz.com`
- **Client Management**: Centralized configuration system
- **Secure Separation**: Each client's data properly isolated

### **📊 Advanced Analytics Pipeline**
- **Request Categorization**: Automated content type detection
- **Trend Analysis**: Client communication patterns
- **Shoot Planning**: Content production optimization
- **Client Insights**: Relationship health monitoring

## 🚀 **Tech Stack**

- **Framework**: Next.js 15 + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Database**: Airtable (with AI-optimized schema)
- **Deployment**: Vercel Serverless
- **Voice**: Web Speech API + Native Mobile Input

## 📋 **Quick Start**

### **1. Environment Setup**
```bash
# Clone and install
git clone <repository>
npm install

# Configure environment
cp .env.example .env.local
```

### **2. Environment Variables**
```env
AIRTABLE_BASE_ID=appovPmfaZS6JKOCr
AIRTABLE_TABLE_NAME=tbl4TyoxqfQpl1NSF  
AIRTABLE_API_KEY=your_personal_access_token
```

### **3. Development**
```bash
npm run dev
# Access at http://localhost:3000
```

### **4. Client Configuration**
Add clients in `src/lib/clients.ts`:
```typescript
const CLIENT_CONFIG = {
  'acme': {
    name: 'ACME Corporation',
    features: { voiceInput: true, aiAnalysis: true }
  }
}
```

## 📊 **Data Structure**

### **Auto-Populated Fields**
- **Request Title**: Brief summary (60 chars)
- **Full Request**: Complete submission
- **Client Name**: Resolved from subdomain  
- **Request Category**: AI-categorized type
- **Urgency Level**: Keyword-based priority
- **Device Type**: Mobile/Desktop detection
- **AI Processing Status**: Workflow tracking

### **Request Categories**
- `Content Shoot` - Video/photo production needs
- `Content Creation` - Social media, marketing materials
- `Strategy & Planning` - Campaign discussions
- `Business Update` - Context and changes
- `Feedback & Review` - Client responses
- `General Request` - Miscellaneous communications

## 🤖 **AI Processing Pipeline**

### **Stage 1: Auto-Categorization**
Real-time analysis of submissions for:
- Content type detection
- Urgency scoring (1-10)
- Keyword extraction
- Shoot requirement identification

### **Stage 2: Pattern Analysis**
Cross-client insights:
- Content gap identification
- Shoot scheduling optimization
- Trending topic detection
- Client health scoring

### **Stage 3: Business Intelligence**
Automated reporting:
- Client engagement metrics
- Content pipeline status
- Resource requirement forecasting
- Revenue opportunity identification

## 🎬 **Content Production Optimization**

### **Shoot Planning**
- **Auto-Detection**: Video/photo needs from requests
- **Timeline Analysis**: Deadline-based prioritization  
- **Resource Planning**: Capacity and scheduling
- **Client Coordination**: Automated follow-up workflows

### **Content Strategy**
- **Trend Identification**: Popular content themes
- **Client Segmentation**: Content preferences by client
- **Performance Prediction**: Success likelihood scoring
- **Upsell Detection**: Revenue opportunity flagging

## 🔒 **Security & Privacy**

- **API Key Protection**: Server-side credential handling
- **Data Isolation**: Client-specific data separation
- **HTTPS Enforcement**: Secure data transmission
- **Input Validation**: Comprehensive request sanitization

## 📱 **Device Compatibility**

### **Desktop Voice Input**
- Chrome/Chromium browsers ✅
- Edge browser ✅  
- Safari (limited) ⚠️
- Firefox (not supported) ❌

### **Mobile Voice Input**
- iOS Safari (native keyboard) ✅
- Android Chrome (native keyboard) ✅
- All devices (fallback typing) ✅

## 🚀 **Deployment**

### **Vercel Deployment**
```bash
# Deploy to Vercel
npm run build
vercel --prod

# Configure custom domains
# Add DNS: *.yourdomain.com → Vercel
```

### **DNS Configuration**
```
# Wildcard subdomain setup
*.localbzz.com → your-vercel-app.vercel.app
```

## 📈 **Usage Analytics**

Track client engagement through:
- **Submission Frequency**: Communication patterns
- **Content Type Distribution**: Request categories
- **Device Usage**: Mobile vs desktop trends
- **Response Time**: Team performance metrics

## 🔮 **Future Enhancements**

### **Phase 2: Advanced AI**
- Auto-scheduling based on availability
- Proactive content recommendations
- Client health monitoring
- Predictive resource allocation

### **Phase 3: Integration Expansion**
- CRM synchronization
- Calendar integration
- Automated invoicing
- Client portal expansion

## 🛠️ **Development**

### **Project Structure**
```
src/
├── app/
│   ├── page.tsx              # Main interface
│   └── api/submit/route.ts   # Submission handler
├── lib/
│   └── clients.ts            # Client configuration
└── middleware.ts             # Subdomain routing
```

### **Key Components**
- **Voice Handler**: Web Speech API integration
- **Form Management**: React Hook Form + Zod validation
- **Client Resolution**: Subdomain-based routing
- **API Integration**: Airtable REST operations

## 📞 **Support**

For technical support or feature requests:
- Review the `AIRTABLE_SETUP.md` for schema optimization
- Check environment variable configuration
- Verify client subdomain setup
- Test voice input compatibility

---

**Transform client communication into competitive advantage with AI-powered insights and optimized content production workflows.** 🚀✨
