/**
 * POST /api/query
 * RAG query endpoint: similarity search + LLM answer generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { embedWithOllama } from '@/lib/ollama';
import { rankByCosine } from '@/lib/similarity';
import { buildContext, buildPrompt } from '@/lib/rag';
import { generateWithOllama } from '@/lib/ollama';

// Explicitly use Node.js runtime for file system access
export const runtime = 'nodejs';

// Configuration from environment
const TOP_K = parseInt(process.env.TOP_K || '5', 10);
const MAX_CONTEXT_CHARS = parseInt(process.env.MAX_CONTEXT_CHARS || '3000', 10);
const OLLAMA_LLM_MODEL = process.env.OLLAMA_LLM_MODEL || 'llama3';
// Limit embeddings fetched to prevent memory issues (default: 1000)
const MAX_EMBEDDINGS_SEARCH = parseInt(process.env.MAX_EMBEDDINGS_SEARCH || '1000', 10);

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { question } = body;

    // Validate question
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid question string is required' },
        { status: 400 }
      );
    }

    // Check if there are any chunks in the database
    const chunkCount = await prisma.chunk.count();
    if (chunkCount === 0) {
      return NextResponse.json(
        { error: 'No embedded content yet. Please embed some documents first.' },
        { status: 422 }
      );
    }

    // Create question embedding
    const questionEmbeddings = await embedWithOllama([question]);
    if (questionEmbeddings.length === 0 || questionEmbeddings[0].length === 0) {
      return NextResponse.json(
        { error: 'Failed to create question embedding' },
        { status: 500 }
      );
    }
    const queryVector = questionEmbeddings[0];

    // Fetch embeddings with their chunk and document data
    // Limit to MAX_EMBEDDINGS_SEARCH to prevent memory issues
    // Use most recent embeddings first (they're likely more relevant)
    const embeddings = await prisma.embedding.findMany({
      take: MAX_EMBEDDINGS_SEARCH,
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
      include: {
        chunk: {
          include: {
            document: {
              select: {
                filename: true,
              },
            },
          },
        },
      },
    });

    if (embeddings.length === 0) {
      return NextResponse.json(
        { error: 'No embeddings found in database' },
        { status: 422 }
      );
    }

    // Build array for ranking (only parse vectors when needed)
    // Filter out invalid vectors early to save memory
    const vectorRows = embeddings
      .filter((emb) => {
        const vec = emb.vector as number[];
        return Array.isArray(vec) && vec.length > 0;
      })
      .map((emb) => ({
        id: emb.chunkId,
        vector: emb.vector as number[], // Parse JSON to number[]
        docId: emb.chunk.documentId,
        chunkIndex: emb.chunk.chunkIndex,
        filename: emb.chunk.document.filename,
        text: emb.chunk.text,
      }));

    // Rank by cosine similarity
    const chosen = rankByCosine(queryVector, vectorRows, TOP_K);

    // Build context from chosen chunks
    const { context, sources } = buildContext(
      chosen.map((c) => ({
        filename: c.filename,
        chunkIndex: c.chunkIndex,
        text: c.text,
      })),
      MAX_CONTEXT_CHARS
    );

    if (context.length === 0) {
      return NextResponse.json(
        { error: 'No context could be built from retrieved chunks' },
        { status: 422 }
      );
    }

    // Build prompt
    const prompt = buildPrompt(question, context);

    // Generate answer using Ollama LLM
    // Use a timeout to prevent hanging
    let answer: string;
    try {
      // Set a timeout for LLM generation (90 seconds - matches fetch timeout)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('LLM generation timeout after 90 seconds')), 90000);
      });
      
      answer = await Promise.race([
        generateWithOllama(prompt),
        timeoutPromise,
      ]);
    } catch (error: any) {
      console.error(`[Query] Error generating answer:`, error);
      
      // Handle specific Ollama errors
      if (error.message.includes('Cannot connect to Ollama server')) {
        return NextResponse.json(
          { error: error.message },
          { status: 503 }
        );
      }
      
      if (error.message.includes('not found') || error.message.includes('Pull LLM model')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to generate answer' },
        { status: 500 }
      );
    }

    // Build sources with documentId
    const sourcesWithDocId = sources.map((s) => {
      const matchedChunk = chosen.find(
        (c) => c.filename === s.filename && c.chunkIndex === s.chunkIndex
      );
      return {
        documentId: matchedChunk?.docId || 0,
        filename: s.filename,
        chunkIndex: s.chunkIndex,
      };
    });

    // Return success response
    return NextResponse.json({
      answer: answer.trim(),
      sources: sourcesWithDocId,
      used: {
        k: chosen.length,
        model: OLLAMA_LLM_MODEL,
      },
    });
  } catch (error: any) {
    console.error('[Query] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during query processing' },
      { status: 500 }
    );
  }
}

