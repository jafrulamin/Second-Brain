/**
 * PDF parsing utilities
 * Wrapper around pdf-parse v1 with proper Next.js compatibility
 */

import { readFile } from 'fs/promises';

/**
 * Extract text from a PDF file
 * @param filePath - Absolute path to the PDF file
 * @returns Object with extracted text and page count
 */
export async function extractTextFromPdf(filePath: string): Promise<{ text: string; pages: number }> {
  try {
    console.log('[PDF] Reading PDF file...');
    const dataBuffer = await readFile(filePath);
    
    console.log('[PDF] Loading pdf-parse module...');
    // pdf-parse v1 has a simple default export
    const pdfParse = (await import('pdf-parse')).default;
    
    console.log('[PDF] Parsing PDF...');
    const data = await pdfParse(dataBuffer);
    
    console.log(`[PDF] Success! Text length: ${data.text.length}, Pages: ${data.numpages}`);
    
    return {
      text: data.text,
      pages: data.numpages,
    };
  } catch (error: any) {
    console.error('[PDF] Error details:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
    });
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

