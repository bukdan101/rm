'use client'

import { useState, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Image as ImageIcon, 
  Upload, 
  X, 
  Star, 
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PhotoItem {
  id: string
  url: string
  caption?: string
  is_primary: boolean
  file?: File
}

interface ListingStepPhotosProps {
  photos: PhotoItem[]
  onUpdate: (photos: PhotoItem[]) => void
  maxPhotos?: number
}

export function ListingStepPhotos({
  photos,
  onUpdate,
  maxPhotos = 10
}: ListingStepPhotosProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxPhotos - photos.length
    if (remainingSlots <= 0) {
      alert(`Maksimal ${maxPhotos} foto`)
      return
    }

    setUploading(true)
    const newPhotos: PhotoItem[] = []

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue
      }

      // Create preview URL
      const url = URL.createObjectURL(file)
      newPhotos.push({
        id: `temp-${Date.now()}-${i}`,
        url,
        is_primary: photos.length === 0 && i === 0,
        file
      })
    }

    onUpdate([...photos, ...newPhotos])
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const setPrimary = (index: number) => {
    const updated = photos.map((photo, i) => ({
      ...photo,
      is_primary: i === index
    }))
    onUpdate(updated)
  }

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index)
    
    // If we removed the primary photo, make the first one primary
    if (updated.length > 0 && !updated.some(p => p.is_primary)) {
      updated[0].is_primary = true
    }
    
    onUpdate(updated)
    setDeleteIndex(null)
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="w-5 h-5 text-purple-500" />
          Foto Kendaraan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Upload minimal 1 foto, maksimal {maxPhotos} foto
          </p>
          <Badge variant="outline">
            {photos.length}/{maxPhotos} foto
          </Badge>
        </div>

        {/* Upload Area */}
        {photos.length < maxPhotos && (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              dragOver ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400",
              uploading && "opacity-50 pointer-events-none"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span className="text-gray-600">Uploading...</span>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  Klik atau drag foto ke sini
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  PNG, JPG, WEBP hingga 5MB
                </p>
              </>
            )}
          </div>
        )}

        {/* Primary Photo Notice */}
        <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-700">
            <p className="font-medium">Foto Utama</p>
            <p className="mt-0.5">
              Foto pertama akan menjadi foto utama yang ditampilkan di listing. Klik tombol "Utama" untuk mengubah.
            </p>
          </div>
        </div>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 group",
                  photo.is_primary ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200"
                )}
              >
                <img
                  src={photo.url}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!photo.is_primary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPrimary(index)
                      }}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Utama
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteIndex(index)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* Primary Badge */}
                {photo.is_primary && (
                  <div className="absolute top-1 left-1">
                    <Badge className="bg-purple-500 text-white text-[10px]">
                      <Star className="w-3 h-3 mr-1" />
                      Utama
                    </Badge>
                  </div>
                )}

                {/* Photo Number */}
                <div className="absolute bottom-1 right-1">
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {photos.length === 0 && !uploading && (
          <div className="text-center py-4 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Belum ada foto yang diupload</p>
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Foto?</AlertDialogTitle>
              <AlertDialogDescription>
                Foto akan dihapus dari daftar. Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteIndex !== null && removePhoto(deleteIndex)}
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
