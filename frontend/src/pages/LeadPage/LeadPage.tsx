"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Info, Plus, X, Search, ArrowRight, List, Grid, MessageCircle, Image } from "lucide-react"
import { useGetActionsByCustomerId, type Action } from "../../hooks/Actions/useGetActionsByCustomerId"
import { useGetLead, type Lead } from "../../hooks/Leads/useGetLead"
import { useGetEmployee } from "../../hooks/Employees/useGetEmployee"
import { useGetProject } from "../../hooks/Projects/useGetProject"
import { useGetUnitById } from "../../hooks/Units/useGetUnitById"
import { useGetAllProjects } from "../../hooks/Projects/useGetAllProjects"
import { useGetUnitByProjectId } from "../../hooks/Units/useGetUnitByProjectId"
import { useCreateAction } from "../../hooks/Actions/useCreateAction"
import { useCreateTask } from "../../hooks/Tasks/useCreateTask"
import { useUpdateUnit } from "../../hooks/Units/useUpdateUnit"
import { useUpdateProject } from "../../hooks/Projects/useUpdateProject"
import { useSendWhatsapp } from "../../hooks/whatsapp/useSendWhatsapp"
import Loading from "../../components/Loading/Loading"
import styles from "./LeadPage.module.css"
import { useAuth } from "../../contexts/auth"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface ActionWithDetails extends Action {
  salesName?: string
  projectName?: string
  unitName?: string
  leadName?: string
}

const LeadActions: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>()
  const numericLeadId = Number.parseInt(leadId || "0", 10)
  const { employee } = useAuth()
  const isAdmin = employee?.role === "ADMIN"

  // Define states requiring task
  const statesRequiringTask = ["VISITING", "MEETING", "FOLLOW_UP"]

  // State
  const [actions, setActions] = useState<ActionWithDetails[]>([])
  const [filteredActions, setFilteredActions] = useState<ActionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards")
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSendUnitModalOpen, setIsSendUnitModalOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<ActionWithDetails | null>(null)
  const [lead, setLead] = useState<Lead | null>(null)
  const [allProjects, setAllProjects] = useState<any[]>([])
  const [projectUnits, setProjectUnits] = useState<any[]>([])
  const [lastAction, setLastAction] = useState<ActionWithDetails | null>(null)

  // Form state
  const [newAction, setNewAction] = useState({
    salesId: 0,
    prevState: "NEW",
    prevSubstate: "",
    newState: "NEW",
    newSubstate: "",
    projectId: null as number | null,
    unitId: null as number | null,
    notes: "",
  })

  // Task modal state
  const [taskForm, setTaskForm] = useState({
    name: "",
    dueDate: "",
    dueTime: "10:00",
  })

  // Send Unit state
  const [sendUnitForm, setSendUnitForm] = useState({
    projectId: null as number | null,
    unitId: null as number | null,
    messageTemplate: "",
    mediaUrls: [] as string[]
  })

  // API Hooks
  const { execute: createTask } = useCreateTask()
  const { execute: fetchActions, isLoading: isLoadingActions } = useGetActionsByCustomerId()
  const { execute: fetchLead } = useGetLead()
  const { execute: fetchEmployee } = useGetEmployee()
  const { execute: fetchProject } = useGetProject()
  const { execute: fetchUnit } = useGetUnitById()
  const { execute: fetchAllProjects } = useGetAllProjects()
  const { execute: fetchUnitsByProject } = useGetUnitByProjectId()
  const { execute: createAction, isLoading: isCreatingAction } = useCreateAction()
  const { execute: updateUnit } = useUpdateUnit()
  const { execute: updateProject } = useUpdateProject()
  const { sendUnit, generateMessageTemplate, isLoading: isSendingWhatsapp } = useSendWhatsapp()

  // Load lead data and actions when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        if (numericLeadId) {
          const leadData = await fetchLead(numericLeadId)
          setLead(leadData)

          const actionsData = await fetchActions(numericLeadId)

          // Fetch additional details for each action
          const actionsWithDetails = await Promise.all(
            actionsData.map(async (action: Action) => {
              const actionWithDetails: ActionWithDetails = { ...action }

              try {
                if (action.sales_id) {
                  const salesData = await fetchEmployee(action.sales_id)
                  actionWithDetails.salesName = salesData.name
                }

                if (action.project_id) {
                  const projectData = await fetchProject(action.project_id)
                  actionWithDetails.projectName = projectData.name
                }

                if (action.unit_id) {
                  const unitData = await fetchUnit(action.unit_id)
                  actionWithDetails.unitName = unitData.name
                }

                actionWithDetails.leadName = leadData.name
              } catch (error) {
                console.error("Error fetching action details:", error)
              }

              return actionWithDetails
            }),
          )

          setActions(actionsWithDetails)
          setFilteredActions(actionsWithDetails)

          // Set the last action for reference
          if (actionsWithDetails.length > 0) {
            // Sort by created_at in descending order to get the most recent action
            const sortedActions = [...actionsWithDetails].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            )
            setLastAction(sortedActions[0])
          }

          // Load projects for the create action form
          const projects = await fetchAllProjects()
          setAllProjects(projects)

          // Use nullish coalescing to provide 0 if sales_id is null/undefined
          setNewAction((prev) => ({
            ...prev,
            salesId: leadData.sales_id ?? 0,
          }))
        }
      } catch (error) {
        console.error("Error loading lead data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [numericLeadId, fetchActions, fetchLead, fetchEmployee, fetchProject, fetchUnit, fetchAllProjects])

  // Filter actions based on search query
  useEffect(() => {
    let filtered = [...actions]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (action) =>
          action.notes?.toLowerCase().includes(query) ||
          action.leadName?.toLowerCase().includes(query) ||
          action.salesName?.toLowerCase().includes(query) ||
          action.projectName?.toLowerCase().includes(query) ||
          action.unitName?.toLowerCase().includes(query) ||
          stateTranslations[action.new_state as keyof typeof stateTranslations]?.toLowerCase().includes(query) ||
          stateTranslations[action.prev_state as keyof typeof stateTranslations]?.toLowerCase().includes(query),
      )
    }

    setFilteredActions(filtered)
  }, [searchQuery, actions])

  // Handle project selection in create form
  const handleProjectChange = async (projectId: number) => {
    setNewAction((prev) => ({ ...prev, projectId, unitId: null }))
    if (projectId) {
      try {
        const units = await fetchUnitsByProject(projectId)
        // Filter only available units (not SOLD)
        const availableUnits = units.filter((unit: any) => unit.status !== "SOLD")
        setProjectUnits(availableUnits)
      } catch (error) {
        console.error("Error fetching units:", error)
        setProjectUnits([])
      }
    } else {
      setProjectUnits([])
    }
  }

  // Handle state change
  const handleStateChange = (state: string) => {
    setNewAction((prev) => ({
      ...prev,
      newState: state,
      newSubstate: "",
    }))

    // Check if state requires scheduling a task
    if (statesRequiringTask.includes(state)) {
      // Set default task name based on the selected state
      const taskNames = {
        VISITING: "زيارة للعميل",
        MEETING: "اجتماع مع العميل",
        FOLLOW_UP: "متابعة مع العميل",
      }

      // Set tomorrow's date as default
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const formattedDate = tomorrow.toISOString().split("T")[0]

      setTaskForm({
        name: taskNames[state as keyof typeof taskNames],
        dueDate: formattedDate,
        dueTime: "10:00",
      })
    }
  }

  // Open info modal
  const openInfoModal = (action: ActionWithDetails) => {
    setSelectedAction(action)
    setIsInfoModalOpen(true)
  }

  // Open create modal
  const openCreateModal = () => {
    // If there's a last action, use its new state as the prev state for the new action
    if (lastAction) {
      setNewAction((prev) => ({
        ...prev,
        prevState: lastAction.new_state || "", // Add fallback to "NEW"
        prevSubstate: lastAction.new_substate || "",
        salesId: lead?.sales_id || 0,
      }))
    } else if (lead?.state) {
      // Otherwise use the lead's current state
      setNewAction((prev) => ({
        ...prev,
        prevState: lead.state || "", // Add fallback to "NEW"
        prevSubstate: lead.substate || "",
        salesId: lead.sales_id || 0,
      }))
    }
    setIsCreateModalOpen(true)
  }

  // Open send unit modal
  const openSendUnitModal = () => {
    setSendUnitForm({
      projectId: null,
      unitId: null,
      messageTemplate: "",
      mediaUrls: []
    })
    setIsSendUnitModalOpen(true)
  }

  // Close all modals
  const closeModals = () => {
    setIsInfoModalOpen(false)
    setIsCreateModalOpen(false)
    setIsSendUnitModalOpen(false)
    setSelectedAction(null)
  }

  // Calculate notification timestamps
  const calculateNotificationTimes = (dueDate: string, dueTime: string) => {
    // Create a Date object from the due date and time (local time)
    const dueDateObj = new Date(`${dueDate}T${dueTime}:00`);
    
    // Add 2 hours to account for timezone difference
    const adjustedDueDate = new Date(dueDateObj);
    adjustedDueDate.setHours(adjustedDueDate.getHours() );
    
    // Calculate day before notification (previous day at 10 PM)
    const dayBeforeDate = new Date(dueDateObj);
    // Set to previous day
    dayBeforeDate.setDate(dayBeforeDate.getDate() - 1);
    // Set time to 10 PM
    dayBeforeDate.setHours(22, 0, 0, 0);
    
    // Calculate hour before notification (exactly 1 hour before the due date)
    const hourBeforeDate = new Date(adjustedDueDate);
    // Set to 1 hour before
    hourBeforeDate.setHours(hourBeforeDate.getHours() - 1);
    
    console.log('Due Date Input:', dueDate, dueTime);
    console.log('Due Date Object:', dueDateObj.toISOString());
    console.log('Adjusted Due Date (+2h):', adjustedDueDate.toISOString());
    console.log('Day Before (Previous day 10 PM):', dayBeforeDate.toISOString());
    console.log('Hour Before (1h before due):', hourBeforeDate.toISOString());

    return {
      dueDateIso: adjustedDueDate.toISOString(),
      dayBeforeIso: dayBeforeDate.toISOString(),
      hourBeforeIso: hourBeforeDate.toISOString(),
    };
  };

  // Handle create action form submission
  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!numericLeadId || !newAction.salesId) {
        throw new Error("Missing required fields")
      }

      // Check if unit and project are required
      if (newAction.newState === "CLOSED_WON" && (!newAction.projectId || !newAction.unitId)) {
        alert("يجب اختيار المشروع والوحدة عند إغلاق الصفقة بنجاح")
        return
      }

      // If not requiring a task, proceed with action creation
      // For states requiring task, the form will already include the task fields
      await createActionAndRefresh(statesRequiringTask.includes(newAction.newState) ? taskForm : undefined)
    } catch (error) {
      console.error("Error creating action:", error)
      alert("حدث خطأ أثناء إنشاء الإجراء")
    }
  }

  // Create action and refresh data
  const createActionAndRefresh = async (taskData?: {
    name: string
    dueDate: string
    dueTime: string
  }) => {
    // Create the action
    const actionResponse = await createAction(
      numericLeadId,
      newAction.salesId,
      newAction.prevState,
      newAction.newState,
      newAction.prevSubstate,
      newAction.newSubstate,
      newAction.projectId || undefined,
      newAction.unitId || undefined,
      newAction.notes || undefined,
    )

    // Create a task if taskData is provided
    if (taskData) {
      const { dueDateIso, dayBeforeIso, hourBeforeIso } = calculateNotificationTimes(taskData.dueDate, taskData.dueTime)

      await createTask(
        taskData.name,
        numericLeadId,
        newAction.salesId,
        actionResponse.id,
        dueDateIso,
        dayBeforeIso,
        hourBeforeIso,
      )
    }

    // If CLOSED_WON, update the unit status and project sold count
    if (newAction.newState === "CLOSED_WON" && newAction.unitId && newAction.projectId) {
      const today = new Date().toISOString()

      // Update only the status and sold_date fields of the unit
      await updateUnit(newAction.unitId, {
        status: "SOLD",
        sold_date: today
      })

      // Update the project's sold count
      // Create a FormData object with only the sold_count field
      const projectFormData = new FormData()

      // Get the current project to get its current sold count
      const currentProject = await fetchProject(newAction.projectId)
      const newSoldCount = (currentProject.sold_count || 0) + 1

      // Add the sold_count field to the FormData
      projectFormData.append("sold_count", newSoldCount.toString())

      // Update the project
      await updateProject(newAction.projectId, projectFormData)
    }

    // Refresh the action list
    const actionsData = await fetchActions(numericLeadId)

    // Fetch additional details for each action
    const actionsWithDetails = await Promise.all(
      actionsData.map(async (action: Action) => {
        const actionWithDetails: ActionWithDetails = { ...action }

        try {
          if (action.sales_id) {
            const salesData = await fetchEmployee(action.sales_id)
            actionWithDetails.salesName = salesData.name
          }

          if (action.project_id) {
            const projectData = await fetchProject(action.project_id)
            actionWithDetails.projectName = projectData.name
          }

          if (action.unit_id) {
            const unitData = await fetchUnit(action.unit_id)
            actionWithDetails.unitName = unitData.name
          }

          actionWithDetails.leadName = lead?.name || ""
        } catch (error) {
          console.error("Error fetching action details:", error)
        }

        return actionWithDetails
      }),
    )

    setActions(actionsWithDetails)
    setFilteredActions(actionsWithDetails)

    // Update the last action
    if (actionsWithDetails.length > 0) {
      const sortedActions = [...actionsWithDetails].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      setLastAction(sortedActions[0])
    }

    // Reset form and close modal
    setNewAction({
      salesId: lead?.sales_id || 0,
      prevState: lastAction?.new_state || lead?.state || "NEW",
      prevSubstate: lastAction?.new_substate || lead?.substate || "",
      newState: "NEW",
      newSubstate: "",
      projectId: null,
      unitId: null,
      notes: "",
    })
    closeModals()

    // Refresh projects list
    const projects = await fetchAllProjects()
    setAllProjects(projects)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  // Lead state translations
  const stateTranslations: Record<string, string> = {
    NEW: " جديد ",
    CONTACTED: " تم التواصل ",
    INTERESTED: " مهتم ",
    VISITING: " زيارة ",
    MEETING: " اجتماع ",
    NEGOTIATING: " تفاوض ",
    QUALIFIED: " مؤهل ",
    CLOSED_WON: " تم الإغلاق (نجاح) ",
    CLOSED_LOST: " تم الإغلاق (خسارة) ",
    FOLLOW_UP: " متابعة ",
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
    CALLBACK_REQUESTED: "طلب معاودة الاتصال ",
    NO_ANSWER: "لا يوجد رد ",
    WRONG_NUMBER: "رقم خاطئ ",

    // Interested
    HIGH_INTEREST: "اهتمام عالي ",
    MEDIUM_INTEREST: "اهتمام متوسط ",
    LOW_INTEREST: "اهتمام منخفض ",

    // Visiting/Meeting
    SCHEDULED: "مجدول ",
    COMPLETED: "مكتمل ",
    CANCELLED: "ملغي ",

    // Negotiating
    PRICE_DISCUSSION: "مناقشة السعر ",
    PAYMENT_PLAN: "خطة الدفع ",
    FINAL_OFFER: "العرض النهائي ",

    // Qualified
    READY_TO_BUY: "جاهز للشراء ",
    NEEDS_FINANCING: "يحتاج تمويل ",
    CONSIDERING_OPTIONS: "يدرس الخيارات ",

    // Closed Won
    FULL_PAYMENT: "دفع كامل ",
    INSTALLMENT_PLAN: "خطة أقساط ",

    // Closed Lost
    PRICE_ISSUE: "مشكلة في السعر ",
    LOCATION_ISSUE: "مشكلة في الموقع ",
    COMPETITOR: "ذهب لمنافس ",
    NOT_INTERESTED: "غير مهتم ",
    OTHER: "أخرى ",

    // Follow Up
    PENDING: "قيد الانتظار ",
  }

  // Handle project selection in send unit form
  const handleSendUnitProjectChange = async (projectId: number) => {
    setSendUnitForm((prev) => ({ ...prev, projectId, unitId: null }))
    if (projectId) {
      try {
        const units = await fetchUnitsByProject(projectId)
        // Get all units, not just available ones
        setProjectUnits(units)
      } catch (error) {
        console.error("Error fetching units:", error)
        setProjectUnits([])
      }
    } else {
      setProjectUnits([])
    }
  }

  // Handle unit selection in send unit form
  const handleSendUnitChange = async (unitId: string) => {
    if (!unitId) {
      setSendUnitForm((prev) => ({
        ...prev,
        unitId: null,
        messageTemplate: "",
        mediaUrls: []
      }));
      return;
    }

    try {
      const numericUnitId = parseInt(unitId, 10);
      setSendUnitForm((prev) => ({
        ...prev,
        unitId: numericUnitId
      }));

      // Generate message template
      const { messageTemplate, mediaUrls } = await generateMessageTemplate(numericUnitId);
      
      setSendUnitForm((prev) => ({
        ...prev,
        unitId: numericUnitId,
        messageTemplate,
        mediaUrls
      }));
    } catch (error) {
      console.error("Error generating message template:", error);
      toast.error("حدث خطأ أثناء تحميل بيانات الوحدة");
    }
  };

  // Handle message template change
  const handleMessageTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSendUnitForm((prev) => ({
      ...prev,
      messageTemplate: e.target.value
    }));
  };

  // Handle send unit form submission
  const handleSendUnit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!numericLeadId || !lead?.number || !sendUnitForm.unitId || !sendUnitForm.messageTemplate) {
        toast.error("يجب ملء جميع الحقول المطلوبة");
        return;
      }

      await sendUnit({
        clientPhoneNumber: lead.number,
        unitId: sendUnitForm.unitId,
        salesId: lead.sales_id || 0,
        customMessage: sendUnitForm.messageTemplate,
        mediaUrls: sendUnitForm.mediaUrls
      });

      // Show success message
      toast.success("تم إرسال معلومات الوحدة بنجاح");
      
      // Create an action to record this interaction
      await createAction(
        numericLeadId,
        lead.sales_id || 0,
        lead.state || "NEW",
        lead.state || "NEW",
        lead.substate || "",
        lead.substate || "",
        sendUnitForm.projectId || undefined,
        sendUnitForm.unitId || undefined,
        "تم إرسال بيانات الوحدة عبر واتساب"
      );
      
      // Refresh actions list
      const actionsData = await fetchActions(numericLeadId);
      const actionsWithDetails = await Promise.all(
        actionsData.map(async (action: Action) => {
          const actionWithDetails: ActionWithDetails = { ...action };
          try {
            if (action.sales_id) {
              const salesData = await fetchEmployee(action.sales_id);
              actionWithDetails.salesName = salesData.name;
            }

            if (action.project_id) {
              const projectData = await fetchProject(action.project_id);
              actionWithDetails.projectName = projectData.name;
            }

            if (action.unit_id) {
              const unitData = await fetchUnit(action.unit_id);
              actionWithDetails.unitName = unitData.name;
            }

            actionWithDetails.leadName = lead?.name || "";
          } catch (error) {
            console.error("Error fetching action details:", error);
          }
          return actionWithDetails;
        })
      );
      
      setActions(actionsWithDetails);
      setFilteredActions(actionsWithDetails);
      
      closeModals();
    } catch (error) {
      console.error("Error sending unit:", error);
      toast.error("حدث خطأ أثناء إرسال معلومات الوحدة");
    }
  }

  return (
    <div className={styles.actionsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>إجراءات العميل: {lead?.name}</h1>
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
          <button className={styles.sendUnitButton} onClick={openSendUnitModal}>
            <MessageCircle size={18} />
            <span>إرسال وحدة عبر واتساب</span>
          </button>
          <button className={styles.addButton} onClick={openCreateModal}>
            <Plus size={18} />
            <span>إضافة إجراء</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loading isVisible={true} />
      ) : filteredActions.length === 0 ? (
        <div className={styles.emptyState}>
          {searchQuery ? (
            <p>لا توجد نتائج مطابقة للبحث</p>
          ) : (
            <>
              <p>لا توجد إجراءات مسجلة لهذا العميل</p>
              <button className={styles.addButton} onClick={openCreateModal}>
                <Plus size={18} />
                <span>إضافة إجراء</span>
              </button>
            </>
          )}
        </div>
      ) : viewMode === "cards" ? (
        <div className={styles.actionsContainer}>
          {filteredActions.map((action) => (
            <div key={action.id} className={styles.actionCard}>
              <div className={styles.actionHeader}>
                <div className={styles.actionDate}>{formatDate(action.created_at.toString())}</div>
                <button className={styles.infoButton} onClick={() => openInfoModal(action)} aria-label="معلومات">
                  <Info size={18} />
                </button>
              </div>

              <div className={styles.actionContent}>
                <div className={styles.actionStatusFlow}>
                  <div className={styles.stateBox}>
                    <span className={styles.stateName}>{stateTranslations[action.prev_state || "NEW"]}</span>
                    {action.prev_substate && (
                      <span className={styles.substateName}>{substateTranslations[action.prev_substate]}</span>
                    )}
                  </div>

                  <ArrowRight className={styles.arrowIcon} size={20} />

                  <div
                    className={`${styles.stateBox} ${
                      action.new_state === "CLOSED_WON"
                        ? styles.successState
                        : action.new_state === "CLOSED_LOST"
                          ? styles.dangerState
                          : styles.activeState
                    }`}
                  >
                    <span className={styles.stateName}>{stateTranslations[action.new_state || "NEW"]}</span>
                    {action.new_substate && (
                      <span className={styles.substateName}>{substateTranslations[action.new_substate]}</span>
                    )}
                  </div>
                </div>

                <div className={styles.actionDetails}>
                  {isAdmin && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>المندوب:</span>
                      <span className={styles.detailValue}>{action.salesName || "غير محدد"}</span>
                    </div>
                  )}

                  {action.project_id && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>المشروع:</span>
                      <span className={styles.detailValue}>{action.projectName || "غير محدد"}</span>
                    </div>
                  )}

                  {action.unit_id && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>الوحدة:</span>
                      <span className={styles.detailValue}>{action.unitName || "غير محدد"}</span>
                    </div>
                  )}

                  {action.notes && (
                    <div className={styles.notesItem}>
                      <span className={styles.detailLabel}>ملاحظات:</span>
                      <span className={styles.notesText}>{action.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.actionsListContainer}>
          {filteredActions.map((action) => (
            <div key={action.id} className={styles.actionListItem}>
              <div className={styles.actionListHeader}>
                <div className={styles.actionDate}>{formatDate(action.created_at.toString())}</div>
                <button className={styles.infoButton} onClick={() => openInfoModal(action)} aria-label="معلومات">
                  <Info size={18} />
                </button>
              </div>

              <div className={styles.actionListContent}>
                <div className={styles.actionStatusFlow}>
                  <div className={styles.stateBox}>
                    <span className={styles.stateName}>{stateTranslations[action.prev_state || "NEW"]}</span>
                    {action.prev_substate && (
                      <span className={styles.substateName}>{substateTranslations[action.prev_substate]}</span>
                    )}
                  </div>

                  <ArrowRight className={styles.arrowIcon} size={20} />

                  <div
                    className={`${styles.stateBox} ${
                      action.new_state === "CLOSED_WON"
                        ? styles.successState
                        : action.new_state === "CLOSED_LOST"
                          ? styles.dangerState
                          : styles.activeState
                    }`}
                  >
                    <span className={styles.stateName}>{stateTranslations[action.new_state || "NEW"]}</span>
                    {action.new_substate && (
                      <span className={styles.substateName}>{substateTranslations[action.new_substate]}</span>
                    )}
                  </div>
                </div>

                <div className={styles.actionListDetails}>
                  <div className={styles.detailsRow}>
                    {isAdmin && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>المندوب:</span>
                        <span className={styles.detailValue}>{action.salesName || "غير محدد"}</span>
                      </div>
                    )}

                    {action.project_id && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>المشروع:</span>
                        <span className={styles.detailValue}>{action.projectName || "غير محدد"}</span>
                      </div>
                    )}

                    {action.unit_id && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>الوحدة:</span>
                        <span className={styles.detailValue}>{action.unitName || "غير محدد"}</span>
                      </div>
                    )}
                  </div>

                  {action.notes && (
                    <div className={styles.notesItem}>
                      <span className={styles.detailLabel}>ملاحظات:</span>
                      <span className={styles.notesText}>{action.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Modal */}
      {isInfoModalOpen && selectedAction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>تفاصيل الإجراء</h2>
              <button className={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.infoContent}>
              <div className={styles.infoSection}>
                <h3>معلومات أساسية</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>رقم الإجراء:</span>
                  <span className={styles.infoValue}>{selectedAction.id}</span>
                </div>
                {isAdmin && (
                  <>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>العميل:</span>
                      <span className={styles.infoValue}>{selectedAction.leadName || "غير محدد"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>المندوب:</span>
                      <span className={styles.infoValue}>{selectedAction.salesName || "غير محدد"}</span>
                    </div>
                  </>
                )}
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>تاريخ الإنشاء:</span>
                  <span className={styles.infoValue}>{formatDate(selectedAction.created_at.toString())}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>آخر تحديث:</span>
                  <span className={styles.infoValue}>{formatDate(selectedAction.updated_at.toString())}</span>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h3>تغيير الحالة</h3>
                <div className={styles.stateChangeInfo}>
                  <div className={`${styles.stateInfoBox} ${styles.prevStateBox}`}>
                    <h4>الحالة السابقة</h4>
                    <span className={styles.stateName}>{stateTranslations[selectedAction.prev_state || "NEW"]}</span>
                    {selectedAction.prev_substate && (
                      <span className={styles.substateName}>{substateTranslations[selectedAction.prev_substate]}</span>
                    )}
                  </div>

                  <ArrowRight className={styles.arrowIconLarge} size={32} />

                  <div className={`${styles.stateInfoBox} ${styles.newStateBox}`}>
                    <h4>الحالة الجديدة</h4>
                    <span className={styles.stateName}>{stateTranslations[selectedAction.new_state || "NEW"]}</span>
                    {selectedAction.new_substate && (
                      <span className={styles.substateName}>{substateTranslations[selectedAction.new_substate]}</span>
                    )}
                  </div>
                </div>
              </div>

              {(selectedAction.project_id || selectedAction.unit_id) && (
                <div className={styles.infoSection}>
                  <h3>معلومات العقار</h3>
                  {selectedAction.project_id && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>المشروع:</span>
                      <span className={styles.infoValue}>{selectedAction.projectName || "غير محدد"}</span>
                    </div>
                  )}
                  {selectedAction.unit_id && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>الوحدة:</span>
                      <span className={styles.infoValue}>{selectedAction.unitName || "غير محدد"}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedAction.notes && (
                <div className={styles.infoSection}>
                  <h3>ملاحظات</h3>
                  <div className={styles.notesBox}>{selectedAction.notes}</div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.closeModalButton} onClick={closeModals}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Action Modal */}
      {isCreateModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>إضافة إجراء جديد</h2>
              <button className={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAction} className={styles.form}>
              <div className={styles.formSection}>
                <h3>الحالة</h3>
                <div className={styles.stateChangeForm}>
                  <div className={styles.stateFormGroup}>
                    <label>الحالة السابقة</label>
                    <select value={newAction.prevState} className={styles.stateSelect} disabled={true}>
                      {Object.keys(stateTranslations).map((state) => (
                        <option key={state} value={state}>
                          {stateTranslations[state]}
                        </option>
                      ))}
                    </select>

                    {stateToSubstate[newAction.prevState]?.length > 0 && (
                      <div className={styles.substateGroup}>
                        <label>الحالة الفرعية السابقة</label>
                        <select value={newAction.prevSubstate} className={styles.substateSelect} disabled={true}>
                          <option value="">بدون حالة فرعية</option>
                          {stateToSubstate[newAction.prevState].map((substate) => (
                            <option key={substate} value={substate}>
                              {substateTranslations[substate]}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <ArrowRight className={styles.arrowIconLarge} size={32} />

                  <div className={styles.stateFormGroup}>
                    <label>الحالة الجديدة</label>
                    <select
                      value={newAction.newState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className={styles.stateSelect}
                      required
                    >
                      {Object.keys(stateTranslations).map((state) => (
                        <option key={state} value={state}>
                          {stateTranslations[state]}
                        </option>
                      ))}
                    </select>

                    {stateToSubstate[newAction.newState]?.length > 0 && (
                      <div className={styles.substateGroup}>
                        <label>الحالة الفرعية الجديدة</label>
                        <select
                          value={newAction.newSubstate}
                          onChange={(e) =>
                            setNewAction((prev) => ({
                              ...prev,
                              newSubstate: e.target.value,
                            }))
                          }
                          className={styles.substateSelect}
                        >
                          <option value="">بدون حالة فرعية</option>
                          {stateToSubstate[newAction.newState].map((substate) => (
                            <option key={substate} value={substate}>
                              {substateTranslations[substate]}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(newAction.newState === "CLOSED_WON" ||
                newAction.newState === "NEGOTIATING" ||
                newAction.newState === "QUALIFIED") && (
                <div className={styles.formSection}>
                  <h3>معلومات العقار</h3>
                  <div className={styles.formGroup}>
                    <label htmlFor="projectId">
                      المشروع {newAction.newState === "CLOSED_WON" && <span className={styles.requiredMark}>*</span>}
                    </label>
                    <select
                      id="projectId"
                      value={newAction.projectId || ""}
                      onChange={(e) => handleProjectChange(e.target.value ? Number.parseInt(e.target.value) : 0)}
                      className={styles.formInput}
                      required={newAction.newState === "CLOSED_WON"}
                    >
                      <option value="">اختر المشروع</option>
                      {allProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {newAction.projectId && (
                    <div className={styles.formGroup}>
                      <label htmlFor="unitId">
                        الوحدة {newAction.newState === "CLOSED_WON" && <span className={styles.requiredMark}>*</span>}
                      </label>
                      <select
                        id="unitId"
                        value={newAction.unitId || ""}
                        onChange={(e) =>
                          setNewAction((prev) => ({
                            ...prev,
                            unitId: e.target.value ? Number.parseInt(e.target.value) : null,
                          }))
                        }
                        className={styles.formInput}
                        required={newAction.newState === "CLOSED_WON"}
                      >
                        <option value="">اختر الوحدة</option>
                        {projectUnits.length > 0 ? (
                          projectUnits.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name} ({unit.status})
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            لا توجد وحدات متاحة
                          </option>
                        )}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Conditionally render task form within the same modal */}
              {statesRequiringTask.includes(newAction.newState) && (
                <div className={styles.formSection}>
                  <h3>جدولة مهمة</h3>
                  <div className={styles.formGroup}>
                    <label htmlFor="taskName">اسم المهمة</label>
                    <input
                      id="taskName"
                      type="text"
                      value={taskForm.name}
                      onChange={(e) => setTaskForm((prev) => ({ ...prev, name: e.target.value }))}
                      className={styles.formInput}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="taskDate">تاريخ المهمة</label>
                    <input
                      id="taskDate"
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) =>
                        setTaskForm((prev) => ({
                          ...prev,
                          dueDate: e.target.value,
                        }))
                      }
                      className={styles.formInput}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="taskTime">وقت المهمة</label>
                    <input
                      id="taskTime"
                      type="time"
                      value={taskForm.dueTime}
                      onChange={(e) =>
                        setTaskForm((prev) => ({
                          ...prev,
                          dueTime: e.target.value,
                        }))
                      }
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>
              )}

              <div className={styles.formSection}>
                <h3>ملاحظات</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="notes">ملاحظات</label>
                  <textarea
                    id="notes"
                    value={newAction.notes}
                    onChange={(e) =>
                      setNewAction((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className={styles.formTextarea}
                    rows={4}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelButton} onClick={closeModals} disabled={isCreatingAction}>
                  إلغاء
                </button>
                <button type="submit" className={styles.submitButton} disabled={isCreatingAction}>
                  {isCreatingAction || isLoadingActions ? (
                    <Loading isVisible={true} />
                  ) : statesRequiringTask.includes(newAction.newState) ? (
                    "إنشاء المهمة والإجراء"
                  ) : (
                    "إضافة إجراء"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Unit Modal */}
      {isSendUnitModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>إرسال معلومات وحدة عبر واتساب</h2>
              <button className={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendUnit} className={styles.form}>
              <div className={styles.formSection}>
                <div className={styles.whatsappRecipient}>
                  <MessageCircle size={24} className={styles.whatsappIcon} />
                  <div className={styles.recipientInfo}>
                    <span className={styles.recipientLabel}>سيتم إرسال الوحدة إلى:</span>
                    <span className={styles.recipientName}>{lead?.name}</span>
                    <span className={styles.recipientNumber}>{lead?.number}</span>
                  </div>
                </div>
                
                <h3>اختيار الوحدة</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="sendProjectId">
                    المشروع <span className={styles.requiredMark}>*</span>
                  </label>
                  <select
                    id="sendProjectId"
                    value={sendUnitForm.projectId || ""}
                    onChange={(e) => handleSendUnitProjectChange(e.target.value ? Number.parseInt(e.target.value) : 0)}
                    className={styles.formInput}
                    required
                  >
                    <option value="">اختر المشروع</option>
                    {allProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {sendUnitForm.projectId && (
                  <div className={styles.formGroup}>
                    <label htmlFor="sendUnitId">
                      الوحدة <span className={styles.requiredMark}>*</span>
                    </label>
                    <select
                      id="sendUnitId"
                      value={sendUnitForm.unitId || ""}
                      onChange={(e) => handleSendUnitChange(e.target.value)}
                      className={styles.formInput}
                      required
                    >
                      <option value="">اختر الوحدة</option>
                      {projectUnits.length > 0 ? (
                        projectUnits.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name} ({unit.status})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          لا توجد وحدات
                        </option>
                      )}
                    </select>
                  </div>
                )}

                {sendUnitForm.unitId && (
                  <>
                    <h3>تعديل الرسالة</h3>
                    <div className={styles.formGroup}>
                      <label htmlFor="messageTemplate">
                        نص الرسالة <span className={styles.requiredMark}>*</span>
                      </label>
                      <textarea
                        id="messageTemplate"
                        value={sendUnitForm.messageTemplate}
                        onChange={handleMessageTemplateChange}
                        className={styles.formTextarea}
                        rows={12}
                        required
                        dir="rtl"
                      />
                      <p className={styles.messageHelp}>
                        يمكنك تعديل الرسالة قبل إرسالها. تنسيق النص يدعم استخدام **للتمييز** و *للإمالة*.
                      </p>
                    </div>

                    {sendUnitForm.mediaUrls.length > 0 && (
                      <div className={styles.mediaSection}>
                        <h3>
                          <Image size={18} /> الصور المرفقة ({sendUnitForm.mediaUrls.length})
                        </h3>
                        <div className={styles.mediaThumbnails}>
                          {sendUnitForm.mediaUrls.map((url, index) => (
                            <div key={index} className={styles.mediaThumbnail}>
                              <img src={url} alt={`صورة ${index + 1}`} />
                            </div>
                          ))}
                  
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelButton} onClick={closeModals} disabled={isSendingWhatsapp}>
                  إلغاء
                </button>
                <button type="submit" className={styles.submitButton} disabled={isSendingWhatsapp || !sendUnitForm.messageTemplate}>
                  {isSendingWhatsapp ? <Loading isVisible={true} /> : "إرسال عبر واتساب"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadActions
