
export const validateTradeUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  
  // Steam trade URL pattern
  const steamTradeUrlPattern = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[a-zA-Z0-9_-]+$/;
  return steamTradeUrlPattern.test(url);
};
