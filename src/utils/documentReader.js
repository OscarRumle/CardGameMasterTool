/**
 * Document Reader Utility
 *
 * Reads and processes documents in chunks to avoid token/memory limits.
 * Supports various file formats: TXT, MD, JSON, XML, HTML, etc.
 */

// Configuration for chunked reading
const DEFAULT_CHUNK_SIZE = 1000; // lines per chunk
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB limit

/**
 * Detects file type from file name or content
 */
const detectFileType = (file) => {
  const extension = file.name.split('.').pop().toLowerCase();
  const mimeType = file.type;

  const typeMap = {
    'txt': 'text',
    'md': 'markdown',
    'markdown': 'markdown',
    'json': 'json',
    'xml': 'xml',
    'html': 'html',
    'htm': 'html',
    'csv': 'csv',
    'log': 'log',
    'yaml': 'yaml',
    'yml': 'yaml'
  };

  return typeMap[extension] || 'text';
};

/**
 * Reads a file in chunks to handle large documents
 * @param {File} file - The file to read
 * @param {Object} options - Reading options
 * @param {number} options.chunkSize - Lines per chunk (default: 1000)
 * @param {Function} options.onChunk - Callback for each chunk (optional)
 * @param {boolean} options.parseJSON - Auto-parse JSON files (default: true)
 * @param {number} options.maxChunks - Maximum number of chunks to read (optional)
 * @returns {Promise<Object>} Document metadata and content
 */
export const readDocument = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      chunkSize = DEFAULT_CHUNK_SIZE,
      onChunk = null,
      parseJSON = true,
      maxChunks = null
    } = options;

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return reject(new Error(`File too large. Maximum size: ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`));
    }

    const reader = new FileReader();
    const fileType = detectFileType(file);

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const lines = content.split('\n');
        const totalLines = lines.length;
        const totalChunks = Math.ceil(totalLines / chunkSize);
        const chunksToRead = maxChunks ? Math.min(totalChunks, maxChunks) : totalChunks;

        // Store chunks
        const chunks = [];

        // Process in chunks
        for (let i = 0; i < chunksToRead; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, totalLines);
          const chunkLines = lines.slice(start, end);
          const chunkContent = chunkLines.join('\n');

          const chunk = {
            index: i,
            lines: chunkLines,
            content: chunkContent,
            lineStart: start + 1,
            lineEnd: end,
            size: chunkContent.length
          };

          chunks.push(chunk);

          // Call chunk callback if provided
          if (onChunk && typeof onChunk === 'function') {
            onChunk(chunk, i, chunksToRead);
          }
        }

        // Parse JSON if requested and applicable
        let parsedData = null;
        if (fileType === 'json' && parseJSON) {
          try {
            parsedData = JSON.parse(content);
          } catch (e) {
            console.warn('Failed to parse JSON:', e.message);
          }
        }

        // Return structured result
        const result = {
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: fileType,
            mimeType: file.type,
            totalLines: totalLines,
            totalChunks: totalChunks,
            chunksRead: chunksToRead,
            chunkSize: chunkSize,
            lastModified: new Date(file.lastModified)
          },
          chunks: chunks,
          fullContent: content,
          parsedData: parsedData,
          preview: lines.slice(0, Math.min(100, totalLines)).join('\n')
        };

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Reads a specific chunk from a document
 * @param {File} file - The file to read
 * @param {number} chunkIndex - The chunk index to read
 * @param {number} chunkSize - Lines per chunk
 * @returns {Promise<Object>} Chunk data
 */
export const readDocumentChunk = (file, chunkIndex, chunkSize = DEFAULT_CHUNK_SIZE) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const lines = content.split('\n');
        const totalLines = lines.length;
        const totalChunks = Math.ceil(totalLines / chunkSize);

        if (chunkIndex >= totalChunks) {
          return reject(new Error(`Chunk index ${chunkIndex} out of range (max: ${totalChunks - 1})`));
        }

        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, totalLines);
        const chunkLines = lines.slice(start, end);
        const chunkContent = chunkLines.join('\n');

        resolve({
          index: chunkIndex,
          lines: chunkLines,
          content: chunkContent,
          lineStart: start + 1,
          lineEnd: end,
          size: chunkContent.length,
          isLastChunk: chunkIndex === totalChunks - 1
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file chunk'));
    };

    reader.readAsText(file);
  });
};

/**
 * Searches for text within a document (chunked search)
 * @param {File} file - The file to search
 * @param {string} searchTerm - Term to search for
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of matches with line numbers
 */
export const searchInDocument = (file, searchTerm, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      caseSensitive = false,
      maxResults = 100
    } = options;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const lines = content.split('\n');
        const matches = [];

        const searchPattern = caseSensitive
          ? searchTerm
          : searchTerm.toLowerCase();

        for (let i = 0; i < lines.length && matches.length < maxResults; i++) {
          const line = lines[i];
          const searchLine = caseSensitive ? line : line.toLowerCase();

          if (searchLine.includes(searchPattern)) {
            matches.push({
              lineNumber: i + 1,
              content: line,
              index: searchLine.indexOf(searchPattern)
            });
          }
        }

        resolve({
          searchTerm,
          matches,
          totalMatches: matches.length,
          truncated: matches.length >= maxResults
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to search file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Gets document statistics
 * @param {File} file - The file to analyze
 * @returns {Promise<Object>} Document statistics
 */
export const getDocumentStats = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const lines = content.split('\n');
        const words = content.split(/\s+/).filter(w => w.length > 0);
        const characters = content.length;
        const nonWhitespace = content.replace(/\s/g, '').length;

        // Calculate average line length
        const totalLineLength = lines.reduce((sum, line) => sum + line.length, 0);
        const avgLineLength = totalLineLength / lines.length;

        resolve({
          lines: lines.length,
          words: words.length,
          characters: characters,
          nonWhitespace: nonWhitespace,
          avgLineLength: Math.round(avgLineLength),
          fileSize: file.size,
          fileName: file.name
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to analyze file'));
    };

    reader.readAsText(file);
  });
};

export default readDocument;
