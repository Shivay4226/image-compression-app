'use client';

import React from "react"

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Upload, X, Grid3x3, List, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
}

const SUPPORTED_FORMATS = ['png', 'jpg', 'jpeg', 'webp', 'avif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 4 * 1024 * 1024 * 1024;
const FREE_MAX_IMAGES = 100;
const PRO_MAX_IMAGES = 1000;
const PRO_UPGRADE_SENTINEL = '__PRO_UPGRADE__';

interface ImageUploaderProps {
  onImagesSelected: (images: UploadedImage[]) => void;
  disabled?: boolean;
  onCompress?: () => void;
  isCompressing?: boolean;
}

export function ImageUploader({ onImagesSelected, disabled, onCompress, isCompressing }: ImageUploaderProps) {
  const { data: session } = useSession();
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemoveIds, setPendingRemoveIds] = useState<string[]>([]);
  const [proOpen, setProOpen] = useState(false);
  const [attemptedTotalCount, setAttemptedTotalCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 100;

  const totalPages = Math.ceil(uploadedImages.length / ITEMS_PER_PAGE);

  const paginatedImages = uploadedImages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages > 0 && currentPage === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (uploadedImages.length === 0) setCurrentPage(1);
  }, [uploadedImages.length]);

  const validateFiles = (files: File[]): string | null => {
    if (files.length === 0) return 'No files selected';

    const totalCount = uploadedImages.length + files.length;
    const isPro = (session?.user as any)?.isPro;

    if (!isPro && totalCount > FREE_MAX_IMAGES) {
      setAttemptedTotalCount(totalCount);
      setProOpen(true);
      return PRO_UPGRADE_SENTINEL;
    }

    if (isPro && totalCount > PRO_MAX_IMAGES) {
      return `Maximum ${PRO_MAX_IMAGES} images allowed (current: ${uploadedImages.length})`;
    }

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!SUPPORTED_FORMATS.includes(ext)) {
        return `Unsupported format: ${ext}. Supported: ${SUPPORTED_FORMATS.join(', ')}`;
      }

      if (file.size > MAX_FILE_SIZE) {
        return `File "${file.name}" exceeds 10MB limit`;
      }
    }

    return null;
  };

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);

      const currentTotalBytes = uploadedImages.reduce((sum, img) => sum + img.originalSize, 0);
      let remainingBytes = Math.max(0, MAX_TOTAL_SIZE - currentTotalBytes);
      const acceptedFiles: File[] = [];
      const skippedFiles: File[] = [];

      for (const file of fileArray) {
        if (file.size <= remainingBytes) {
          acceptedFiles.push(file);
          remainingBytes -= file.size;
        } else {
          skippedFiles.push(file);
        }
      }

      if (acceptedFiles.length === 0) {
        setError('Total upload limit is 4GB. Please select fewer/smaller images.');
        return;
      }

      const validationError = validateFiles(acceptedFiles);

      if (validationError) {
        if (validationError !== PRO_UPGRADE_SENTINEL) {
          setError(validationError);
        } else {
          setError('');
        }
        return;
      }

      const newImages: UploadedImage[] = acceptedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        originalSize: file.size,
      }));

      setUploadedImages((prev) => [...prev, ...newImages]);
      onImagesSelected([...uploadedImages, ...newImages]);

      if (skippedFiles.length > 0) {
        setError(`Total upload limit is 4GB. ${skippedFiles.length} file(s) were skipped.`);
      } else {
        setError('');
      }

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [uploadedImages, onImagesSelected]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeImageNow = (id: string) => {
    const newImages = uploadedImages.filter((img) => img.id !== id);
    setUploadedImages(newImages);
    onImagesSelected(newImages);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const openRemoveDialog = (ids: string[]) => {
    if (ids.length === 0) return;
    setPendingRemoveIds(ids);
    setConfirmOpen(true);
  };

  const confirmRemove = () => {
    if (pendingRemoveIds.length === 0) return;
    const toRemove = new Set(pendingRemoveIds);
    const newImages = uploadedImages.filter((img) => !toRemove.has(img.id));
    setUploadedImages(newImages);
    onImagesSelected(newImages);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of pendingRemoveIds) next.delete(id);
      return next;
    });
    setPendingRemoveIds([]);
    setConfirmOpen(false);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = uploadedImages.length > 0 && selectedIds.size === uploadedImages.length;

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (uploadedImages.length === 0) return prev;
      if (allSelected) return new Set();
      return new Set(uploadedImages.map((img) => img.id));
    });
  };

  const removeSelected = () => {
    if (selectedIds.size === 0) return;
    openRemoveDialog(Array.from(selectedIds));
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-6 sm:p-12 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-accent bg-accent/10 scale-105'
            : 'border-muted-foreground/20 hover:border-accent/50 hover:bg-accent/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={SUPPORTED_FORMATS.map((f) => `.${f}`).join(',')}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-accent" />
          </div>
        </div>
        <p className="text-lg font-semibold text-foreground">
          Drag and drop images here
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          or click to browse from your computer
        </p>
        <p className="text-xs text-muted-foreground mt-3 opacity-70">
          PNG, JPG, WebP, AVIF • Max 10MB each • Total up to 4GB • Free up to {FREE_MAX_IMAGES} images (Pro up to {PRO_MAX_IMAGES})
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm font-medium">
              Selected: {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''}
            </p>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center items-stretch gap-2">
              {viewMode === 'list' && (
                <div className="flex flex-col sm:flex-row sm:items-center items-stretch gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4"
                    />
                    Select all
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-transparent w-full sm:w-auto"
                    onClick={removeSelected}
                    disabled={selectedIds.size === 0}
                  >
                    Remove ({selectedIds.size})
                  </Button>
                </div>
              )}

              {onCompress && (
                <Button
                  size="lg"
                  className="gap-2 w-full sm:w-auto"
                  onClick={onCompress}
                  disabled={disabled || isCompressing || uploadedImages.length === 0}
                >
                  <Zap className="h-4 w-4" />
                  {isCompressing ? 'Compressing...' : 'Compress'}
                </Button>
              )}

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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {paginatedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <Card className="overflow-hidden aspect-square">
                    <img
                      src={image.preview || "/placeholder.svg"}
                      alt="Uploaded preview"
                      className="h-full w-full object-cover"
                    />
                  </Card>
                  <button
                    onClick={() => removeImageNow(image.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive rounded-md p-1"
                  >
                    <X className="h-3 w-3 text-destructive-foreground" />
                  </button>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {image.file.name}
                  </p>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-2 border rounded-lg divide-y">
              {paginatedImages.map((image) => (
                <div key={image.id} className="p-3 hover:bg-muted/30 transition-colors flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(image.id)}
                    onChange={() => toggleSelected(image.id)}
                    className="h-4 w-4"
                  />
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image.preview || "/placeholder.svg"}
                      alt="Uploaded preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{image.file.name}</p>
                    <p className="text-xs text-muted-foreground">{(image.originalSize / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={() => removeImageNow(image.id)}
                    className="flex-shrink-0 p-2 hover:bg-destructive/10 rounded-md transition-colors text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground mx-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setPendingRemoveIds([]);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingRemoveIds.length <= 1 ? 'Remove image?' : `Remove ${pendingRemoveIds.length} images?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemoveIds.length <= 1
                ? 'This will remove the image from your selection.'
                : 'This will remove the selected images from your selection.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmRemove}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={proOpen} onOpenChange={setProOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Go Pro</DialogTitle>
            <DialogDescription>
              You tried to select {attemptedTotalCount} images.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="text-sm font-semibold">Free</p>
              <p className="text-sm text-muted-foreground mt-1">Up to {FREE_MAX_IMAGES} images / batch</p>
            </div>
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
              <p className="text-sm font-semibold">Pro</p>
              <p className="text-sm text-muted-foreground mt-1">Up to {PRO_MAX_IMAGES} images / batch</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Unlock Pro</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">Batch compression up to {PRO_MAX_IMAGES} images</p>
              <p className="text-sm text-muted-foreground">Priority processing & future premium features</p>
              <p className="text-sm text-muted-foreground">Built for high-volume workflows</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="bg-transparent" onClick={() => setProOpen(false)}>
              Not now
            </Button>
            <Button asChild>
              <Link href="/subscription?plan=pro">View Pro plans</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
