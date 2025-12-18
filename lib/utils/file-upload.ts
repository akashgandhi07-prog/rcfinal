import { supabase } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'text/plain',
]

export interface FileUploadResult {
  success: boolean
  filePath?: string
  error?: string
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  userId: string,
  category: 'personal_statement' | 'cv' | 'grades' | 'other'
): Promise<FileUploadResult> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      }
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'File type not allowed. Please upload PDF, Word document, or image files only.',
      }
    }

    // Sanitize filename
    const sanitizedFileName = sanitizeFileName(file.name)
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`
    
    // Create file path: {user_id}/{category}/{filename}
    const filePath = `${userId}/${category}/${uniqueFileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('student-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: error.message || 'Failed to upload file',
      }
    }

    return {
      success: true,
      filePath: data.path,
    }
  } catch (error) {
    console.error('Error in uploadFile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('student-documents')
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteFile:', error)
    return false
  }
}

/**
 * Get a signed URL for downloading a file
 */
export async function getFileDownloadUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('student-documents')
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Error in getFileDownloadUrl:', error)
    return null
  }
}

/**
 * Get a public URL for a file (if bucket is public)
 */
export function getFilePublicUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('student-documents')
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Sanitize filename to prevent security issues
 */
function sanitizeFileName(fileName: string): string {
  // Remove path components
  const name = fileName.replace(/^.*[\\/]/, '')
  // Remove special characters, keep alphanumeric, dots, dashes, underscores
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file icon based on MIME type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('image')) return '🖼️'
  if (mimeType.includes('text')) return '📋'
  return '📎'
}

