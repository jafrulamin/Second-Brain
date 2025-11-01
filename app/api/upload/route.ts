/**
 * POST /api/upload
 * Accepts PDF file uploads, saves to disk, and persists metadata to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { savePdfToDisk } from '@/lib/storage';
import { prisma } from '@/lib/db';
import { MAX_UPLOAD_MB, ALLOWED_MIME } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Only PDF files are allowed. Got: ${file.type}` },
        { status: 400 }
      );
    }

    // Validate file size (convert MB to bytes)
    const maxSizeBytes = MAX_UPLOAD_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_UPLOAD_MB}MB` },
        { status: 400 }
      );
    }

    // Get upload directory from environment (default to ./uploads)
    const uploadDir = process.env.UPLOAD_DIR || './uploads';

    // Save file to disk
    const { savedPath, safeFilename, sizeBytes } = await savePdfToDisk(
      file,
      uploadDir
    );

    // Insert document record into database
    const document = await prisma.document.create({
      data: {
        filename: safeFilename,
        originalPath: savedPath,
        sizeBytes: sizeBytes,
      },
    });

    // Return success response with document metadata
    return NextResponse.json({
      documentId: document.id,
      filename: document.filename,
      sizeBytes: document.sizeBytes,
      originalPath: document.originalPath,
      createdAt: document.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}

