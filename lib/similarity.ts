/**
 * Similarity search utilities
 * Cosine similarity for vector comparisons
 */

/**
 * Compute cosine similarity between two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns Cosine similarity score between -1 and 1 (or 0 if invalid)
 */
export function cosine(a: number[], b: number[]): number {
  // Guard: vectors must have same length
  if (a.length !== b.length) {
    console.warn(`[Similarity] Vector length mismatch: ${a.length} vs ${b.length}`);
    return 0;
  }

  // Guard: empty vectors
  if (a.length === 0) {
    return 0;
  }

  // Compute dot product and norms in a single loop (optimization)
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  // Guard: zero norms
  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Rank items by cosine similarity to a query vector
 * Optimized for performance with large datasets
 * @param query - Query vector
 * @param vectors - Array of items with vectors and metadata
 * @param topK - Number of top results to return
 * @returns Top K items sorted by similarity (highest first)
 */
export function rankByCosine(
  query: number[],
  vectors: {
    id: number;
    vector: number[];
    docId: number;
    chunkIndex: number;
    filename: string;
    text: string;
  }[],
  topK: number
): {
  id: number;
  vector: number[];
  docId: number;
  chunkIndex: number;
  filename: string;
  text: string;
  similarity: number;
}[] {
  if (vectors.length === 0) {
    return [];
  }

  // Pre-compute query norm once (optimization)
  let queryNorm = 0;
  for (let i = 0; i < query.length; i++) {
    queryNorm += query[i] * query[i];
  }
  queryNorm = Math.sqrt(queryNorm);

  // Calculate similarities for all vectors and keep only top K
  // Using a more efficient approach: calculate all, then sort once
  const results: Array<{
    id: number;
    vector: number[];
    docId: number;
    chunkIndex: number;
    filename: string;
    text: string;
    similarity: number;
  }> = [];

  // Process all vectors and calculate similarities
  for (const item of vectors) {
    // Optimized cosine similarity calculation in single loop
    let dotProduct = 0;
    let itemNorm = 0;
    
    for (let j = 0; j < query.length; j++) {
      dotProduct += query[j] * item.vector[j];
      itemNorm += item.vector[j] * item.vector[j];
    }
    itemNorm = Math.sqrt(itemNorm);
    
    const similarity = itemNorm > 0 && queryNorm > 0 
      ? dotProduct / (queryNorm * itemNorm)
      : 0;

    results.push({
      ...item,
      similarity,
    });
  }

  // Sort once and take top K (more efficient than maintaining heap with repeated sorts)
  // For typical use cases (hundreds of vectors, K=5-20), a single sort is faster
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
}

