import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const next = () => {
    setCurrentIndex((current) => (current + 1) % images.length);
  };

  const previous = () => {
    setCurrentIndex((current) => (current - 1 + images.length) % images.length);
  };

  // Filter out failed images
  const validImages = images.filter(img => !failedImages.has(img));

  console.log('ImageCarousel images:', images); // Debug logging
  console.log('Failed images:', Array.from(failedImages)); // Debug logging

  if (validImages.length === 0) {
    return (
      <div className="relative h-full w-full bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Geen afbeeldingen beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <img
        src={validImages[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        className="h-full w-full object-cover"
        onError={(e) => {
          console.error('Error loading image:', validImages[currentIndex]); // Debug logging
          setFailedImages(prev => new Set([...prev, validImages[currentIndex]]));
          // Probeer de volgende afbeelding te laden
          if (validImages.length > 1) {
            next();
          }
        }}
      />
      {validImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
            onClick={previous}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
            onClick={next}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {validImages.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
