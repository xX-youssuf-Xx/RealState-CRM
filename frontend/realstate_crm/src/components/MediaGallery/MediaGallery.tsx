"use client"

import React, { useState } from "react"
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react"
import styles from "../../pages/UnitPage/UnitPage.module.css"

interface MediaGalleryProps {
  mediaUrls: string[]
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ mediaUrls }) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null)

  const isVideo = (url: string) => {
    return (
      url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm") || url.toLowerCase().endsWith(".mov")
    )
  }

  const openMedia = (index: number) => {
    setSelectedMediaIndex(index)
  }

  const closeMedia = () => {
    setSelectedMediaIndex(null)
  }

  const navigateMedia = (direction: "prev" | "next") => {
    if (selectedMediaIndex === null || mediaUrls.length <= 1) return

    if (direction === "prev") {
      setSelectedMediaIndex((prev) => (prev === 0 ? mediaUrls.length - 1 : prev! - 1))
    } else {
      setSelectedMediaIndex((prev) => (prev === mediaUrls.length - 1 ? 0 : prev! + 1))
    }
  }

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedMediaIndex === null) return

      if (e.key === "Escape") {
        closeMedia()
      } else if (e.key === "ArrowLeft") {
        navigateMedia("prev")
      } else if (e.key === "ArrowRight") {
        navigateMedia("next")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedMediaIndex])

  if (!mediaUrls || mediaUrls.length === 0) {
    return <p>لا توجد وسائط متاحة</p>
  }

  return (
    <>
      <div className={styles.mediaGallery}>
        {mediaUrls.map((url, index) => (
          <div key={index} className={styles.mediaItem} onClick={() => openMedia(index)}>
            {isVideo(url) ? (
              <>
                <video className={styles.mediaVideo} src={url} preload="metadata">
                  <source src={url} />
                  متصفحك لا يدعم تشغيل الفيديو
                </video>
                <div className={styles.videoIcon}>
                  <Play size={24} />
                </div>
              </>
            ) : (
              <img className={styles.mediaImage} src={ ('https://amaar.egypt-tech.com'+url) || "/placeholder.svg"} alt={`صورة ${index + 1}`} />
            )}
          </div>
        ))}
      </div>

      {selectedMediaIndex !== null && (
        <div className={styles.mediaPreviewOverlay} onClick={closeMedia}>
          <div className={styles.mediaPreviewContent} onClick={(e) => e.stopPropagation()}>
            {isVideo(mediaUrls[selectedMediaIndex]) ? (
              <video className={styles.mediaPreviewVideo} src={mediaUrls[selectedMediaIndex]} controls autoPlay>
                <source src={'https://amaar.egypt-tech.com'+ mediaUrls[selectedMediaIndex]} />
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            ) : (
              <img
                className={styles.mediaPreviewImage}
                src={'https://amaar.egypt-tech.com' + mediaUrls[selectedMediaIndex] || "/placeholder.svg"}
                alt={`صورة ${selectedMediaIndex + 1}`}
              />
            )}

            <button className={styles.mediaPreviewClose} onClick={closeMedia} aria-label="إغلاق">
              <X size={24} />
            </button>

            {mediaUrls.length > 1 && (
              <>
                <button
                  className={`${styles.mediaPreviewNav} ${styles.mediaPreviewPrev}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateMedia("prev")
                  }}
                  aria-label="السابق"
                >
                  <ChevronRight size={24} />
                </button>
                <button
                  className={`${styles.mediaPreviewNav} ${styles.mediaPreviewNext}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateMedia("next")
                  }}
                  aria-label="التالي"
                >
                  <ChevronLeft size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default MediaGallery
