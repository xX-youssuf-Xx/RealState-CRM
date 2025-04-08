﻿import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
   Info, Plus, X, Search, Filter, ArrowRight
} from "lucide-react";
import { useGetActionsByCustomerId, Action } from "../../hooks/Actions/useGetActionsByCustomerId";
import { useGetLead, Lead } from "../../hooks/Leads/useGetLead";
import { useGetEmployee } from "../../hooks/Employees/useGetEmployee";
import { useGetProject } from "../../hooks/Projects/useGetProject";
import { useGetUnitById } from "../../hooks/Units/useGetUnitById";
import { useGetAllProjects } from "../../hooks/Projects/useGetAllProjects";
import { useGetUnitByProjectId } from "../../hooks/Units/useGetUnitByProjectId";
import { useCreateAction } from "../../hooks/Actions/useCreateAction";
import { useCreateTask } from "../../hooks/Tasks/useCreateTask";
import { useUpdateUnit } from "../../hooks/Units/useUpdateUnit";
import Loading from "../../components/Loading/Loading";
import styles from "./LeadPage.module.css";


interface ActionWithDetails extends Action {
  salesName?: string;
  projectName?: string;
  unitName?: string;
  leadName?: string;
}

const LeadActions: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const numericLeadId = parseInt(leadId || "0", 10);
  
  // State
  const [actions, setActions] = useState<ActionWithDetails[]>([]);
  const [filteredActions, setFilteredActions] = useState<ActionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "project" | "unit">("all");
  const [filterProjectId, setFilterProjectId] = useState<number | null>(null);
  const [filterUnitId, setFilterUnitId] = useState<number | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionWithDetails | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [projectUnits, setProjectUnits] = useState<any[]>([]);
  
  // Form state
  const [newAction, setNewAction] = useState({
    salesId: 0,
    prevState: "NEW",
    prevSubstate: "",
    newState: "NEW",
    newSubstate: "",
    projectId: null as number | null,
    unitId: null as number | null,
    notes: ""
  });
  // Add these to the existing state declarations
const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
const [taskForm, setTaskForm] = useState({
  name: "",
  dueDate: "",
  dueTime: "10:00"
});

// API Hooks
  const { execute: createTask } = useCreateTask(); // Add the hook usage
  const { execute: fetchActions, isLoading: isLoadingActions } = useGetActionsByCustomerId();
  const { execute: fetchLead } = useGetLead();
  const { execute: fetchEmployee } = useGetEmployee();
  const { execute: fetchProject } = useGetProject();
  const { execute: fetchUnit } = useGetUnitById();
  const { execute: fetchAllProjects } = useGetAllProjects();
  const { execute: fetchUnitsByProject } = useGetUnitByProjectId();
  const { execute: createAction, isLoading: isCreatingAction } = useCreateAction();
  const { execute: updateUnit } = useUpdateUnit();
  
  // Load lead data and actions when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        if (numericLeadId) {
          const leadData = await fetchLead(numericLeadId);
          setLead(leadData);
          
          const actionsData = await fetchActions(numericLeadId);
          
          // Fetch additional details for each action
          const actionsWithDetails = await Promise.all(
            actionsData.map(async (action: Action) => {
              let actionWithDetails: ActionWithDetails = { ...action };
              
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
                
                actionWithDetails.leadName = leadData.name;
              } catch (error) {
                console.error("Error fetching action details:", error);
              }
              
              return actionWithDetails;
            })
          );
          
          setActions(actionsWithDetails);
          setFilteredActions(actionsWithDetails);
          
          // Load projects for the create action form
          const projects = await fetchAllProjects();
          setAllProjects(projects);
          
        // Use nullish coalescing to provide 0 if sales_id is null/undefined
        setNewAction(prev => ({ 
          ...prev, 
          salesId: leadData.sales_id ?? 0 
      }));

        }
      } catch (error) {
        console.error("Error loading lead data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [numericLeadId, fetchActions, fetchLead, fetchEmployee, fetchProject, fetchUnit, fetchAllProjects]);
  
  // Filter actions
  useEffect(() => {
    let filtered = [...actions];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(action => 
        action.notes?.toLowerCase().includes(query) ||
        action.leadName?.toLowerCase().includes(query) ||
        action.salesName?.toLowerCase().includes(query) ||
        action.projectName?.toLowerCase().includes(query) ||
        action.unitName?.toLowerCase().includes(query) ||
        stateTranslations[action.new_state as keyof typeof stateTranslations]?.toLowerCase().includes(query) ||
        stateTranslations[action.prev_state as keyof typeof stateTranslations]?.toLowerCase().includes(query)
      );
    }
    
    // Apply project/unit filter
    if (selectedFilter === "project" && filterProjectId) {
      filtered = filtered.filter(action => action.project_id === filterProjectId);
    } else if (selectedFilter === "unit" && filterUnitId) {
      filtered = filtered.filter(action => action.unit_id === filterUnitId);
    }
    
    setFilteredActions(filtered);
  }, [searchQuery, selectedFilter, filterProjectId, filterUnitId, actions]);
  
  // Handle project selection in create form
  const handleProjectChange = async (projectId: number) => {
    setNewAction(prev => ({ ...prev, projectId, unitId: null }));
    if (projectId) {
      try {
        const units = await fetchUnitsByProject(projectId);
        // Filter only available units (not SOLD)
        const availableUnits = units.filter((unit: any) => unit.status !== "SOLD");
        setProjectUnits(availableUnits);
      } catch (error) {
        console.error("Error fetching units:", error);
        setProjectUnits([]);
      }
    } else {
      setProjectUnits([]);
    }
  };
  
// Replace or update the handleStateChange function
const handleStateChange = (state: string) => {
  setNewAction(prev => ({ 
    ...prev, 
    newState: state, 
    newSubstate: "" 
  }));
  
  // Check if state requires scheduling a task
  const statesRequiringTask = ["VISITING", "MEETING", "FOLLOW_UP"];
  if (statesRequiringTask.includes(state)) {
    // Set default task name based on the selected state
    const taskNames = {
      "VISITING": "زيارة للعميل",
      "MEETING": "اجتماع مع العميل",
      "FOLLOW_UP": "متابعة مع العميل"
    };
    
    // Set tomorrow's date as default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    
    setTaskForm({
      name: taskNames[state as keyof typeof taskNames],
      dueDate: formattedDate,
      dueTime: "10:00"
    });
  }
};

  
  // Open info modal
  const openInfoModal = (action: ActionWithDetails) => {
    setSelectedAction(action);
    setIsInfoModalOpen(true);
  };
  
  // Open create modal
  const openCreateModal = () => {
    if (lead?.state) {
      setNewAction(prev => ({ 
        ...prev, 
        prevState: lead.state, 
        prevSubstate: lead.substate || "",
        salesId: lead.sales_id || 0
      }));
    }
    setIsCreateModalOpen(true);
  };
  
  // Close all modals
const closeModals = () => {
  setIsInfoModalOpen(false);
  setIsCreateModalOpen(false);
  setIsTaskModalOpen(false);
  setSelectedAction(null);
};
  
  // Handle create action form submission
// Update the handleCreateAction function
const handleCreateAction = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    if (!numericLeadId || !newAction.salesId) {
      throw new Error("Missing required fields");
    }
    
    // Check if unit and project are required
    if (newAction.newState === "CLOSED_WON" && (!newAction.projectId || !newAction.unitId)) {
      alert("يجب اختيار المشروع والوحدة عند إغلاق الصفقة بنجاح");
      return;
    }
    
    // Check if we should show the task modal instead of creating the action right away
    const statesRequiringTask = ["VISITING", "MEETING", "FOLLOW_UP"];
    if (statesRequiringTask.includes(newAction.newState)) {
      setIsTaskModalOpen(true);
      return;
    }
    
    // If not requiring a task, proceed with action creation
    await createActionAndRefresh();
    
  } catch (error) {
    console.error("Error creating action:", error);
    alert("حدث خطأ أثناء إنشاء الإجراء");
  }
};

// Add a new function to create action and refresh data
const createActionAndRefresh = async (taskData?: { name: string, dueDate: string, dueTime: string }) => {
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
    newAction.notes || undefined
  );
  
  // Create a task if taskData is provided
  if (taskData) {
    const isoDateTime = `${taskData.dueDate}T${taskData.dueTime}:00Z`;
    
    // Modify this to match the expected signature of createTask
    await createTask(
      taskData.name,
      numericLeadId,
      newAction.salesId,
      actionResponse.id, // This is already a string based on the response example
      isoDateTime
    );
  }
  
  // If CLOSED_WON, update the unit status
  if (newAction.newState === "CLOSED_WON" && newAction.unitId) {
    const today = new Date().toISOString().split('T')[0];
    await updateUnit(
      newAction.unitId,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "SOLD",
      today
    );
  }
  
  // Refresh the action list
  const actionsData = await fetchActions(numericLeadId);
  
  // Fetch additional details for each action
  const actionsWithDetails = await Promise.all(
    actionsData.map(async (action: Action) => {
      let actionWithDetails: ActionWithDetails = { ...action };
      
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
  
  // Reset form and close modal
  setNewAction({
    salesId: lead?.sales_id || 0,
    prevState: lead?.state || "NEW",
    prevSubstate: lead?.substate || "",
    newState: "NEW",
    newSubstate: "",
    projectId: null,
    unitId: null,
    notes: ""
  });
  closeModals();
  
  // Refresh projects list
  const projects = await fetchAllProjects();
  setAllProjects(projects);
};

// Add handler for task submission
const handleTaskSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await createActionAndRefresh(taskForm);
    setIsTaskModalOpen(false);
  } catch (error) {
    console.error("Error creating task:", error);
    alert("حدث خطأ أثناء إنشاء المهمة");
  }
};
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
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
  };
  
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
  };
  
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
  };

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
          <div className={styles.filterContainer}>
            <Filter size={18} className={styles.filterIcon} />
            <select 
              value={selectedFilter} 
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="all">جميع الإجراءات</option>
              <option value="project">حسب المشروع</option>
              <option value="unit">حسب الوحدة</option>
            </select>
            
            {selectedFilter === "project" && (
              <select
                value={filterProjectId || ""}
                onChange={(e) => setFilterProjectId(e.target.value ? parseInt(e.target.value) : null)}
                className={styles.filterSelect}
              >
                <option value="">اختر المشروع</option>
                {allProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            )}
            
            {selectedFilter === "unit" && filterProjectId && (
              <select
                value={filterUnitId || ""}
                onChange={(e) => setFilterUnitId(e.target.value ? parseInt(e.target.value) : null)}
                className={styles.filterSelect}
              >
                <option value="">اختر الوحدة</option>
                {projectUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            )}
          </div>
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
          {searchQuery || selectedFilter !== "all" ? (
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
      ) : (
        <div className={styles.actionsContainer}>
          {filteredActions.map((action) => (
            <div key={action.id} className={styles.actionCard}>
              <div className={styles.actionHeader}>
                <div className={styles.actionDate}>
                  {formatDate(action.created_at.toString())}
                </div>
                <button 
                  className={styles.infoButton} 
                  onClick={() => openInfoModal(action)}
                  aria-label="معلومات"
                >
                  <Info size={18} />
                </button>
              </div>
              
              <div className={styles.actionContent}>
                <div className={styles.actionStatusFlow}>
                  <div className={styles.stateBox}>
                    <span className={styles.stateName}>
                      {stateTranslations[action.prev_state || "NEW"]}
                    </span>
                    {action.prev_substate && (
                      <span className={styles.substateName}>
                        {substateTranslations[action.prev_substate]}
                      </span>
                    )}
                  </div>
                  
                  <ArrowRight className={styles.arrowIcon} size={20} />
                  
                  <div className={`${styles.stateBox} ${action.new_state === "CLOSED_WON" ? styles.successState : action.new_state === "CLOSED_LOST" ? styles.dangerState : styles.activeState}`}>
                    <span className={styles.stateName}>
                      {stateTranslations[action.new_state || "NEW"]}
                    </span>
                    {action.new_substate && (
                      <span className={styles.substateName}>
                        {substateTranslations[action.new_substate]}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={styles.actionDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>المندوب:</span>
                    <span className={styles.detailValue}>{action.salesName || "غير محدد"}</span>
                  </div>
                  
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
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>العميل:</span>
                  <span className={styles.infoValue}>{selectedAction.leadName || "غير محدد"}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>المندوب:</span>
                  <span className={styles.infoValue}>{selectedAction.salesName || "غير محدد"}</span>
                </div>
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
                    <span className={styles.stateName}>
                      {stateTranslations[selectedAction.prev_state || "NEW"]}
                    </span>
                    {selectedAction.prev_substate && (
                      <span className={styles.substateName}>
                        {substateTranslations[selectedAction.prev_substate]}
                      </span>
                    )}
                  </div>
                  
                  <ArrowRight className={styles.arrowIconLarge} size={32} />
                  
                  <div className={`${styles.stateInfoBox} ${styles.newStateBox}`}>
                    <h4>الحالة الجديدة</h4>
                    <span className={styles.stateName}>
                      {stateTranslations[selectedAction.new_state || "NEW"]}
                    </span>
                    {selectedAction.new_substate && (
                      <span className={styles.substateName}>
                        {substateTranslations[selectedAction.new_substate]}
                      </span>
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
                  <div className={styles.notesBox}>
                    {selectedAction.notes}
                  </div>
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
                    <select 
                      value={newAction.prevState} 
                      onChange={(e) => setNewAction(prev => ({ ...prev, prevState: e.target.value }))}
                      
                      className={styles.stateSelect}
                    >
                      {Object.keys(stateTranslations).map(state => (
                        <option key={state} value={state}>
                          {stateTranslations[state]}
                        </option>
                      ))}
                    </select>
                    
                    {stateToSubstate[newAction.prevState]?.length > 0 && (
                      <div className={styles.substateGroup}>
                        <label>الحالة الفرعية السابقة</label>
                        <select
                          value={newAction.prevSubstate}
                          onChange={(e) => setNewAction(prev => ({ ...prev, prevSubstate: e.target.value }))}
                          
                          className={styles.substateSelect}
                        >
                          <option value="">بدون حالة فرعية</option>
                          {stateToSubstate[newAction.prevState].map(substate => (
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
                      {Object.keys(stateTranslations).map(state => (
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
                          onChange={(e) => setNewAction(prev => ({ ...prev, newSubstate: e.target.value }))}
                          className={styles.substateSelect}
                        >
                          <option value="">بدون حالة فرعية</option>
                          {stateToSubstate[newAction.newState].map(substate => (
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
              
              {/* Task Modal */}
{isTaskModalOpen && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <div className={styles.modalHeader}>
        <h2>جدولة مهمة</h2>
        <button className={styles.closeButton} onClick={() => setIsTaskModalOpen(false)}>
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleTaskSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label htmlFor="taskName">اسم المهمة</label>
            <input
              id="taskName"
              type="text"
              value={taskForm.name}
              onChange={(e) => setTaskForm(prev => ({ ...prev, name: e.target.value }))}
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
              onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
              className={styles.formInput}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="taskTime">وقت المهمة</label>
            <input
              id="taskTime"
              type="time"
              value={taskForm.dueTime}
              onChange={(e) => setTaskForm(prev => ({ ...prev, dueTime: e.target.value }))}
              className={styles.formInput}
              required
            />
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className={styles.cancelButton} 
            onClick={() => setIsTaskModalOpen(false)}
          >
            إلغاء
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
          >
            إنشاء المهمة والإجراء
          </button>
        </div>
      </form>
    </div>
  </div>
)}
              {(newAction.newState === "CLOSED_WON" || newAction.newState === "NEGOTIATING" || newAction.newState === "QUALIFIED") && (
                <div className={styles.formSection}>
                  <h3>معلومات العقار</h3>
                  <div className={styles.formGroup}>
                    <label htmlFor="projectId">المشروع {newAction.newState === "CLOSED_WON" && <span className={styles.requiredMark}>*</span>}</label>
                    <select
                      id="projectId"
                      value={newAction.projectId || ""}
                      onChange={(e) => handleProjectChange(e.target.value ? parseInt(e.target.value) : 0)}
                      className={styles.formInput}required={newAction.newState === "CLOSED_WON"}
                                          >
                                            <option value="">اختر المشروع</option>
                                            {allProjects.map(project => (
                                              <option key={project.id} value={project.id}>{project.name}</option>
                                            ))}
                                          </select>
                                        </div>
                                        
                                        {newAction.projectId && (
                                          <div className={styles.formGroup}>
                                            <label htmlFor="unitId">الوحدة {newAction.newState === "CLOSED_WON" && <span className={styles.requiredMark}>*</span>}</label>
                                            <select
                                              id="unitId"
                                              value={newAction.unitId || ""}
                                              onChange={(e) => setNewAction(prev => ({ ...prev, unitId: e.target.value ? parseInt(e.target.value) : null }))}
                                              className={styles.formInput}
                                              required={newAction.newState === "CLOSED_WON"}
                                            >
                                              <option value="">اختر الوحدة</option>
                                              {projectUnits.length > 0 ? (
                                                projectUnits.map(unit => (
                                                  <option key={unit.id} value={unit.id}>{unit.name} ({unit.status})</option>
                                                ))
                                              ) : (
                                                <option value="" disabled>لا توجد وحدات متاحة</option>
                                              )}
                                            </select>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    <div className={styles.formSection}>
                                      <h3>ملاحظات</h3>
                                      <div className={styles.formGroup}>
                                        <label htmlFor="notes">ملاحظات</label>
                                        <textarea
                                          id="notes"
                                          value={newAction.notes}
                                          onChange={(e) => setNewAction(prev => ({ ...prev, notes: e.target.value }))}
                                          className={styles.formTextarea}
                                          rows={4}
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className={styles.modalFooter}>
                                      <button 
                                        type="button" 
                                        className={styles.cancelButton} 
                                        onClick={closeModals}
                                        disabled={isCreatingAction}
                                      >
                                        إلغاء
                                      </button>
                                      <button 
                                          type="submit" 
                                        className={styles.submitButton}
                                        disabled={isCreatingAction}
                                      >
                                        {isCreatingAction  || isLoadingActions ? <Loading isVisible={true} /> : "إضافة إجراء"}
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      };
                      
                      export default LeadActions;