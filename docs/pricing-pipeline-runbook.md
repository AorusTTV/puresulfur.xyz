
# Pricing Pipeline Runbook

## Price Divergence Alert Response

### Immediate Actions (< 5 minutes)
1. **Check the Alert Details**
   - Review which item(s) triggered the alert
   - Note the price change percentage
   - Check the timestamp of the divergence

2. **Verify Steam Market Status**
   - Visit Steam Community Market for the affected item
   - Compare current market price with our stored price
   - Check if Steam is experiencing issues or unusual market activity

3. **Assess Impact**
   - Check how many users are affected
   - Review recent transactions for the item
   - Determine if this is a single item or widespread issue

### Investigation Steps (5-15 minutes)
1. **Check Pricing Pipeline Logs**
   ```bash
   # Check recent edge function logs
   supabase functions logs update-steam-prices --limit 50
   
   # Check debug pricing logs
   supabase functions logs debug-pricing --limit 20
   ```

2. **Verify Database State**
   ```sql
   -- Check recent price updates
   SELECT name, price, updated_at 
   FROM store_items 
   WHERE updated_at > NOW() - INTERVAL '1 hour'
   AND name = 'AFFECTED_ITEM_NAME';
   
   -- Check for unusual price changes
   SELECT name, price, 
          LAG(price) OVER (PARTITION BY name ORDER BY updated_at) as prev_price,
          ((price - LAG(price) OVER (PARTITION BY name ORDER BY updated_at)) / 
           LAG(price) OVER (PARTITION BY name ORDER BY updated_at)) * 100 as change_percent
   FROM store_items 
   WHERE updated_at > NOW() - INTERVAL '2 hours'
   ORDER BY change_percent DESC;
   ```

3. **Steam API Health Check**
   - Test Steam Market API directly
   - Check if other items are also affected
   - Verify our API key is working correctly

### Response Actions

#### If Steam Market Spike (Legitimate)
1. **No immediate action needed** - price increase is legitimate
2. Monitor for continued volatility
3. Consider implementing price change limits for highly volatile items

#### If Pricing Pipeline Error
1. **Immediate**: Disable the 30-minute cron job
   ```sql
   -- Disable the cron job
   SELECT cron.unschedule('update-steam-prices-30min');
   ```

2. **Fix the Issue**
   - Review and fix the pricing calculation
   - Test with debug-pricing function
   - Run verification tests

3. **Re-enable Safely**
   - Run final verification
   - Flush Redis cache
   - Re-enable cron job

#### If Database Corruption
1. **Immediate**: Stop all price updates
2. **Rollback**: Restore prices from backup if available
3. **Investigation**: Identify root cause
4. **Recovery**: Implement fix and test thoroughly

### Escalation Criteria
- Price divergence >50% on multiple items
- System-wide pricing pipeline failure
- Database corruption detected
- Unable to determine root cause within 30 minutes

### Post-Incident Actions
1. **Document the incident** in incident log
2. **Update monitoring** if gaps were identified
3. **Review and improve** alert thresholds if needed
4. **Conduct post-mortem** for significant incidents

## Contact Information
- **Primary**: DevOps Team Slack Channel
- **Secondary**: CTO Direct Line
- **Emergency**: 24/7 On-call Engineer

## Useful Commands
```bash
# Check current cron jobs
SELECT * FROM cron.job WHERE jobname LIKE '%steam%';

# Manual price update for single item
curl -X POST 'https://sckkxdmwzxayefwvcgic.supabase.co/functions/v1/debug-pricing' \
  -H 'Authorization: Bearer ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"market_hash_name": "ITEM_NAME"}'

# Flush Redis cache
redis-cli DEL price:usd:*

# Check pricing verification
curl -X POST 'https://sckkxdmwzxayefwvcgic.supabase.co/functions/v1/verify-pricing-fixes' \
  -H 'Authorization: Bearer ANON_KEY'
```
