"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Upload, X, FileVideo } from "lucide-react"
import styles from "../../pages/UnitPage/UnitPage.module.css"

interface MediaUploadProps {
  onMediaChange: (files: File[], previewUrls: string[]) => void
  initialMedia?: string | null // URLs of already uploaded media
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onMediaChange, initialMedia }) => {
  // For storing actual files to be uploaded
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  
  // For previewing files (both existing and new)
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    initialMedia ? initialMedia.split(",").filter((url) => url.trim() !== "") : []
  )
  
  // For tracking which previews are existing URLs vs new file blobs
  const [isExistingUrl, setIsExistingUrl] = useState<boolean[]>(
    initialMedia ? initialMedia.split(",").filter(url => url.trim() !== "").map(() => true) : []
  )
  
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)

      // Validate file types
      const validFiles = newFiles.filter((file) => {
        const fileType = file.type.toLowerCase()
        return fileType.startsWith("image/") || fileType.startsWith("video/")
      })

      if (validFiles.length !== newFiles.length) {
        setError("بعض الملفات غير مدعومة. يرجى تحميل صور أو فيديوهات فقط.")
        return
      } else {
        setError(null)
      }

      // Simulate upload progress
      simulateUploadProgress()

      // Create object URLs for preview
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
      
      // Update state
      setMediaFiles(prevFiles => [...prevFiles, ...validFiles])
      setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls])
      setIsExistingUrl(prev => [...prev, ...newPreviewUrls.map(() => false)])
      
      // Notify parent component
      onMediaChange([...mediaFiles, ...validFiles], [...previewUrls, ...newPreviewUrls])
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const simulateUploadProgress = () => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const removeMedia = (index: number) => {
    // Create copies of our arrays
    const updatedFiles = [...mediaFiles]
    const updatedPreviewUrls = [...previewUrls]
    const updatedIsExisting = [...isExistingUrl]
    
    // If it's a new file (not an existing URL), revoke the blob URL
    if (!updatedIsExisting[index]) {
      URL.revokeObjectURL(updatedPreviewUrls[index])
      
      // Find the file index (it will be offset by the number of existing URLs before it)
      const fileIndex = updatedIsExisting.slice(0, index).filter(isExisting => !isExisting).length
      updatedFiles.splice(fileIndex, 1)
    }
    
    // Remove from all arrays
    updatedPreviewUrls.splice(index, 1)
    updatedIsExisting.splice(index, 1)
    
    // Update state
    setMediaFiles(updatedFiles)
    setPreviewUrls(updatedPreviewUrls)
    setIsExistingUrl(updatedIsExisting)
    
    // Notify parent component
    onMediaChange(updatedFiles, updatedPreviewUrls)
  }

  const isVideoFile = (file: File | string): boolean => {
    if (typeof file === 'string') {
      // Check URL extension for existing files
      return ['.mp4', '.webm', '.mov', '.avi', '.wmv', '.flv'].some(ext => 
        file.toLowerCase().endsWith(ext)
      )
    } else {
      // Check MIME type for new files
      return file.type.startsWith('video/')
    }
  }

  useEffect(() => {
    // Cleanup function to revoke all created object URLs
    return () => {
      previewUrls.forEach((url, index) => {
        if (!isExistingUrl[index]) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [previewUrls, isExistingUrl])

  return (
    <div className={styles.mediaUploadSection}>
      <label className={styles.mediaUploadLabel}>صور ومقاطع فيديو الوحدة</label>

      <input
        type="file"
        ref={fileInputRef}
        className={styles.mediaUploadInput}
        onChange={handleFileChange}
        accept="image/*,video/*"
        multiple
      />

      <button
        type="button"
        className={styles.mediaUploadButton}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Upload size={18} />
        <span>اختر ملفات</span>
      </button>

      {error && <div className={styles.mediaUploadError}>{error}</div>}

      {isUploading && (
        <div className={styles.mediaUploadProgress}>
          <div className={styles.mediaUploadProgressBar} style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}

      {/* Display media previews */}
      {previewUrls.length > 0 && (
        <div>
          <h4 className="mt-4 mb-2">الوسائط:</h4>
          <div className={styles.mediaPreview}>
            {previewUrls.map((url, index) => (
              <div key={`media-${index}`} className={styles.mediaPreviewItem}>
                {isExistingUrl[index] && isVideoFile(url) || 
                  (!isExistingUrl[index] && mediaFiles[isExistingUrl.slice(0, index).filter(e => !e).length].type.startsWith('video/')) ? (
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <FileVideo
                      size={40}
                      style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                    />
                  </div>
                ) : (
                  <img
                    src={'https://amaar.egypt-tech.com' + url}
                    alt={`Media ${index}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      // Fallback if image loading fails
                      e.currentTarget.src = "/placeholder.svg"
                      const iconContainer = document.createElement('div')
                      iconContainer.style.position = "relative"
                      iconContainer.style.width = "100%"
                      iconContainer.style.height = "100%"
                      e.currentTarget.parentNode?.replaceChild(iconContainer, e.currentTarget)
                      
                      const icon = document.createElement('div')
                      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
                      icon.style.position = "absolute"
                      icon.style.top = "50%"
                      icon.style.left = "50%"
                      icon.style.transform = "translate(-50%, -50%)"
                      iconContainer.appendChild(icon)
                    }}
                  />
                )}
                <button
                  className={styles.mediaPreviewRemove}
                  onClick={() => removeMedia(index)}
                  aria-label="إزالة"
                  type="button"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaUpload