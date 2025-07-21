import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DailyCaseResult } from './DailyCaseResult';
import { DailyCaseCarousel, CrateItem as CarouselCrateItem } from './DailyCaseCarousel';

interface CrateItem {
  id: string;
  name: string;
  price: number;
  image: string;
  rarity: string;
  rarityColor: string;
  probability: number;
}

export const DailyFreeCrate: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [canClaim, setCanClaim] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [wonItem, setWonItem] = useState<CrateItem | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Daily items with proper UUIDs
  const dailyItems: CrateItem[] = [
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Fire Jacket',
      price: 495.23,
      image: '/lovable-uploads/679cea75-a886-4a41-8e30-7f6d45bd21a0.png',
      rarity: 'Legendary',
      rarityColor: 'from-yellow-400 to-orange-500',
      probability: 0.01 // 0.01%
    },
    {
      id: 'b2c3d4e5-f6g7-8901-bcde-f12345678901',
      name: 'Crime Bag',
      price: 101.83,
      image: '/lovable-uploads/ee5e9966-bbd3-4cd8-bf64-07171e3cbeed.png',
      rarity: 'Epic',
      rarityColor: 'from-purple-400 to-pink-500',
      probability: 0.09 // 0.09%
    },
    {
      id: 'c3d4e5f6-g7h8-9012-cdef-123456789012',
      name: 'Tempered Bow',
      price: 4.68,
      image: '/lovable-uploads/fc5e7800-3c86-4b0f-924a-7330797a46a1.png',
      rarity: 'Rare',
      rarityColor: 'from-blue-400 to-cyan-500',
      probability: 0.9 // 0.9%
    },
    {
      id: 'd4e5f6g7-h8i9-0123-def1-234567890123',
      name: 'Red Christmas Grenade',
      price: 1.22,
      image: '/lovable-uploads/b5e40e81-fe3c-45c0-b4ba-f63e562cb986.png',
      rarity: 'Common',
      rarityColor: 'from-green-400 to-emerald-500',
      probability: 9 // 9%
    },
    {
      id: 'e5f6g7h8-i9j0-1234-ef12-345678901234',
      name: 'Wood',
      price: 0.07,
      image: '/lovable-uploads/ffa42209-157f-414e-94f7-ceceeeac38b2.png',
      rarity: 'Normal',
      rarityColor: 'from-gray-400 to-slate-500',
      probability: 90 // 90%
    }
  ];

  // Calculate time until next midnight GMT+3
  const calculateTimeUntilReset = () => {
    const now = new Date();
    const gmt3Offset = 3 * 60 * 60 * 1000;
    const nowGmt3 = new Date(now.getTime() + gmt3Offset);
    
    const nextMidnight = new Date(nowGmt3);
    nextMidnight.setUTCHours(24, 0, 0, 0);
    
    const nextMidnightLocal = new Date(nextMidnight.getTime() - gmt3Offset);
    
    const timeDiff = nextMidnightLocal.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  // Get today's date string in GMT+3
  const getTodayGMT3Date = () => {
    const now = new Date();
    const gmt3Offset = 3 * 60 * 60 * 1000;
    const gmt3Date = new Date(now.getTime() + gmt3Offset);
    // Return in YYYY-MM-DD format for database
    return gmt3Date.toISOString().split('T')[0];
  };

  // Check if user has already opened daily case today (SERVER-SIDE CHECK)
  const checkDailyCaseStatus = async () => {
    if (!user) {
      setCanClaim(false);
      setIsCheckingStatus(false);
      return;
    }
    
    setIsCheckingStatus(true);
    
    try {
      const todayDate = getTodayGMT3Date();
      console.log(`Checking daily case status for user ${user.id} on date: ${todayDate}`);
      
      // Query the database to check if user has opened case today
      // Using type assertion to work around TypeScript issues until types are regenerated
      const { data: existingOpening, error } = await (supabase as any)
        .from('daily_case_openings')
        .select('id')
        .eq('user_id', user.id)
        .eq('date_gmt3', todayDate)
        .eq('case_type', 'daily_free')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking daily case status:', error);
        setCanClaim(false);
      } else if (existingOpening) {
        console.log('Case already opened today (server confirmed)');
        setCanClaim(false);
      } else {
        console.log('Case can be opened (server confirmed)');
        setCanClaim(true);
      }
    } catch (error) {
      console.error('Error in checkDailyCaseStatus:', error);
      setCanClaim(false);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Initialize and update countdown timer
  useEffect(() => {
    setTimeLeft(calculateTimeUntilReset());
    if (user) {
      checkDailyCaseStatus();
    }
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeUntilReset());
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  // Dynamically check requirements based on profile
  const requirements = [
    {
      text: 'Steam profile MUST be public',
      met: !!profile?.steam_id,
    },
    {
      text: 'You must own Rust on Steam',
      met: !!profile?.owns_rust,
    },
    {
      text: "Put PureSulfur in your Steam name. Or spend more than 50$.",
      met: !!profile?.steam_username && profile.steam_username.toLowerCase().includes('puresulfur'),
    },
    {
      text: 'Level 5+ on Steam',
      met: typeof profile?.steam_level === 'number' && profile.steam_level >= 5,
    },
    {
      text: 'Join our Discord server',
      met: !!profile?.joined_discord,
      hasLink: true
    }
  ];

  const allRequirementsMet = requirements.every(r => r.met);

  // Random item selection based on probability
  const selectRandomItem = (): CrateItem => {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const item of dailyItems) {
      cumulative += item.probability;
      if (random <= cumulative) {
        return item;
      }
    }
    
    // Fallback to last item if something goes wrong
    return dailyItems[dailyItems.length - 1];
  };

  const handleClaimCrate = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to open daily cases',
        variant: 'destructive'
      });
      return;
    }
    if (!allRequirementsMet) {
      toast({
        title: 'Requirements Not Met',
        description: 'You must meet all requirements to open the daily case.',
        variant: 'destructive'
      });
      return;
    }
    if (!canClaim || isOpening) {
      toast({
        title: 'Cannot Open Case',
        description: !canClaim ? 'You have already opened your daily case today' : 'Case is already opening',
        variant: 'destructive'
      });
      return;
    }
    setIsOpening(true);
    setShowCarouselModal(true);
    setAnimationComplete(false);
    try {
      const todayDate = getTodayGMT3Date();
      // Select the won item first
      const selectedItem = selectRandomItem();
      // Record the opening in the database with the actual won item value
      const { error: insertError } = await (supabase as any)
        .from('daily_case_openings')
        .insert({
          user_id: user.id,
          date_gmt3: todayDate,
          case_type: 'daily_free',
          won_item_value: selectedItem.price
        });
      if (insertError) {
        if (insertError.code === '23505') {
          toast({
            title: 'Already Opened',
            description: 'You have already opened your daily case today',
            variant: 'destructive'
          });
          setCanClaim(false);
          setIsOpening(false);
          setShowCarouselModal(false);
          return;
        }
        console.error('Error recording daily case opening:', insertError);
        toast({
          title: 'Error',
          description: 'Failed to open case. Please try again.',
          variant: 'destructive'
        });
        setIsOpening(false);
        setShowCarouselModal(false);
        return;
      }
      setCanClaim(false);
      setWonItem(selectedItem);
      // Animation and modal will handle the rest
    } catch (error) {
      console.error('Unexpected error in handleClaimCrate:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
      setIsOpening(false);
      setShowCarouselModal(false);
    }
  };

  const handleCarouselAnimationComplete = () => {
    setAnimationComplete(true);
    setIsOpening(false);
  };

  const handleClaimItem = async () => {
    if (!wonItem || !user) return;
    try {
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          balance: (profile?.balance || 0) + wonItem.price 
        })
        .eq('id', user.id);
      if (balanceError) {
        console.error('Error updating balance:', balanceError);
        toast({
          title: 'Error',
          description: 'Failed to update balance. Please try again.',
          variant: 'destructive'
        });
        return;
      }
      await refreshProfile();
      toast({
        title: 'Item Claimed!',
        description: `${wonItem.name} value of $${wonItem.price.toFixed(2)} added to balance`,
      });
      setShowCarouselModal(false);
      setAnimationComplete(false);
      setWonItem(null);
    } catch (error) {
      console.error('Error claiming item:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim item. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Card className="w-full max-w-[550px] mx-auto bg-card/60 border-primary/30 backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-primary text-xl font-bold flex items-center gap-2 mb-0">
            <Gift className="h-6 w-6 text-primary" />
            DAILY FREE CASE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-10">
          {/* Open Daily Case Button */}
          <div className="text-center">
            <Button
              onClick={handleClaimCrate}
              disabled={!canClaim || isOpening || isCheckingStatus || !allRequirementsMet}
              className="flex items-center justify-center mx-auto mb-8 w-full max-w-80 h-14 px-8 py-0 text-xl font-bold tracking-wide bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              title={!allRequirementsMet ? 'You must meet all requirements to open the daily case.' : ''}
            >
              {isCheckingStatus ? 'CHECKING STATUS...' : 
               isOpening ? 'OPENING...' : 
               canClaim ? 'OPEN DAILY CASE' : 'ALREADY CLAIMED TODAY'}
            </Button>
          </div>
          {/* Requirements Section */}
          <div>
            <h3 className="text-primary text-lg font-bold mb-4">REQUIREMENTS</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0 mb-10">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3 text-sm leading-relaxed">
                  {req.met ? (
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className={req.met ? 'text-muted-foreground' : 'text-destructive font-semibold'}>{req.text}</span>
                    {req.hasLink && (
                      <div className="flex items-center mt-1">
                        <span className="text-primary cursor-pointer hover:underline">
                          Discord server
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Today's Items Section */}
          <div>
            <h3 className="text-primary text-lg font-bold mb-2">TODAY'S ITEMS</h3>
            <p className="text-muted-foreground text-sm mb-4">
              There are multiple types of daily cases, check back every day to never miss new items!
            </p>
            
            {/* Item Cards - Fixed layout to prevent overflow */}
            <div className="grid grid-cols-5 gap-2 mb-10 px-4 max-[600px]:grid-cols-2 max-[600px]:gap-4">
              {dailyItems.map((item) => (
                <article 
                  key={item.id} 
                  className="w-full max-w-[85px] mx-auto h-[280px] p-3 bg-[#131313] border-2 border-primary rounded-lg flex flex-col justify-between items-center text-center transition-all duration-200"
                >
                  {/* Item Image - Fixed height container */}
                  <div className="flex-shrink-0 h-[90px] w-full flex items-center justify-center">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="max-h-[90px] max-w-full object-contain drop-shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  {/* Rarity Badge - Fixed height */}
                  <div className="mt-1 h-6 flex items-center justify-center">
                    <Badge 
                      className={`text-xs font-bold bg-gradient-to-r ${item.rarityColor} text-white border-0`}
                    >
                      {item.rarity}
                    </Badge>
                  </div>
                  
                  {/* Item Name - Fixed height container */}
                  <div className="h-[42px] flex items-center justify-center px-1">
                    <h4 className="text-foreground text-[0.85rem] font-medium leading-tight text-center">
                      {item.name}
                    </h4>
                  </div>
                  
                  {/* Price Section - Fixed height */}
                  <div className="w-full h-8 pt-2 border-t border-white/[0.06] flex items-center justify-center gap-1 text-[0.9rem] font-bold">
                    <img 
                      src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                      alt="Currency" 
                      className="h-4 w-4 flex-shrink-0" 
                    />
                    <span className="text-primary">
                      {item.price.toFixed(2)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Footer with Timer */}
          <div className="flex items-center justify-center pt-4 border-t border-border">
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Next daily case items unlock in...</span>
              <time className="flex items-center gap-1 text-primary font-mono">
                <Clock className="h-4 w-4" />
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </time>
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Carousel Animation Modal */}
      {showCarouselModal && wonItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-card rounded-lg shadow-lg p-6 w-[480px] max-w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Opening Daily Case...</h2>
            <DailyCaseCarousel
              items={dailyItems as CarouselCrateItem[]}
              winningItem={wonItem as CarouselCrateItem}
              isAnimating={!animationComplete}
              onAnimationComplete={handleCarouselAnimationComplete}
            />
            {animationComplete && (
              <>
                <div className="mt-6 text-center">
                  <div className="text-lg font-bold text-primary mb-2">You won:</div>
                  <div className="flex flex-col items-center">
                    <img src={wonItem.image} alt={wonItem.name} className="w-20 h-20 object-contain mb-2" />
                    <div className="font-bold text-xl text-foreground">{wonItem.name}</div>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-1 rounded bg-gradient-to-r ${wonItem.rarityColor} text-white text-xs font-bold`}>{wonItem.rarity}</span>
                    </div>
                    <div className="flex items-center justify-center text-primary text-lg font-medium mt-2">
                      <img src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" alt="Currency" className="h-5 w-5 mr-1" />
                      {wonItem.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleClaimItem}
                  className="mt-6 w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold py-3 rounded-lg text-lg shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Claim Item
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
