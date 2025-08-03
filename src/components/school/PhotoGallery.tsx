'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import Image from 'next/image';

interface PhotoGalleryProps {
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    caption?: string;
  }>;
  schoolName: string;
}

export default function PhotoGallery({ images, schoolName }: PhotoGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">No photos available</p>
      </div>
    );
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={images[0].url}
          alt={images[0].alt || `${schoolName} - Photo 1`}
          fill
          className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => openGallery(0)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <ZoomIn className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
        </div>
        {images[0].caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <p className="text-sm">{images[0].caption}</p>
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(1, 5).map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-square rounded-md overflow-hidden bg-gray-100 cursor-pointer group"
              onClick={() => openGallery(index + 1)}
            >
              <Image
                src={image.url}
                alt={image.alt || `${schoolName} - Photo ${index + 2}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
            </div>
          ))}
          
          {/* Show more indicator */}
          {images.length > 5 && (
            <div
              className="relative aspect-square rounded-md overflow-hidden bg-gray-900 cursor-pointer flex items-center justify-center"
              onClick={() => openGallery(5)}
            >
              <div className="text-white text-center">
                <p className="text-lg font-semibold">+{images.length - 5}</p>
                <p className="text-xs">more</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View All Photos Button */}
      {images.length > 1 && (
        <Button
          variant="outline"
          onClick={() => openGallery(0)}
          className="w-full"
        >
          View All Photos ({images.length})
        </Button>
      )}

      {/* Full Screen Gallery Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          <div className="relative w-full h-full bg-black">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white hover:bg-opacity-20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <div className="relative w-full h-full">
              <Image
                src={images[selectedImageIndex].url}
                alt={images[selectedImageIndex].alt || `${schoolName} - Photo ${selectedImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  {images[selectedImageIndex].caption && (
                    <p className="text-sm mb-1">{images[selectedImageIndex].caption}</p>
                  )}
                  <p className="text-xs text-gray-300">
                    {selectedImageIndex + 1} of {images.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-16 left-0 right-0 p-4">
                <div className="flex justify-center space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 ${
                        index === selectedImageIndex ? 'ring-2 ring-white' : ''
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}