
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useAffiliateCodeFromUrl = () => {
  const location = useLocation();
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const refCode = searchParams.get('ref');
    
    if (refCode) {
      setAffiliateCode(refCode.toUpperCase());
      // Store in localStorage to persist across page reloads
      localStorage.setItem('affiliate_code', refCode.toUpperCase());
    } else {
      // Check if we have a stored code
      const storedCode = localStorage.getItem('affiliate_code');
      if (storedCode) {
        setAffiliateCode(storedCode);
      }
    }
  }, [location]);

  const clearAffiliateCode = () => {
    setAffiliateCode(null);
    localStorage.removeItem('affiliate_code');
  };

  return { affiliateCode, clearAffiliateCode };
};
