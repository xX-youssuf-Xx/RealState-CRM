"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Edit, Trash2, Plus, X, Search, Info, Grid, List } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useGetAllEmployees, type Employee } from "../../hooks/Employees/useGetAllEmployees"
import { useCreateEmployee } from "../../hooks/Employees/useCreateEmployee"
import { useUpdateEmployee } from "../../hooks/Employees/useUpdateEmployee"
import { useDeleteEmployee } from "../../hooks/Employees/useDeleteEmployee"
import styles from "./EmployeesPage.module.css"
import Loading from "../../components/Loading/Loading"

// Role translation mapping
const roleTranslations: Record<string, string> = {
  ADMIN: "مدير النظام",
  SALES: "مبيعات",
  MANAGER: "مدير",
  DELETED: "محذوف",
}

// Role priority for sorting (lower number = higher priority)
const rolePriority: Record<string, number> = {
  ADMIN: 1,
  MANAGER: 2,
  SALES: 3,
  DELETED: 4,
}

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

interface EmployeeFormData {
  id?: string
  name: string
  number: string
  role: string
  notes: string
  password: string
}

const initialFormData: EmployeeFormData = {
  name: "",
  number: "",
  role: "SALES",
  notes: "",
  password: "",
}

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData)
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards")

  const { execute: fetchEmployees, isLoading: isLoadingEmployees } = useGetAllEmployees()
  const { execute: createEmployee, isLoading: isCreating } = useCreateEmployee()
  const { execute: updateEmployee, isLoading: isUpdating } = useUpdateEmployee()
  const { execute: deleteEmployee, isLoading: isDeleting } = useDeleteEmployee()

  // Fetch employees on component mount
  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployees()
      setEmployees(data)
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحميل بيانات الموظفين")
    }
  }

  // Filter and sort employees
  const filteredAndSortedEmployees = useMemo(() => {
    // First filter by search query
    const filtered = employees.filter((employee) => employee.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Then sort by role priority and date
    return filtered.sort((a, b) => {
      // First sort by role priority
      const roleA = a.role.toUpperCase()
      const roleB = b.role.toUpperCase()
      const rolePriorityA = rolePriority[roleA] || 999
      const rolePriorityB = rolePriority[roleB] || 999

      if (rolePriorityA !== rolePriorityB) {
        return rolePriorityA - rolePriorityB
      }

      // Then sort by date (earlier first)
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateA - dateB
    })
  }, [employees, searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const openCreateModal = () => {
    setSelectedEmployee(null)
    setFormData(initialFormData)
    setIsModalOpen(true)
  }

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      id: employee.id.toString(),
      name: employee.name,
      number: employee.number,
      role: employee.role.toUpperCase(),
      notes: employee.notes || "",
      password: "", // Password field is empty when editing
    })
    setIsModalOpen(true)
  }

  const openInfoModal = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsInfoModalOpen(true)
  }

  const openDeleteModal = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDeleteModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsDeleteModalOpen(false)
    setIsInfoModalOpen(false)
  }

  // Update the handleSubmit function to only send changed fields
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedEmployee) {
        // Update existing employee
        const updates: Record<string, string> = {}

        // Only include fields that have changed
        if (formData.name !== selectedEmployee.name) updates.name = formData.name
        if (formData.number !== selectedEmployee.number) updates.number = formData.number
        if (formData.role !== selectedEmployee.role.toUpperCase()) updates.role = formData.role
        if (formData.notes !== (selectedEmployee.notes || "")) updates.notes = formData.notes

        // Always include password if it's not empty
        if (formData.password) updates.password = formData.password

        await updateEmployee(Number(selectedEmployee.id), updates)
        toast.success("تم تحديث بيانات الموظف بنجاح")
      } else {
        // Create new employee
        await createEmployee(formData.name, formData.number, formData.role, formData.notes, formData.password)
        toast.success("تم إضافة الموظف بنجاح")
      }

      closeModal()
      loadEmployees()
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حفظ بيانات الموظف")
    }
  }

  const handleDelete = async () => {
    if (!selectedEmployee) return

    try {
      await deleteEmployee(Number(selectedEmployee.id))
      toast.success("تم حذف الموظف بنجاح")
      closeModal()
      loadEmployees()
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حذف الموظف")
    }
  }

  // Get CSS class based on employee role for card view
  const getEmployeeCardClass = (role: string) => {
    const upperRole = role.toUpperCase()
    if (upperRole === "DELETED") {
      return `${styles.employeeCard} ${styles.deletedEmployee}`
    } else if (upperRole === "ADMIN") {
      return `${styles.employeeCard} ${styles.adminEmployee}`
    } else if (upperRole === "MANAGER") {
      return `${styles.employeeCard} ${styles.managerEmployee}`
    } else if (upperRole === "SALES") {
      return `${styles.employeeCard} ${styles.salesEmployee}`
    }
    return styles.employeeCard
  }

  // Get CSS class based on employee role for list view
  const getEmployeeListItemClass = (role: string) => {
    const upperRole = role.toUpperCase()
    if (upperRole === "DELETED") {
      return `${styles.employeeListItem} ${styles.deletedListItem}`
    } else if (upperRole === "ADMIN") {
      return `${styles.employeeListItem} ${styles.adminListItem}`
    } else if (upperRole === "MANAGER") {
      return `${styles.employeeListItem} ${styles.managerListItem}`
    } else if (upperRole === "SALES") {
      return `${styles.employeeListItem} ${styles.salesListItem}`
    }
    return styles.employeeListItem
  }

  return (
    <div className={styles.employeesPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>إدارة الموظفين</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="بحث بالاسم..."
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
          <button className={styles.addButton} onClick={openCreateModal} disabled={isLoadingEmployees}>
            <Plus size={18} />
            <span>إضافة موظف</span>
          </button>
        </div>
      </div>

      {isLoadingEmployees ? (
        <Loading isVisible={true} />
      ) : filteredAndSortedEmployees.length === 0 ? (
        <div className={styles.emptyState}>
          {searchQuery ? (
            <p>لا توجد نتائج مطابقة للبحث</p>
          ) : (
            <>
              <p>لا يوجد موظفين حالياً</p>
              <button className={styles.addButton} onClick={openCreateModal}>
                <Plus size={18} />
                <span>إضافة موظف</span>
              </button>
            </>
          )}
        </div>
      ) : viewMode === "cards" ? (
        <div className={styles.employeesGrid}>
          {filteredAndSortedEmployees.map((employee) => (
            <div key={employee.id} className={getEmployeeCardClass(employee.role)}>
              <div className={`${styles.employeeHeader} ${styles[employee.role.toLowerCase() + "Header"]}`}>
                <h3 className={styles.employeeName}>{employee.name}</h3>
                <div className={styles.actions}>
                  <button className={styles.infoButton} onClick={() => openInfoModal(employee)} aria-label="معلومات">
                    <Info size={18} />
                  </button>
                  <button className={styles.editButton} onClick={() => openEditModal(employee)} aria-label="تعديل">
                    <Edit size={18} />
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => openDeleteModal(employee)}
                    aria-label="حذف"
                    disabled={employee.role.toUpperCase() === "DELETED"}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.employeeDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>رقم الهاتف:</span>
                  <span className={styles.detailValue}>{employee.number}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>الوظيفة:</span>
                  <span className={`${styles.detailValue} ${styles[employee.role.toLowerCase() + "Role"]}`}>
                    {roleTranslations[employee.role.toUpperCase()] || employee.role}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>تاريخ البدء:</span>
                  <span className={styles.detailValue}>{formatDate(employee.created_at.toString())}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.employeesList}>
          {filteredAndSortedEmployees.map((employee) => (
            <div key={employee.id} className={getEmployeeListItemClass(employee.role)}>
              <div className={styles.employeeListHeader}>
                <h3 className={styles.employeeName}>{employee.name}</h3>
                <div className={styles.actions}>
                  <button className={styles.infoButton} onClick={() => openInfoModal(employee)} aria-label="معلومات">
                    <Info size={18} />
                  </button>
                  <button className={styles.editButton} onClick={() => openEditModal(employee)} aria-label="تعديل">
                    <Edit size={18} />
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => openDeleteModal(employee)}
                    aria-label="حذف"
                    disabled={employee.role.toUpperCase() === "DELETED"}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.employeeListContent}>
                <div className={styles.employeeListDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>رقم الهاتف:</span>
                    <span className={styles.detailValue}>{employee.number}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>الوظيفة:</span>
                    <span className={`${styles.detailValue} ${styles[employee.role.toLowerCase() + "Role"]}`}>
                      {roleTranslations[employee.role.toUpperCase()] || employee.role}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>تاريخ البدء:</span>
                    <span className={styles.detailValue}>{formatDate(employee.created_at.toString())}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Employee Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{selectedEmployee ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}</h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">الاسم</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل اسم الموظف"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="number">رقم الهاتف</label>
                <input
                  type="number"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="role">الوظيفة</label>
                <select id="role" name="role" value={formData.role} onChange={handleInputChange} required>
                  <option value="ADMIN">مدير النظام</option>
                  <option value="MANAGER">مدير</option>
                  <option value="SALES">مبيعات</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notes">ملاحظات</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="أدخل ملاحظات (اختياري)"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">
                  {selectedEmployee ? "كلمة المرور (اتركها فارغة إذا لم ترغب في تغييرها)" : "كلمة المرور"}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!selectedEmployee}
                  placeholder="أدخل كلمة المرور"
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                  disabled={isCreating || isUpdating}
                >
                  إلغاء
                </button>
                <button type="submit" className={styles.submitButton} disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? (
                    <>
                      <Loading isVisible={true} />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>{selectedEmployee ? "تحديث" : "إضافة"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Info Modal */}
      {isInfoModalOpen && selectedEmployee && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={`${styles.modalHeader} ${styles[selectedEmployee.role.toLowerCase() + "Header"]}`}>
              <h2>معلومات الموظف</h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.infoContent}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>الرقم التعريفي:</span>
                <span className={styles.infoValue}>{selectedEmployee.id}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>الاسم:</span>
                <span className={styles.infoValue}>{selectedEmployee.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>رقم الهاتف:</span>
                <span className={styles.infoValue}>{selectedEmployee.number}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>الوظيفة:</span>
                <span className={`${styles.infoValue} ${styles[selectedEmployee.role.toLowerCase() + "Role"]}`}>
                  {roleTranslations[selectedEmployee.role.toUpperCase()] || selectedEmployee.role}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ملاحظات:</span>
                <span className={styles.infoValue}>{selectedEmployee.notes || "لا توجد ملاحظات"}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>تاريخ البدء:</span>
                <span className={styles.infoValue}>{formatDate(selectedEmployee.created_at.toString())}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>آخر تحديث:</span>
                <span className={styles.infoValue}>{formatDate(selectedEmployee.updated_at.toString())}</span>
              </div>
            </div>

            <div className={styles.infoActions}>
              <button className={styles.closeInfoButton} onClick={closeModal}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedEmployee && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h2>تأكيد الحذف</h2>
            <p>
              هل أنت متأكد من رغبتك في حذف الموظف "{selectedEmployee.name}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </p>

            <div className={styles.confirmActions}>
              <button className={styles.cancelButton} onClick={closeModal} disabled={isDeleting}>
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

export default EmployeesPage
