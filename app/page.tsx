'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { ImageUploader } from '@/components/image-uploader';
import { CompressionOptions, CompressionSettings } from '@/components/compression-options';
import { CompressedGallery } from '@/components/compressed-gallery';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Zap, ChevronDown } from 'lucide-react';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { Footer } from '@/components/footer';

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
}

export default function Home() {
  const { data: session } = useSession();
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    format: 'webp',
    quality: 80,
    lossless: false,
  });

  const isPro = (session?.user as any)?.isPro;
  const BATCH_LIMIT = isPro ? 1000 : 100;

  const handleImagesSelected = useCallback((images: UploadedImage[]) => {
    if (images.length > BATCH_LIMIT) {
      toast.error(`Limit exceeded: ${images.length} images selected.`, {
        description: `Free plan is limited to ${BATCH_LIMIT} images.`,
        action: {
          label: 'Upgrade',
          onClick: () => window.location.href = '/subscription'
        }
      });
      setUploadedImages(images.slice(0, BATCH_LIMIT));
    } else {
      setUploadedImages(images);
    }
    setCompressedImages([]);
  }, [BATCH_LIMIT]);

  const compressImages = async () => {
    if (uploadedImages.length === 0) return;

    setIsProcessing(true);

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

    for (let i = 0; i < uploadedImages.length; i++) {
      const image = uploadedImages[i];

      try {
        const formData = new FormData();
        formData.append('file', image.file);
        formData.append('format', compressionSettings.format);
        formData.append('quality', compressionSettings.quality.toString());
        formData.append('lossless', compressionSettings.lossless.toString());

        const response = await fetch('/api/compress', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Compression failed');
        }

        const jsonData = await response.json();

        if (!jsonData.success) {
          throw new Error(jsonData.error || 'Compression failed');
        }

        // Convert base64 to blob
        const binaryString = atob(jsonData.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }
        const compressedBlob = new Blob([bytes], { type: jsonData.mimeType });

        setCompressedImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? {
                ...img,
                compressedBlob,
                compressedSize: compressedBlob.size,
                progress: 100,
                status: 'completed',
              }
              : img
          )
        );
      } catch (error) {
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
      }
    }

    setIsProcessing(false);
  };

  const downloadSingle = (image: CompressedImage) => {
    const ext = compressionSettings.format === 'jpg' ? 'jpeg' : compressionSettings.format;
    const filename = image.originalName.replace(/\.[^/.]+$/, `.${ext}`);
    FileSaver.saveAs(image.compressedBlob, filename);
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const ext = compressionSettings.format === 'jpg' ? 'jpeg' : compressionSettings.format;

    for (const image of compressedImages) {
      if (image.status === 'completed') {
        const filename = image.originalName.replace(/\.[^/.]+$/, `.${ext}`);
        zip.file(filename, image.compressedBlob);
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    FileSaver.saveAs(blob, 'compressed-images.zip');
  };

  const handleReset = () => {
    setUploadedImages([]);
    setCompressedImages([]);
  };

  const handleRemove = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
    setCompressedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const totalOriginalSize = compressedImages.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = compressedImages.reduce((sum, img) => sum + img.compressedSize, 0);
  const totalSaved = totalOriginalSize - totalCompressedSize;
  const compressionRate =
    totalOriginalSize > 0 ? Math.round(((totalSaved / totalOriginalSize) * 100 + Number.EPSILON) * 100) / 100 : 0;

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
                  <p className="text-sm font-semibold">Pro Feature Hint</p>
                  <p className="text-xs text-muted-foreground">Priority processing active for Pro members</p>
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
                    {/* Settings Toggle Button */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowSettings(!showSettings)}
                        variant="outline"
                        className="gap-2 bg-transparent"
                        size="lg"
                      >
                        Settings
                        <ChevronDown className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
                      </Button>
                    </div>

                    {/* Compression Options - Collapsible */}
                    {showSettings && (
                      <Card className="p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        <h2 className="text-lg font-semibold mb-4">Compression Settings</h2>
                        <CompressionOptions settings={compressionSettings} onSettingsChange={setCompressionSettings} />
                      </Card>
                    )}

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
                  <h2 className="text-3xl font-bold">Compression Complete!</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Files Compressed</p>
                      <p className="text-2xl font-bold">{compressedImages.length}</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Size Reduction</p>
                      <p className="text-2xl font-bold text-accent">{compressionRate}%</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Original Size</p>
                      <p className="text-2xl font-bold">{(totalOriginalSize / 1024 / 1024).toFixed(2)}MB</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">Compressed Size</p>
                      <p className="text-2xl font-bold">{(totalCompressedSize / 1024 / 1024).toFixed(2)}MB</p>
                    </Card>
                  </div>
                </div>

                {/* Gallery */}
                <CompressedGallery images={compressedImages} onDownload={downloadSingle} onRemove={handleRemove} />

                {/* Download & Reset Buttons */}
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button
                    onClick={downloadAll}
                    size="lg"
                    className="gap-2"
                    disabled={compressedImages.filter((img) => img.status === 'completed').length === 0}
                  >
                    <Zap className="w-5 h-5 fill-white" />
                    Download All as ZIP
                  </Button>
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
