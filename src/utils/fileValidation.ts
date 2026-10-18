/**
 * Security utility for strict file upload validation to prevent Remote Code Execution (RCE),
 * directory traversal, and malicious script uploads.
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFileName?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'text/csv',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp'
]);

const ALLOWED_EXTENSIONS = new Set([
  'csv',
  'json',
  'png',
  'jpg',
  'jpeg',
  'webp'
]);

const DANGEROUS_EXTENSIONS = new Set([
  'php', 'php3', 'php4', 'php5', 'phtml', 'exe', 'bat', 'cmd', 'sh',
  'js', 'mjs', 'cjs', 'ts', 'jsx', 'tsx', 'py', 'pl', 'cgi', 'jar',
  'war', 'jsp', 'asp', 'aspx', 'htm', 'html', 'svg', 'xhtml', 'vbs'
]);

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB maximum

/**
 * Validates file upload for safe extensions, MIME types, and file size.
 * Prevents arbitrary file uploads and potential remote code execution.
 */
export function validateUploadedFile(
  file: File,
  allowedTypes: 'data' | 'image' | 'all' = 'all'
): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // 1. File Size check
  if (file.size <= 0) {
    return { valid: false, error: 'File is empty.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File exceeds maximum allowed size of 2MB.' };
  }

  // 2. File Name & Extension check
  const originalName = file.name || 'unnamed';
  
  // Path traversal prevention: strip any slashes or directory paths
  const baseName = originalName.replace(/^.*[\\\/]/, '').trim();
  const ext = baseName.split('.').pop()?.toLowerCase() || '';

  if (!ext || DANGEROUS_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Security Violation: Files with extension .${ext} are blocked to prevent code execution.`
    };
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Unsupported file type .${ext}. Only CSV, JSON, PNG, and JPEG files are supported.`
    };
  }

  // Type-specific restrictions
  if (allowedTypes === 'data' && !['csv', 'json'].includes(ext)) {
    return { valid: false, error: 'Only CSV and JSON data files are allowed.' };
  }
  if (allowedTypes === 'image' && !['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    return { valid: false, error: 'Only PNG, JPEG, and WebP image files are allowed.' };
  }

  // 3. MIME type check
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid MIME type (${file.type}). File content rejected.`
    };
  }

  // Sanitize filename to alphanumeric and safe characters
  const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');

  return {
    valid: true,
    sanitizedFileName: safeName
  };
}
