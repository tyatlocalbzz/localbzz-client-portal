# LocalBzz Client Portal Integration Guide

## Overview
This document outlines the integration points and data structure for applications interacting with the LocalBzz Client Portal database. The system is designed to manage client relationships, content creation, and project management for a creative agency.

## Core Entities and Relationships

### 1. Clients
- Primary entity representing agency clients
- Contains contact information and service preferences
- Key fields:
  - `id`: UUID (primary key)
  - `name`: Client business name
  - `status`: Active/Inactive/Pitching
  - `primary_contact_name`, `email`, `phone`
  - `client_portal_subdomain`: Unique identifier for client portal access
  - `shoot_frequency`: Monthly/Quarterly/Per Project/Ad Hoc
  - Default content counts (reels, photos, carousels)

### 2. Team Members
- Represents agency staff and contractors
- Key fields:
  - `id`: UUID (primary key)
  - `name`, `email`, `phone`
  - Roles (Editor, Scheduler, Content Creator)
  - Associated with tasks, deliverables, and shoots

### 3. Shoots
- Content creation events
- Key fields:
  - `id`: UUID (primary key)
  - `client_id`: Reference to client
  - `shoot_start`, `duration`, `shoot_end`
  - `status`: Scheduled/Postponed/Completed/Cancelled
  - `location`
  - Calendar and drive folder links
  - Team member assignments

### 4. Deliverables
- Content items produced for clients
- Key fields:
  - `id`: UUID (primary key)
  - `shoot_id`: Reference to shoot
  - `client_id`: Reference to client
  - `deliverable_type`: Reel/Photo/Carousel/Other
  - `status`: To Do/In Progress/Needs Review/Ready-To-Post/Delivered
  - `due_date`
  - `file_link`
  - Content details (caption, posting instructions)

### 5. Tasks
- Work items and assignments
- Key fields:
  - `id`: UUID (primary key)
  - `name`, `description`
  - `status`: To Do/In Progress/Blocked/Awaiting Review/Completed
  - `priority`: High/Medium/Low
  - Time tracking fields
  - Can be linked to clients, shoots, or deliverables

### 6. Form Submissions
- Lead and request information
- Key fields:
  - `id`: UUID (primary key)
  - Contact information
  - Business details
  - Approval workflow status

### 7. Client Portal Requests
- Client communication and requests
- Key fields:
  - `id`: UUID (primary key)
  - `client_id`: Reference to client
  - `content`: Request details
  - `request_type`: Request/Insight
  - `priority`: Normal/Urgent
  - `topic`: Content/Strategy/Business Update/General
  - `status`: New/Working/Done

## Integration Points

### 1. Authentication and Authorization
- Required for all API endpoints
- JWT-based authentication recommended
- Role-based access control:
  - Admin
  - Team Member
  - Client
  - Public (for form submissions)

### 2. API Endpoints Structure

#### Client Management
```
GET    /api/clients
GET    /api/clients/:id
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id
```

#### Shoot Management
```
GET    /api/shoots
GET    /api/shoots/:id
POST   /api/shoots
PUT    /api/shoots/:id
DELETE /api/shoots/:id
GET    /api/clients/:clientId/shoots
```

#### Deliverable Management
```
GET    /api/deliverables
GET    /api/deliverables/:id
POST   /api/deliverables
PUT    /api/deliverables/:id
DELETE /api/deliverables/:id
GET    /api/shoots/:shootId/deliverables
GET    /api/clients/:clientId/deliverables
```

#### Task Management
```
GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/team-members/:id/tasks
GET    /api/clients/:clientId/tasks
```

#### Team Management
```
GET    /api/team-members
GET    /api/team-members/:id
POST   /api/team-members
PUT    /api/team-members/:id
DELETE /api/team-members/:id
```

#### Form Submissions
```
GET    /api/form-submissions
GET    /api/form-submissions/:id
POST   /api/form-submissions
PUT    /api/form-submissions/:id
```

#### Client Portal
```
GET    /api/client-portal/:subdomain/requests
POST   /api/client-portal/:subdomain/requests
GET    /api/client-portal/:subdomain/deliverables
```

### 3. Webhook Events
The system should implement webhooks for real-time updates:

- Client status changes
- Shoot status updates
- Deliverable status changes
- Task assignments and completions
- Form submission approvals
- Client portal request updates

### 4. File Management
- Integration with cloud storage (Google Drive)
- File upload/download endpoints
- Attachment management for various entities

## Data Synchronization

### 1. Real-time Updates
- WebSocket connections for live updates
- Event-based architecture for state changes
- Push notifications for important updates

### 2. Batch Operations
- Bulk data import/export capabilities
- Scheduled synchronization jobs
- Data validation and cleanup processes

## Security Considerations

### 1. API Security
- HTTPS for all communications
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

### 2. Data Protection
- Encryption at rest
- Secure file storage
- Access control lists
- Audit logging

### 3. Compliance
- GDPR considerations
- Data retention policies
- Privacy controls

## Performance Considerations

### 1. Caching Strategy
- Redis for session management
- CDN for static assets
- Query result caching
- API response caching

### 2. Database Optimization
- Index usage
- Query optimization
- Connection pooling
- Batch operations

## Monitoring and Logging

### 1. System Health
- API endpoint monitoring
- Database performance metrics
- Error tracking
- Usage statistics

### 2. Audit Trail
- User actions logging
- Data changes tracking
- Access logs
- Error logs

## Development Guidelines

### 1. API Versioning
- Semantic versioning
- Backward compatibility
- Deprecation policies

### 2. Error Handling
- Standard error responses
- Error codes and messages
- Debug information
- Rate limit handling

### 3. Documentation
- OpenAPI/Swagger documentation
- Code examples
- Integration guides
- Troubleshooting guides

## Testing Requirements

### 1. Integration Testing
- API endpoint testing
- Authentication testing
- Data validation testing
- Error handling testing

### 2. Performance Testing
- Load testing
- Stress testing
- Concurrent user testing
- Response time testing

## Deployment Considerations

### 1. Environment Setup
- Development
- Staging
- Production
- Configuration management

### 2. CI/CD Pipeline
- Automated testing
- Deployment automation
- Version control
- Rollback procedures

## Support and Maintenance

### 1. Monitoring
- System health checks
- Performance monitoring
- Error tracking
- Usage analytics

### 2. Maintenance
- Database maintenance
- Backup procedures
- Update procedures
- Security patches

## Future Considerations

### 1. Scalability
- Horizontal scaling
- Vertical scaling
- Load balancing
- Database sharding

### 2. Feature Roadmap
- Additional integrations
- Enhanced reporting
- Advanced analytics
- Mobile applications 