
import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, onError, onLoad, src, ...props }, ref) => {
  // Simple Steam avatar URL processing
  const processedSrc = React.useMemo(() => {
    if (!src) return undefined;
    
    // For Steam avatars, ensure HTTPS and use a simpler CORS bypass
    if (src.includes('steamcommunity-a.akamaihd.net') || src.includes('avatars.steamstatic.com')) {
      const httpsUrl = src.replace('http://', 'https://');
      // Use wsrv.nl proxy which is more reliable for Steam avatars
      return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=64&h=64`;
    }
    
    return src;
  }, [src]);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Avatar failed to load:', {
      originalSrc: src,
      processedSrc,
      timestamp: new Date().toISOString()
    });
    
    if (onError) {
      onError(event);
    }
  };

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('Avatar loaded successfully:', {
      originalSrc: src,
      processedSrc,
      timestamp: new Date().toISOString()
    });
    
    if (onLoad) {
      onLoad(event);
    }
  };

  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      src={processedSrc}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
