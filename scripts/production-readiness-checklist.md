
# Production Readiness Checklist - Pricing Pipeline

## Pre-Production Verification ✅

### 1. Database Schema
- [x] `store_items` table has `updated_at` column
- [x] `updated_at` trigger is properly configured
- [x] All necessary indexes are in place
- [x] Row-level security policies reviewed

### 2. Pricing Logic
- [x] Rounding formula fixed: `Number((askUsd * 1.495).toFixed(2))`
- [x] USD currency handling implemented
- [x] Fallback pricing mechanism in place
- [x] Cache invalidation strategy defined

### 3. Edge Functions
- [x] `update-steam-prices` function deployed
- [x] `debug-pricing` function deployed
- [x] Error handling implemented
- [x] Logging configured properly

### 4. Testing & Verification
- [x] Debug pricing tests pass
- [x] End-to-end pipeline verification complete
- [x] Final verification runner implemented
- [x] All verification checks green

## Production Deployment Steps 🚀

### Phase 1: Final Verification
- [ ] **Flush Redis Cache in Production**
  ```bash
  redis-cli DEL price:usd:*
  ```

- [ ] **Run Final Verification in Production**
  - Navigate to Admin → Steam Bot Management
  - Click "Run Final Verification"
  - Verify all checks show green ✅

- [ ] **Screenshot Green Dashboard**
  - Take screenshot of successful verification
  - Archive alongside migration SQL files
  - Document timestamp and environment

### Phase 2: Monitoring Setup
- [ ] **Deploy Grafana Alerts**
  - Import `price-divergence-alert.yml`
  - Configure alert destinations (Slack, email)
  - Test alert firing with dummy data

- [ ] **Set Up Price Monitoring Dashboard**
  - Import `price-monitoring-dashboard.json`
  - Verify all panels display correctly
  - Set up appropriate refresh intervals

### Phase 3: Cron Job Activation
- [ ] **Enable 30-minute Cron Job**
  ```sql
  SELECT cron.schedule(
    'update-steam-prices-30min',
    '*/30 * * * *',
    $$
    SELECT net.http_post(
      url:='https://sckkxdmwzxayefwvcgic.supabase.co/functions/v1/update-steam-prices',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNja2t4ZG13enhheWVmd3ZjZ2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTI2MDgsImV4cCI6MjA2ODI2ODYwOH0.bu0p6fXSnlw02qRDkKUCo1IBTwMherhRmJT54NTQd-w"}'::jsonb
    );
    $$
  );
  ```

- [ ] **Verify Cron Job Execution**
  - Wait for first execution (within 30 minutes)
  - Check edge function logs for success
  - Verify store prices are updating

### Phase 4: Post-Deployment Monitoring
- [ ] **Monitor First 24 Hours**
  - Watch for price divergence alerts
  - Check pipeline success rate
  - Monitor edge function performance

- [ ] **Validate Store Consistency**
  - Spot-check item prices against Steam market
  - Verify updated_at timestamps are current
  - Confirm cache is working properly

## Success Criteria ✨

### All Systems Green
- ✅ Final verification shows all checks passed
- ✅ 30-minute cron job running successfully
- ✅ Grafana alerts configured and tested
- ✅ Price divergence monitoring active
- ✅ Store prices updating consistently
- ✅ No critical errors in 24-hour period

### Documentation Complete
- ✅ Migration SQL archived with verification screenshots
- ✅ Runbook updated with new procedures
- ✅ Monitoring dashboards configured
- ✅ Team trained on new alert procedures

## Rollback Plan 🔄

If issues arise post-deployment:

1. **Immediate**: Disable cron job
   ```sql
   SELECT cron.unschedule('update-steam-prices-30min');
   ```

2. **Assess**: Check logs and determine root cause

3. **Fix**: Apply necessary corrections

4. **Re-verify**: Run full verification suite again

5. **Re-deploy**: Only after all checks pass

---

**Sign-off Required**: DevOps Lead, Product Owner, CTO
**Date**: ___________
**Environment**: Production
**Approved by**: ___________
