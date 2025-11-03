#!/bin/bash
# Data Integrity Test Script for Second Brain

echo "=========================================="
echo "  SECOND BRAIN - Data Integrity Check"
echo "=========================================="
echo ""

DB_PATH="/home/shubon/Desktop/Second-Brain/prisma/data/app.db"

echo "1. DOCUMENT COUNT:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) as total_documents FROM Document;"
echo ""

echo "2. CHUNK COUNT:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) as total_chunks FROM Chunk;"
echo ""

echo "3. EMBEDDING COUNT:"
sqlite3 "$DB_PATH" "SELECT COUNT(*) as total_embeddings FROM Embedding;"
echo ""

echo "4. EMBEDDED DOCUMENTS (with chunk counts):"
sqlite3 "$DB_PATH" -header -column << 'SQL'
SELECT 
  d.id,
  d.filename,
  COUNT(DISTINCT c.id) as chunks,
  COUNT(DISTINCT e.id) as embeddings,
  CASE 
    WHEN COUNT(DISTINCT c.id) = COUNT(DISTINCT e.id) THEN '✓ Valid'
    ELSE '✗ Mismatch'
  END as integrity
FROM Document d
LEFT JOIN Chunk c ON c.documentId = d.id
LEFT JOIN Embedding e ON e.chunkId = c.id
GROUP BY d.id, d.filename
HAVING chunks > 0
ORDER BY d.id;
SQL

echo ""
echo "5. INTEGRITY CHECK: Chunks without embeddings (should be 0):"
sqlite3 "$DB_PATH" << 'SQL'
SELECT COUNT(*) as orphaned_chunks
FROM Chunk c
WHERE NOT EXISTS (
  SELECT 1 FROM Embedding e WHERE e.chunkId = c.id
);
SQL

echo ""
echo "6. INTEGRITY CHECK: Embeddings without chunks (should be 0):"
sqlite3 "$DB_PATH" << 'SQL'
SELECT COUNT(*) as orphaned_embeddings
FROM Embedding e
WHERE NOT EXISTS (
  SELECT 1 FROM Chunk c WHERE c.id = e.chunkId
);
SQL

echo ""
echo "7. VECTOR DIMENSIONS (sample from first embedding):"
sqlite3 "$DB_PATH" << 'SQL'
SELECT 
  json_array_length(vector) as dimensions,
  model,
  substr(vector, 1, 150) || '...' as vector_preview
FROM Embedding
LIMIT 1;
SQL

echo ""
echo "8. MULTIPLE EMBEDDINGS PER CHUNK CHECK (should be 0):"
sqlite3 "$DB_PATH" << 'SQL'
SELECT 
  chunkId,
  COUNT(*) as embedding_count
FROM Embedding
GROUP BY chunkId
HAVING COUNT(*) > 1
LIMIT 5;
SQL

echo ""
echo "=========================================="
echo "  Check complete! Review results above."
echo "=========================================="

