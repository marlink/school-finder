# 🚀 Quick Environment Reference

## 🎯 Three-Tier System Overview

| Environment | Database | Purpose | Safety Level |
|-------------|----------|---------|--------------|
| **🧪 Testing** | Mock/In-memory | Unit tests, isolated dev | ✅ Completely Safe |
| **🔧 Staging** | `xhcltxeknhsvxzvvcjlp` | Development with real data | ✅ Safe for Development |
| **🚀 Production** | `iakvamnayaknanniejjs` | Live users | ⚠️ CRITICAL - Handle with Care |

## 🔄 Quick Commands

```bash
# Switch environments
npm run env:testing    # 🧪 For tests and isolated development
npm run env:staging    # 🔧 For daily development (RECOMMENDED)
npm run env:production # 🚀 For production builds only

# Start development
npm run dev            # Runs on port 3001

# Run tests
npm test              # Uses testing environment automatically
npm run test:e2e      # End-to-end tests
```

## 🛡️ Safety Rules

1. **Daily Development**: Always use `npm run env:staging`
2. **Testing**: Use `npm run env:testing` for isolated tests
3. **Production**: Only for CI/CD and final deployment
4. **Never**: Mix environment credentials

## 🔍 Verify Current Environment

```bash
# Check which environment is active
cat .env.local | grep NEXT_PUBLIC_SUPABASE_URL

# Expected outputs:
# Testing:    http://localhost:54321
# Staging:    https://xhcltxeknhsvxzvvcjlp.supabase.co  
# Production: https://iakvamnayaknanniejjs.supabase.co
```

## 📊 Database Status

- **Testing**: ✅ Isolated mock database
- **Staging**: ✅ 5 real Polish schools for development
- **Production**: ✅ Full production dataset

## 🆘 Emergency

If you're unsure which environment you're in:
1. **STOP** all processes
2. Run: `cat .env.local | head -5`
3. Verify the database URL
4. Switch to staging if in doubt: `npm run env:staging`

---
*Keep this file for quick reference in future sessions*