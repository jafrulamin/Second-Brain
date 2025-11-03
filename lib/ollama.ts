/**
 * Ollama embedding integration
 * Free, local embeddings using Ollama server
 */

const OLLAMA_BASE = process.env.OLLAMA_BASE || 'http://localhost:11434';
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'all-minilm';

// Batch size for embedding requests (Ollama can handle more, but we'll be conservative)
const BATCH_SIZE = 64;

/**
 * Generate embeddings using local Ollama server
 * @param texts - Array of texts to embed
 * @returns Array of embedding vectors in the same order as input texts
 */
export async function embedWithOllama(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  console.log(`[Ollama] Embedding ${texts.length} texts using model: ${OLLAMA_EMBED_MODEL}`);
  
  const allEmbeddings: number[][] = [];
  
  // Process in batches
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, Math.min(i + BATCH_SIZE, texts.length));
    console.log(`[Ollama] Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} texts)`);
    
    try {
      const response = await fetch(`${OLLAMA_BASE}/api/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_EMBED_MODEL,
          input: batch,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Check for specific error types
        if (response.status === 404 || errorText.includes('model') || errorText.includes('not found')) {
          throw new Error(
            `Model "${OLLAMA_EMBED_MODEL}" not found. ` +
            `Please run: ollama pull ${OLLAMA_EMBED_MODEL}`
          );
        }
        
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.embeddings || !Array.isArray(data.embeddings)) {
        throw new Error('Invalid response from Ollama: missing embeddings array');
      }

      allEmbeddings.push(...data.embeddings);
      
    } catch (error: any) {
      // Handle connection errors
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        throw new Error(
          `Cannot connect to Ollama server at ${OLLAMA_BASE}. ` +
          `Please start the server with: ollama serve`
        );
      }
      
      if (error.cause?.code === 'ECONNREFUSED') {
        throw new Error(
          `Cannot connect to Ollama server at ${OLLAMA_BASE}. ` +
          `Please start the server with: ollama serve`
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  console.log(`[Ollama] Successfully generated ${allEmbeddings.length} embeddings`);
  return allEmbeddings;
}

/**
 * Get the current Ollama model name
 */
export function getOllamaModel(): string {
  return OLLAMA_EMBED_MODEL;
}

/**
 * Get the Ollama base URL
 */
export function getOllamaBase(): string {
  return OLLAMA_BASE;
}

