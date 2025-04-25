"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/auth"
import { useGetTaskBySalesId, type Task } from "../../hooks/Tasks/useGetTaskBySalesId"
import { useGetAllTasks } from "../../hooks/Tasks/useGetAllTasks"
import { useGetLead, type Lead } from "../../hooks/Leads/useGetLead"
import { useGetEmployee } from "../../hooks/Employees/useGetEmployee"
import { Search, Info, X, Grid, List, ExternalLink } from "lucide-react"
import Loading from "../../components/Loading/Loading"
import styles from "./UpcomingPage.module.css"

// Lead state translations
const stateTranslations: Record<string, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  INTERESTED: "مهتم",
  VISITING: "زيارة",
  MEETING: "اجتماع",
  NEGOTIATING: "تفاوض",
  QUALIFIED: "مؤهل",
  CLOSED_WON: "تم الإغلاق (نجاح)",
  CLOSED_LOST: "تم الإغلاق (خسارة)",
  FOLLOW_UP: "متابعة",
}

// State to substate mapping
// const stateToSubstate: Record<string, string[]> = {
//   NEW: [],
//   CONTACTED: ["CALLBACK_REQUESTED", "NO_ANSWER", "WRONG_NUMBER"],
//   INTERESTED: ["HIGH_INTEREST", "MEDIUM_INTEREST", "LOW_INTEREST"],
//   VISITING: ["SCHEDULED", "COMPLETED", "CANCELLED"],
//   MEETING: ["SCHEDULED", "COMPLETED", "CANCELLED"],
//   NEGOTIATING: ["PRICE_DISCUSSION", "PAYMENT_PLAN", "FINAL_OFFER"],
//   QUALIFIED: ["READY_TO_BUY", "NEEDS_FINANCING", "CONSIDERING_OPTIONS"],
//   CLOSED_WON: ["FULL_PAYMENT", "INSTALLMENT_PLAN"],
//   CLOSED_LOST: ["PRICE_ISSUE", "LOCATION_ISSUE", "COMPETITOR", "NOT_INTERESTED", "OTHER"],
//   FOLLOW_UP: ["SCHEDULED", "PENDING"],
// }

// Substate translations
const substateTranslations: Record<string, string> = {
  // Contacted
  CALLBACK_REQUESTED: "طلب معاودة الاتصال",
  NO_ANSWER: "لا يوجد رد",
  WRONG_NUMBER: "رقم خاطئ",

  // Interested
  HIGH_INTEREST: "اهتمام عالي",
  MEDIUM_INTEREST: "اهتمام متوسط",
  LOW_INTEREST: "اهتمام منخفض",

  // Visiting/Meeting
  SCHEDULED: "مجدول",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",

  // Negotiating
  PRICE_DISCUSSION: "مناقشة السعر",
  PAYMENT_PLAN: "خطة الدفع",
  FINAL_OFFER: "العرض النهائي",

  // Qualified
  READY_TO_BUY: "جاهز للشراء",
  NEEDS_FINANCING: "يحتاج تمويل",
  CONSIDERING_OPTIONS: "يدرس الخيارات",

  // Closed Won
  FULL_PAYMENT: "دفع كامل",
  INSTALLMENT_PLAN: "خطة أقساط",

  // Closed Lost
  PRICE_ISSUE: "مشكلة في السعر",
  LOCATION_ISSUE: "مشكلة في الموقع",
  COMPETITOR: "ذهب لمنافس",
  NOT_INTERESTED: "غير مهتم",
  OTHER: "أخرى",

  // Follow Up
  PENDING: "قيد الانتظار",
}

// Lead source translations
const sourceTranslations: Record<string, string> = {
  WEBSITE: "الموقع الإلكتروني",
  SOCIAL_MEDIA: "وسائل التواصل الاجتماعي",
  REFERRAL: "إحالة",
  COLD_CALL: "اتصال مباشر",
  EXHIBITION: "معرض",
  WALK_IN: "زيارة مباشرة",
  SALES: "فريق المبيعات",
  PARTNER: "شريك",
  OTHER: "أخرى",
}

interface TaskWithDetails extends Task {
  customerName?: string
  salesName?: string
  actionDetails?: string
}

const UpcomingPage: React.FC = () => {
  const navigate = useNavigate()

  // State
  const [tasks, setTasks] = useState<TaskWithDetails[]>([])
  const [filteredTasks, setFilteredTasks] = useState<TaskWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards")
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Lead | null>(null)
  const [isCustomerLoading, setIsCustomerLoading] = useState(false)

  // Get employee ID and role from auth context
  const { employee } = useAuth()
  const { execute: fetchTasksBySalesId } = useGetTaskBySalesId()
  const { execute: fetchAllTasks } = useGetAllTasks()
  const { execute: fetchLead } = useGetLead()
  const { execute: fetchEmployee } = useGetEmployee()

  // Load tasks when component mounts
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true)
        let tasksData: Task[] = []

        // Check role and fetch tasks accordingly
        if (employee?.role === "ADMIN") {
          tasksData = await fetchAllTasks()
        } else if (employee?.id) {
          tasksData = await fetchTasksBySalesId(Number.parseInt(employee.id))
        }

        // Enhance tasks with additional details
        const tasksWithDetails = await Promise.all(
          tasksData.map(async (task: Task) => {
            const taskWithDetails: TaskWithDetails = { ...task }

            // Fetch customer name if customer_id exists
            if (task.customer_id) {
              try {
                const customerData = await fetchLead(task.customer_id)
                taskWithDetails.customerName = customerData.name
              } catch (error) {
                console.error("Error fetching customer:", error)
                taskWithDetails.customerName = `عميل ${task.customer_id}`
              }
            }

            // Fetch sales name if sales_id exists and role is ADMIN
            if (task.sales_id && employee?.role === "ADMIN") {
              try {
                const salesData = await fetchEmployee(task.sales_id)
                taskWithDetails.salesName = salesData.name
              } catch (error) {
                console.error("Error fetching sales:", error)
                taskWithDetails.salesName = `مندوب ${task.sales_id}`
              }
            }

            taskWithDetails.actionDetails = task.action_id ? `إجراء ${task.action_id}` : "لا يوجد إجراء مرتبط"
            return taskWithDetails
          }),
        )

        setTasks(tasksWithDetails)
        setFilteredTasks(tasksWithDetails)
      } catch (error) {
        console.error("Error loading tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [employee?.id, employee?.role, fetchTasksBySalesId, fetchAllTasks, fetchLead, fetchEmployee])

  // Filter tasks based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filtered = tasks.filter(
        (task) =>
          task.name.toLowerCase().includes(query) ||
          task.customerName?.toLowerCase().includes(query) ||
          task.salesName?.toLowerCase().includes(query) ||
          task.actionDetails?.toLowerCase().includes(query),
      )
      setFilteredTasks(filtered)
    } else {
      setFilteredTasks(tasks)
    }
  }, [searchQuery, tasks])

  // Open info modal
  const openInfoModal = (task: TaskWithDetails) => {
    setSelectedTask(task)
    setIsInfoModalOpen(true)
  }

  // Open customer modal
  const openCustomerModal = async (customerId: number, event: React.MouseEvent) => {
    event.stopPropagation()

    try {
      setIsCustomerLoading(true)
      const customerData = await fetchLead(customerId)
      setSelectedCustomer(customerData)
      setIsCustomerModalOpen(true)
    } catch (error) {
      console.error("Error fetching customer details:", error)
    } finally {
      setIsCustomerLoading(false)
    }
  }

  // Navigate to action view
  const navigateToAction = (customerId: number, actionId: number | null, event: React.MouseEvent) => {
    event.stopPropagation()
    if (actionId) {
      navigate(`/leads/${customerId}?actionId=${actionId}`)
    } else {
      navigate(`/leads/${customerId}`)
    }
  }

  // Close all modals
  const closeModals = () => {
    setIsInfoModalOpen(false)
    setIsCustomerModalOpen(false)
    setSelectedTask(null)
    setSelectedCustomer(null)
  }

  // Format date
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "غير محدد"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  // Check if task is overdue
  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false
    const now = new Date()
    return new Date(dueDate) < now
  }

  // Check if task is due today
  const isDueToday = (dueDate: Date | null) => {
    if (!dueDate) return false
    const today = new Date()
    const due = new Date(dueDate)
    return (
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear()
    )
  }

  return (
    <div className={styles.tasksPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>المهام القادمة</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        </div>
      </div>

      {isLoading ? (
        <Loading isVisible={true} />
      ) : filteredTasks.length === 0 ? (
        <div className={styles.emptyState}>
          {searchQuery ? <p>لا توجد نتائج مطابقة للبحث</p> : <p>لا توجد مهام قادمة</p>}
        </div>
      ) : viewMode === "cards" ? (
        <div className={styles.tasksContainer}>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`${styles.taskCard} ${isOverdue(task.due_date) ? styles.overdueTask : isDueToday(task.due_date) ? styles.todayTask : ""}`}
              onClick={() => openInfoModal(task)}
            >
              <div className={styles.taskHeader}>
                <div className={styles.taskDate}>{formatDate(task.due_date)}</div>
                <button
                  className={styles.infoButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    openInfoModal(task)
                  }}
                  aria-label="معلومات"
                >
                  <Info size={18} />
                </button>
              </div>

              <div className={styles.taskContent}>
                <h3 className={styles.taskName}>{task.name}</h3>

                <div className={styles.taskDetails}>
                  {task.customer_id && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>العميل:</span>
                      <button
                        className={styles.linkButton}
                        onClick={(e) => openCustomerModal(task.customer_id as number, e)}
                      >
                        {task.customerName || `عميل ${task.customer_id}`}
                      </button>
                    </div>
                  )}

                  {employee?.role === "ADMIN" && task.sales_id && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>المندوب:</span>
                      <span className={styles.detailValue}>{task.salesName || `مندوب ${task.sales_id}`}</span>
                    </div>
                  )}

                  {task.action_id && task.customer_id && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>الإجراء:</span>
                      <button
                        className={styles.linkButton}
                        onClick={(e) => navigateToAction(task.customer_id as number, task.action_id, e)}
                      >
                        عرض الإجراء <ExternalLink size={14} className={styles.linkIcon} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.taskFooter}>
                <div
                  className={`${styles.taskStatus} ${
                    isOverdue(task.due_date)
                      ? styles.overdue
                      : isDueToday(task.due_date)
                        ? styles.today
                        : styles.upcoming
                  }`}
                >
                  {isOverdue(task.due_date) ? "متأخر" : isDueToday(task.due_date) ? "اليوم" : "قادم"}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.tasksListContainer}>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`${styles.taskListItem} ${isOverdue(task.due_date) ? styles.overdueTask : isDueToday(task.due_date) ? styles.todayTask : ""}`}
              onClick={() => openInfoModal(task)}
            >
              <div className={styles.taskListHeader}>
                <div className={styles.taskListHeaderLeft}>
                  <h3 className={styles.taskName}>{task.name}</h3>
                  <div
                    className={`${styles.taskStatus} ${
                      isOverdue(task.due_date)
                        ? styles.overdue
                        : isDueToday(task.due_date)
                          ? styles.today
                          : styles.upcoming
                    }`}
                  >
                    {isOverdue(task.due_date) ? "متأخر" : isDueToday(task.due_date) ? "اليوم" : "قادم"}
                  </div>
                </div>
                <div className={styles.taskDate}>{formatDate(task.due_date)}</div>
              </div>

              <div className={styles.taskListContent}>
                <div className={styles.taskListDetails}>
                  {task.customer_id && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>العميل:</span>
                      <button
                        className={styles.linkButton}
                        onClick={(e) => openCustomerModal(task.customer_id as number, e)}
                      >
                        {task.customerName || `عميل ${task.customer_id}`}
                      </button>
                    </div>
                  )}

                  {employee?.role === "ADMIN" && task.sales_id && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>المندوب:</span>
                      <span className={styles.detailValue}>{task.salesName || `مندوب ${task.sales_id}`}</span>
                    </div>
                  )}
                </div>

                {task.action_id && task.customer_id && (
                  <button
                    className={styles.actionButton}
                    onClick={(e) => navigateToAction(task.customer_id as number, task.action_id, e)}
                  >
                    عرض الإجراء <ExternalLink size={14} className={styles.linkIcon} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Info Modal */}
      {isInfoModalOpen && selectedTask && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>تفاصيل المهمة</h2>
              <button className={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.infoContent}>
              <div className={styles.infoSection}>
                <h3>معلومات أساسية</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>اسم المهمة:</span>
                  <span className={styles.infoValue}>{selectedTask.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>تاريخ الاستحقاق:</span>
                  <span
                    className={`${styles.infoValue} ${
                      isOverdue(selectedTask.due_date)
                        ? styles.overdue
                        : isDueToday(selectedTask.due_date)
                          ? styles.today
                          : ""
                    }`}
                  >
                    {formatDate(selectedTask.due_date)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>تاريخ الإنشاء:</span>
                  <span className={styles.infoValue}>{formatDate(selectedTask.created_at)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>آخر تحديث:</span>
                  <span className={styles.infoValue}>{formatDate(selectedTask.updated_at)}</span>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3>العلاقات</h3>
                {selectedTask.customer_id && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>العميل:</span>
                    <button
                      className={styles.linkButton}
                      onClick={(e) => openCustomerModal(selectedTask.customer_id as number, e)}
                    >
                      {selectedTask.customerName || `عميل ${selectedTask.customer_id}`}
                    </button>
                  </div>
                )}

                {employee?.role === "ADMIN" && selectedTask.sales_id && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>المندوب:</span>
                    <span className={styles.infoValue}>
                      {selectedTask.salesName || `مندوب ${selectedTask.sales_id}`}
                    </span>
                  </div>
                )}

                {selectedTask.action_id && selectedTask.customer_id && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>الإجراء:</span>
                    <button
                      className={styles.linkButton}
                      onClick={(e) => navigateToAction(selectedTask.customer_id as number, selectedTask.action_id, e)}
                    >
                      عرض الإجراء <ExternalLink size={14} className={styles.linkIcon} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.closeModalButton} onClick={closeModals}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Info Modal */}
      {isCustomerModalOpen && selectedCustomer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>معلومات العميل</h2>
              <button className={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.infoContent}>
              {isCustomerLoading ? (
                <Loading isVisible={true} />
              ) : (
                <>
                  <div className={styles.infoSection}>
                    <h3>معلومات أساسية</h3>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>الاسم:</span>
                      <span className={styles.infoValue}>{selectedCustomer.name}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>رقم الهاتف:</span>
                      <span className={styles.infoValue}>{selectedCustomer.number}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>العنوان:</span>
                      <span className={styles.infoValue}>{selectedCustomer.address || "غير محدد"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>المصدر:</span>
                      <span className={styles.infoValue}>
                        {sourceTranslations[selectedCustomer.source] || selectedCustomer.source}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>الميزانية:</span>
                      <span className={styles.infoValue}>
                        {selectedCustomer.budget ? `${selectedCustomer.budget} ج.م` : "غير محدد"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.infoSection}>
                    <h3>الحالة</h3>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>الحالة:</span>
                      <span className={styles.infoValue}>
                        {stateTranslations[selectedCustomer.state] || selectedCustomer.state}
                      </span>
                    </div>
                    {selectedCustomer.substate && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>الحالة الفرعية:</span>
                        <span className={styles.infoValue}>
                          {substateTranslations[selectedCustomer.substate] || selectedCustomer.substate}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedCustomer.notes && (
                    <div className={styles.infoSection}>
                      <h3>ملاحظات</h3>
                      <div className={styles.notesBox}>{selectedCustomer.notes}</div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.viewLeadButton} onClick={() => navigate(`/leads/${selectedCustomer.id}`)}>
                عرض صفحة العميل
              </button>
              <button className={styles.closeModalButton} onClick={closeModals}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpcomingPage
