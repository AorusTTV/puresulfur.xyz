import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Check, X } from 'lucide-react';

interface ImageCropperProps {
  imageFile: File;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageFile,
  isOpen,
  onClose,
  onCropComplete
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      setImageLoaded(false);
      setPosition({ x: 0, y: 0 });
      setScale(1);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handleImageLoad = useCallback(() => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    const containerSize = 192; // 48 * 4 = 192px (w-48 h-48)
    
    // Get natural dimensions
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    
    // Calculate initial scale to fit the image within the container
    const scaleToFit = Math.min(
      containerSize / naturalWidth,
      containerSize / naturalHeight
    );
    
    // Set initial scale to show full image, but ensure it's at least 0.5
    const initialScale = Math.max(scaleToFit, 0.5);
    setScale(initialScale);
    setImageLoaded(true);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || !imageRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const containerSize = 192;
    
    // Calculate new position based on mouse movement
    const newX = e.clientX - rect.left - containerSize / 2;
    const newY = e.clientY - rect.top - containerSize / 2;
    
    // Apply constraints to prevent the image from being dragged too far
    const scaledWidth = imageDimensions.width * scale;
    const scaledHeight = imageDimensions.height * scale;
    
    const maxX = Math.max(0, (scaledWidth - containerSize) / 2);
    const maxY = Math.max(0, (scaledHeight - containerSize) / 2);
    
    const constrainedX = Math.min(maxX, Math.max(-maxX, newX));
    const constrainedY = Math.min(maxY, Math.max(-maxY, newY));
    
    setPosition({ x: constrainedX, y: constrainedY });
  }, [isDragging, scale, imageDimensions]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    setScale(newScale);
    
    // Adjust position to keep image centered when scaling
    if (imageDimensions.width && imageDimensions.height) {
      const containerSize = 192;
      const scaledWidth = imageDimensions.width * newScale;
      const scaledHeight = imageDimensions.height * newScale;
      
      const maxX = Math.max(0, (scaledWidth - containerSize) / 2);
      const maxY = Math.max(0, (scaledHeight - containerSize) / 2);
      
      setPosition(prev => ({
        x: Math.min(maxX, Math.max(-maxX, prev.x)),
        y: Math.min(maxY, Math.max(-maxY, prev.y))
      }));
    }
  };

  const cropImage = useCallback(async () => {
    if (!imageRef.current || !containerRef.current || !imageLoaded) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to desired output size (square)
    const outputSize = 200;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Create a new image to load our file
    const img = new Image();
    img.onload = () => {
      // Calculate the crop area based on the current view
      const containerSize = 192;
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Calculate the source crop area on the original image
      const cropSize = containerSize / scale;
      const sourceX = (img.width - cropSize) / 2 - position.x / scale;
      const sourceY = (img.height - cropSize) / 2 - position.y / scale;
      
      // Ensure crop area is within image bounds
      const finalSourceX = Math.max(0, Math.min(img.width - cropSize, sourceX));
      const finalSourceY = Math.max(0, Math.min(img.height - cropSize, sourceY));
      const finalCropSize = Math.min(cropSize, img.width - finalSourceX, img.height - finalSourceY);
      
      // Draw the cropped image
      ctx.drawImage(
        img,
        finalSourceX,
        finalSourceY,
        finalCropSize,
        finalCropSize,
        0,
        0,
        outputSize,
        outputSize
      );

      // Convert canvas to blob and create file
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], imageFile.name, {
            type: imageFile.type,
            lastModified: Date.now()
          });
          onCropComplete(croppedFile);
        }
      }, imageFile.type, 0.9);
    };
    
    img.src = imageUrl;
  }, [imageUrl, position, scale, imageFile, onCropComplete, imageLoaded]);

  React.useEffect(() => {
    if (isDragging) {
      const handleDocumentMouseMove = (e: MouseEvent) => {
        if (!containerRef.current || !imageRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const containerSize = 192;
        
        const newX = e.clientX - rect.left - containerSize / 2;
        const newY = e.clientY - rect.top - containerSize / 2;
        
        const scaledWidth = imageDimensions.width * scale;
        const scaledHeight = imageDimensions.height * scale;
        
        const maxX = Math.max(0, (scaledWidth - containerSize) / 2);
        const maxY = Math.max(0, (scaledHeight - containerSize) / 2);
        
        const constrainedX = Math.min(maxX, Math.max(-maxX, newX));
        const constrainedY = Math.min(maxY, Math.max(-maxY, newY));
        
        setPosition({ x: constrainedX, y: constrainedY });
      };

      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, scale, imageDimensions, handleMouseUp]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Profile Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div
            ref={containerRef}
            className="relative w-48 h-48 mx-auto border-2 border-dashed border-primary rounded-full overflow-hidden bg-muted cursor-move"
            onMouseDown={handleMouseDown}
          >
            {imageUrl && (
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop preview"
                className="absolute inset-0 object-cover select-none pointer-events-none"
                style={{
                  width: `${imageDimensions.width * scale}px`,
                  height: `${imageDimensions.height * scale}px`,
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  transformOrigin: 'center',
                  left: '50%',
                  top: '50%',
                  marginLeft: `${-(imageDimensions.width * scale) / 2}px`,
                  marginTop: `${-(imageDimensions.height * scale) / 2}px`
                }}
                onLoad={handleImageLoad}
                draggable={false}
              />
            )}
            <div className="absolute inset-0 pointer-events-none border-2 border-primary rounded-full"></div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.1"
              value={scale}
              onChange={handleScaleChange}
              className="w-full"
              disabled={!imageLoaded}
            />
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            {imageLoaded ? 'Drag the image to position it within the circle' : 'Loading image...'}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={cropImage} disabled={!imageLoaded}>
            <Check className="h-4 w-4 mr-2" />
            Crop Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
