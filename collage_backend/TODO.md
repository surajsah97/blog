# NestJS API Migration TODO

## Overview
Migrate Express.js API routes from `collage-backend` to NestJS `blog/collage_backend` project.

## Current Status
- ✅ Existing modules: auth, users, post, profile
- ✅ Completed modules: chat, skills, certifications
- ❌ Missing modules: connections, dashboard-stats, education, experiences, jobs, lectures, notifications, projects, resources

## Module Implementation Plan

### 1. Chat Module
- [x] Create src/chat/ directory
- [x] Create chat.controller.ts with endpoints matching chatRoutes.js
- [x] Create chat.service.ts for business logic
- [x] Create chat schemas/DTOs
- [x] Update app.module.ts

### 2. Skills Module
- [x] Create src/skills/ directory
- [x] Create skills.controller.ts with endpoints matching skillsRoutes.js
- [x] Create skills.service.ts for business logic
- [x] Create skills schemas/DTOs
- [x] Update app.module.ts

### 3. Certifications Module
- [x] Create src/certifications/ directory
- [x] Create certifications.controller.ts with endpoints matching certificationsRoutes.js
- [x] Create certifications.service.ts for business logic
- [x] Create certifications schemas/DTOs
- [x] Update app.module.ts

### 3. Connections Module
- [ ] Create src/connections/ directory
- [ ] Create connections.controller.ts
- [ ] Create connections.service.ts
- [ ] Create connections schemas/DTOs
- [ ] Update app.module.ts

### 4. Dashboard Stats Module
- [ ] Create src/dashboard-stats/ directory
- [ ] Create dashboard-stats.controller.ts
- [ ] Create dashboard-stats.service.ts
- [ ] Create dashboard-stats schemas/DTOs
- [ ] Update app.module.ts

### 5. Education Module
- [ ] Create src/education/ directory
- [ ] Create education.controller.ts
- [ ] Create education.service.ts
- [ ] Create education schemas/DTOs
- [ ] Update app.module.ts

### 6. Experiences Module
- [ ] Create src/experiences/ directory
- [ ] Create experiences.controller.ts
- [ ] Create experiences.service.ts
- [ ] Create experiences schemas/DTOs
- [ ] Update app.module.ts

### 7. Jobs Module
- [ ] Create src/jobs/ directory
- [ ] Create jobs.controller.ts
- [ ] Create jobs.service.ts
- [ ] Create jobs schemas/DTOs
- [ ] Update app.module.ts

### 8. Lectures Module
- [ ] Create src/lectures/ directory
- [ ] Create lectures.controller.ts
- [ ] Create lectures.service.ts
- [ ] Create lectures schemas/DTOs
- [ ] Update app.module.ts

### 9. Notifications Module
- [ ] Create src/notifications/ directory
- [ ] Create notifications.controller.ts
- [ ] Create notifications.service.ts
- [ ] Create notifications schemas/DTOs
- [ ] Update app.module.ts

### 10. Projects Module
- [ ] Create src/projects/ directory
- [ ] Create projects.controller.ts
- [ ] Create projects.service.ts
- [ ] Create projects schemas/DTOs
- [ ] Update app.module.ts

### 11. Resources Module
- [ ] Create src/resources/ directory
- [ ] Create resources.controller.ts
- [ ] Create resources.service.ts
- [ ] Create resources schemas/DTOs
- [ ] Update app.module.ts

### 12. Skills Module
- [ ] Create src/skills/ directory
- [ ] Create skills.controller.ts
- [ ] Create skills.service.ts
- [ ] Create skills schemas/DTOs
- [ ] Update app.module.ts

## Final Steps
- [ ] Update package.json if new dependencies needed
- [ ] Test all endpoints
- [ ] Update Swagger documentation
- [ ] Verify authentication works for protected routes
- [ ] Run integration tests
