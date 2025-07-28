# 🚨 PERMANENT DEVELOPMENT RULES

## 📍 CRITICAL TERMINAL COMMAND RULES

### Rule 1: ALWAYS Verify Working Directory
**BEFORE executing ANY terminal command, ALWAYS:**
1. Check current working directory with `pwd`
2. Ensure you are in `/Users/ciepolml/Projects/school-finder/mc-fullpower-01/school-finder-production`
3. If not, navigate there first: `cd /Users/ciepolml/Projects/school-finder/mc-fullpower-01/school-finder-production`

### Rule 2: NO Compound Commands
**NEVER use `&` or `&&` in terminal commands**
- ❌ BAD: `npm run build && npm start`
- ✅ GOOD: Execute commands separately:
  ```bash
  npm run build
  npm start
  ```

### Rule 3: Repository Configuration
- **GitHub Repository**: Always push to `marlink` account repositories
- **Never push to**: `mc-design` or `design-mc` repositories
- **Verify remote**: Always check `git remote -v` before pushing

### Rule 4: Deployment Checklist
Before any deployment:
1. ✅ Verify working directory
2. ✅ Check Supabase connection
3. ✅ Test local build
4. ✅ Verify environment variables
5. ✅ Commit all changes
6. ✅ Push to correct repository

---
**These rules are MANDATORY for all future development work.**