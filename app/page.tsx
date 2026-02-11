'use client';

import React, { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { ImageUploader } from '@/components/image-uploader';
import { CompressionOptions, CompressionSettings } from '@/components/compression-options';
import { CompressedGallery } from '@/components/compressed-gallery';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Zap, Settings } from 'lucide-react';
import * as fflate from 'fflate';
import FileSaver from 'file-saver';
import { Footer } from '@/components/footer';
import imageCompression from 'browser-image-compression';
import pLimit from 'p-limit';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
}

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
  downloadUrl?: string;
}

const DOWNLOAD_ZIP_CHUNK_SIZE = 50; // Optimized for fflate

export default function Home() {
  const { data: session } = useSession();
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    format: 'webp',
    quality: 80,
    lossless: false,
  });

  const isPro = (session?.user as any)?.isPro;
  const BATCH_LIMIT = isPro ? 1000 : 100;

  const formatEta = (seconds: number) => {
    const total = Math.max(0, Math.round(seconds));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatSettingsDisplay = () => {
    const format = compressionSettings.format.toUpperCase();
    const quality = compressionSettings.quality;
    // Browser-image-compression doesn't support "lossless" bool directly in the same way, 
    // but we can simulate high quality.
    return `${format} • ${quality}%`;
  };

  const completedCount = React.useMemo(
    () => compressedImages.reduce((count, img) => count + (img.status === 'completed' ? 1 : 0), 0),
    [compressedImages]
  );

  const handleImagesSelected = useCallback((images: UploadedImage[]) => {
    if (images.length > BATCH_LIMIT) {
      if (isPro) {
        toast.error(`Limit exceeded: ${images.length} images selected.`, {
          description: `Pro plan is limited to ${BATCH_LIMIT} images per batch.`,
        });
      } else {
        toast.error(`Limit exceeded: ${images.length} images selected.`, {
          description: `Free plan is limited to ${BATCH_LIMIT} images.`,
          action: {
            label: 'Upgrade',
            onClick: () => window.location.href = '/subscription'
          }
        });
      }
      setUploadedImages(images.slice(0, BATCH_LIMIT));
    } else {
      setUploadedImages(images);
    }
    setCompressedImages([]);
  }, [BATCH_LIMIT, isPro]);

  const compressImages = useCallback(async () => {
    if (uploadedImages.length === 0) return;

    setIsProcessing(true);
    setEtaSeconds(null);

    // Initialize compressed images state
    const initialCompressed: CompressedImage[] = uploadedImages.map((img) => ({
      id: img.id,
      originalName: img.file.name,
      originalSize: img.originalSize,
      compressedSize: 0,
      compressedBlob: new Blob(),
      originalFile: img.file,
      progress: 0,
      status: 'processing',
    }));

    setCompressedImages(initialCompressed);

    const startMs = performance.now();
    let finishedCount = 0;

    // Concurrency limit: 2-3 is safe for browser
    const limit = pLimit(2);

    const compressOne = async (image: UploadedImage) => {
      setCompressedImages((prev) =>
        prev.map((img) =>
          img.id === image.id && img.status === 'processing'
            ? { ...img, progress: 10 }
            : img
        )
      );

      try {
        const options = {
          maxSizeMB: 1, // Default fallback, but we rely mostly on quality/maxWidth
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: `image/${compressionSettings.format}` as string,
          initialQuality: compressionSettings.quality / 100,
        };

        // Adjust for PNG/lossless if needed (basic mapping)
        if (compressionSettings.format === 'png') {
          // browser-image-compression handles png, but quality might be less effective than JPG/WebP
        }

        const compressedBlob = await imageCompression(image.file, options);

        // Create download URL
        const downloadUrl = URL.createObjectURL(compressedBlob);

        setCompressedImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                ...img,
                compressedBlob,
                compressedSize: compressedBlob.size,
                progress: 100,
                status: 'completed',
                downloadUrl
              }
              : img
          )
        );
      } catch (error) {
        console.error("Compression error:", error);
        setCompressedImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                ...img,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                progress: 0,
              }
              : img
          )
        );
      } finally {
        const t1 = performance.now();
        finishedCount += 1;

        const elapsedMs = t1 - startMs;
        const avgMsPerImage = elapsedMs / Math.max(1, finishedCount);
        const remaining = uploadedImages.length - finishedCount;
        setEtaSeconds(remaining > 0 ? (remaining * avgMsPerImage) / 1000 : 0);
      }
    };

    const tasks = uploadedImages.map(image => limit(() => compressOne(image)));
    await Promise.all(tasks);

    setIsProcessing(false);
    setEtaSeconds(null);
  }, [uploadedImages, compressionSettings]);

  const downloadSingle = (image: CompressedImage) => {
    if (image.downloadUrl) {
      const ext = compressionSettings.format === 'jpg' ? 'jpeg' : compressionSettings.format;
      const filename = image.originalName.replace(/\.[^/.]+$/, `.${ext}`);
      FileSaver.saveAs(image.compressedBlob, filename);
    }
  };

  const downloadAll = async () => {
    const completed = compressedImages.filter((img) => img.status === 'completed');
    if (completed.length === 0) return;

    const ext = compressionSettings.format === 'jpg' ? 'jpeg' : compressionSettings.format;

    // Chunking for huge batches to avoid memory spikes
    const chunkSize = completed.length > DOWNLOAD_ZIP_CHUNK_SIZE ? DOWNLOAD_ZIP_CHUNK_SIZE : completed.length;
    const chunks: CompressedImage[][] = [];
    for (let i = 0; i < completed.length; i += chunkSize) {
      chunks.push(completed.slice(i, i + chunkSize));
    }

    const createZip = (images: CompressedImage[], filename: string) => {
      return new Promise<void>((resolve, reject) => {
        const zipFiles: fflate.AsyncZippable = {};

        // Read all blobs as Uint8Array
        let processed = 0;
        if (images.length === 0) {
          resolve();
          return;
        }

        images.forEach(async (img) => {
          const imgName = img.originalName.replace(/\.[^/.]+$/, `.${ext}`);
          const buf = await img.compressedBlob.arrayBuffer();
          zipFiles[imgName] = new Uint8Array(buf) as unknown as Uint8Array;

          processed++;
          if (processed === images.length) {
            fflate.zip(zipFiles, (err, data) => {
              if (err) {
                reject(err);
                return;
              }
              const blob = new Blob([data as any], { type: 'application/zip' });
              FileSaver.saveAs(blob, filename);
              resolve();
            });
          }
        });
      });
    };

    if (chunks.length === 1) {
      await createZip(chunks[0], 'compressed-images.zip');
      return;
    }

    toast.message('Large batch detected', {
      description: `Downloading in ${chunks.length} ZIP files to keep your browser fast.`,
    });

    let idx = 1;
    for (const chunk of chunks) {
      await createZip(chunk, `compressed-images-part-${idx}.zip`);
      idx += 1;
      // Small delay to prevent UI freeze
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      compressedImages.forEach(img => {
        if (img.downloadUrl) URL.revokeObjectURL(img.downloadUrl);
      });
    };
  }, [compressedImages]);

  // Optimize size calculations to prevent re-renders
  const sizeCalculations = React.useMemo(() => {
    const totalOriginalSize = compressedImages.reduce((sum, img) => sum + img.originalSize, 0);
    const totalCompressedSize = compressedImages.reduce((sum, img) => sum + img.compressedSize, 0);
    const totalSaved = totalOriginalSize - totalCompressedSize;
    const compressionRate = totalOriginalSize > 0 ? Math.round(((totalSaved / totalOriginalSize) * 100 + Number.EPSILON) * 100) / 100 : 0;

    return {
      totalOriginalSize,
      totalCompressedSize,
      compressionRate
    };
  }, [compressedImages]);

  const handleReset = () => {
    // Cleanup URLs before clearing state
    compressedImages.forEach(img => {
      if (img.downloadUrl) URL.revokeObjectURL(img.downloadUrl);
    });
    setUploadedImages([]);
    setCompressedImages([]);
  };

  const handleRemove = (id: string) => {
    const imgToRemove = compressedImages.find(img => img.id === id);
    if (imgToRemove?.downloadUrl) {
      URL.revokeObjectURL(imgToRemove.downloadUrl);
    }
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    setCompressedImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr_220px] gap-8">
          <aside className="hidden xl:block">
            <Card className="sticky top-24 h-[600px] flex items-center justify-center bg-muted/30 border border-dashed">
              <div className="text-center px-4">
                <p className="text-sm font-semibold">Ready for Batch</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {isPro ? 'You can upload up to 1000 images.' : 'Upgrade to Pro for more power.'}
                </p>
                {!isPro && (
                  <Button variant="link" onClick={() => window.location.href = '/subscription'} className="text-xs p-0 h-auto mt-2">Learn more</Button>
                )}
              </div>
            </Card>
          </aside>

          <div>
            <div className="mb-8">
              <Card className="h-24 md:h-28 flex items-center justify-center bg-muted/30 border border-dashed">
                <div className="text-center">
                  <p className="text-sm font-semibold">Client-Side Compression</p>
                  <p className="text-xs text-muted-foreground">Images never leave your device. Privacy first.</p>
                </div>
              </Card>
            </div>

            {compressedImages.length === 0 ? (
              <div className="space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                      <Zap className="w-4 h-4 text-accent" />
                      <span className="text-sm text-accent font-medium">{isPro ? 'Pro Active' : 'Fast & Free'}</span>
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                    Compress Your Images Instantly
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Convert between PNG, JPG, WebP, and AVIF formats. Reduce file size by up to 80% while maintaining quality.
                  </p>
                </div>

                {/* Upload Section */}
                <Card className="p-8">
                  <ImageUploader
                    onImagesSelected={handleImagesSelected}
                    onCompress={compressImages}
                    isCompressing={isProcessing}
                  />
                </Card>

                {uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    {/* Settings Display with Dialog */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">Compression:</span>
                        <span className="text-sm font-semibold">{formatSettingsDisplay()}</span>
                        {uploadedImages.length > 1 && (
                          <span className="text-xs text-muted-foreground">({uploadedImages.length} images)</span>
                        )}
                      </div>

                      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 h-8 px-3">
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Settings</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Compression Settings</DialogTitle>
                          </DialogHeader>
                          <CompressionOptions
                            settings={compressionSettings}
                            onSettingsChange={setCompressionSettings}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Compress Button - Prominent */}
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={compressImages}
                        disabled={isProcessing || uploadedImages.length === 0}
                        size="lg"
                        className="gap-2 min-w-80"
                      >
                        <Zap className="w-5 h-5" />
                        {isProcessing ? 'Compressing...' : `Compress ${uploadedImages.length} Image${uploadedImages.length > 1 ? 's' : ''}`}
                      </Button>
                      <Button variant="outline" onClick={handleReset} size="lg" className="bg-transparent">
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Results Header */}
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">{isProcessing ? 'Compressing...' : 'Compression Complete!'}</h2>
                  {isProcessing && etaSeconds !== null && (
                    <p className="text-sm text-muted-foreground">
                      Estimated time left: {formatEta(etaSeconds)}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 relative overflow-hidden">
                      <p className="text-sm text-muted-foreground mb-1">Files Compressed</p>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold text-accent transition-all duration-300 ease-out ${isProcessing ? 'animate-pulse' : ''}`}>
                          {completedCount}
                        </span>
                        <span className="text-lg text-muted-foreground">/ {compressedImages.length}</span>
                      </div>
                      {isProcessing && (
                        <div className="absolute bottom-0 left-0 h-1 bg-accent/20 animate-pulse"
                          style={{ width: `${compressedImages.length > 0 ? (completedCount / compressedImages.length) * 100 : 0}%` }}>
                        </div>
                      )}
                      {!isProcessing && completedCount === compressedImages.length && compressedImages.length > 0 && (
                        <div className="absolute -top-[-5px] -right-[-5px]">
                          <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                          </span>
                        </div>
                      )}
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Size Reduction</p>
                      <p className="text-2xl font-bold text-accent">{sizeCalculations.compressionRate}%</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Original Size</p>
                      <p className="text-2xl font-bold">{(sizeCalculations.totalOriginalSize / 1024 / 1024).toFixed(2)}MB</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Compressed Size</p>
                      <p className="text-2xl font-bold">{(sizeCalculations.totalCompressedSize / 1024 / 1024).toFixed(2)}MB</p>
                    </Card>
                  </div>
                </div>

                {/* Gallery */}
                <CompressedGallery
                  images={compressedImages}
                  onDownload={downloadSingle}
                  onRemove={handleRemove}
                  showIndividualDownload={true}
                  showModalDownload={true}
                  showHeaderDownloadAll={false}
                  showZipDownload={completedCount >= 2}
                  onDownloadZip={downloadAll}
                />

                {/* Download & Reset Buttons */}
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button variant="outline" onClick={handleReset} size="lg">
                    Compress More Images
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="hidden xl:block">
            <Card className="sticky top-24 h-[600px] flex items-center justify-center bg-muted/30 border border-dashed">
              <div className="text-center px-4">
                <p className="text-sm font-semibold">Pro Benefits</p>
                <ul className="text-xs text-muted-foreground mt-4 space-y-2 text-left list-disc list-inside">
                  <li>1000 images per batch</li>
                  <li>Priority support</li>
                  <li>No ads</li>
                  <li>Custom formats</li>
                </ul>
              </div>
            </Card>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
