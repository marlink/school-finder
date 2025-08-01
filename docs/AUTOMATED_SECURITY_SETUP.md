# Automated Security Testing Setup

## 🔄 Regular Security Testing Automation

### Quick Setup Commands

```bash
# Test security immediately
npm run security:test

# Run full security check
npm run security:check

# Complete security audit
npm run security:full
```

### 📅 Recommended Testing Schedule

#### **Daily Testing** (Development Environment)
```bash
# Add to crontab: crontab -e
0 9 * * * cd /path/to/school-finder && npm run security:test >> logs/daily-security.log 2>&1
```

#### **Weekly Testing** (Production Environment)
```bash
# Add to crontab: crontab -e
0 6 * * 1 cd /path/to/school-finder && npm run security:full >> logs/weekly-security.log 2>&1
```

#### **Monthly Full Audit**
```bash
# Add to crontab: crontab -e
0 3 1 * * cd /path/to/school-finder && npm audit && npm run security:full >> logs/monthly-audit.log 2>&1
```

### 🛠️ Setup Instructions

1. **Make scripts executable**:
   ```bash
   chmod +x scripts/automated-security-check.sh
   ```

2. **Create logs directory**:
   ```bash
   mkdir -p logs
   ```

3. **Test the automation**:
   ```bash
   npm run security:test
   ```

4. **Set up cron jobs** (replace `/path/to/school-finder` with actual path):
   ```bash
   crontab -e
   ```
   
   Add these lines:
   ```bash
   # Daily security test at 9 AM
   0 9 * * * cd /Users/ciepolml/Projects/school-finder/mc-fullpower-01/school-finder && npm run security:test >> logs/daily-security.log 2>&1
   
   # Weekly full check on Mondays at 6 AM
   0 6 * * 1 cd /Users/ciepolml/Projects/school-finder/mc-fullpower-01/school-finder && npm run security:full >> logs/weekly-security.log 2>&1
   ```

### 📊 Monitoring Security Status

#### **Check Recent Test Results**:
```bash
# View latest security test
tail -20 logs/daily-security.log

# Check for any failures
grep -i "failed\|error" logs/*.log
```

#### **Security Dashboard Commands**:
```bash
# Quick status check
npm run security:test | grep "Success Rate"

# Full security summary
npm run security:full | tail -20
```

### 🚨 Alert Setup

#### **Email Notifications** (Optional):
```bash
# Add to security script for email alerts
if ! npm run security:test; then
    echo "Security test failed on $(date)" | mail -s "Security Alert" admin@yoursite.com
fi
```

#### **Slack Notifications** (Optional):
```bash
# Add webhook for Slack alerts
SLACK_WEBHOOK="your-webhook-url"
if ! npm run security:test; then
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚨 Security test failed on $(hostname)"}' \
    $SLACK_WEBHOOK
fi
```

### 📈 Security Metrics Tracking

#### **Log Analysis**:
```bash
# Count successful tests this month
grep "Success Rate: 100" logs/*.log | wc -l

# Find any security failures
grep -n "failed\|error" logs/*.log

# Security trend analysis
grep "Success Rate" logs/*.log | tail -10
```

### 🔧 Troubleshooting

#### **Common Issues**:

1. **Permission denied**:
   ```bash
   chmod +x scripts/automated-security-check.sh
   ```

2. **Node modules not found**:
   ```bash
   npm install
   ```

3. **Database connection issues**:
   ```bash
   # Check environment variables
   cat .env.local | grep DATABASE
   ```

#### **Manual Testing**:
```bash
# Test individual components
node scripts/security-tests.js
npm audit
npm run lint
npm run build
```

### 📋 Security Checklist

- [ ] Scripts are executable
- [ ] Cron jobs are set up
- [ ] Logs directory exists
- [ ] Email/Slack alerts configured (optional)
- [ ] Security tests pass 100%
- [ ] Regular monitoring in place

### 🎯 Success Criteria

- **Daily Tests**: 100% pass rate
- **Weekly Audits**: No critical vulnerabilities
- **Monthly Reviews**: All dependencies up to date
- **Response Time**: Issues resolved within 24 hours

---

**Last Updated**: $(date)
**Current Security Status**: ✅ 100% (33/33 tests passing)
**Next Scheduled Check**: Daily at 9 AM