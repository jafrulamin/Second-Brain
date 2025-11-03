/**
 * File storage utilities for handling PDF uploads
 */

import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

/**
 * Ensures the upload directory exists, creating it if necessary
 */
export async function ensureUploadDir(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

/**
 * Sanitizes a filename by:
 * - Converting to lowercase
 * - Replacing spaces and unsafe characters with hyphens
 * - Ensuring .pdf extension
 * - Removing consecutive hyphens
 */
function sanitizeFilename(originalName: string): string {
  // Remove extension temporarily
  const nameWithoutExt = originalName.replace(/\.pdf$/i, '');
  
  // Sanitize: lowercase, replace unsafe chars with hyphens
  let safe = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric with hyphen
    .replace(/-+/g, '-')          // Replace consecutive hyphens with single hyphen
    .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
  
  // Fallback if name becomes empty after sanitization
  if (!safe) {
    safe = 'document-' + Date.now();
  }
  
  // Always ensure .pdf extension
  return safe + '.pdf';
}

/**
 * Saves a PDF file to disk with sanitized filename
 * @returns Object containing saved path, safe filename, and size in bytes
 */
export async function savePdfToDisk(
  file: File,
  dirPath: string
): Promise<{ savedPath: string; safeFilename: string; sizeBytes: number }> {
  // Ensure directory exists
  await ensureUploadDir(dirPath);
  
  // Sanitize the filename
  const safeFilename = sanitizeFilename(file.name);
  
  // Create unique filename by prepending timestamp if file exists
  const timestamp = Date.now();
  const uniqueFilename = `${timestamp}-${safeFilename}`;
  const savedPath = join(dirPath, uniqueFilename);
  
  // Convert Web File to Buffer
  // File.arrayBuffer() returns ArrayBuffer, which we convert to Buffer (Node.js)
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Write to disk
  await writeFile(savedPath, buffer);
  
  return {
    savedPath,
    safeFilename: uniqueFilename,
    sizeBytes: buffer.length,
  };
}

/**
 * Resolve a file path to absolute path from project root
 * @param filePath - Relative or absolute file path
 * @returns Absolute path
 */
export function resolveFilePath(filePath: string): string {
  return resolve(process.cwd(), filePath);
}

