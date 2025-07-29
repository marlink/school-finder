# 🔄 Git Workflow & Versioning Strategy

## 📋 **Branch Strategy**

### **Branch Structure**
```
main (production) ← production-ready ← staging ← feature-branches
```

### **Branch Purposes**
- **`main`**: Production-ready code, deployed to live environment
- **`production-ready`**: Pre-production testing, final QA
- **`staging`**: Integration testing, staging environment
- **`feature/*`**: Individual feature development

## 🚀 **Deployment Flow**

### **Correct Workflow**
1. **Development**: Work on `feature/feature-name` branches
2. **Staging**: Merge to `staging` → Test on staging environment
3. **Pre-Production**: Merge to `production-ready` → Final QA
4. **Production**: Merge to `main` → Deploy to live

### **Environment Mapping**
- **Testing Environment** → `feature/*` branches
- **Staging Environment** → `staging` branch
- **Production Environment** → `main` branch

## 🏷️ **Semantic Versioning**

### **Version Format**: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features, backward compatible (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes, backward compatible (1.0.0 → 1.0.1)

### **Current Version**: `v1.0.0`
- Initial production release with environment setup

## 📝 **Git Commands Reference**

### **Create Feature Branch**
```bash
git checkout staging
git pull origin staging
git checkout -b feature/new-feature
```

### **Deploy to Staging**
```bash
git checkout staging
git merge feature/new-feature
git push origin staging
```

### **Deploy to Production-Ready**
```bash
git checkout production-ready
git merge staging
git push origin production-ready
```

### **Deploy to Production**
```bash
git checkout main
git merge production-ready
git tag -a v1.1.0 -m "Release description"
git push origin main --tags
```

### **Check Current Status**
```bash
git branch -a                    # View all branches
git log --oneline -10           # Recent commits
git tag -l                      # List all tags
```

## ⚠️ **Important Rules**

### **Never Push Directly To**
- ❌ `main` (production)
- ❌ `production-ready` (pre-production)

### **Always Test Before Merging**
- ✅ Test on staging environment first
- ✅ Run all tests before merging
- ✅ Verify environment switching works

### **Version Tagging**
- ✅ Tag every production release
- ✅ Use descriptive commit messages
- ✅ Include version in release notes

## 🔧 **Quick Setup Commands**

### **Switch to Staging for Development**
```bash
git checkout staging
npm run env:staging
npm run dev
```

### **Prepare for Production Release**
```bash
git checkout production-ready
npm run env:production
npm run build
npm run test
```

## 📊 **Current Branch Status**
- **Active Branch**: `staging` ✅
- **Environment**: Staging ✅
- **Version**: `v1.0.0` ✅
- **Remote Sync**: ✅

---
*Last Updated: $(date)*
*Next Version: v1.1.0 (planned)*