// ProjectsPage.tsx

"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
// REMOVED: ImageIcon, Upload
import { Edit, Trash2, Plus, X, Search, Building, Grid, List } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGetAllProjects } from "../../hooks/Projects/useGetAllProjects";
import { useCreateProject } from "../../hooks/Projects/useCreateProject";
import { useUpdateProject } from "../../hooks/Projects/useUpdateProject";
import { useDeleteProject } from "../../hooks/Projects/useDeleteProject";
// Ensure Project interface is imported from the updated types file
import { type Project, projectTypeTranslations } from "../../types/project";
import styles from "./ProjectsPage.module.css";
import Loading from "../../components/Loading/Loading";

// Project type definitions (can be removed if imported from types file)
// export type ProjectType = "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL" | "LAND" | "MIXED_USE";

// Format date to Arabic format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("ar-EG", options);
};

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // REMOVED: isImageGalleryOpen state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  // REMOVED: apiUrlBase (unless needed elsewhere)

  // Form state for create/edit
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<string>("RESIDENTIAL");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [benefits, setBenefits] = useState(""); // ADDED: benefits state
  // REMOVED: selectedFiles, existingImages, previewUrls states

  const { execute: fetchProjects, isLoading: isLoadingProjects } = useGetAllProjects();
  const { execute: createProject, isLoading: isCreating } = useCreateProject();
  const { execute: updateProject, isLoading: isUpdating } = useUpdateProject();
  const { execute: deleteProject, isLoading: isDeleting } = useDeleteProject();

  const isLoading = isCreating || isUpdating || isDeleting;

  // Fetch projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // REMOVED: useEffect for previewUrls

  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحميل بيانات المشاريع");
    }
  };

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    const filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [projects, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const openCreateModal = () => {
    setSelectedProject(null);
    setName("");
    setLocation("");
    setType("RESIDENTIAL");
    setNumberOfUnits("");
    setBenefits(""); // ADDED: Reset benefits
    // REMOVED: Reset image states
    setIsCreateModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setName(project.name);
    setLocation(project.location);
    setType(project.type);
    setNumberOfUnits(project.number_of_units.toString());
    setBenefits(project.benefits || ""); // ADDED: Set benefits, handle null/undefined
    // REMOVED: Set/Parse image states
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  // REMOVED: openImageGallery function

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    // REMOVED: setIsImageGalleryOpen(false)
  };

  // REMOVED: handleFileChange, removeSelectedFile, removeExistingImage functions

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !location || !type || !numberOfUnits) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      // Still using FormData as hooks likely expect it, but only append relevant fields
      const formData = new FormData();
      formData.append("name", name);
      formData.append("location", location);
      formData.append("type", type);
      formData.append("number_of_units", numberOfUnits);
      if (benefits) { // Only append if benefits has a value
        formData.append("benefits", benefits);
      }
      // REMOVED: Appending images

      await createProject(formData);
      toast.success("تم إنشاء المشروع بنجاح");
      closeModals();
      loadProjects();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إنشاء المشروع");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject || !name || !location || !type || !numberOfUnits) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      // Still using FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("location", location);
      formData.append("type", type);
      formData.append("number_of_units", numberOfUnits);
      if (benefits) { // Only append if benefits has a value
          formData.append("benefits", benefits);
      } else {
          // Explicitly send empty string if you want to clear it
          // Or don't send if backend handles missing field as no-change
          formData.append("benefits", ""); // Adjust based on backend needs
      }
      // REMOVED: Appending pics and newImages

      await updateProject(Number(selectedProject.id), formData);
      toast.success("تم تحديث المشروع بنجاح");
      closeModals();
      loadProjects();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث المشروع");
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    try {
      await deleteProject(Number(selectedProject.id));
      toast.success("تم حذف المشروع بنجاح");
      closeModals();
      loadProjects();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حذف المشروع");
    }
  };

  // REMOVED: getImageCount, getImageUrls functions

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
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === "cards" ? styles.activeView : ""}`}
              onClick={() => setViewMode("cards")}
              aria-label="عرض البطاقات"
            >
              <Grid size={18} />
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === "list" ? styles.activeView : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="عرض القائمة"
            >
              <List size={18} />
            </button>
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
      ) : viewMode === "cards" ? (
        <div className={styles.projectsGrid}>
          {filteredAndSortedProjects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectHeader}>
                <h3 className={styles.projectName}>{project.name}</h3>
                <div className={styles.actions}>
                  {/* REMOVED: Image button */}
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
                  <span className={styles.detailValue}>{project.number_of_units ?? 'N/A'}</span> {/* Handle potential null */}
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>الوحدات المباعة:</span>
                  <span className={styles.detailValue}>{project.number_of_sold_items}</span>
                </div>
                 {/* ADDED: Display benefits if present */}
                 {project.benefits && (
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>المميزات:</span>
                        <span className={styles.detailValue}>{project.benefits}</span>
                    </div>
                 )}
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
      ) : (
        // List View (Apply similar changes: remove image button, add benefits display)
        <div className={styles.projectsList}>
          {filteredAndSortedProjects.map((project) => (
            <div key={project.id} className={styles.projectListItem}>
              <div className={styles.projectListHeader}>
                <h3 className={styles.projectName}>{project.name}</h3>
                <div className={styles.actions}>
                    {/* REMOVED: Image button */}
                  <button className={styles.editButton} onClick={() => openEditModal(project)} aria-label="تعديل">
                    <Edit size={18} />
                  </button>
                  <button className={styles.deleteButton} onClick={() => openDeleteModal(project)} aria-label="حذف">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.projectListContent}>
                <div className={styles.projectListDetails}>
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
                    <span className={styles.detailValue}>{project.number_of_units ?? 'N/A'}</span> {/* Handle potential null */}
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>الوحدات المباعة:</span>
                    <span className={styles.detailValue}>{project.number_of_sold_items}</span>
                  </div>
                  {/* ADDED: Display benefits if present */}
                  {project.benefits && (
                      <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>المميزات:</span>
                          <span className={styles.detailValue}>{project.benefits}</span>
                      </div>
                  )}
                </div>
                <div>
                  <a href={`/projects/${project.id}?name=${project.name}`} className={styles.manageButton}>
                    <Building size={16} />
                    <span>إدارة المشروع</span>
                  </a>
                </div>
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

              {/* ADDED: Benefits input */}
              <div className={styles.formGroup}>
                <label htmlFor="benefits">المميزات</label>
                <textarea
                  id="benefits"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="أدخل مميزات أو فوائد المشروع (اختياري)"
                  rows={3}
                />
              </div>

              {/* REMOVED: File input and preview sections */}

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

               {/* ADDED: Benefits input */}
               <div className={styles.formGroup}>
                <label htmlFor="editBenefits">المميزات</label>
                <textarea
                  id="editBenefits"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="أدخل مميزات أو فوائد المشروع (اختياري)"
                  rows={3}
                />
              </div>

              {/* REMOVED: Existing image display, new file input, and preview sections */}

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

      {/* REMOVED: Image Gallery Modal */}

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
  );
};

export default ProjectsPage;