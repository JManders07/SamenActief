import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  // Filter out failed images
  const validImages = images.filter(img => !failedImages.includes(img));

  useEffect(() => {
    // Reset state when images change
    setCurrentIndex(0);
    setFailedImages([]);
    setLoadedImages([]);
  }, [images]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = (imageUrl: string) => {
    console.error('Error loading image:', imageUrl);
    setFailedImages(prev => [...prev, imageUrl]);
    
    // Probeer de volgende afbeelding te laden als de huidige mislukt
    if (currentIndex < validImages.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }

    // Log extra informatie voor debugging
    console.log('Failed image details:', {
      url: imageUrl,
      currentIndex,
      totalImages: validImages.length,
      failedImages
    });
  };

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => [...prev, imageUrl]);
  };

  if (validImages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Geen afbeeldingen beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <img
        src={`/api/proxy-image?url=${encodeURIComponent(validImages[currentIndex])}`}
        alt={`Afbeelding ${currentIndex + 1}`}
        className="h-full w-full object-cover"
        onError={() => handleImageError(validImages[currentIndex])}
        onLoad={() => handleImageLoad(validImages[currentIndex])}
        loading="eager"
      />
      
      {validImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
    </div>
  );
}
