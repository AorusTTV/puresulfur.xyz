
import React from 'react';
import { HomeBanner } from '@/components/home/HomeBanner';
import { HeroSection } from '@/components/home/HeroSection';
import { LiveStats } from '@/components/home/LiveStats';
import { DailyFreeCrate } from '@/components/crate/DailyFreeCrate';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
      {/* Banner Section */}
      <HomeBanner />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <HeroSection />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-8">
            <LiveStats />
            <DailyFreeCrate />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
