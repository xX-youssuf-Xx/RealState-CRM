"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/auth"
import { useGetSalesReports } from "../../hooks/Reports/useGetSalesReports"
import { useGetAllReports } from "../../hooks/Reports/useGetAllReports"
import { useGetAllEmployees } from "../../hooks/Employees/useGetAllEmployees"
import { useGetTaskBySalesId, type Task } from "../../hooks/Tasks/useGetTaskBySalesId"
import { useGetAllTasks } from "../../hooks/Tasks/useGetAllTasks"
import { useGetLeadBySalesId, type Lead } from "../../hooks/Leads/useGetLeadBySalesId"
import { useGetAllLeads } from "../../hooks/Leads/useGetAllLeads"
import { useGetLead } from "../../hooks/Leads/useGetLead"
import { useGetEmployee } from "../../hooks/Employees/useGetEmployee"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale } from "chart.js"
import { Search, Info, X, Grid, List, ExternalLink, Calendar, PieChart, BarChart } from "lucide-react"
import Loading from "../../components/Loading/Loading"
import styles from "./DashboardPage.module.css"

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale)

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

// Define the expected data structure from the API hooks
interface ReportData {
  totalSales: number
  unitsSold: number
}

// interface SalesmanReport {
//   id: number
//   name: string
//   totalSales: number
//   unitsSold: number
// }

interface TaskWithDetails extends Task {
  customerName?: string
  salesName?: string
}

interface SourceData {
  source: string
  count: number
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { employee } = useAuth()
  const isAdmin = employee?.role === "ADMIN"

  // State for the report data
  const [myReportData, setMyReportData] = useState<ReportData | null>(null)
  const [allReportData, setAllReportData] = useState<ReportData | null>(null)
  // const [salesmenReports, setSalesmenReports] = useState<SalesmanReport[]>([])
  const [todayTasks, setTodayTasks] = useState<TaskWithDetails[]>([])
  const [filteredTasks, setFilteredTasks] = useState<TaskWithDetails[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards")
  const [sourcesData, setSourcesData] = useState<SourceData[]>([])
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Lead | null>(null)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isCustomerLoading, setIsCustomerLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch hooks
  const { execute: fetchMyReports } = useGetSalesReports()
  const { execute: fetchAllReports } = useGetAllReports()
  const { execute: fetchAllEmployees } = useGetAllEmployees()
  const { execute: fetchTasksBySalesId } = useGetTaskBySalesId()
  const { execute: fetchAllTasks } = useGetAllTasks()
  const { execute: fetchLeadsBySalesId } = useGetLeadBySalesId()
  const { execute: fetchAllLeads } = useGetAllLeads()
  const { execute: fetchLead } = useGetLead()
  const { execute: fetchEmployee } = useGetEmployee()

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Fetch sales reports
        const myReports = await fetchMyReports()
        setMyReportData(myReports)

        // Only fetch all reports if admin
        if (isAdmin) {
          const allReports = await fetchAllReports()
          setAllReportData(allReports)

          // Fetch sales per salesman (admin only)
          // const employees = await fetchAllEmployees()
          // const salesmen = employees.filter((emp) => emp.role === "SALES")

          // const salesmenData = await Promise.all(
          //   salesmen.map(async (salesman) => {
          //     try {
          //       // This is a mock call - you would need to implement a real endpoint for this
          //       // For now, we'll just return random data
          //       const salesData = {
          //         totalSales: Math.floor(Math.random() * 1000000),
          //         unitsSold: Math.floor(Math.random() * 20),
          //       }

          //       return {
          //         id: salesman.id,
          //         name: salesman.name,
          //         totalSales: salesData.totalSales,
          //         unitsSold: salesData.unitsSold,
          //       }
          //     } catch (error) {
          //       console.error(`Error fetching sales for ${salesman.name}:`, error)
          //       return {
          //         id: salesman.id,
          //         name: salesman.name,
          //         totalSales: 0,
          //         unitsSold: 0,
          //       }
          //     }
          //   }),
          // )

          // setSalesmenReports(salesmenData)
        }

        // Fetch today's tasks
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let tasksData: Task[] = []

        if (isAdmin) {
          tasksData = await fetchAllTasks()
        } else if (employee?.id) {
          // For non-admin, fetch only their tasks
          tasksData = await fetchTasksBySalesId(Number.parseInt(employee.id))
        }

        // Filter for today's tasks
        const todayTasksData = tasksData.filter((task) => {
          if (!task.due_date) return false
          const taskDate = new Date(task.due_date)
          taskDate.setHours(0, 0, 0, 0)
          return taskDate.getTime() === today.getTime()
        })

        // Enhance tasks with additional details
        const tasksWithDetails = await Promise.all(
          todayTasksData.map(async (task) => {
            const taskWithDetails: TaskWithDetails = { ...task }

            // Fetch customer name if customer_id exists
            if (task.customer_id) {
              try {
                const customerData = await fetchLead(task.customer_id)
                taskWithDetails.customerName = customerData.name
              } catch (error) {
                console.error("Error fetching customer:", error)
                taskWithDetails.customerName = `العميل ${task.customer_id}`
              }
            }

            // Fetch sales name if sales_id exists and role is ADMIN
            if (task.sales_id && isAdmin) {
              try {
                const salesData = await fetchEmployee(task.sales_id)
                taskWithDetails.salesName = salesData.name
              } catch (error) {
                console.error("Error fetching sales:", error)
                taskWithDetails.salesName = `مندوب المبيعات ${task.sales_id}`
              }
            }

            return taskWithDetails
          }),
        )

        setTodayTasks(tasksWithDetails)
        setFilteredTasks(tasksWithDetails)

        // Fetch leads for source pie chart
        let leadsData: Lead[] = []

        if (isAdmin) {
          // If admin, get all leads
          leadsData = await fetchAllLeads()
        } else if (employee?.id) {
          // If not admin, get only leads assigned to this employee
          leadsData = await fetchLeadsBySalesId(Number.parseInt(employee.id))
        }

        // Count leads by source
        const sourceCounts: Record<string, number> = {}

        leadsData.forEach((lead) => {
          if (!sourceCounts[lead.source]) {
            sourceCounts[lead.source] = 0
          }
          sourceCounts[lead.source]++
        })

        const sourceData = Object.entries(sourceCounts).map(([source, count]) => ({
          source,
          count,
        }))

        setSourcesData(sourceData)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [
    employee?.id,
    employee?.role,
    isAdmin,
    fetchMyReports,
    fetchAllReports,
    fetchAllEmployees,
    fetchTasksBySalesId,
    fetchAllTasks,
    fetchLeadsBySalesId,
    fetchAllLeads,
    fetchLead,
    fetchEmployee,
  ])

  // Filter tasks based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filtered = todayTasks.filter(
        (task) =>
          task.name.toLowerCase().includes(query) ||
          task.customerName?.toLowerCase().includes(query) ||
          task.salesName?.toLowerCase().includes(query),
      )
      setFilteredTasks(filtered)
    } else {
      setFilteredTasks(todayTasks)
    }
  }, [searchQuery, todayTasks])

  // Open task modal
  const openTaskModal = (task: TaskWithDetails) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
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
    setIsTaskModalOpen(false)
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
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  // Format number
  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return "0"
    return num.toLocaleString("en-US") // الحفاظ على الأرقام باللغة الإنجليزية
  }

  // Prepare chart data
  const chartData = {
    labels: sourcesData.map((item) => sourceTranslations[item.source] || item.source),
    datasets: [
      {
        label: "العملاء حسب المصدر",
        data: sourcesData.map((item) => item.count),
        backgroundColor: ["#0a2351", "#d4af37", "#2e7d32", "#1976d2", "#9c27b0", "#e53935", "#ff9800", "#795548"],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          font: {
            size: 12,
          },
          // إظهار الأرقام في وسيلة الإيضاح
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets
            return chart.data.labels.map((label: string, i: number) => {
              const meta = chart.getDatasetMeta(0)
              const style = meta.controller.getStyle(i)

              return {
                text: `${label}: ${datasets[0].data[i]}`,
                fillStyle: style.backgroundColor,
                strokeStyle: style.borderColor,
                lineWidth: style.borderWidth,
                hidden: !chart.getDataVisibility(i),
                index: i,
              }
            })
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw}`,
        },
      },
    },
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.pageTitle}>لوحة المعلومات</h1>

      {isLoading ? (
        <Loading isVisible={true} />
      ) : (
        <>
          {/* Sales Statistics Section */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <BarChart className={styles.sectionIcon} />
              إحصائيات المبيعات
            </h2>
          </div>

          <div className={styles.cardsGrid}>
            {/* Card 1: My Total Sales */}
            <div className={styles.statCard}>
              <div className={styles.cardHeader}>إجمالي مبيعاتي</div>
              <div className={styles.cardBody}>
                <span className={styles.statValue}>{formatNumber(myReportData?.totalSales)}</span>
              </div>
            </div>

            {/* Card 2: My Units Sold */}
            <div className={styles.statCard}>
              <div className={styles.cardHeader}>وحداتي المباعة</div>
              <div className={styles.cardBody}>
                <span className={styles.statValue}>{formatNumber(myReportData?.unitsSold)}</span>
                <span className={styles.statLabel}> وحدة</span>
              </div>
            </div>

            {/* Only show all sales data for admins */}
            {isAdmin && (
              <>
                {/* Card 3: All Total Sales */}
                <div className={styles.statCard}>
                  <div className={styles.cardHeader}>إجمالي المبيعات (الكل)</div>
                  <div className={styles.cardBody}>
                    <span className={styles.statValue}>{formatNumber(allReportData?.totalSales)}</span>
                  </div>
                </div>

                {/* Card 4: All Units Sold */}
                <div className={styles.statCard}>
                  <div className={styles.cardHeader}>الوحدات المباعة (الكل)</div>
                  <div className={styles.cardBody}>
                    <span className={styles.statValue}>{formatNumber(allReportData?.unitsSold)}</span>
                    <span className={styles.statLabel}> وحدة</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Today's Tasks Section */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Calendar className={styles.sectionIcon} />
              مهام اليوم
            </h2>
            <div className={styles.sectionActions}>
              <div className={styles.searchContainer}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="بحث في المهام..."
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

          {filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              {searchQuery ? <p>لا توجد مهام تطابق بحثك</p> : <p>لا توجد مهام مجدولة لليوم</p>}
            </div>
          ) : viewMode === "cards" ? (
            <div className={styles.tasksGrid}>
              {filteredTasks.map((task) => (
                <div key={task.id} className={styles.taskCard} onClick={() => openTaskModal(task)}>
                  <div className={styles.taskHeader}>
                    <div className={styles.taskTime}>{formatDate(task.due_date)}</div>
                    <button
                      className={styles.infoButton}
                      onClick={(e) => {
                        e.stopPropagation()
                        openTaskModal(task)
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
                            {task.customerName || `العميل ${task.customer_id}`}
                          </button>
                        </div>
                      )}

                      {isAdmin && task.sales_id && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>مندوب المبيعات:</span>
                          <span className={styles.detailValue}>
                            {task.salesName || `مندوب المبيعات ${task.sales_id}`}
                          </span>
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
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.tasksList}>
              {filteredTasks.map((task) => (
                <div key={task.id} className={styles.taskListItem} onClick={() => openTaskModal(task)}>
                  <div className={styles.taskListHeader}>
                    <h3 className={styles.taskName}>{task.name}</h3>
                    <div className={styles.taskTime}>{formatDate(task.due_date)}</div>
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
                            {task.customerName || `العميل ${task.customer_id}`}
                          </button>
                        </div>
                      )}

                      {isAdmin && task.sales_id && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>مندوب المبيعات:</span>
                          <span className={styles.detailValue}>
                            {task.salesName || `مندوب المبيعات ${task.sales_id}`}
                          </span>
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

          {/* Lead Sources Pie Chart */}
          {sourcesData.length > 0 && (
            <>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <PieChart className={styles.sectionIcon} />
                  مصادر العملاء
                </h2>
              </div>

              <div className={styles.chartContainer}>
                <div className={styles.pieChartWrapper}>
                  <Pie data={chartData} options={chartOptions} />
                </div>
              </div>
            </>
          )}

          {/* Task Modal */}
          {isTaskModalOpen && selectedTask && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2>تفاصيل المهمة</h2>
                  <button className={styles.closeButton} onClick={closeModals}>
                    <X size={20} />
                  </button>
                </div>

                <div className={styles.modalContent}>
                  <div className={styles.modalSection}>
                    <h3>المعلومات الأساسية</h3>
                    <div className={styles.modalItem}>
                      <span className={styles.modalLabel}>اسم المهمة:</span>
                      <span className={styles.modalValue}>{selectedTask.name}</span>
                    </div>
                    <div className={styles.modalItem}>
                      <span className={styles.modalLabel}>تاريخ الاستحقاق:</span>
                      <span className={styles.modalValue}>{formatDate(selectedTask.due_date)}</span>
                    </div>
                    <div className={styles.modalItem}>
                      <span className={styles.modalLabel}>تاريخ الإنشاء:</span>
                      <span className={styles.modalValue}>{formatDate(selectedTask.created_at)}</span>
                    </div>
                    <div className={styles.modalItem}>
                      <span className={styles.modalLabel}>آخر تحديث:</span>
                      <span className={styles.modalValue}>{formatDate(selectedTask.updated_at)}</span>
                    </div>
                  </div>

                  <div className={styles.modalSection}>
                    <h3>المعلومات ذات الصلة</h3>
                    {selectedTask.customer_id && (
                      <div className={styles.modalItem}>
                        <span className={styles.modalLabel}>العميل:</span>
                        <button
                          className={styles.linkButton}
                          onClick={(e) => openCustomerModal(selectedTask.customer_id as number, e)}
                        >
                          {selectedTask.customerName || `العميل ${selectedTask.customer_id}`}
                        </button>
                      </div>
                    )}

                    {isAdmin && selectedTask.sales_id && (
                      <div className={styles.modalItem}>
                        <span className={styles.modalLabel}>مندوب المبيعات:</span>
                        <span className={styles.modalValue}>
                          {selectedTask.salesName || `مندوب المبيعات ${selectedTask.sales_id}`}
                        </span>
                      </div>
                    )}

                    {selectedTask.action_id && selectedTask.customer_id && (
                      <div className={styles.modalItem}>
                        <span className={styles.modalLabel}>الإجراء:</span>
                        <button
                          className={styles.linkButton}
                          onClick={(e) =>
                            navigateToAction(selectedTask.customer_id as number, selectedTask.action_id, e)
                          }
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

          {/* Customer Modal */}
          {isCustomerModalOpen && selectedCustomer && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2>معلومات العميل</h2>
                  <button className={styles.closeButton} onClick={closeModals}>
                    <X size={20} />
                  </button>
                </div>

                <div className={styles.modalContent}>
                  {isCustomerLoading ? (
                    <Loading isVisible={true} />
                  ) : (
                    <>
                      <div className={styles.modalSection}>
                        <h3>المعلومات الأساسية</h3>
                        <div className={styles.modalItem}>
                          <span className={styles.modalLabel}>الاسم:</span>
                          <span className={styles.modalValue}>{selectedCustomer.name}</span>
                        </div>
                        <div className={styles.modalItem}>
                          <span className={styles.modalLabel}>الهاتف:</span>
                          <span className={styles.modalValue}>{selectedCustomer.number}</span>
                        </div>
                        <div className={styles.modalItem}>
                          <span className={styles.modalLabel}>العنوان:</span>
                          <span className={styles.modalValue}>{selectedCustomer.address || "غير محدد"}</span>
                        </div>
                        <div className={styles.modalItem}>
                          <span className={styles.modalLabel}>المصدر:</span>
                          <span className={styles.modalValue}>
                            {sourceTranslations[selectedCustomer.source] || selectedCustomer.source}
                          </span>
                        </div>
                        <div className={styles.modalItem}>
                          <span className={styles.modalLabel}>الميزانية:</span>
                          <span className={styles.modalValue}>
                            {selectedCustomer.budget ? `${formatNumber(selectedCustomer.budget)} ج.م` : "غير محدد"}
                          </span>
                        </div>
                      </div>

                      <div className={styles.modalSection}>
                        <h3>الحالة</h3>
                        <div className={styles.modalItem}>
                          <span className={styles.modalLabel}>الحالة:</span>
                          <span className={styles.modalValue}>
                            {stateTranslations[selectedCustomer.state] || selectedCustomer.state}
                          </span>
                        </div>
                        {selectedCustomer.substate && (
                          <div className={styles.modalItem}>
                            <span className={styles.modalLabel}>الحالة الفرعية:</span>
                            <span className={styles.modalValue}>
                              {substateTranslations[selectedCustomer.substate] || selectedCustomer.substate}
                            </span>
                          </div>
                        )}
                      </div>

                      {selectedCustomer.notes && (
                        <div className={styles.modalSection}>
                          <h3>الملاحظات</h3>
                          <div className={styles.notesBox}>{selectedCustomer.notes}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className={styles.modalFooter}>
                  <button className={styles.viewButton} onClick={() => navigate(`/leads/${selectedCustomer.id}`)}>
                    عرض صفحة العميل
                  </button>
                  <button className={styles.closeModalButton} onClick={closeModals}>
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DashboardPage
