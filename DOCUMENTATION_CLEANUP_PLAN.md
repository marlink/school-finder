# 📚 DOCUMENTATION CLEANUP & ORGANIZATION PLAN

## 🎯 OBJECTIVES
1. Eliminate duplicate documentation
2. Consolidate related files
3. Remove outdated/unnecessary files
4. Create clear documentation hierarchy
5. Sync root docs with school-finder docs

## 📋 CURRENT STATE ANALYSIS

### Root `/docs` (9 files)
- API_ENDPOINTS.md
- CLEANUP_COMPLETION_SUMMARY.md
- DATABASE_SCHEMA.md
- DEPLOYMENT_GUIDE.md
- PRODUCT_SPECIFICATION.md
- SECURITY_GUIDELINES.md
- SECURITY_HARDENING_PLAN.md
- TECHNICAL_REQUIREMENTS.md
- TODO.md

### School-finder `/docs` (30+ files)
- Many deployment-related files (duplicates)
- Multiple security files (can be consolidated)
- Session completion summaries (outdated)
- Setup guides (some outdated)

### Root level files in school-finder (12+ files)
- Multiple deployment guides
- Various status files
- Session summaries

## 🗂️ PROPOSED ORGANIZATION

### 1. KEEP & CONSOLIDATE
#### Core Documentation (in `/docs`)
- **README.md** - Main project overview
- **TECHNICAL_REQUIREMENTS.md** - System requirements
- **API_ENDPOINTS.md** - API documentation
- **DATABASE_SCHEMA.md** - Database structure
- **SECURITY.md** - Consolidated security guide
- **DEPLOYMENT.md** - Consolidated deployment guide
- **DEVELOPMENT.md** - Development setup & guidelines

#### Setup Guides (in `/docs/setup`)
- **GOOGLE_MAPS_SETUP.md**
- **MCP_INTEGRATION.md**
- **ENVIRONMENT_SETUP.md**
- **AUTHENTICATION_SETUP.md**

#### Reference (in `/docs/reference`)
- **BRANCH_STRATEGY.md**
- **GIT_WORKFLOW.md**
- **PRODUCT_SPECIFICATION.md**

### 2. ARCHIVE (move to `/docs/archive`)
- Session completion summaries
- Old status files
- Outdated setup guides
- Cleanup summaries

### 3. DELETE
- Duplicate files
- Completely outdated files
- Empty or placeholder files

## 🚀 CLEANUP ACTIONS

### Phase 1: Root Level Cleanup
- [ ] Move deployment files to `/docs`
- [ ] Consolidate status files
- [ ] Remove session summaries from root

### Phase 2: Documentation Consolidation
- [ ] Merge duplicate deployment guides
- [ ] Consolidate security documentation
- [ ] Update and organize setup guides

### Phase 3: Archive & Delete
- [ ] Archive outdated session files
- [ ] Delete empty/duplicate files
- [ ] Clean up screenshots (keep only current)

### Phase 4: Sync & Validate
- [ ] Ensure root docs match school-finder docs
- [ ] Update all cross-references
- [ ] Validate all links and paths

## 📝 FILES TO PROCESS

### CONSOLIDATE
- DEPLOYMENT_GUIDE.md + DEPLOYMENT.md + HOSTING_DEPLOYMENT_GUIDE.md → DEPLOYMENT.md
- SECURITY_GUIDELINES.md + SECURITY.md + SECURITY_*.md → SECURITY.md
- Multiple session summaries → DEVELOPMENT_HISTORY.md

### ARCHIVE
- SESSION_8_COMPLETION_SUMMARY.md
- CLEANUP_COMPLETION_SUMMARY.md
- SECURITY_AUTOMATION_COMPLETE.md
- SECURITY_IMPLEMENTATION_SUMMARY.md

### DELETE
- Duplicate README files
- Empty placeholder files
- Outdated screenshots

## ✅ SUCCESS CRITERIA
- Single source of truth for each topic
- Clear navigation and organization
- No duplicate information
- All links working
- Up-to-date content only

---
*This plan will be executed systematically to create a clean, organized documentation structure.*