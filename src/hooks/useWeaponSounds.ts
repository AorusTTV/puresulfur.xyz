import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeaponSoundCache {
  [key: string]: string; // base64 audio data
}

export const useWeaponSounds = () => {
  const [soundCache, setSoundCache] = useState<WeaponSoundCache>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWeaponSound = useCallback(async (weaponType: string): Promise<string | null> => {
    // Check cache first
    if (soundCache[weaponType]) {
      return soundCache[weaponType];
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weapon-sounds', {
        body: { weaponType }
      });

      if (error) throw error;

      const audioContent = data.audioContent;
      
      // Cache the sound
      setSoundCache(prev => ({
        ...prev,
        [weaponType]: audioContent
      }));

      return audioContent;
    } catch (error) {
      console.error('Error generating weapon sound:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [soundCache]);

  const playWeaponSound = useCallback(async (weaponType: string) => {
    try {
      const audioData = await generateWeaponSound(weaponType);
      if (!audioData) return;

      // Convert base64 to audio and play
      const audioBlob = new Blob([
        Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
      ], { type: 'audio/mpeg' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Clean up URL after playing
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });
      
      await audio.play();
    } catch (error) {
      console.error('Error playing weapon sound:', error);
    }
  }, [generateWeaponSound]);

  return {
    playWeaponSound,
    isGenerating,
    soundCache
  };
};