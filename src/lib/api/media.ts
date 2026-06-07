import type { NextApiRequest } from 'next'
import formidable from 'formidable'
import { v2 as cloudinary } from 'cloudinary'
import { MediaType } from '@prisma/client'
import { ApiError } from './http'

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const GIF_TYPES = new Set(['image/gif'])
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm'])

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_GIF_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 50 * 1024 * 1024

export type ParsedUpload = {
  file: formidable.File
  postId?: string
}

export function parseMultipartUpload(req: NextApiRequest): Promise<ParsedUpload> {
  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: MAX_VIDEO_SIZE
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(new ApiError(400, 'Invalid upload request', 'INVALID_UPLOAD'))
        return
      }

      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file
      if (!uploadedFile) {
        reject(new ApiError(400, 'Upload file is required in field "file"', 'FILE_REQUIRED'))
        return
      }

      const postIdValue = Array.isArray(fields.postId) ? fields.postId[0] : fields.postId
      resolve({ file: uploadedFile, postId: postIdValue })
    })
  })
}

export function getMediaType(file: formidable.File) {
  const mime = file.mimetype || ''
  const size = Number(file.size || 0)

  if (IMAGE_TYPES.has(mime)) {
    if (size > MAX_IMAGE_SIZE) throw new ApiError(400, 'Image uploads must be 5MB or smaller', 'IMAGE_TOO_LARGE')
    return MediaType.IMAGE
  }

  if (GIF_TYPES.has(mime)) {
    if (size > MAX_GIF_SIZE) throw new ApiError(400, 'GIF uploads must be 10MB or smaller', 'GIF_TOO_LARGE')
    return MediaType.GIF
  }

  if (VIDEO_TYPES.has(mime)) {
    if (size > MAX_VIDEO_SIZE) throw new ApiError(400, 'Video uploads must be 50MB or smaller', 'VIDEO_TOO_LARGE')
    return MediaType.VIDEO
  }

  throw new ApiError(400, 'Unsupported media type', 'UNSUPPORTED_MEDIA_TYPE')
}

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) return false

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  })

  return true
}

export async function uploadToMediaStorage(file: formidable.File, mediaType: MediaType) {
  if (!configureCloudinary()) {
    throw new ApiError(501, 'Media storage is not configured. Set Cloudinary environment variables.', 'MEDIA_STORAGE_NOT_CONFIGURED')
  }

  const resourceType = mediaType === MediaType.VIDEO ? 'video' : 'image'
  const result = await cloudinary.uploader.upload(file.filepath, {
    folder: 'amittech-blog',
    resource_type: resourceType,
    use_filename: true,
    unique_filename: true,
    overwrite: false
  })

  return result.secure_url
}
