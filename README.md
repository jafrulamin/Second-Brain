# Second Brain (Local-First AI Knowledge Base)

**Purpose**  
Personal AI-powered knowledge base. Start local, keep the stack minimal, deploy later.

## ✅ Completed Features

### Day 1 - Foundation
- ✅ Repo skeleton with Next.js App Router
- ✅ Environment files configured
- ✅ SQLite via Prisma
- ✅ Health check route at `/api/health`

### Day 2 - PDF Upload & Storage
- ✅ PDF upload functionality (single and multiple files)
- ✅ File validation (PDF only, max 20MB)
- ✅ Sanitized filename storage
- ✅ Document persistence in SQLite
- ✅ Document library with upload UI

### Day 3 - Text Extraction & Embeddings (FREE Local Ollama)
- ✅ PDF text extraction using `pdf-parse`
- ✅ Text chunking with overlap (1500 chars, 200 overlap)
- ✅ **FREE local embeddings** using Ollama (no API costs!)
- ✅ Chunk and Embedding storage in database
- ✅ Embed UI for each document

## Local Setup

### Prerequisites
- Node.js LTS (v18 or higher)
- **Ollama** (for FREE local embeddings)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Ollama (FREE local AI):**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Start Ollama server (in a new terminal)
   ollama serve
   
   # Pull the embedding model (in another terminal)
   ollama pull all-minilm
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   
   The default `.env.local` should have:
   ```
   OLLAMA_BASE=http://localhost:11434
   OLLAMA_EMBED_MODEL=all-minilm
   DATABASE_URL=file:/home/shubon/Desktop/Second-Brain/prisma/data/app.db
   UPLOAD_DIR=./uploads
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Structure
- `/app` — Next.js App Router area
- `/app/api` — server routes (same project, local-first)
- `/data` — SQLite database file (git-ignored)
- `/uploads` — local file uploads (git-ignored)
- `/prisma` — Prisma schema & migrations

## Environment
- Copy `.env.example` to `.env.local` and fill in values locally.
- Never commit secrets.

## Usage

### Uploading Documents
1. Click "**+ Upload PDF**" button on the home page
2. Select one or more PDF files (max 20MB each)
3. Files are uploaded and saved to `./uploads/`
4. Document metadata is stored in the database

### Embedding Documents
1. On the home page, find your uploaded document in the table
2. Click the "**Embed**" button in the Actions column
3. Wait for the embedding process to complete (shows progress)
4. Success message displays: `✓ Embedded` with chunk/embedding counts

### Viewing Data in Prisma Studio
```bash
npx prisma studio
```
This opens a GUI at `http://localhost:5555` where you can view:
- **Document** table - Uploaded PDFs
- **Chunk** table - Text chunks from PDFs
- **Embedding** table - Vector embeddings for each chunk

## Day 3 Testing - FREE Local Embeddings with Ollama

### Prerequisites Check:

**1. Verify Ollama is installed:**
```bash
ollama --version
```

**2. Start Ollama server (if not already running):**
```bash
# In a separate terminal
ollama serve
```

**3. Pull the embedding model:**
```bash
ollama pull all-minilm
```

**4. Test Ollama directly (optional):**
```bash
curl -s http://localhost:11434/api/embed \
  -H 'Content-Type: application/json' \
  -d '{"model":"all-minilm","input":"Hello world"}'
```

Expected: JSON response with `{"embeddings":[[...]]}`

### Test the Full Embedding Pipeline:

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Upload a PDF** (if you haven't already):
   - Go to `http://localhost:3000`
   - Click "+ Upload PDF"
   - Select a PDF file

3. **Trigger embedding:**
   - Find your document in the table
   - Click "**Embed**" button next to it
   - Expected UI: 
     ```
     Embedding... → ✓ Embedded
     18 chunks, 18 embeddings
     ```
   (Numbers vary by document size)

4. **Check server logs:**
   Server console should show:
   ```
   [Embed] Starting embedding process for document X
   [Embed] Found document: filename.pdf
   [Embed] Reading PDF from: /path/to/file
   [Embed] Extracted XXXX characters of text
   [Embed] Created XX chunks
   [Embed] Inserting XX chunks into database...
   [Ollama] Embedding XX texts using model: all-minilm
   [Ollama] Processing batch 1 (XX texts)
   [Ollama] Successfully generated XX embeddings
   [Embed] Generated XX embeddings
   [Embed] ✓ Embedding process complete for document X
   ```

5. **Verify in Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   - Navigate to **Chunk** table - should see text chunks
   - Navigate to **Embedding** table - should see vector embeddings
   - Check `model` column shows "all-minilm"

### Common Issues:

**Error: "Cannot connect to Ollama server"**
```bash
# Solution: Start Ollama
ollama serve
```

**Error: "Model 'all-minilm' not found"**
```bash
# Solution: Pull the model
ollama pull all-minilm
```

**Want to use a different model?**
```bash
# Pull a different model
ollama pull mxbai-embed-large

# Update .env.local
OLLAMA_EMBED_MODEL=mxbai-embed-large

# Restart your dev server
```

## Day 3 - Polish & Error Handling

### Duplicate Prevention
Embedding the same document twice will return a **409 Conflict** error:
```json
{
  "error": "Document already embedded. To refresh later, implement a re-embed mode."
}
```

This prevents duplicate chunks and embeddings from being created accidentally.

### Error Handling & Troubleshooting

The embed endpoint now provides clearer error messages:

**400 Bad Request**
- Missing or invalid `documentId` in request body

**404 Not Found**
- Document doesn't exist
- PDF file path missing or file not found
- Ollama model not found → **Fix:** `ollama pull <model>`

**409 Conflict**
- Document already embedded → **Fix:** Use a different document or implement re-embed mode

**422 Unprocessable Entity**
- No extractable text (scanned PDF) → **Fix:** Use OCR or a text-based PDF

**503 Service Unavailable**
- Ollama server not running → **Fix:** Start with `ollama serve`

**Example Error Response:**
```json
{
  "error": "Cannot connect to Ollama server. Start: `ollama serve`"
}
```

### UI Error Display
The embed button now shows:
- **"Embedding..."** while processing
- **"Done ✓ (X chunks)"** on success
- **Error message** from server on failure (plain text, easy to read)

## API Endpoints

### POST `/api/upload`
Upload a PDF file and store it locally.

**Request:** `multipart/form-data` with `file` field  
**Response:**
```json
{
  "documentId": 1,
  "filename": "1234567890-document.pdf",
  "sizeBytes": 453261,
  "originalPath": "uploads/1234567890-document.pdf",
  "createdAt": "2025-10-31T01:22:17.347Z"
}
```

### POST `/api/embed`
Extract text from a PDF, chunk it, and create embeddings using local Ollama.

**Request:**
```json
{
  "documentId": 1
}
```

**Success Response (200):**
```json
{
  "documentId": 1,
  "chunksCreated": 18,
  "embeddingsCreated": 18,
  "model": "all-minilm"
}
```

**Error Responses:**
- **400**: Invalid or missing `documentId`
- **404**: Document not found, file missing, or model not found
- **409**: Document already embedded (duplicate prevention)
- **422**: No extractable text (scanned PDF)
- **503**: Ollama server not running

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/embed \
  -H "Content-Type: application/json" \
  -d '{"documentId": 1}'
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "ok": true,
  "time": "2025-10-31T01:22:17.183Z"
}
```

## Database Schema

### Document
- `id` - Primary key
- `filename` - Sanitized filename
- `originalPath` - File path on disk
- `sizeBytes` - File size in bytes
- `createdAt` - Upload timestamp

### Chunk
- `id` - Primary key
- `documentId` - Foreign key to Document
- `chunkIndex` - Chunk sequence number (0, 1, 2...)
- `text` - Chunk text content
- `tokenCount` - Approximate token count (character length)
- `createdAt` - Creation timestamp

### Embedding
- `id` - Primary key
- `chunkId` - Foreign key to Chunk
- `vector` - Embedding vector (JSON array of numbers)
- `model` - Model used (e.g., "all-minilm" from Ollama)
- `createdAt` - Creation timestamp

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** SQLite via Prisma
- **PDF Processing:** pdf-parse
- **AI/Embeddings:** Ollama (FREE local embeddings - all-minilm)
- **Language:** TypeScript
- **Runtime:** Node.js

## Why Ollama?
- ✅ **100% FREE** - No API costs, no quotas
- ✅ **Privacy** - All data stays on your machine
- ✅ **Fast** - Local processing, no network latency
- ✅ **Offline** - Works without internet
- ✅ **Flexible** - Easy to swap models

## Day 4 - RAG Q&A with Local LLM (FREE)

### Overview
Ask questions about your documents! The system uses:
- **Similarity Search**: Finds relevant chunks using cosine similarity
- **Local LLM**: Generates answers using Ollama (llama3, mistral, etc.)
- **Source Citations**: Shows which chunks were used

### Prerequisites

**1. Pull an LLM model:**
```bash
# Option 1: Llama 3 (recommended, ~4.7GB)
ollama pull llama3

# Option 2: Mistral (smaller, ~4.1GB)
ollama pull mistral

# Option 3: Any other Ollama model
ollama pull <model-name>
```

**2. Configure environment:**
Update `.env.local`:
```bash
OLLAMA_LLM_MODEL=llama3  # or your chosen model
TOP_K=5                  # Number of chunks to retrieve
MAX_CONTEXT_CHARS=3000   # Max context size for LLM
```

### Usage

**1. Start services:**
```bash
# Terminal 1: Ollama server
ollama serve

# Terminal 2: Your app
npm run dev
```

**2. Ask questions:**
- Go to `http://localhost:3000/ask`
- Or click "Ask Questions →" on the home page
- Type your question and click "Ask"

**3. Example questions:**
- "What is the main idea in my notes?"
- "Summarize the key points from the documents"
- "What did I learn about blockchain?"

### How It Works

1. **Question Embedding**: Your question is converted to a vector
2. **Similarity Search**: Finds top-K most similar chunks (cosine similarity)
3. **Context Building**: Selected chunks are formatted into context
4. **LLM Generation**: Local Ollama LLM generates an answer using the context
5. **Response**: Returns answer + source citations

### Configuration Knobs

**`TOP_K`** (default: 5)
- Number of chunks to retrieve for context
- Higher = more context, but may include irrelevant info
- Lower = more focused, but may miss important details

**`MAX_CONTEXT_CHARS`** (default: 3000)
- Maximum characters in the context sent to LLM
- Prevents context overflow
- Adjust based on your LLM's context window

### Troubleshooting

**Error: "Ollama LLM model not found"**
```bash
# Solution: Pull the model
ollama pull llama3  # or your chosen model

# Verify it's available
ollama list
```

**Error: "Cannot connect to Ollama server"**
```bash
# Solution: Start Ollama
ollama serve
```

**Error: "No embedded content yet"**
- Embed at least one document first using the "Embed" button on the home page

**Slow responses?**
- LLM generation can take 10-30 seconds depending on model size
- Smaller models (mistral) are faster but less accurate
- Larger models (llama3) are slower but more accurate

### API Endpoint

**POST `/api/query`**
```json
{
  "question": "What is the main idea?"
}
```

**Response:**
```json
{
  "answer": "Based on the documents...",
  "sources": [
    {
      "documentId": 1,
      "filename": "document.pdf",
      "chunkIndex": 0
    }
  ],
  "used": {
    "k": 5,
    "model": "llama3"
  }
}
```

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the main idea in my notes?"}'
```

## Next Steps
- Day 5: Polish UI and optional deployment

