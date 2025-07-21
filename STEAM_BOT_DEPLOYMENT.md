
# Steam Bot Manager - Production Deployment Guide

This guide covers deploying the Steam Bot Manager with real Steam API integration for production use.

## Prerequisites

1. **Steam Account Setup**
   - Steam account with Rust items in inventory
   - Steam Guard Mobile Authenticator enabled
   - Steam Web API Key from https://steamcommunity.com/dev/apikey
   - Steam Guard shared_secret and identity_secret from authenticator

2. **Supabase Configuration**
   - Supabase project with steam_bots and steam_bot_inventory tables
   - Service role key for Edge Function access
   - Edge Functions enabled

## Environment Variables

Configure these secrets in your Supabase Edge Functions environment:

### Required Variables

```bash
# Steam Web API Key (get from https://steamcommunity.com/dev/apikey)
STEAM_API_KEY=your_32_character_steam_api_key

# Global fallback credentials (optional - bots store encrypted creds in DB)
STEAM_BOT_USERNAME=your_steam_username
STEAM_BOT_PASSWORD=your_steam_password
STEAM_BOT_SHARED_SECRET=your_base64_shared_secret
STEAM_BOT_IDENTITY_SECRET=your_base64_identity_secret
STEAM_BOT_STEAM_ID=your_64bit_steam_id
```

### Optional Configuration

```bash
# Rate limiting and performance
STEAM_INVENTORY_BATCH_SIZE=100
STEAM_MARKET_RATE_LIMIT_MS=500
STEAM_INVENTORY_RETRY_ATTEMPTS=3
STEAM_INVENTORY_RETRY_DELAY_MS=2000

# Pricing configuration
STEAM_PRICE_MULTIPLIER=1.6

# Debug settings
STEAM_BOT_DEBUG=false
STEAM_BOT_LOG_LEVEL=info
```

## Getting Steam Guard Secrets

### Method 1: Using Steam Desktop Authenticator (SDA)

1. Install Steam Desktop Authenticator
2. Import your mobile authenticator
3. Find the `.maFile` in SDA directory
4. Extract `shared_secret` and `identity_secret` values

### Method 2: Using steam-totp package

```javascript
const SteamTotp = require('steam-totp');

// Your shared secret from authenticator setup
const sharedSecret = 'your_shared_secret_here';

// Generate TOTP code
const code = SteamTotp.generateAuthCode(sharedSecret);
console.log('Current TOTP:', code);
```

## Database Schema Updates

The production version requires additional fields for error tracking:

```sql
-- Add error tracking fields to steam_bots table
ALTER TABLE steam_bots ADD COLUMN IF NOT EXISTS error_details TEXT;
ALTER TABLE steam_bots ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0;
ALTER TABLE steam_bots ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE steam_bots ADD COLUMN IF NOT EXISTS inventory_count INTEGER DEFAULT 0;

-- Add price and visibility fields to steam_bot_inventory
ALTER TABLE steam_bot_inventory ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00;
ALTER TABLE steam_bot_inventory ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;
ALTER TABLE steam_bot_inventory ADD COLUMN IF NOT EXISTS appid INTEGER DEFAULT 252490;
ALTER TABLE steam_bot_inventory ADD COLUMN IF NOT EXISTS contextid INTEGER DEFAULT 2;

-- Update existing records
UPDATE steam_bot_inventory SET appid = 252490, contextid = 2 WHERE appid IS NULL;
```

## Rate Limiting and Steam API Considerations

### Steam Community API Limits

- **Inventory API**: ~100 requests per minute per IP
- **Market Price API**: ~200 requests per minute per IP
- **Steam Web API**: 1000 requests per day (with API key)

### Best Practices

1. **Batch Processing**: Process items in batches of 10-50
2. **Rate Limiting**: 500ms delay between market price requests
3. **Retry Logic**: Exponential backoff on 429 errors
4. **Caching**: Cache market prices for 1 hour
5. **Error Handling**: Graceful degradation on API failures

### Error Handling Strategy

```javascript
// Retry on these errors
const RETRYABLE_ERRORS = [
  'ECONNRESET',
  'ETIMEDOUT', 
  'rate limit',
  '429',
  '502',
  '503'
];

// Permanent failures
const PERMANENT_ERRORS = [
  '403', // Private inventory
  '404', // User not found
  'Invalid API key'
];
```

## Deployment Steps

1. **Set Environment Variables**
   ```bash
   # In Supabase Dashboard > Settings > Edge Functions
   STEAM_API_KEY=your_api_key_here
   ```

2. **Deploy Edge Function**
   ```bash
   supabase functions deploy steam-bot-manager
   ```

3. **Test with Single Bot**
   ```javascript
   // Test sync for one bot
   const response = await supabase.functions.invoke('steam-bot-manager', {
     body: {
       action: 'sync_inventory',
       botId: 'your-bot-id-here'
     }
   });
   ```

4. **Monitor Logs**
   ```bash
   supabase functions logs steam-bot-manager --follow
   ```

## Production Monitoring

### Key Metrics to Track

- **Sync Success Rate**: % of successful inventory syncs
- **API Error Rate**: Steam API failures per hour  
- **Average Sync Time**: Time to complete full inventory sync
- **Item Count Accuracy**: Verification against Steam inventory
- **Price Update Frequency**: Market price refresh rate

### Alerting Thresholds

- Sync failure rate > 10%
- Average sync time > 5 minutes
- Steam API errors > 50/hour
- Bot offline for > 30 minutes

## Troubleshooting

### Common Issues

1. **"Steam inventory is private"**
   - Solution: Make bot's Steam profile and inventory public

2. **"Steam rate limit exceeded"**
   - Solution: Increase delays, implement exponential backoff

3. **"Steam login failed"**
   - Solution: Verify credentials, check Steam Guard codes

4. **"Market price fetch failed"**
   - Solution: Fallback to default prices, retry later

### Debug Mode

Enable debug logging:

```bash
STEAM_BOT_DEBUG=true
STEAM_BOT_LOG_LEVEL=debug
```

### Testing Checklist

- [ ] Bot can authenticate with Steam
- [ ] Inventory fetching works for Rust (252490/2)
- [ ] Market prices are fetched and multiplied correctly
- [ ] Items are upserted (not duplicated) in database
- [ ] Bot status updates correctly on success/failure
- [ ] Frontend receives realtime updates
- [ ] Error handling works for rate limits
- [ ] Retry logic functions properly

## Security Considerations

1. **Credential Encryption**: All bot credentials stored encrypted in database
2. **API Key Protection**: Steam API key stored in secure environment variables
3. **Rate Limiting**: Prevent API abuse and Steam bans
4. **Error Logging**: Don't log sensitive credentials in errors
5. **Access Control**: Only admin users can manage bots

## Performance Optimization

1. **Parallel Processing**: Sync multiple bots concurrently (max 3)
2. **Incremental Updates**: Only sync changed items where possible
3. **Price Caching**: Cache market prices to reduce API calls
4. **Database Optimization**: Use upserts instead of delete/insert
5. **Connection Pooling**: Reuse database connections

## Launch Preparation

1. **Load Testing**: Test with multiple bots and large inventories
2. **Backup Strategy**: Database backups before major syncs
3. **Rollback Plan**: Ability to revert to mock system if needed
4. **User Communication**: Notify users about sync improvements
5. **Documentation**: Update user guides and admin procedures

---

**Timeline Target**: Ready for production testing within 2-3 days

For support or questions, check the Edge Function logs first, then consult this guide.
