/**
 * Home page - displays list of uploaded documents
 * Server component that queries documents from database
 */

import { prisma } from '@/lib/db';
import InlineUpload from '@/components/InlineUpload';
import EmbedButton from '@/components/EmbedButton';

export default async function Page() {
  // Query all documents from database, sorted by most recent first
  const documents = await prisma.document.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h1>Second Brain — Document Library</h1>
        <InlineUpload />
      </div>

      {documents.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '18px', color: '#666' }}>
            No documents uploaded yet.
          </p>
          <p style={{ color: '#999' }}>
            Upload your first PDF to get started.
          </p>
        </div>
      ) : (
        <div>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Total documents: {documents.length}
          </p>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>ID</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Filename</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Size</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Uploaded</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Path</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{doc.id}</td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{doc.filename}</td>
                  <td style={{ padding: '12px' }}>{formatBytes(doc.sizeBytes)}</td>
                  <td style={{ padding: '12px', color: '#666' }}>
                    {formatDate(doc.createdAt)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#999' }}>
                    {doc.originalPath}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <EmbedButton documentId={doc.id} filename={doc.filename} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}