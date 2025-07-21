
import React from 'react';

export const PricingVerificationInstructions = () => {
  return (
    <div className="mt-6 p-4 bg-slate-100 rounded-lg">
      <h4 className="font-medium mb-2">Post-Verification Steps:</h4>
      <div className="text-sm space-y-1 text-slate-700">
        <div>1. ✅ Verify all checks show green above</div>
        <div>2. 🗑️ Flush Redis cache: <code>redis-cli DEL price:usd:*</code></div>
        <div>3. ⏰ Reactivate 30-minute cron job for price updates</div>
        <div>4. 📊 Monitor store page for consistent pricing</div>
      </div>
    </div>
  );
};
