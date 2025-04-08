"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Edit, Trash2, Plus, X, Search, ImageIcon, Building, Upload } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useGetAllProjects } from "../../hooks/Projects/useGetAllProjects"
import { useCreateProject } from "../../hooks/Projects/useCreateProject"
import { useUpdateProject } from "../../hooks/Projects/useUpdateProject"
import { useDeleteProject } from "../../hooks/Projects/useDeleteProject"
import { type Project, projectTypeTranslations } from "../../types/project"
import styles from "./ProjectsPage.module.css"
import Loading from "../../components/Loading/Loading"

// Project type definitions
export type ProjectType = "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL" | "LAND" | "MIXED_USE"

// Format date to Arabic format
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
  return date.toLocaleDateString("ar-EG", options)
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Form state for create/edit
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [type, setType] = useState<string>("RESIDENTIAL")
  const [numberOfUnits, setNumberOfUnits] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const { execute: fetchProjects, isLoading: isLoadingProjects } = useGetAllProjects()
  const { execute: createProject, isLoading: isCreating } = useCreateProject()
  const { execute: updateProject, isLoading: isUpdating } = useUpdateProject()
  const { execute: deleteProject, isLoading: isDeleting } = useDeleteProject()

  const isLoading = isCreating || isUpdating || isDeleting

  // Fetch projects on component mount
  useEffect(() => {
    loadProjects()
  }, [])

  // Generate preview URLs for selected files
  useEffect(() => {
    const urls: string[] = []
    selectedFiles.forEach((file) => {
      const url = URL.createObjectURL(file)
      urls.push(url)
    })
    setPreviewUrls(urls)

    // Cleanup function to revoke object URLs
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [selectedFiles])

  const loadProjects = async () => {
    try {
      const data = await fetchProjects()
      setProjects(data)
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحميل بيانات المشاريع")
    }
  }

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    // Filter by search query
    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    })
  }, [projects, searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const openCreateModal = () => {
    setSelectedProject(null)
    setName("")
    setLocation("")
    setType("RESIDENTIAL")
    setNumberOfUnits("")
    setSelectedFiles([])
    setExistingImages([])
    setPreviewUrls([])
    setIsCreateModalOpen(true)
  }

  const openEditModal = (project: Project) => {
    setSelectedProject(project)
    setName(project.name)
    setLocation(project.location)
    setType(project.type)
    setNumberOfUnits(project.number_of_units.toString())
    setSelectedFiles([])

    // Parse existing images
    if (project.pics) {
      const imageUrls = project.pics.split(",").filter((url) => url.trim().length > 0)
      setExistingImages(imageUrls)
    } else {
      setExistingImages([])
    }

    setIsEditModalOpen(true)
  }

  const openDeleteModal = (project: Project) => {
    setSelectedProject(project)
    setIsDeleteModalOpen(true)
  }

  const openImageGallery = (project: Project) => {
    setSelectedProject(project)
    setIsImageGalleryOpen(true)
  }

  const closeModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setIsImageGalleryOpen(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...files])
    }
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !location || !type || !numberOfUnits) {
      toast.error("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("location", location)
      formData.append("type", type)
      formData.append("number_of_units", numberOfUnits)

      // Add images for create
      selectedFiles.forEach((file) => {
        formData.append("images", file)
      })

      await createProject(formData)
      toast.success("تم إنشاء المشروع بنجاح")
      closeModals()
      loadProjects()
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إنشاء المشروع")
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProject || !name || !location || !type || !numberOfUnits) {
      toast.error("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("location", location)
      formData.append("type", type)
      formData.append("number_of_units", numberOfUnits)

      // Add existing images as a comma-separated string
      formData.append("pics", existingImages.join(","))

      // Add new images for update
      selectedFiles.forEach((file) => {
        formData.append("newImages", file)
      })

      await updateProject(Number(selectedProject.id), formData)
      toast.success("تم تحديث المشروع بنجاح")
      closeModals()
      loadProjects()
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث المشروع")
    }
  }

  const handleDelete = async () => {
    if (!selectedProject) return

    try {
      await deleteProject(Number(selectedProject.id))
      toast.success("تم حذف المشروع بنجاح")
      closeModals()
      loadProjects()
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حذف المشروع")
    }
  }

  // Get image count from pics string
  const getImageCount = (pics: string) => {
    if (!pics) return 0
    return pics.split(",").filter((pic) => pic.trim().length > 0).length
  }

  // Get image URLs from pics string
  const getImageUrls = (pics: string) => {
    if (!pics) return []
    return pics.split(",").filter((pic) => pic.trim().length > 0)
  }

  return (
    <div className={styles.projectsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>إدارة المشاريع</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="بحث بالاسم أو الموقع..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>
          <button className={styles.addButton} onClick={openCreateModal} disabled={isLoadingProjects}>
            <Plus size={18} />
            <span>إضافة مشروع</span>
          </button>
        </div>
      </div>

      {isLoadingProjects ? (
        <Loading isVisible={true} />
      ) : filteredAndSortedProjects.length === 0 ? (
        <div className={styles.emptyState}>
          {searchQuery ? (
            <p>لا توجد نتائج مطابقة للبحث</p>
          ) : (
            <>
              <p>لا توجد مشاريع حالياً</p>
              <button className={styles.addButton} onClick={openCreateModal}>
                <Plus size={18} />
                <span>إضافة مشروع</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <div className={styles.projectsGrid}>
          {filteredAndSortedProjects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectHeader}>
                <h3 className={styles.projectName}>{project.name}</h3>
                <div className={styles.actions}>
                  <button
                    className={styles.imageButton}
                    onClick={() => openImageGallery(project)}
                    aria-label="عرض الصور"
                    disabled={getImageCount(project.pics) === 0}
                  >
                    <ImageIcon size={18} />
                    <span className={styles.imageCount}>{getImageCount(project.pics)}</span>
                  </button>
                  <button className={styles.editButton} onClick={() => openEditModal(project)} aria-label="تعديل">
                    <Edit size={18} />
                  </button>
                  <button className={styles.deleteButton} onClick={() => openDeleteModal(project)} aria-label="حذف">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.projectDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>الموقع:</span>
                  <span className={styles.detailValue}>{project.location}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>النوع:</span>
                  <span className={styles.detailValue}>{projectTypeTranslations[project.type] || project.type}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>عدد الوحدات:</span>
                  <span className={styles.detailValue}>{project.number_of_units}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>الوحدات المباعة:</span>
                  <span className={styles.detailValue}>{project.number_of_sold_items}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>تاريخ الإنشاء:</span>
                  <span className={styles.detailValue}>{formatDate(project.created_at)}</span>
                </div>
              </div>

              <div className={styles.projectFooter}>
                <a href={`/projects/${project.id}?name=${project.name}`} className={styles.manageButton}>
                  <Building size={16} />
                  <span>إدارة المشروع</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>إضافة مشروع جديد</h2>
              <button className={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">اسم المشروع</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="أدخل اسم المشروع"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="location">الموقع</label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="أدخل موقع المشروع"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="type">نوع المشروع</label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value)} required>
                  {Object.entries(projectTypeTranslations).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="numberOfUnits">عدد الوحدات</label>
                <input
                  type="number"
                  id="numberOfUnits"
                  value={numberOfUnits}
                  onChange={(e) => setNumberOfUnits(e.target.value)}
                  required
                  min="1"
                  placeholder="أدخل عدد الوحدات"
                />
              </div>

              <div className={styles.formGroup}>
                <label>صور المشروع</label>
                <div className={styles.fileUploadContainer}>
                  <label htmlFor="projectImages" className={styles.fileUploadButton}>
                    <Upload size={18} />
                    <span>اختر الصور</span>
                  </label>
                  <input
                    type="file"
                    id="projectImages"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className={styles.fileInput}
                  />
                </div>
              </div>

              {/* Display selected files preview */}
              {selectedFiles.length > 0 && (
                <div className={styles.imagesSection}>
                  <h3>الصور المختارة</h3>
                  <div className={styles.imageGrid}>
                    {previewUrls.map((url, index) => (
                      <div key={index} className={styles.imageContainer}>
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`صورة ${index + 1}`}
                          className={styles.imagePreview}
                        />
                        <button
                          type="button"
                          className={styles.removeImageButton}
                          onClick={() => removeSelectedFile(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={closeModals} disabled={isLoading}>
                  إلغاء
                </button>
                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                  {isCreating ? (
                    <>
                      <Loading isVisible={true} />
                      <span>جاري الإنشاء...</span>
                    </>
                  ) : (
                    <span>إضافة</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && selectedProject && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>تعديل المشروع</h2>
              <button className={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="editName">اسم المشروع</label>
                <input
                  type="text"
                  id="editName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="أدخل اسم المشروع"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="editLocation">الموقع</label>
                <input
                  type="text"
                  id="editLocation"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="أدخل موقع المشروع"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="editType">نوع المشروع</label>
                <select id="editType" value={type} onChange={(e) => setType(e.target.value)} required>
                  {Object.entries(projectTypeTranslations).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="editNumberOfUnits">عدد الوحدات</label>
                <input
                  type="number"
                  id="editNumberOfUnits"
                  value={numberOfUnits}
                  onChange={(e) => setNumberOfUnits(e.target.value)}
                  required
                  min="1"
                  placeholder="أدخل عدد الوحدات"
                />
              </div>

              {/* Display existing images */}
              {existingImages.length > 0 && (
                <div className={styles.imagesSection}>
                  <h3>الصور الحالية</h3>
                  <div className={styles.imageGrid}>
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className={styles.imageContainer}>
                        <img
                          src={`http://localhost:3001${imageUrl}`}
                          alt={`صورة ${index + 1}`}
                          className={styles.imagePreview}
                        />
                        <button
                          type="button"
                          className={styles.removeImageButton}
                          onClick={() => removeExistingImage(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>إضافة صور جديدة</label>
                <div className={styles.fileUploadContainer}>
                  <label htmlFor="editProjectImages" className={styles.fileUploadButton}>
                    <Upload size={18} />
                    <span>اختر الصور</span>
                  </label>
                  <input
                    type="file"
                    id="editProjectImages"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className={styles.fileInput}
                  />
                </div>
              </div>

              {/* Display selected files preview */}
              {selectedFiles.length > 0 && (
                <div className={styles.imagesSection}>
                  <h3>الصور الجديدة</h3>
                  <div className={styles.imageGrid}>
                    {previewUrls.map((url, index) => (
                      <div key={index} className={styles.imageContainer}>
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`صورة ${index + 1}`}
                          className={styles.imagePreview}
                        />
                        <button
                          type="button"
                          className={styles.removeImageButton}
                          onClick={() => removeSelectedFile(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={closeModals} disabled={isLoading}>
                  إلغاء
                </button>
                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                  {isUpdating ? (
                    <>
                      <Loading isVisible={true} />
                      <span>جاري التحديث...</span>
                    </>
                  ) : (
                    <span>تحديث</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {isImageGalleryOpen && selectedProject && (
        <div className={styles.modalOverlay}>
          <div className={styles.galleryModal}>
            <div className={styles.modalHeader}>
              <h2>صور المشروع: {selectedProject.name}</h2>
              <button className={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.galleryContent}>
              {getImageUrls(selectedProject.pics).length > 0 ? (
                <div className={styles.galleryGrid}>
                  {getImageUrls(selectedProject.pics).map((imageUrl, index) => (
                    <div key={index} className={styles.galleryImageContainer}>
                      <img
                        src={`http://localhost:3001${imageUrl}`}
                        alt={`صورة ${index + 1}`}
                        className={styles.galleryImage}
                        onClick={() => window.open(`http://localhost:3001${imageUrl}`, "_blank")}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noImages}>
                  <p>لا توجد صور لهذا المشروع</p>
                </div>
              )}
            </div>

            <div className={styles.galleryFooter}>
              <button className={styles.closeGalleryButton} onClick={closeModals}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedProject && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h2>تأكيد الحذف</h2>
            <p>
              هل أنت متأكد من رغبتك في حذف المشروع "{selectedProject.name}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </p>

            <div className={styles.confirmActions}>
              <button className={styles.cancelButton} onClick={closeModals} disabled={isDeleting}>
                إلغاء
              </button>
              <button className={styles.deleteConfirmButton} onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loading isVisible={true} />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <span>تأكيد الحذف</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsPage
