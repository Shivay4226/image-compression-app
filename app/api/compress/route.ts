import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS = ['png', 'jpg', 'jpeg', 'webp', 'avif'];

interface CompressionOptions {
  format: 'png' | 'jpg' | 'jpeg' | 'webp' | 'avif';
  quality?: number;
  lossless?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = (formData.get('file') ?? formData.get('image')) as File | null;
    const formatStr = formData.get('format') as string;
    const quality = parseInt(formData.get('quality') as string) || 80;
    const lossless = formData.get('lossless') === 'true';

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate format
    const format = formatStr.toLowerCase() as CompressionOptions['format'];
    if (!SUPPORTED_FORMATS.includes(format)) {
      return NextResponse.json(
        { error: `Unsupported format: ${format}` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);

    // Process image based on format
    let processed = sharp(imageBuffer);

    // Apply compression based on format
    switch (format) {
      case 'jpg':
      case 'jpeg':
        processed = processed.jpeg({
          quality: Math.max(10, Math.min(100, quality)),
          progressive: true,
          mozjpeg: true,
        });
        break;
      case 'png':
        processed = processed.png({
          compressionLevel: lossless ? 9 : 7,
          progressive: true,
        });
        break;
      case 'webp':
        processed = processed.webp({
          quality: Math.max(10, Math.min(100, quality)),
          alphaQuality: 100,
        });
        break;
      case 'avif':
        processed = processed.avif({
          quality: Math.max(10, Math.min(100, quality)),
          effort: 4,
        });
        break;
    }

    const compressedBuffer = await processed.toBuffer();
    const base64 = compressedBuffer.toString('base64');
    const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : `image/${format}`;

    // Return compressed image as base64 with metadata
    return NextResponse.json({
      success: true,
      data: base64,
      mimeType,
      size: compressedBuffer.length,
      originalSize: imageBuffer.length,
    });
  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
