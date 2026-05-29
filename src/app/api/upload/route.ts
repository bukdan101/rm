import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { checkAuth } from '@/lib/api-auth'
import { v4 as uuidv4 } from 'uuid'

// Allowed MIME types for upload
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

// Supabase Storage bucket names
const BUCKETS: Record<string, string> = {
  ktp: 'kyc-documents',
  selfie: 'kyc-documents',
  document: 'kyc-documents',
  logo: 'dealer-assets',
  listing: 'listing-images',
  default: 'uploads',
}

function getBucket(fileType: string): string {
  return BUCKETS[fileType] || BUCKETS.default
}

function getFilePath(fileType: string, fileName: string): string {
  const ext = fileName.split('.').pop() || 'bin'
  const uniqueName = `${uuidv4()}.${ext}`

  switch (fileType) {
    case 'ktp':
      return `ktp/${uniqueName}`
    case 'selfie':
      return `selfie/${uniqueName}`
    case 'document':
      return `documents/${uniqueName}`
    case 'logo':
      return `logos/${uniqueName}`
    case 'listing':
      return `listings/${uniqueName}`
    default:
      return `misc/${uniqueName}`
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const authResult = await checkAuth(request)
    if (!authResult.authorized) {
      return authResult.response
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const fileType = (formData.get('fileType') as string) || 'default'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate MIME type
    const isDocument = fileType === 'document'
    const allowedTypes = isDocument ? ALLOWED_DOCUMENT_TYPES : ALLOWED_IMAGE_TYPES
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `File type ${file.type} not allowed. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const bucket = getBucket(fileType)
    const filePath = getFilePath(fileType, file.name)

    // Ensure bucket exists (Supabase Storage buckets need to be created beforehand)
    // Upload the file to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // If bucket doesn't exist, try the default bucket
      if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket not found')) {
        const fallbackBucket = BUCKETS.default
        const { data: fallbackData, error: fallbackError } = await supabaseAdmin.storage
          .from(fallbackBucket)
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            upsert: false,
          })

        if (fallbackError) {
          console.error('Fallback upload error:', fallbackError)
          return NextResponse.json(
            { success: false, error: 'Failed to upload file' },
            { status: 500 }
          )
        }

        // Get public URL from fallback bucket
        const { data: urlData } = supabaseAdmin.storage
          .from(fallbackBucket)
          .getPublicUrl(fallbackData.path)

        return NextResponse.json({
          success: true,
          url: urlData.publicUrl,
          path: fallbackData.path,
          bucket: fallbackBucket,
          fileType,
          fileName: file.name,
          fileSize: file.size,
        })
      }

      return NextResponse.json(
        { success: false, error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(uploadData.path)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: uploadData.path,
      bucket,
      fileType,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error during upload' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await checkAuth(request)
    if (!authResult.authorized) {
      return authResult.response
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const bucket = searchParams.get('bucket') || BUCKETS.default

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'File path is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete file' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })
  } catch (error) {
    console.error('Delete upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
