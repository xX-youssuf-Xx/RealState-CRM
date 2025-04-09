"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Edit, Trash2, Plus, X, Search, Info, Phone, Filter, UserPlus, ExternalLink, Grid, List } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useGetAllLeads, type Lead } from "../../hooks/Leads/useGetAllLeads"
import { useCreateLead } from "../../hooks/Leads/useCreateLead"
import { useUpdateLead } from "../../hooks/Leads/useUpdateLead"
import { useDeleteLead } from "../../hooks/Leads/useDeleteLead"
import { useGetLeadBySalesId } from "../../hooks/Leads/useGetLeadBySalesId"
import { useTransferLead } from "../../hooks/Leads/useTransferLead"
import { useGetAllEmployees, type Employee } from "../../hooks/Employees/useGetAllEmployees"
import { useGetEmployee } from "../../hooks/Employees/useGetEmployee"
import { useAuth } from "../../contexts/auth"
import styles from "./LeadsPage.module.css"
import Loading from "../../components/Loading/Loading"

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
const stateToSubstate: Record<string, string[]> = {
  NEW: [],
  CONTACTED: ["CALLBACK_REQUESTED", "NO_ANSWER", "WRONG_NUMBER"],
  INTERESTED: ["HIGH_INTEREST", "MEDIUM_INTEREST", "LOW_INTEREST"],
  VISITING: ["SCHEDULED", "COMPLETED", "CANCELLED"],
  MEETING: ["SCHEDULED", "COMPLETED", "CANCELLED"],
  NEGOTIATING: ["PRICE_DISCUSSION", "PAYMENT_PLAN", "FINAL_OFFER"],
  QUALIFIED: ["READY_TO_BUY", "NEEDS_FINANCING", "CONSIDERING_OPTIONS"],
  CLOSED_WON: ["FULL_PAYMENT", "INSTALLMENT_PLAN"],
  CLOSED_LOST: ["PRICE_ISSUE", "LOCATION_ISSUE", "COMPETITOR", "NOT_INTERESTED", "OTHER"],
  FOLLOW_UP: ["SCHEDULED", "PENDING"],
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

// Budget ranges
const budgetRanges = [
  { label: "100,000 - 200,000", value: 150000 },
  { label: "200,000 - 300,000", value: 250000 },
  { label: "300,000 - 500,000", value: 400000 },
  { label: "500,000 - 750,000", value: 625000 },
  { label: "750,000 - 1,000,000", value: 875000 },
  { label: "1,000,000 - 1,500,000", value: 1250000 },
  { label: "1,500,000 - 2,000,000", value: 1750000 },
  { label: "2,000,000 - 3,000,000", value: 2500000 },
  { label: "3,000,000 - 5,000,000", value: 4000000 },
  { label: "5,000,000 - 10,000,000", value: 7500000 },
]

// Format budget to readable format
const formatBudget = (budget: number | null) => {
  if (!budget) return "غير محدد"
  return new Intl.NumberFormat("ar-EG").format(budget) + " جنيه"
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

interface LeadFormData {
  id?: string
  name: string
  number: string
  source: string
  address: string
  state: string
  substate: string | null
  budget: number | null
  notes: string | null
  notification_id: string | null
}

interface FilterOptions {
  salesId: number | null
  state: string | null
  substate: string | null
  budget: number | null
  source: string | null
  isCreatedBySales: boolean | null
}

interface LeadWithSalesName extends Lead {
  salesName?: string
}

const initialFormData: LeadFormData = {
  name: "",
  number: "",
  source: "WEBSITE",
  address: "",
  state: "NEW",
  substate: null,
  budget: null,
  notes: "",
  notification_id: null,
}

const initialFilterOptions: FilterOptions = {
  salesId: null,
  state: null,
  substate: null,
  budget: null,
  source: null,
  isCreatedBySales: null,
}

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<LeadWithSalesName[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<LeadWithSalesName | null>(null)
  const [formData, setFormData] = useState<LeadFormData>(initialFormData)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(initialFilterOptions)
  const [transferSalesId, setTransferSalesId] = useState<number | null>(null)
  const [isFiltered, setIsFiltered] = useState(false)
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards")
  const [employeeMap, setEmployeeMap] = useState<Record<string, string>>({})

  const { employee } = useAuth()
  const { execute: fetchLeads, isLoading: isLoadingLeads } = useGetAllLeads()
  const { execute: fetchLeadsBySalesId, isLoading: isLoadingLeadsBySalesId } = useGetLeadBySalesId()
  const { execute: fetchEmployees, isLoading: isLoadingEmployees } = useGetAllEmployees()
  const { execute: fetchEmployee } = useGetEmployee()
  const { execute: createLead, isLoading: isCreating } = useCreateLead()
  const { execute: updateLead, isLoading: isUpdating } = useUpdateLead()
  const { execute: deleteLead, isLoading: isDeleting } = useDeleteLead()
  const { execute: transferLead, isLoading: isTransferring } = useTransferLead()

  // Fetch leads and employees on component mount
  useEffect(() => {
    loadEmployees()

    // Load leads based on user role
    if (employee?.role === "ADMIN") {
      loadLeads()
    } else if (employee?.role === "SALES" && employee?.id) {
      loadLeadsBySalesId(Number.parseInt(employee.id))
    }
  }, [employee])

  // Load all leads (for admin)
  const loadLeads = async () => {
    try {
      const data = await fetchLeads()

      // Ensure data is properly formatted with correct types
      const formattedData = data.map((lead) => ({
        ...lead,
        id: Number(lead.id),
        sales_id: lead.sales_id ? Number(lead.sales_id) : null,
        budget: lead.budget ? Number(lead.budget) : null,
        is_created_by_sales: Boolean(lead.is_created_by_sales),
      }))

      // Add sales names to leads
      const leadsWithSalesNames = await addSalesNamesToLeads(formattedData)
      setLeads(leadsWithSalesNames)
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحميل بيانات العملاء")
    }
  }

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployees()
      setEmployees(data)

      // Create a map of employee IDs to names for quick lookup
      const empMap: Record<string, string> = {}
      data.forEach((emp) => {
        empMap[emp.id.toString()] = emp.name
      })
      setEmployeeMap(empMap)
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحميل بيانات الموظفين")
    }
  }

  // Add sales names to leads
  const addSalesNamesToLeads = async (leadsData: Lead[]): Promise<LeadWithSalesName[]> => {
    // First try to use the employee map for quick lookup
    const leadsWithNames = leadsData.map((lead) => {
      if (lead.sales_id && employeeMap[lead.sales_id.toString()]) {
        return {
          ...lead,
          salesName: employeeMap[lead.sales_id.toString()],
        }
      }
      return lead as LeadWithSalesName
    })

    // For any leads without a sales name, fetch the employee data
    const leadsWithMissingSalesNames = leadsWithNames.filter((lead) => lead.sales_id && !lead.salesName)

    if (leadsWithMissingSalesNames.length > 0) {
      // Create a new map to store newly fetched employee names
      const newEmployeeMap = { ...employeeMap }

      // Fetch missing employee data
      await Promise.all(
        leadsWithMissingSalesNames.map(async (lead) => {
          if (lead.sales_id) {
            try {
              const salesData = await fetchEmployee(Number(lead.sales_id))
              lead.salesName = salesData.name
              newEmployeeMap[lead.sales_id.toString()] = salesData.name
            } catch (error) {
              console.error(`Error fetching employee ${lead.sales_id}:`, error)
              lead.salesName = `مندوب ${lead.sales_id}`
            }
          }
        }),
      )

      // Update the employee map with newly fetched data
      setEmployeeMap(newEmployeeMap)
    }

    return leadsWithNames
  }

  // Load leads by sales ID (for salespeople)
  const loadLeadsBySalesId = async (salesId: number) => {
    try {
      const data = await fetchLeadsBySalesId(salesId)

      // Ensure data is properly formatted with correct types
      const formattedData = data.map((lead) => ({
        ...lead,
        id: Number(lead.id),
        sales_id: lead.sales_id ? Number(lead.sales_id) : null,
        budget: lead.budget ? Number(lead.budget) : null,
        is_created_by_sales: Boolean(lead.is_created_by_sales),
      }))

      // Add sales names to leads
      const leadsWithSalesNames = await addSalesNamesToLeads(formattedData)
      setLeads(leadsWithSalesNames)
      setIsFiltered(true)
      toast.info(`تم العثور على ${data.length} عميل`)
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحميل بيانات العملاء")
    }
  }

  // Filter and sort leads
  const filteredAndSortedLeads = useMemo(() => {
    // First filter by search query
    let filtered = leads.filter((lead) => lead.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Apply additional filters if any are set
    if (filterOptions.salesId) {
      filtered = filtered.filter((lead) => {
        // Convert both to numbers for comparison to avoid string/number mismatch
        const leadSalesId = typeof lead.sales_id === "string" ? Number(lead.sales_id) : lead.sales_id
        return leadSalesId === filterOptions.salesId
      })
    }
    if (filterOptions.state) {
      filtered = filtered.filter((lead) => lead.state === filterOptions.state)
    }
    if (filterOptions.substate) {
      filtered = filtered.filter((lead) => lead.substate === filterOptions.substate)
    }
    if (filterOptions.budget) {
      // Find the selected budget range
      const selectedRange = budgetRanges.find((range) => range.value === filterOptions.budget)
      if (selectedRange) {
        // Extract min and max from the label (format: "min - max")
        const [minStr, maxStr] = selectedRange.label.split(" - ")
        const min = Number.parseInt(minStr.replace(/,/g, ""))
        const max = Number.parseInt(maxStr.replace(/,/g, ""))

        // Filter leads with budget in the selected range
        filtered = filtered.filter((lead) => {
          const budget = lead.budget ? Number(lead.budget) : 0
          return budget >= min && budget <= max
        })
      }
    }
    if (filterOptions.source) {
      filtered = filtered.filter((lead) => lead.source === filterOptions.source)
    }
    if (filterOptions.isCreatedBySales !== null) {
      filtered = filtered.filter((lead) => lead.is_created_by_sales === filterOptions.isCreatedBySales)
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    })
  }, [leads, searchQuery, filterOptions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "state") {
      // Reset substate when state changes
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        substate: stateToSubstate[value]?.length > 0 ? stateToSubstate[value][0] : null,
      }))
    } else if (name === "budget") {
      // Convert budget string to number
      setFormData((prev) => ({ ...prev, [name]: value ? Number.parseInt(value) : null }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "state") {
      // Reset substate when state changes
      setFilterOptions((prev) => ({
        ...prev,
        [name]: value || null,
        substate: null,
      }))
    } else if (name === "budget") {
      // Convert budget string to number
      setFilterOptions((prev) => ({ ...prev, [name]: value ? Number.parseInt(value) : null }))
    } else if (name === "salesId") {
      setFilterOptions((prev) => ({ ...prev, [name]: value ? Number.parseInt(value) : null }))
    } else if (name === "isCreatedBySales") {
      setFilterOptions((prev) => ({ ...prev, [name]: value === "" ? null : value === "true" }))
    } else {
      setFilterOptions((prev) => ({ ...prev, [name]: value || null }))
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const openCreateModal = () => {
    setSelectedLead(null)
    setFormData(initialFormData)
    setIsModalOpen(true)
  }

  const openEditModal = (lead: LeadWithSalesName) => {
    setSelectedLead(lead)
    setFormData({
      id: lead.id.toString(),
      name: lead.name,
      number: lead.number,
      source: lead.source,
      address: lead.address,
      state: lead.state,
      substate: lead.substate,
      budget: lead.budget,
      notes: lead.notes,
      notification_id: lead.notification_id,
    })
    setIsModalOpen(true)
  }

  const openInfoModal = (lead: LeadWithSalesName) => {
    setSelectedLead(lead)
    setIsInfoModalOpen(true)
  }

  const openDeleteModal = (lead: LeadWithSalesName) => {
    setSelectedLead(lead)
    setIsDeleteModalOpen(true)
  }

  const openFilterModal = () => {
    setIsFilterModalOpen(true)
  }

  const openTransferModal = (lead: LeadWithSalesName) => {
    setSelectedLead(lead)
    setTransferSalesId(null)
    setIsTransferModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsDeleteModalOpen(false)
    setIsInfoModalOpen(false)
    setIsFilterModalOpen(false)
    setIsTransferModalOpen(false)
  }

  const resetFilters = () => {
    setFilterOptions(initialFilterOptions)
    setIsFiltered(false)

    // Reload leads based on user role
    if (employee?.role === "ADMIN") {
      loadLeads()
    } else if (employee?.role === "SALES" && employee?.id) {
      loadLeadsBySalesId(Number.parseInt(employee.id))
    }
  }

  const applyFilters = () => {
    // If only salesId filter is applied, use the dedicated API endpoint
    if (
      filterOptions.salesId &&
      !filterOptions.state &&
      !filterOptions.substate &&
      !filterOptions.budget &&
      !filterOptions.source &&
      filterOptions.isCreatedBySales === null
    ) {
      loadLeadsBySalesId(filterOptions.salesId)
    } else {
      setIsFiltered(Object.values(filterOptions).some((value) => value !== null))
    }
    closeModal()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (selectedLead) {
        // Update existing lead
        await updateLead(
          Number(selectedLead.id),
          formData.name,
          formData.number,
          formData.source,
          formData.address,
          formData.state,
          formData.substate || undefined,
          selectedLead.sales_id,
          formData.budget,
          formData.notes,
          selectedLead.is_created_by_sales,
          formData.notification_id,
        )
        toast.success("تم تحديث بيانات العميل بنجاح")
      } else {
        // Create new lead
        const isCreatedBySales = employee?.role.toUpperCase() === "SALES"
        // const salesId = isCreatedBySales ? Number(employee.id) : null

        await createLead(
          formData.name,
          formData.number,
          formData.source,
          formData.address,
          formData.state,
          formData.substate || "",
          formData.budget,
          formData.notes,
          isCreatedBySales,
          formData.notification_id,
        )
        toast.success("تم إضافة العميل بنجاح")
      }

      closeModal()

      // Reload leads based on user role
      if (employee?.role === "ADMIN") {
        loadLeads()
      } else if (employee?.role === "SALES" && employee?.id) {
        loadLeadsBySalesId(Number.parseInt(employee.id))
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حفظ بيانات العميل")
    }
  }

  const handleDelete = async () => {
    if (!selectedLead) return

    try {
      await deleteLead(Number(selectedLead.id))
      toast.success("تم حذف العميل بنجاح")
      closeModal()

      // Reload leads based on user role
      if (employee?.role === "ADMIN") {
        loadLeads()
      } else if (employee?.role === "SALES" && employee?.id) {
        loadLeadsBySalesId(Number.parseInt(employee.id))
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء حذف العميل")
    }
  }

  const handleTransfer = async () => {
    if (!selectedLead || !transferSalesId) return

    try {
      await transferLead(Number(selectedLead.id), transferSalesId)
      toast.success("تم نقل العميل بنجاح")
      closeModal()

      // Reload leads based on user role
      if (employee?.role === "ADMIN") {
        loadLeads()
      } else if (employee?.role === "SALES" && employee?.id) {
        loadLeadsBySalesId(Number.parseInt(employee.id))
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء نقل العميل")
    }
  }

  // Get sales person name by ID
  const getSalesPersonName = (lead: LeadWithSalesName) => {
    if (!lead.sales_id) return "غير معين"

    // If the lead already has a salesName property, use it
    if (lead.salesName) return lead.salesName

    // Otherwise, try to get it from the employee map
    if (employeeMap[lead.sales_id.toString()]) {
      return employeeMap[lead.sales_id.toString()]
    }

    // If all else fails, return a generic name
    return `مندوب ${lead.sales_id}`
  }

  // Get CSS class based on lead state
  const getLeadCardClass = (state: string) => {
    const upperState = state.toUpperCase()
    if (upperState === "NEW") {
      return `${styles.leadCard} ${styles.newLead}`
    } else if (upperState === "CONTACTED" || upperState === "FOLLOW_UP") {
      return `${styles.leadCard} ${styles.contactedLead}`
    } else if (upperState === "INTERESTED" || upperState === "VISITING" || upperState === "MEETING") {
      return `${styles.leadCard} ${styles.interestedLead}`
    } else if (upperState === "NEGOTIATING" || upperState === "QUALIFIED") {
      return `${styles.leadCard} ${styles.qualifiedLead}`
    } else if (upperState === "CLOSED_WON") {
      return `${styles.leadCard} ${styles.wonLead}`
    } else if (upperState === "CLOSED_LOST") {
      return `${styles.leadCard} ${styles.lostLead}`
    }
    return styles.leadCard
  }

  // Get CSS class for list item based on lead state
  const getLeadListItemClass = (state: string) => {
    const upperState = state.toUpperCase()
    if (upperState === "NEW") {
      return `${styles.leadListItem} ${styles.newLead}`
    } else if (upperState === "CONTACTED" || upperState === "FOLLOW_UP") {
      return `${styles.leadListItem} ${styles.contactedLead}`
    } else if (upperState === "INTERESTED" || upperState === "VISITING" || upperState === "MEETING") {
      return `${styles.leadListItem} ${styles.interestedLead}`
    } else if (upperState === "NEGOTIATING" || upperState === "QUALIFIED") {
      return `${styles.leadListItem} ${styles.qualifiedLead}`
    } else if (upperState === "CLOSED_WON") {
      return `${styles.leadListItem} ${styles.wonLead}`
    } else if (upperState === "CLOSED_LOST") {
      return `${styles.leadListItem} ${styles.lostLead}`
    }
    return styles.leadListItem
  }

  return (
    <div className={styles.leadsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>إدارة العملاء</h1>
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
          <button className={styles.filterButton} onClick={openFilterModal}>
            <Filter size={18} />
            <span>تصفية</span>
            {isFiltered && <span className={styles.filterBadge}></span>}
          </button>
          <button className={styles.addButton} onClick={openCreateModal} disabled={isLoadingLeads}>
            <Plus size={18} />
            <span>إضافة عميل</span>
          </button>
        </div>
      </div>

      {isLoadingLeads || isLoadingEmployees || isLoadingLeadsBySalesId ? (
        <Loading isVisible={true} />
      ) : filteredAndSortedLeads.length === 0 ? (
        <div className={styles.emptyState}>
          {searchQuery || isFiltered ? (
            <>
              <p>لا توجد نتائج مطابقة للبحث</p>
              {isFiltered && (
                <button className={styles.resetButton} onClick={resetFilters}>
                  إعادة ضبط التصفية
                </button>
              )}
            </>
          ) : (
            <>
              <p>لا يوجد عملاء حالياً</p>
              <button className={styles.addButton} onClick={openCreateModal}>
                <Plus size={18} />
                <span>إضافة عميل</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {isFiltered && (
            <div className={styles.filterIndicator}>
              <span>تم تطبيق التصفية</span>
              <button className={styles.resetButton} onClick={resetFilters}>
                إعادة ضبط
              </button>
            </div>
          )}

          {viewMode === "cards" ? (
            <div className={styles.leadsGrid}>
              {filteredAndSortedLeads.map((lead) => (
                <div key={lead.id} className={getLeadCardClass(lead.state)}>
                  <div className={`${styles.leadHeader} ${styles[lead.state.toLowerCase() + "Header"]}`}>
                    <h3 className={styles.leadName}>{lead.name}</h3>
                    <div className={styles.actions}>
                      <button className={styles.infoButton} onClick={() => openInfoModal(lead)} aria-label="معلومات">
                        <Info size={18} />
                      </button>
                    {employee?.role == 'ADMIN' && (<>
                      <button className={styles.editButton} onClick={() => openEditModal(lead)} aria-label="تعديل">
                        <Edit size={18} />
                      </button>
                      <button className={styles.deleteButton} onClick={() => openDeleteModal(lead)} aria-label="حذف">
                        <Trash2 size={18} />
                      </button>
                    </>)}

                    </div>
                  </div>

                  <div className={styles.leadDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>رقم الهاتف:</span>
                      <div className={styles.phoneActions}>
                        <span className={styles.detailValue}>{lead.number}</span>
                        <div className={styles.phoneButtons}>
                          <a href={`tel:${lead.number}`} className={styles.callButton} aria-label="اتصال">
                            <Phone size={16} />
                          </a>
                          <a
                            href={`https://wa.me/${lead.number.replace(/\+/g, "").replace(/\s/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.whatsappButton}
                            aria-label="واتساب"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    </div>
                    {employee?.role == 'ADMIN' && (<>

                    {lead.sales_id && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>المندوب:</span>
                        <span className={styles.detailValue}>{getSalesPersonName(lead)}</span>
                      </div>
                    )}
                    </>)}

                    <div className={styles.actionButtons}>
                    {employee?.role == 'ADMIN' && (<>
                
                      <div className={styles.transferButton} onClick={() => openTransferModal(lead)}>
                        <UserPlus size={16} />
                        <span>تحويل</span>
                      </div>
                    </>)}

                      <a href={`/leads/${lead.id}`} className={styles.detailsButton}>
                        <Info size={16} />
                        <span>بيانات مفصلة</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.leadsList}>
              {filteredAndSortedLeads.map((lead) => (
                <div key={lead.id} className={getLeadListItemClass(lead.state)}>
                  <div className={styles.leadListHeader}>
                    <h3 className={styles.leadName}>{lead.name}</h3>
                    <div className={styles.actions}>

                      <button className={styles.infoButton} onClick={() => openInfoModal(lead)} aria-label="معلومات">
                        <Info size={18} />
                      </button>
                    {employee?.role == 'ADMIN' && (<>
                      <button className={styles.editButton} onClick={() => openEditModal(lead)} aria-label="تعديل">
                        <Edit size={18} />
                      </button>
                      <button className={styles.deleteButton} onClick={() => openDeleteModal(lead)} aria-label="حذف">
                        <Trash2 size={18} />
                      </button>
                    </>)}
                    </div>
                  </div>

                  <div className={styles.leadListContent}>
                    <div className={styles.leadListDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>رقم الهاتف:</span>
                        <div className={styles.phoneActions}>
                          <span className={styles.detailValue}>{lead.number}</span>
                          <div className={styles.phoneButtons}>
                            <a href={`tel:${lead.number}`} className={styles.callButton} aria-label="اتصال">
                              <Phone size={16} />
                            </a>
                            <a
                              href={`https://wa.me/${lead.number.replace(/\+/g, "").replace(/\s/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.whatsappButton}
                              aria-label="واتساب"
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>الحالة:</span>
                        <span className={`${styles.detailValue} ${styles[lead.state.toLowerCase() + "State"]}`}>
                          {stateTranslations[lead.state] || lead.state}
                        </span>
                      </div>
                    {employee?.role == 'ADMIN' && (<>
                      {lead.sales_id && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>المندوب:</span>
                          <span className={styles.detailValue}>{getSalesPersonName(lead)}</span>
                        </div>
                      )}
                    </>)}

                    </div>
                    <div className={styles.leadListActions}>
                    {employee?.role == 'ADMIN' && (<>
                    
                      <div className={styles.transferButton} onClick={() => openTransferModal(lead)}>
                        <UserPlus size={16} />
                        <span>تحويل</span>
                      </div>
                    </>)}

                      <a href={`/leads/${lead.id}`} className={styles.detailsButton}>
                        <Info size={16} />
                        <span>بيانات مفصلة</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Lead Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{selectedLead ? "تعديل بيانات العميل" : "إضافة عميل جديد"}</h2>
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
                  placeholder="أدخل اسم العميل"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="number">رقم الهاتف</label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل رقم الهاتف"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="source">المصدر</label>
                <select id="source" name="source" value={formData.source} onChange={handleInputChange} required>
                  {Object.entries(sourceTranslations).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">العنوان</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل العنوان"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="state">الحالة</label>
                <select id="state" name="state" value={formData.state} onChange={handleInputChange} required>
                  {Object.entries(stateTranslations).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              {stateToSubstate[formData.state]?.length > 0 && (
                <div className={styles.formGroup}>
                  <label htmlFor="substate">الحالة الفرعية</label>
                  <select id="substate" name="substate" value={formData.substate || ""} onChange={handleInputChange}>
                    {stateToSubstate[formData.state].map((substate) => (
                      <option key={substate} value={substate}>
                        {substateTranslations[substate]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="budget">الميزانية</label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget?.toString() || ""}
                  onChange={handleInputChange}
                >
                  <option value="">غير محدد</option>
                  {budgetRanges.map((range) => (
                    <option key={range.value} value={range.value.toString()}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notes">ملاحظات</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  placeholder="أدخل ملاحظات (اختياري)"
                  rows={3}
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
                    <span>{selectedLead ? "تحديث" : "إضافة"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Info Modal */}
      {isInfoModalOpen && selectedLead && (
        <div className={styles.modalOverlay}>
          <div className={styles.infoModal}>
            <div className={`${styles.modalHeader} ${styles[selectedLead.state.toLowerCase() + "Header"]}`}>
              <h2>معلومات العميل</h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.infoContent}>
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>المعلومات الأساسية</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>الرقم التعريفي:</span>
                  <span className={styles.infoValue}>{selectedLead.id}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>الاسم:</span>
                  <span className={styles.infoValue}>{selectedLead.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>رقم الهاتف:</span>
                  <div className={styles.phoneActions}>
                    <span className={styles.infoValue}>{selectedLead.number}</span>
                    <div className={styles.phoneButtons}>
                      <a href={`tel:${selectedLead.number}`} className={styles.callButton} aria-label="اتصال">
                        <Phone size={16} />
                      </a>
                      <a
                        href={`https://wa.me/${selectedLead.number.replace(/\+/g, "").replace(/\s/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.whatsappButton}
                        aria-label="واتساب"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>العنوان:</span>
                  <span className={styles.infoValue}>{selectedLead.address}</span>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>حالة العميل</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>الحالة:</span>
                  <span className={`${styles.infoValue} ${styles[selectedLead.state.toLowerCase() + "State"]}`}>
                    {stateTranslations[selectedLead.state] || selectedLead.state}
                  </span>
                </div>
                {selectedLead.substate && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>الحالة الفرعية:</span>
                    <span className={styles.infoValue}>
                      {substateTranslations[selectedLead.substate] || selectedLead.substate}
                    </span>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>المصدر:</span>
                  <span className={styles.infoValue}>
                    {sourceTranslations[selectedLead.source] || selectedLead.source}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>الميزانية:</span>
                  <span className={styles.infoValue}>{formatBudget(selectedLead.budget)}</span>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>معلومات إضافية</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>مسؤول المبيعات:</span>
                  <span className={styles.infoValue}>{getSalesPersonName(selectedLead)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>تم إنشاؤه بواسطة:</span>
                  <span className={styles.infoValue}>
                    {selectedLead.is_created_by_sales ? "فريق المبيعات" : "النظام"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>تاريخ الإنشاء:</span>
                  <span className={styles.infoValue}>{formatDate(selectedLead.created_at.toString())}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>آخر تحديث:</span>
                  <span className={styles.infoValue}>{formatDate(selectedLead.updated_at.toString())}</span>
                </div>
              </div>

              {selectedLead.notes && (
                <div className={styles.infoSection}>
                  <h3 className={styles.sectionTitle}>ملاحظات</h3>
                  <div className={styles.notesBox}>{selectedLead.notes}</div>
                </div>
              )}
            </div>

            <div className={styles.infoActions}>
              <button className={styles.closeInfoButton} onClick={closeModal}>
                إغلاق
              </button>
              {employee?.role == 'ADMIN' && (<>
              <button
                className={styles.editInfoButton}
                onClick={() => {
                  closeModal()
                  openEditModal(selectedLead)
                }}
              >
                تعديل
              </button>
              </>)}
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>تصفية العملاء</h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.filterForm}>
              <div className={styles.formGroup}>
                <label htmlFor="salesId">مسؤول المبيعات</label>
                <select
                  id="salesId"
                  name="salesId"
                  value={filterOptions.salesId?.toString() || ""}
                  onChange={handleFilterChange}
                >
                  <option value="">الكل</option>
                  {employees
                    .filter((emp) => emp.role.toUpperCase() === "SALES" || emp.role.toUpperCase() === "ADMIN")
                    .map((emp) => (
                      <option key={emp.id} value={emp.id.toString()}>
                        {emp.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="state">الحالة</label>
                <select id="state" name="state" value={filterOptions.state || ""} onChange={handleFilterChange}>
                  <option value="">الكل</option>
                  {Object.entries(stateTranslations).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              {filterOptions.state && stateToSubstate[filterOptions.state]?.length > 0 && (
                <div className={styles.formGroup}>
                  <label htmlFor="substate">الحالة الفرعية</label>
                  <select
                    id="substate"
                    name="substate"
                    value={filterOptions.substate || ""}
                    onChange={handleFilterChange}
                  >
                    <option value="">الكل</option>
                    {stateToSubstate[filterOptions.state].map((substate) => (
                      <option key={substate} value={substate}>
                        {substateTranslations[substate]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="source">المصدر</label>
                <select id="source" name="source" value={filterOptions.source || ""} onChange={handleFilterChange}>
                  <option value="">الكل</option>
                  {Object.entries(sourceTranslations).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="budget">الميزانية</label>
                <select
                  id="budget"
                  name="budget"
                  value={filterOptions.budget?.toString() || ""}
                  onChange={handleFilterChange}
                >
                  <option value="">الكل</option>
                  {budgetRanges.map((range) => (
                    <option key={range.value} value={range.value.toString()}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="isCreatedBySales">تم إنشاؤه بواسطة</label>
                <select
                  id="isCreatedBySales"
                  name="isCreatedBySales"
                  value={filterOptions.isCreatedBySales === null ? "" : filterOptions.isCreatedBySales.toString()}
                  onChange={handleFilterChange}
                >
                  <option value="">الكل</option>
                  <option value="true">فريق المبيعات</option>
                  <option value="false">النظام</option>
                </select>
              </div>

              <div className={styles.filterActions}>
                <button type="button" className={styles.resetFilterButton} onClick={resetFilters}>
                  إعادة ضبط
                </button>
                <button type="button" className={styles.applyFilterButton} onClick={applyFilters}>
                  تطبيق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Lead Modal */}
      {isTransferModalOpen && selectedLead && (
        <div className={styles.modalOverlay}>
          <div className={styles.transferModal}>
            <h2>تحويل العميل</h2>
            <p>اختر مسؤول المبيعات الذي تريد تحويل العميل "{selectedLead.name}" إليه.</p>

            <div className={styles.formGroup}>
              <label htmlFor="transferSalesId">مسؤول المبيعات</label>
              <select
                id="transferSalesId"
                value={transferSalesId?.toString() || ""}
                onChange={(e) => setTransferSalesId(e.target.value ? Number.parseInt(e.target.value) : null)}
                required
              >
                <option value="">اختر مسؤول المبيعات</option>
                {employees
                  .filter((emp) => emp.role.toUpperCase() === "SALES" && emp.id !== selectedLead.sales_id)
                  .map((emp) => (
                    <option key={emp.id} value={emp.id.toString()}>
                      {emp.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className={styles.transferActions}>
              <button className={styles.cancelButton} onClick={closeModal} disabled={isTransferring}>
                إلغاء
              </button>
              <button
                className={styles.transferConfirmButton}
                onClick={handleTransfer}
                disabled={isTransferring || !transferSalesId}
              >
                {isTransferring ? (
                  <>
                    <Loading isVisible={true} />
                    <span>جاري التحويل...</span>
                  </>
                ) : (
                  <span>تأكيد التحويل</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedLead && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h2>تأكيد الحذف</h2>
            <p>
              هل أنت متأكد من رغبتك في حذف العميل "{selectedLead.name}"؟
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

export default LeadsPage
