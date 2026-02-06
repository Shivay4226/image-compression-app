'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, X, Grid3x3, List } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CompressedImage {
  id: string;
  originalName: string;
  originalSize: number;
  compressedSize: number;
  compressedBlob: Blob;
  originalFile: File;
  progress: number;
  status: 'processing' | 'completed' | 'error';
  error?: string;
}

interface CompressedGalleryProps {
  images: CompressedImage[];
  onDownload: (image: CompressedImage) => void;
  onRemove: (id: string) => void; // Declare onRemove here
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function calculateSavings(original: number, compressed: number): number {
  if (original === 0) return 0;
  return Math.round(((original - compressed) / original) * 100);
}

export function CompressedGallery({
  images,
  onDownload,
  onRemove,
}: CompressedGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const objectUrlsRef = useRef<Record<string, string>>({});
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);

  if (images.length === 0) return null;

  const completedImages = images.filter((image) => image.status === 'completed');
  const selectedIndex = selectedId
    ? completedImages.findIndex((image) => image.id === selectedId)
    : -1;
  const selectedImage = selectedIndex >= 0 ? completedImages[selectedIndex] : null;

  const downloadAll = () => {
    for (const image of completedImages) {
      onDownload(image);
    }
  };

  useEffect(() => {
    const prev = objectUrlsRef.current;
    const next: Record<string, string> = { ...prev };
    const ids = new Set(images.map((img) => img.id));

    for (const id of Object.keys(next)) {
      if (!ids.has(id)) {
        URL.revokeObjectURL(next[id]);
        delete next[id];
      }
    }

    for (const img of images) {
      if (img.status === 'completed' && !next[img.id]) {
        next[img.id] = URL.createObjectURL(img.compressedBlob);
      }
    }

    objectUrlsRef.current = next;
    setObjectUrls(next);
  }, [images]);

  useEffect(() => {
    return () => {
      const urls = objectUrlsRef.current;
      for (const url of Object.values(urls)) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  useEffect(() => {
    setIsPreviewLoaded(false);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedImage) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedId(null);
        return;
      }

      if (completedImages.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        const prevIndex = (selectedIndex - 1 + completedImages.length) % completedImages.length;
        setSelectedId(completedImages[prevIndex]?.id ?? null);
      }

      if (e.key === 'ArrowRight') {
        const nextIndex = (selectedIndex + 1) % completedImages.length;
        setSelectedId(completedImages[nextIndex]?.id ?? null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedImage, selectedIndex, completedImages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Your Compressed Images</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            size="lg"
            className="gap-2 w-full sm:w-auto"
            onClick={downloadAll}
            disabled={completedImages.length === 0}
          >
            <Download className="h-4 w-4" />
            Download All
          </Button>

          <div className="flex flex-wrap gap-2 bg-muted p-1 rounded-lg w-full sm:w-auto justify-center">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const savings = calculateSavings(image.originalSize, image.compressedSize);
            const originalFormatted = formatFileSize(image.originalSize);
            const compressedFormatted = formatFileSize(image.compressedSize);

            return (
              <Card key={image.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                <div
                  className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden flex items-center justify-center cursor-pointer"
                  onClick={() => image.status === 'completed' && setSelectedId(image.id)}
                >
                  {image.status === 'completed' && (
                    <img
                      src={objectUrls[image.id] || "/placeholder.svg"}
                      alt={image.originalName}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {image.status === 'processing' && (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-2">
                          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        </div>
                        <p className="text-xs text-muted-foreground">{image.progress}%</p>
                      </div>
                    </div>
                  )}
                  {image.status === 'error' && (
                    <div className="text-center">
                      <p className="text-sm text-destructive font-medium mb-1">Error</p>
                      <p className="text-xs text-destructive/80">{image.error}</p>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-4 space-y-3 flex flex-col">
                  <div>
                    <p className="text-sm font-medium truncate">{image.originalName}</p>
                  </div>

                  {image.status === 'processing' && (
                    <div className="space-y-2">
                      <Progress value={image.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground text-center">
                        Processing... {image.progress}%
                      </p>
                    </div>
                  )}

                  {image.status === 'completed' && (
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-muted-foreground text-xs">Original</p>
                          <p className="font-semibold text-sm">{originalFormatted}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Compressed</p>
                          <p className="font-semibold text-sm">{compressedFormatted}</p>
                        </div>
                      </div>
                      {savings > 0 && (
                        <div className="text-center p-2 bg-accent/10 rounded-lg text-accent font-semibold">
                          Saved {savings}%
                        </div>
                      )}
                    </div>
                  )}

                  {image.status === 'completed' && (
                    <Button
                      size="sm"
                      className="w-full mt-auto gap-2"
                      onClick={() => onDownload(image)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  )}

                  {image.status !== 'processing' && (
                    <Button
                      size="sm"
                      className="w-full mt-auto gap-2"
                      onClick={() => onRemove(image.id)}
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-3 border rounded-lg divide-y">
          {images.map((image) => {
            const savings = calculateSavings(image.originalSize, image.compressedSize);
            const originalFormatted = formatFileSize(image.originalSize);
            const compressedFormatted = formatFileSize(image.compressedSize);

            return (
              <div key={image.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => image.status === 'completed' && setSelectedId(image.id)}>
                    {image.status === 'completed' && (
                      <img
                        src={objectUrls[image.id] || "/placeholder.svg"}
                        alt={image.originalName}
                        className="h-full w-full object-cover"
                      />
                    )}
                    {image.status === 'processing' && (
                      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    )}
                    {image.status === 'error' && (
                      <X className="h-6 w-6 text-destructive" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{image.originalName}</p>
                    
                    {image.status === 'processing' && (
                      <div className="mt-3 space-y-2">
                        <Progress value={image.progress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">
                          Processing... {image.progress}%
                        </p>
                      </div>
                    )}
                    
                    {image.status === 'completed' && (
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-muted-foreground">Original:</p>
                          <p className="text-sm font-semibold">{originalFormatted}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-muted-foreground">Compressed:</p>
                          <p className="text-sm font-semibold">{compressedFormatted}</p>
                        </div>
                        {savings > 0 && (
                          <div className="px-2 py-1 bg-accent/10 rounded text-xs text-accent font-semibold">
                            Saved {savings}%
                          </div>
                        )}
                      </div>
                    )}
                    
                    {image.status === 'error' && (
                      <p className="text-xs text-destructive mt-1">{image.error}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:ml-4 w-full sm:w-auto">
                    {image.status === 'completed' && (
                      <Button
                        size="sm"
                        className="gap-2 w-full sm:w-auto"
                        onClick={() => onDownload(image)}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    )}

                    {image.status !== 'processing' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 bg-transparent w-full sm:w-auto justify-center"
                        onClick={() => onRemove(image.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedId(null)}
        >
          <div 
            className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background border-b p-3 sm:p-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold truncate">{selectedImage.originalName}</h3>
              <button 
                onClick={() => setSelectedId(null)}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              <div className="relative w-full h-64 sm:h-96 bg-muted rounded-lg overflow-hidden">
                {completedImages.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background"
                      onClick={() => {
                        const prevIndex = (selectedIndex - 1 + completedImages.length) % completedImages.length;
                        setSelectedId(completedImages[prevIndex]?.id ?? null);
                      }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background"
                      onClick={() => {
                        const nextIndex = (selectedIndex + 1) % completedImages.length;
                        setSelectedId(completedImages[nextIndex]?.id ?? null);
                      }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-background/70 px-2 py-1 rounded">
                      {selectedIndex + 1} / {completedImages.length}
                    </div>
                  </>
                )}

                <img
                  src={objectUrls[selectedImage.id] || "/placeholder.svg"}
                  alt={selectedImage.originalName}
                  className={`absolute inset-0 h-full w-full object-contain transition-opacity ${isPreviewLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setIsPreviewLoaded(true)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Original Size</p>
                  <p className="text-xl sm:text-2xl font-bold">{formatFileSize(selectedImage.originalSize)}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Compressed Size</p>
                  <p className="text-xl sm:text-2xl font-bold">{formatFileSize(selectedImage.compressedSize)}</p>
                </div>
              </div>

              {calculateSavings(selectedImage.originalSize, selectedImage.compressedSize) > 0 && (
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Space Saved</p>
                  <p className="text-2xl sm:text-3xl font-bold text-accent">
                    {calculateSavings(selectedImage.originalSize, selectedImage.compressedSize)}%
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="w-full sm:flex-1 gap-2"
                  onClick={() => {
                    onDownload(selectedImage);
                    setSelectedId(null);
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto gap-2 bg-transparent"
                  onClick={() => setSelectedId(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
